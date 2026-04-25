import db from '../db.js';
import { computeAdminAnalytics } from '../services/analyticsService.js';
import { generateMatchInsight } from '../services/aiService.js';

export function getAdminStats(req, res) {
  try {
    const data = computeAdminAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    console.error('[adminController] getAdminStats error:', error.message);
    res.status(500).json({ success: false, error: { code: 'STATS_FAILED', message: 'Failed to generate admin statistics.' } });
  }
}

export function getAdminResumes(req, res) {
  try {
    const poolData = db.prepare(`
      SELECT m.id as match_id, u.name, p.location, p.education, m.score,
             m.skills_score, m.experience_score, m.status, r.content as resume_content,
             j.title as role
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      JOIN matches m ON u.id = m.user_id
      JOIN jobs j ON m.job_id = j.id
      LEFT JOIN resumes r ON u.id = r.user_id
      WHERE m.is_applied = 1
      ORDER BY m.score DESC
    `).all();

    const formattedPool = poolData.map(c => {
      let university = 'Not specified';
      try {
        const eduArray = JSON.parse(c.education || '[]');
        if (eduArray.length > 0 && eduArray[0].school) university = eduArray[0].school;
      } catch {}

      let skills = [];
      try {
        const parsed = JSON.parse(c.resume_content || '{}');
        skills = (parsed.skills || []).slice(0, 6);
      } catch {}

      return {
        id: c.match_id,
        name: c.name,
        role: c.role || 'Not specified',
        location: c.location || 'Remote',
        university,
        skills,
        score: Math.round(c.score),
        skillsScore: Math.round(c.skills_score || 0),
        experienceScore: Math.round(c.experience_score || 0),
        status: c.status || 'Pending',
      };
    });

    res.json({ success: true, data: formattedPool });
  } catch (error) {
    console.error('[adminController] getAdminResumes error:', error.message);
    res.status(500).json({ success: false, error: { code: 'POOL_FAILED', message: 'Failed to load Candidate Pool.' } });
  }
}

export function updateMatchStatus(req, res) {
  try {
    const matchId = req.params.id;
    const { status } = req.body;

    if (!['Shortlisted', 'Rejected', 'Pending', 'Reviewed'].includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION', message: 'Invalid status label.' } });
    }

    const info = db.prepare('UPDATE matches SET status = ? WHERE id = ?').run(status, matchId);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found.' } });
    }

    res.json({ success: true, message: 'Status updated successfully.' });
  } catch (error) {
    console.error('[adminController] updateMatchStatus error:', error.message);
    res.status(500).json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update status.' } });
  }
}

export function exportCandidatesCSV(req, res) {
  try {
    const { status } = req.query;
    let query = `
      SELECT m.id, u.name, u.email, p.location, p.phone, p.education, m.score, m.status, r.content as resume_content
      FROM users u LEFT JOIN profiles p ON u.id = p.user_id JOIN matches m ON u.id = m.user_id
      LEFT JOIN resumes r ON u.id = r.user_id WHERE m.is_applied = 1`;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND m.status = ?`;
      params.push(status.charAt(0).toUpperCase() + status.slice(1));
    }
    query += ` ORDER BY m.score DESC`;

    const candidates = db.prepare(query).all(...params);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="candidates.csv"');
    res.write('Match ID,Name,Email,Location,Phone,Score,Status,Skills\n');

    const clean = (str) => `"${(str || '').toString().replace(/"/g, '""').replace(/\n/g, ' ')}"`;

    for (const c of candidates) {
      let skills = '';
      try {
        const parsed = JSON.parse(c.resume_content || '{}');
        skills = Array.isArray(parsed.skills) ? parsed.skills.join('; ') : '';
      } catch {}
      res.write(`${c.id},${clean(c.name)},${clean(c.email)},${clean(c.location)},${clean(c.phone)},${c.score},${c.status},${clean(skills)}\n`);
    }
    res.end();
  } catch (error) {
    console.error('[adminController] exportCandidatesCSV error:', error.message);
    res.status(500).send('Failed to generate CSV export.');
  }
}

export async function getMatchInsights(req, res) {
  try {
    const matchId = req.params.id;
    const currMatch = db.prepare(`
      SELECT m.insights, m.score, r.content as resume_content, j.description as job_req
      FROM matches m JOIN resumes r ON m.user_id = r.user_id JOIN jobs j ON m.job_id = j.id
      WHERE m.id = ?
    `).get(matchId);

    if (!currMatch) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Match not found.' } });
    }

    if (currMatch.insights) {
      return res.json({ success: true, insight: currMatch.insights });
    }

    const aiResult = await generateMatchInsight(currMatch.resume_content, currMatch.job_req, currMatch.score);
    if (aiResult.success) {
      try {
        const data = JSON.parse(aiResult.content);
        const insight = data.insight || 'Analysis complete.';
        db.prepare('UPDATE matches SET insights = ? WHERE id = ?').run(insight, matchId);
        return res.json({ success: true, insight });
      } catch {
        return res.json({ success: true, insight: 'AI returned an invalid response format.' });
      }
    }

    return res.json({ success: true, insight: `Compatibility score of ${Math.round(currMatch.score)}% was computed based on skill overlap, experience relevance, and keyword coverage.` });
  } catch (error) {
    console.error('[adminController] getMatchInsights error:', error.message);
    res.status(500).json({ success: false, error: { code: 'INSIGHT_FAILED', message: 'Failed to build insights.' } });
  }
}
