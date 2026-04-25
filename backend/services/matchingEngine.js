import { computeJobMatchScore } from './scoringEngine.js';
import db from '../db.js';

export function generateMatchesForUser(userId) {
  // 1. Fetch user's latest resume and parsed data
  const resume = db.prepare('SELECT * FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
  if (!resume) {
    throw new Error('Please upload a resume first to see matched jobs.');
  }

  const parsedRow = db.prepare('SELECT * FROM parsed_data WHERE resume_id = ? ORDER BY created_at DESC LIMIT 1').get(resume.id);
  let parsedData = { skills: [] };
  if (parsedRow) {
    parsedData = {
      skills: safeJsonParse(parsedRow.skills, []),
      experience: parsedRow.summary || '',
      education: '',
      experience_entries: safeJsonParse(parsedRow.experience_entries, []),
      education_entries: safeJsonParse(parsedRow.education_entries, []),
    };
  } else {
    // Fallback: parse from resume content JSON
    const content = safeJsonParse(resume.content, {});
    parsedData = {
      skills: content.skills || [],
      experience: content.experience || '',
      education: content.education || '',
      experience_entries: content.experience_entries || [],
      education_entries: content.education_entries || [],
    };
  }

  const rawText = resume.raw_text || '';

  // 2. Fetch all jobs
  const jobs = db.prepare('SELECT * FROM jobs ORDER BY created_at DESC').all();

  // 3. Cache existing matches to preserve status, is_applied, and insights
  const existingMatches = db.prepare('SELECT job_id, status, is_applied, insights FROM matches WHERE user_id = ?').all(userId);
  const existingMap = new Map(existingMatches.map(m => [m.job_id, m]));

  // Clear old matches for this user
  db.prepare('DELETE FROM matches WHERE user_id = ?').run(userId);

  // 4. Compute match scores
  const results = [];
  for (const job of jobs) {
    const jobSkills = safeJsonParse(job.skills, []);
    if (!Array.isArray(jobSkills)) continue;

    const matchResult = computeJobMatchScore(parsedData, rawText, jobSkills, job.description);
    
    // Restore previous state if it exists
    const prev = existingMap.get(job.id) || { status: 'Pending', is_applied: 0, insights: null };

    // Insert match with breakdown and preserved state
    const insertResult = db.prepare(`
      INSERT INTO matches (user_id, job_id, score, skills_score, experience_score, education_score, keyword_score, quality_score, status, is_applied, insights)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId, job.id, matchResult.total,
      matchResult.breakdown.skills,
      matchResult.breakdown.experience,
      matchResult.breakdown.education,
      matchResult.breakdown.keywords,
      matchResult.breakdown.quality,
      prev.status,
      prev.is_applied,
      prev.insights
    );

    results.push({
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      skills: jobSkills,
      created_at: job.created_at,
      match: {
        matchId: Number(insertResult.lastInsertRowid),
        matchScore: matchResult.total,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills,
        breakdown: matchResult.breakdown,
        experienceMatch: matchResult.breakdown.experience >= 50,
        educationMatch: matchResult.breakdown.education >= 50,
        is_applied: prev.is_applied === 1
      },
    });
  }

  // Sort by score descending
  results.sort((a, b) => b.match.matchScore - a.match.matchScore);

  return results;
}

function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  if (typeof str === 'object') return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}
