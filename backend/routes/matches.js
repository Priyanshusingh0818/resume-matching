import { Router } from 'express';
import {
  getAllMatches, getMatchById, getMatchesByUser, getMatchesByJob,
  createMatch, updateMatchScore, deleteMatch, generateMatches, getJobFitExplanation,
} from '../controllers/matchController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', getAllMatches);
router.post('/', createMatch);
router.get('/generate', protect, requireRole('student'), aiLimiter, generateMatches);
router.get('/user/:userId', getMatchesByUser);
router.get('/job/:jobId', getMatchesByJob);
router.get('/:id', getMatchById);
router.get('/:id/explanation', protect, aiLimiter, getJobFitExplanation);
router.patch('/:id/score', updateMatchScore);
router.delete('/:id', deleteMatch);

export default router;
