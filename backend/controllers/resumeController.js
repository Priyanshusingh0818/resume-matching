import db from '../db.js';
import { parseResumeFile } from '../services/resumeParser.js';
import { computeATSScore } from '../services/scoringEngine.js';
import { generateResumeImprovements } from '../services/aiService.js';
import { logAnalyticsEvent } from '../services/analyticsService.js';
import { extractYearsOfExperience } from '../utils/textNormalizer.js';

export async function uploadAndAnalyzeResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'NO_FILE', message: 'No file uploaded.' } });
    }

    const userId = req.user.id;

    // Step 1: Parse PDF or DOCX
    const { rawText, parsedData, aiUsed } = await parseResumeFile(req.file.buffer, req.file.originalname);

    // Step 2: Compute deterministic ATS score
    const atsResult = computeATSScore(parsedData, rawText);

    // Step 3: Save to database
    const contentString = JSON.stringify({
      skills: parsedData.skills,
      experience: parsedData.experience,
      education: parsedData.education,
      recommendations: parsedData.recommendations,
    });

    const existingResume = db.prepare('SELECT id, version FROM resumes WHERE user_id = ?').get(userId);
    let resumeId;

    if (existingResume) {
      const newVersion = (existingResume.version || 1) + 1;
      db.prepare('UPDATE resumes SET content = ?, score = ?, raw_text = ?, version = ?, file_data = ?, file_name = ?, file_type = ? WHERE user_id = ?')
        .run(contentString, atsResult.total, rawText, newVersion, req.file.buffer, req.file.originalname, req.file.mimetype, userId);
      resumeId = existingResume.id;
    } else {
      const result = db.prepare('INSERT INTO resumes (user_id, content, score, raw_text, version, file_data, file_name, file_type) VALUES (?, ?, ?, ?, 1, ?, ?, ?)')
        .run(userId, contentString, atsResult.total, rawText, req.file.buffer, req.file.originalname, req.file.mimetype);
      resumeId = Number(result.lastInsertRowid);
    }

    // Step 4: Save parsed data
    const existingParsed = db.prepare('SELECT id FROM parsed_data WHERE resume_id = ?').get(resumeId);
    const yearsExp = extractYearsOfExperience(rawText);

    if (existingParsed) {
      db.prepare(`UPDATE parsed_data SET skills = ?, experience_entries = ?, education_entries = ?,
        certifications = ?, summary = ?, years_of_experience = ? WHERE resume_id = ?`)
        .run(
          JSON.stringify(parsedData.skills),
          JSON.stringify(parsedData.experience_entries || []),
          JSON.stringify(parsedData.education_entries || []),
          JSON.stringify(parsedData.certifications || []),
          parsedData.summary || parsedData.experience || '',
          yearsExp,
          resumeId
        );
    } else {
      db.prepare(`INSERT INTO parsed_data (resume_id, user_id, skills, experience_entries, education_entries,
        certifications, summary, years_of_experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(
          resumeId, userId,
          JSON.stringify(parsedData.skills),
          JSON.stringify(parsedData.experience_entries || []),
          JSON.stringify(parsedData.education_entries || []),
          JSON.stringify(parsedData.certifications || []),
          parsedData.summary || parsedData.experience || '',
          yearsExp
        );
    }

    // Step 5: Log event
    logAnalyticsEvent(userId, 'resume_parsed', {
      score: atsResult.total,
      skillsFound: parsedData.skills.length,
      aiUsed,
    });

    return res.json({
      success: true,
      message: 'Resume analyzed successfully.',
      data: {
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        score: atsResult.total,
        breakdown: atsResult.breakdown,
        recommendations: parsedData.recommendations,
        summary: parsedData.summary || '',
        aiUsed,
      },
    });
  } catch (error) {
    console.error('[resumeController] uploadAndAnalyzeResume error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      error: { code: 'ANALYSIS_FAILED', message: error.message || 'An error occurred during resume analysis.' },
    });
  }
}

export async function getResume(req, res) {
  try {
    const userId = req.user.id;
    const resume = db.prepare('SELECT content, score, raw_text, file_name FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);

    if (!resume) {
      return res.json({ success: true, data: null });
    }

    let parsedContent = {};
    try { parsedContent = JSON.parse(resume.content); } catch {}

    // Get score breakdown from most recent match or recompute
    const parsedRow = db.prepare('SELECT * FROM parsed_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
    let parsedData = parsedContent;
    if (parsedRow) {
      try {
        parsedData = {
          ...parsedContent,
          skills: JSON.parse(parsedRow.skills || '[]'),
          experience_entries: JSON.parse(parsedRow.experience_entries || '[]'),
          education_entries: JSON.parse(parsedRow.education_entries || '[]'),
          certifications: JSON.parse(parsedRow.certifications || '[]'),
          summary: parsedRow.summary || '',
        };
      } catch {}
    }

    // Recompute score breakdown deterministically
    const { computeATSScore: recompute } = await import('../services/scoringEngine.js');
    const atsResult = recompute(parsedData, resume.raw_text || '');

    return res.json({
      success: true,
      data: {
        ...parsedContent,
        skills: parsedData.skills || parsedContent.skills || [],
        score: atsResult.total,
        breakdown: atsResult.breakdown,
        summary: parsedData.summary || '',
        experience_entries: parsedData.experience_entries || [],
        education_entries: parsedData.education_entries || [],
        certifications: parsedData.certifications || [],
        file_name: resume.file_name || null,
      },
    });
  } catch (error) {
    console.error('[resumeController] getResume error:', error);
    return res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Server error retrieving resume.' } });
  }
}

export async function getResumeImprovements(req, res) {
  try {
    const userId = req.user.id;
    const resume = db.prepare('SELECT content, score FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);

    if (!resume) {
      return res.status(404).json({ success: false, error: { code: 'NO_RESUME', message: 'Upload a resume first.' } });
    }

    let parsed = {};
    try { parsed = JSON.parse(resume.content); } catch {}

    const aiResult = await generateResumeImprovements(
      parsed.skills || [],
      parsed.experience || '',
      parsed.education || '',
      resume.score
    );

    if (aiResult.success) {
      try {
        const data = JSON.parse(aiResult.content);
        return res.json({ success: true, data });
      } catch {
        return res.json({ success: true, data: { overall_assessment: 'AI returned an invalid response. Please try again.', critical_improvements: [], skill_suggestions: [], formatting_tips: [], score_potential: resume.score } });
      }
    } else {
      return res.json({
        success: true,
        data: {
          overall_assessment: 'AI improvement service is temporarily unavailable.',
          critical_improvements: ['Ensure your resume has clearly labeled sections (Experience, Education, Skills)', 'Add quantifiable achievements with numbers and percentages', 'Include relevant keywords from target job descriptions'],
          skill_suggestions: [],
          formatting_tips: ['Use a single-column layout for ATS compatibility', 'Save as PDF to preserve formatting'],
          score_potential: Math.min(100, resume.score + 15),
        },
      });
    }
  } catch (error) {
    console.error('[resumeController] getResumeImprovements error:', error);
    return res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: 'Failed to generate improvements.' } });
  }
}

export async function downloadResume(req, res) {
  try {
    const userId = req.user.id;
    const resume = db.prepare('SELECT file_data, file_name, file_type FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);

    if (!resume || !resume.file_data) {
      return res.status(404).json({ success: false, error: { message: 'Original file not found. Please upload again.' } });
    }

    res.setHeader('Content-Type', resume.file_type || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.file_name || 'resume.pdf'}"`);
    return res.send(resume.file_data);
  } catch (error) {
    console.error('[resumeController] downloadResume error:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to download resume.' } });
  }
}
