import { Router } from 'express';
import multer from 'multer';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { uploadAndAnalyzeResume, getResume, getResumeImprovements } from '../controllers/resumeController.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/upload', protect, requireRole('student'), aiLimiter, upload.single('resume'), uploadAndAnalyzeResume);
router.get('/', protect, requireRole('student'), getResume);
router.get('/improvements', protect, requireRole('student'), aiLimiter, getResumeImprovements);

export default router;
