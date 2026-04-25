import Groq from 'groq-sdk';
import config from '../config/index.js';

let groqClient = null;

function getClient() {
  if (!groqClient && config.groq.apiKey) {
    groqClient = new Groq({ apiKey: config.groq.apiKey });
  }
  return groqClient;
}

async function callWithRetry(promptMessages, options = {}) {
  const client = getClient();
  if (!client) {
    return { success: false, error: 'AI service unavailable — no API key configured.' };
  }

  const maxRetries = options.maxRetries || config.groq.maxRetries;
  const useJsonFormat = options.jsonFormat !== false;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.groq.timeoutMs);

      const params = {
        messages: promptMessages,
        model: config.groq.model,
        temperature: options.temperature ?? config.groq.temperature,
      };
      if (useJsonFormat) {
        params.response_format = { type: 'json_object' };
      }

      const completion = await client.chat.completions.create(params, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const content = completion.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from AI');
      }

      return { success: true, content };
    } catch (err) {
      const isLast = attempt === maxRetries;
      console.error(`[aiService] Attempt ${attempt}/${maxRetries} failed:`, err.message);

      if (isLast) {
        return { success: false, error: err.message };
      }
      // Exponential backoff
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 500));
    }
  }

  return { success: false, error: 'AI service exhausted all retries.' };
}

export async function parseResumeWithAI(cleanedText) {
  const prompt = `You are an expert ATS (Applicant Tracking System) resume parser.
Analyze the following resume text and extract structured information.
Respond ONLY with a valid JSON object matching this exact schema:

{
  "skills": ["Array of technical and professional skills found"],
  "experience": "Brief summary of overall work experience and total years if discernible",
  "education": "Summary of highest degree, field, and institution",
  "experience_entries": [
    {"title": "Job Title", "company": "Company Name", "duration": "Time Period", "description": "Brief description"}
  ],
  "education_entries": [
    {"degree": "Degree Type", "field": "Field of Study", "school": "Institution", "year": "Graduation Year", "gpa": "GPA if mentioned"}
  ],
  "certifications": ["Any certifications or professional credentials"],
  "summary": "A 2-3 sentence professional summary of the candidate",
  "recommendations": ["3-5 specific, actionable recommendations to improve this resume for ATS systems"]
}

Resume Text:
${cleanedText.substring(0, 8000)}`;

  const result = await callWithRetry([{ role: 'user', content: prompt }], { jsonFormat: true });
  return result;
}

export async function generateJobFitExplanation(resumeSkills, jobTitle, jobDescription, matchScore, scoreBreakdown) {
  const prompt = `You are an expert career advisor. A candidate was matched to a job with the following details:

Job: ${jobTitle}
Job Description: ${(jobDescription || '').substring(0, 1000)}
Candidate Skills: ${resumeSkills.join(', ')}
Overall Match Score: ${matchScore}%

Score Breakdown:
- Skills Match: ${scoreBreakdown.skills}%
- Experience Relevance: ${scoreBreakdown.experience}%
- Education Fit: ${scoreBreakdown.education}%
- Keyword Coverage: ${scoreBreakdown.keywords}%
- Resume Quality: ${scoreBreakdown.quality}%

Respond ONLY with a valid JSON object:
{
  "explanation": "A 2-3 sentence explanation of why this match score was given",
  "strengths": ["2-3 specific strengths the candidate has for this role"],
  "improvements": ["2-3 specific suggestions to improve their match for this role"],
  "fit_level": "strong|moderate|weak"
}`;

  const result = await callWithRetry([{ role: 'user', content: prompt }], { jsonFormat: true });
  return result;
}

export async function generateResumeImprovements(skills, experience, education, score) {
  const prompt = `You are an expert resume coach. A candidate's resume was analyzed:

Skills Found: ${skills.join(', ')}
Experience: ${experience}
Education: ${education}
Current ATS Score: ${score}/100

Provide specific, actionable improvement suggestions.
Respond ONLY with a valid JSON object:
{
  "overall_assessment": "2-3 sentence assessment of the resume quality",
  "critical_improvements": ["2-3 most impactful changes to make"],
  "skill_suggestions": ["2-3 in-demand skills they should consider adding or highlighting"],
  "formatting_tips": ["2-3 ATS formatting recommendations"],
  "score_potential": <integer 0-100 representing their potential score after improvements>
}`;

  const result = await callWithRetry([{ role: 'user', content: prompt }], { jsonFormat: true });
  return result;
}

export async function generateMatchInsight(resumeContent, jobDescription, score) {
  const prompt = `You are an expert HR analyst. Review this ATS candidate data against the job requirements.
Candidate Resume Data: ${(resumeContent || '').substring(0, 2000)}
Job Description: ${(jobDescription || '').substring(0, 1000)}

Write a short, professional analysis (max 4 bullet points) explaining why this candidate achieved a compatibility score of ${Math.round(score)}%.
Respond ONLY with a valid JSON object:
{
  "insight": "• Bullet point 1\\n• Bullet point 2\\n• Bullet point 3\\n• Bullet point 4"
}`;

  const result = await callWithRetry([{ role: 'user', content: prompt }], { jsonFormat: true });
  return result;
}

export function getFallbackParseResult() {
  return {
    skills: [],
    experience: 'Could not parse — AI service unavailable',
    education: 'Could not parse — AI service unavailable',
    experience_entries: [],
    education_entries: [],
    certifications: [],
    summary: 'Resume was uploaded but AI parsing was unavailable. The scoring engine will still analyze content using keyword extraction.',
    recommendations: [
      'Ensure your resume is in a standard single-column PDF format',
      'Include a clear skills section with specific technologies listed',
      'Add quantifiable achievements to your experience entries',
    ],
  };
}
