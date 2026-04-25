import config from '../config/index.js';
import { normalizeSkill, normalizeSkills, categorizeSkill, extractYearsOfExperience, detectResumeSections, countActionVerbs, extractDegreeLevel } from '../utils/textNormalizer.js';
import { tokenize, computeTF, computeIDF, computeTFIDF, cosineSimilarity } from '../utils/tfidf.js';

const WEIGHTS = config.scoring.weights;

export function computeATSScore(parsedData, rawText) {
  const skillsScore = computeSkillsQuality(parsedData.skills);
  const experienceScore = computeExperienceScore(parsedData, rawText);
  const educationScore = computeEducationScore(parsedData);
  const keywordScore = computeKeywordDensity(parsedData, rawText);
  const qualityScore = computeResumeQuality(rawText, parsedData);

  const totalScore = Math.round(
    skillsScore * WEIGHTS.skills +
    experienceScore * WEIGHTS.experience +
    educationScore * WEIGHTS.education +
    keywordScore * WEIGHTS.keywords +
    qualityScore * WEIGHTS.quality
  );

  return {
    total: Math.min(100, Math.max(0, totalScore)),
    breakdown: {
      skills: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      education: Math.round(educationScore),
      keywords: Math.round(keywordScore),
      quality: Math.round(qualityScore),
    },
  };
}

function computeSkillsQuality(skills) {
  if (!skills || skills.length === 0) return 10;

  const normalized = normalizeSkills(skills);
  const uniqueCount = normalized.length;

  // Base score from quantity (diminishing returns)
  let score = Math.min(60, uniqueCount * 6);

  // Bonus for skill diversity across categories
  const categories = new Set(normalized.map(categorizeSkill));
  score += categories.size * 10;

  // Bonus for in-demand hard skills
  const hardSkills = normalized.filter(s => categorizeSkill(s) === 'hard');
  score += Math.min(10, hardSkills.length * 3);

  return Math.min(100, score);
}

function computeExperienceScore(parsedData, rawText) {
  let score = 30; // Base score for having any content

  const years = extractYearsOfExperience(rawText);
  if (years > 0) {
    // Score curve: 0y=30, 1y=50, 3y=70, 5y=85, 10y=95, 15+=100
    score = Math.min(100, 30 + years * 10 - Math.max(0, years - 5) * 3);
  }

  // Bonus for structured experience entries
  const entries = parsedData.experience_entries || [];
  if (entries.length > 0) {
    score += Math.min(15, entries.length * 5);
  }

  // Bonus for action verbs in experience text
  const actionVerbCount = countActionVerbs(rawText);
  score += Math.min(10, actionVerbCount * 2);

  return Math.min(100, score);
}

function computeEducationScore(parsedData) {
  let score = 20; // Base score

  const eduText = parsedData.education || '';
  const entries = parsedData.education_entries || [];

  // Score from degree level
  let maxDegree = extractDegreeLevel(eduText);
  for (const entry of entries) {
    const level = extractDegreeLevel(`${entry.degree || ''} ${entry.field || ''}`);
    maxDegree = Math.max(maxDegree, level);
  }

  // PhD=100, Masters=85, Bachelors=70, Associate=50
  const degreeScores = [20, 50, 70, 85, 100];
  score = degreeScores[maxDegree] || 20;

  // Bonus for GPA mention
  if (entries.some(e => e.gpa && parseFloat(e.gpa) > 0)) score += 5;

  return Math.min(100, score);
}

function computeKeywordDensity(parsedData, rawText) {
  const skills = parsedData.skills || [];
  if (skills.length === 0 || !rawText) return 20;

  // Count how many times each skill appears in the resume text
  const lower = rawText.toLowerCase();
  let totalMentions = 0;
  let mentionedSkills = 0;

  for (const skill of skills) {
    const normalized = normalizeSkill(skill);
    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches) {
      totalMentions += matches.length;
      mentionedSkills++;
    }
  }

  // Skills with at least one mention beyond the skills section
  const coverage = skills.length > 0 ? (mentionedSkills / skills.length) : 0;
  let score = coverage * 60;

  // Bonus for multiple mentions (shows depth of experience)
  const avgMentions = totalMentions / (skills.length || 1);
  score += Math.min(40, avgMentions * 15);

  return Math.min(100, Math.max(10, score));
}

function computeResumeQuality(rawText, parsedData) {
  if (!rawText) return 10;

  let score = 0;

  // Section completeness (max 50 points)
  const sections = detectResumeSections(rawText);
  const sectionChecks = [sections.hasContact, sections.hasSummary, sections.hasExperience, sections.hasEducation, sections.hasSkills];
  const sectionScore = sectionChecks.filter(Boolean).length;
  score += sectionScore * 10;

  // Length appropriateness (max 20 points) — ideal 400-1500 words
  const wordCount = rawText.split(/\s+/).length;
  if (wordCount >= 300 && wordCount <= 1500) score += 20;
  else if (wordCount >= 200 && wordCount <= 2000) score += 15;
  else if (wordCount >= 100) score += 10;
  else score += 5;

  // Action verbs usage (max 15 points)
  const actionVerbs = countActionVerbs(rawText);
  score += Math.min(15, actionVerbs * 3);

  // Has quantifiable achievements (max 15 points)
  const numberMatches = rawText.match(/\d+%|\d+\+|\$\d+|\d+\s*(?:users|clients|projects|team|people)/gi);
  score += Math.min(15, (numberMatches?.length || 0) * 5);

  return Math.min(100, score);
}

export function computeJobMatchScore(parsedData, rawText, jobSkills, jobDescription) {
  const normalizedResumeSkills = normalizeSkills(parsedData.skills || []);
  const normalizedJobSkills = normalizeSkills(jobSkills || []);

  const skillsMatchScore = computeSkillsMatchScore(normalizedResumeSkills, normalizedJobSkills);
  const experienceRelevance = computeExperienceRelevance(parsedData, rawText, jobDescription);
  const educationFit = computeEducationFit(parsedData);
  const keywordCoverage = computeJobKeywordCoverage(rawText, jobDescription);
  const resumeQuality = computeResumeQuality(rawText, parsedData);

  const totalScore = Math.round(
    skillsMatchScore * WEIGHTS.skills +
    experienceRelevance * WEIGHTS.experience +
    educationFit * WEIGHTS.education +
    keywordCoverage * WEIGHTS.keywords +
    resumeQuality * WEIGHTS.quality
  );

  // Determine matched and missing skills
  const matchedSkills = [];
  const missingSkills = [];
  for (const jSkill of normalizedJobSkills) {
    if (normalizedResumeSkills.includes(jSkill)) {
      // Return the original casing from job skills
      const original = (jobSkills || []).find(s => normalizeSkill(s) === jSkill);
      matchedSkills.push(original || jSkill);
    } else {
      const original = (jobSkills || []).find(s => normalizeSkill(s) === jSkill);
      missingSkills.push(original || jSkill);
    }
  }

  return {
    total: Math.min(100, Math.max(0, totalScore)),
    breakdown: {
      skills: Math.round(skillsMatchScore),
      experience: Math.round(experienceRelevance),
      education: Math.round(educationFit),
      keywords: Math.round(keywordCoverage),
      quality: Math.round(resumeQuality),
    },
    matchedSkills,
    missingSkills,
  };
}

function computeSkillsMatchScore(resumeSkills, jobSkills) {
  if (jobSkills.length === 0) return 80;
  if (resumeSkills.length === 0) return 5;

  let weightedMatch = 0;
  let totalWeight = 0;

  for (let i = 0; i < jobSkills.length; i++) {
    // Skills listed first in job posting get higher importance weight
    const positionWeight = 1 + (jobSkills.length - i) / jobSkills.length;
    const categoryWeight = config.scoring.skillCategories[categorizeSkill(jobSkills[i])] || 0.7;
    const weight = positionWeight * categoryWeight;
    totalWeight += weight;

    if (resumeSkills.includes(jobSkills[i])) {
      weightedMatch += weight;
    }
  }

  return totalWeight > 0 ? (weightedMatch / totalWeight) * 100 : 0;
}

function computeExperienceRelevance(parsedData, rawText, jobDescription) {
  if (!jobDescription) return 50;

  // TF-IDF similarity between resume experience text and job description
  const resumeTokens = tokenize(rawText);
  const jobTokens = tokenize(jobDescription);

  if (resumeTokens.length === 0 || jobTokens.length === 0) return 40;

  const idf = computeIDF([resumeTokens, jobTokens]);
  const resumeTFIDF = computeTFIDF(computeTF(resumeTokens), idf);
  const jobTFIDF = computeTFIDF(computeTF(jobTokens), idf);

  const similarity = cosineSimilarity(resumeTFIDF, jobTFIDF);
  return Math.min(100, similarity * 140); // Scale up from 0-0.7 range
}

function computeEducationFit(parsedData) {
  return computeEducationScore(parsedData);
}

function computeJobKeywordCoverage(rawText, jobDescription) {
  if (!rawText || !jobDescription) return 30;

  const jobTokens = tokenize(jobDescription);
  const resumeTokens = new Set(tokenize(rawText));

  if (jobTokens.length === 0) return 50;

  const uniqueJobTokens = [...new Set(jobTokens)];
  const covered = uniqueJobTokens.filter(t => resumeTokens.has(t)).length;
  const coverage = covered / uniqueJobTokens.length;

  return Math.min(100, coverage * 120);
}
