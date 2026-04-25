import { ResumeParseResultSchema } from '../validators/schemas.js';
import { cleanResumeText } from '../utils/textNormalizer.js';
import { parseResumeWithAI, getFallbackParseResult } from './aiService.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function parseResumePDF(fileBuffer) {
  // Step 1: Extract raw text from PDF
  let rawText = '';
  try {
    const data = await pdfParse(fileBuffer);
    rawText = data.text || '';
  } catch (err) {
    throw new Error('Could not extract text from PDF. Ensure the file is a valid, text-based PDF.');
  }

  // Step 2: Clean and normalize
  const cleanedText = cleanResumeText(rawText);
  if (!cleanedText || cleanedText.length < 20) {
    throw new Error('PDF appears empty or contains too little text to analyze.');
  }

  // Step 3: Send to LLM with strict JSON schema + validate with Zod
  let parsedData = null;
  let aiUsed = true;

  const aiResult = await parseResumeWithAI(cleanedText);

  if (aiResult.success) {
    try {
      const jsonData = JSON.parse(aiResult.content);
      const validated = ResumeParseResultSchema.safeParse(jsonData);

      if (validated.success) {
        parsedData = validated.data;
      } else {
        console.warn('[resumeParser] Zod validation failed:', validated.error.issues);
        // Try to salvage what we can from the raw JSON
        parsedData = {
          ...getFallbackParseResult(),
          skills: Array.isArray(jsonData.skills) ? jsonData.skills : [],
          experience: jsonData.experience || 'Not specified',
          education: jsonData.education || 'Not specified',
        };
      }
    } catch (jsonErr) {
      console.warn('[resumeParser] JSON parse failed, using fallback');
      parsedData = getFallbackParseResult();
      aiUsed = false;
    }
  } else {
    console.warn('[resumeParser] AI call failed, using fallback:', aiResult.error);
    parsedData = getFallbackParseResult();
    aiUsed = false;
  }

  // Step 4: If AI failed, extract skills from text heuristically
  if (!aiUsed || parsedData.skills.length === 0) {
    parsedData.skills = extractSkillsFromText(cleanedText);
  }

  return {
    rawText: cleanedText,
    parsedData,
    aiUsed,
  };
}

function extractSkillsFromText(text) {
  // Heuristic fallback: scan for known skill keywords
  const knownSkills = [
    'JavaScript','TypeScript','Python','Java','C++','C#','Go','Rust','Ruby','PHP',
    'Kotlin','Swift','React','Angular','Vue','Node.js','Express','Django','Flask',
    'FastAPI','Spring','Docker','Kubernetes','AWS','Azure','GCP','SQL','MongoDB',
    'PostgreSQL','MySQL','Redis','Git','Linux','HTML','CSS','Sass','TailwindCSS',
    'GraphQL','REST','CI/CD','Jenkins','Terraform','Figma','Jira','Agile','Scrum',
    'Machine Learning','Deep Learning','TensorFlow','PyTorch','Pandas','NumPy',
    'Next.js','Vite','Webpack','Firebase','Supabase','Elasticsearch',
  ];

  const lower = text.toLowerCase();
  return knownSkills.filter(skill => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`, 'i').test(lower);
  });
}
