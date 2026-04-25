import { generateMatchesForUser } from '../services/matchingEngine.js';
import { generateJobFitExplanation } from '../services/aiService.js';
import { logAnalyticsEvent } from '../services/analyticsService.js';
import Match from '../models/Match.js';
import db from '../db.js';

export function getAllMatches(req, res) {
  try {
    res.json({ success: true, data: Match.getAll() });
  } catch (err) {
    console.error('[matchController] getAllMatches error:', err.message);
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch matches.' } });
  }
}

export function getMatchById(req, res) {
  try {
    const match = Match.getById(Number(req.params.id));
    if (!match) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found.' } });
    }
    res.json({ success: true, data: match });
  } catch (err) {
    console.error('[matchController] getMatchById error:', err.message);
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch match.' } });
  }
}

export function getMatchesByUser(req, res) {
  try {
    const matches = Match.getByUserId(Number(req.params.userId));
    res.json({ success: true, data: matches });
  } catch (err) {
    console.error('[matchController] getMatchesByUser error:', err.message);
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch user matches.' } });
  }
}

export function getMatchesByJob(req, res) {
  try {
    const matches = Match.getByJobId(Number(req.params.jobId));
    res.json({ success: true, data: matches });
  } catch (err) {
    console.error('[matchController] getMatchesByJob error:', err.message);
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch job matches.' } });
  }
}

export function createMatch(req, res) {
  try {
    const { user_id, job_id, score } = req.body;
    if (!user_id || !job_id) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'user_id and job_id are required.' } });
    }
    const result = Match.create({ user_id, job_id, score });
    res.status(201).json({ success: true, data: { id: result.id } });
  } catch (err) {
    console.error('[matchController] createMatch error:', err.message);
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create match.' } });
  }
}

export function updateMatchScore(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Match.getById(id)) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found.' } });
    }
    const { score } = req.body;
    if (score === undefined) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'score is required.' } });
    }
    Match.updateScore(id, score);
    res.json({ success: true, message: 'Match score updated.' });
  } catch (err) {
    console.error('[matchController] updateMatchScore error:', err.message);
    res.status(500).json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update match score.' } });
  }
}

export function deleteMatch(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Match.getById(id)) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found.' } });
    }
    Match.delete(id);
    res.json({ success: true, message: 'Match deleted successfully.' });
  } catch (err) {
    console.error('[matchController] deleteMatch error:', err.message);
    res.status(500).json({ success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete match.' } });
  }
}

export function generateMatches(req, res) {
  try {
    const userId = Number(req.user?.id);
    const results = generateMatchesForUser(userId);

    logAnalyticsEvent(userId, 'matches_generated', {
      jobsMatched: results.length,
      topScore: results[0]?.match?.matchScore || 0,
    });

    res.json({ success: true, data: results });
  } catch (err) {
    console.error('[matchController] generateMatches error:', err.message);
    const status = err.message?.includes('upload a resume') ? 400 : 500;
    res.status(status).json({ success: false, error: { code: 'MATCH_FAILED', message: err.message || 'Match generation failed.' } });
  }
}

export async function getJobFitExplanation(req, res) {
  try {
    const matchId = Number(req.params.id);
    const match = db.prepare(`
      SELECT m.*, j.title, j.description, j.skills as job_skills, r.content as resume_content
      FROM matches m JOIN jobs j ON m.job_id = j.id JOIN resumes r ON m.user_id = r.user_id
      WHERE m.id = ?
    `).get(matchId);

    if (!match) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found.' } });
    }

    let resumeSkills = [];
    try { resumeSkills = JSON.parse(match.resume_content || '{}').skills || []; } catch {}

    const breakdown = {
      skills: Math.round(match.skills_score || 0),
      experience: Math.round(match.experience_score || 0),
      education: Math.round(match.education_score || 0),
      keywords: Math.round(match.keyword_score || 0),
      quality: Math.round(match.quality_score || 0),
    };

    const aiResult = await generateJobFitExplanation(
      resumeSkills, match.title, match.description, Math.round(match.score), breakdown
    );

    if (aiResult.success) {
      try {
        const data = JSON.parse(aiResult.content);
        return res.json({ success: true, data: { ...data, breakdown } });
      } catch {
        return res.json({ success: true, data: { explanation: 'AI response was invalid.', strengths: [], improvements: [], fit_level: 'moderate', breakdown } });
      }
    }

    return res.json({
      success: true,
      data: {
        explanation: `This match is based on ${breakdown.skills}% skill alignment, ${breakdown.experience}% experience relevance, and ${breakdown.keywords}% keyword coverage.`,
        strengths: ['Score was computed deterministically based on skill overlap and keyword analysis'],
        improvements: ['AI explanation service is temporarily unavailable'],
        fit_level: match.score >= 70 ? 'strong' : match.score >= 50 ? 'moderate' : 'weak',
        breakdown,
      },
    });
  } catch (error) {
    console.error('[matchController] getJobFitExplanation error:', error);
    res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: 'Failed to generate explanation.' } });
  }
}
