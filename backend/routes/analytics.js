import { Router } from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoint: GET /api/analytics
router.get('/', protect, requireRole('student'), getAnalytics);

export default router;
