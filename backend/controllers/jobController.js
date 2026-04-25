// controllers/jobController.js — Request handlers for /api/jobs
// Skills are stored as a JSON string array in SQLite and parsed on read.

import Job from '../models/Job.js';

// ─── Helper: normalise the skills field after reading from DB ─────────────────
// Skills are stored as JSON string → parse to array for the frontend
function parseJobSkills(job) {
  if (!job) return null;
  try {
    return { ...job, skills: JSON.parse(job.skills) };
  } catch {
    // Fallback: comma-split for legacy plain-text rows
    return { ...job, skills: job.skills.split(',').map((s) => s.trim()) };
  }
}

// ─── GET /api/jobs ───────────────────────────────────────────────────────────
export function getAllJobs(req, res) {
  try {
    const jobs = Job.getAll().map(parseJobSkills);
    res.json({ success: true, data: jobs });
  } catch (err) {
    console.error('[jobController] getAllJobs error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch jobs.' });
  }
}

// ─── GET /api/jobs/:id ───────────────────────────────────────────────────────
export function getJobById(req, res) {
  try {
    const job = parseJobSkills(Job.getById(Number(req.params.id)));
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    res.json({ success: true, data: job });
  } catch (err) {
    console.error('[jobController] getJobById error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch job.' });
  }
}

// ─── POST /api/jobs (admin only — enforced in router) ───────────────────────
// Body: { title, description, skills: string[], company? }
// company is optional — defaults to the admin's name (org)
export function createJob(req, res) {
  try {
    const { title, description, skills, company } = req.body;

    // Validate required fields
    if (!title || !description || !skills) {
      return res.status(400).json({
        success: false,
        message: 'title, description, and skills are required.',
      });
    }

    // skills must be an array with at least one entry
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'skills must be a non-empty array, e.g. ["React","Node.js"].',
      });
    }

    // Auto-fill company from the admin's user name if not provided
    const companyName = company?.trim() || req.user?.name || 'Unknown';

    // Store skills as JSON string
    const skillsJson = JSON.stringify(skills.map((s) => String(s).trim()));

    const result = Job.create({
      title:       title.trim(),
      description: description.trim(),
      skills:      skillsJson,
      company:     companyName,
    });

    // Fetch the full freshly-created row to return it
    const created = parseJobSkills(Job.getById(result.id));

    return res.status(201).json({
      success: true,
      message: 'Job created successfully.',
      data: created,
    });
  } catch (err) {
    console.error('[jobController] createJob error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create job.' });
  }
}

// ─── PUT /api/jobs/:id (admin only) ─────────────────────────────────────────
export function updateJob(req, res) {
  try {
    const id       = Number(req.params.id);
    const existing = Job.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const { title, description, skills, company } = req.body;

    // If skills provided it must be an array
    if (skills !== undefined && (!Array.isArray(skills) || skills.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'skills must be a non-empty array.',
      });
    }

    const skillsJson = skills
      ? JSON.stringify(skills.map((s) => String(s).trim()))
      : existing.skills;

    Job.update(id, {
      title:       title       ? title.trim()       : existing.title,
      description: description ? description.trim() : existing.description,
      skills:      skillsJson,
      company:     company     ? company.trim()     : existing.company,
    });

    return res.json({ success: true, message: 'Job updated successfully.' });
  } catch (err) {
    console.error('[jobController] updateJob error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update job.' });
  }
}

// ─── DELETE /api/jobs/:id (admin only) ──────────────────────────────────────
export function deleteJob(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Job.getById(id)) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }
    Job.delete(id);
    return res.json({ success: true, message: 'Job deleted successfully.' });
  } catch (err) {
    console.error('[jobController] deleteJob error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete job.' });
  }
}
