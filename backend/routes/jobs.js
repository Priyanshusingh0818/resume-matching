// routes/jobs.js — Express router for /api/jobs (with auth protection)

import { Router } from 'express';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController.js';

const router = Router();

// ── Public routes ─────────────────────────────────────────────────────────────
// GET  /api/jobs        → any visitor (no token needed — students browse freely)
// GET  /api/jobs/:id    → single job detail
router.get('/',    getAllJobs);
router.get('/:id', getJobById);

// ── Admin-only routes ─────────────────────────────────────────────────────────
// POST   /api/jobs        → create a job  (JWT required + admin role)
// PUT    /api/jobs/:id    → update a job  (JWT required + admin role)
// DELETE /api/jobs/:id    → delete a job  (JWT required + admin role)
router.post('/',      protect, requireRole('admin'), createJob);
router.put('/:id',    protect, requireRole('admin'), updateJob);
router.delete('/:id', protect, requireRole('admin'), deleteJob);

export default router;
