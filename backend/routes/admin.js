import { Router } from 'express';
import { 
  getAdminStats, 
  getAdminResumes, 
  updateMatchStatus, 
  exportCandidatesCSV, 
  getMatchInsights 
} from '../controllers/adminController.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all admin routes securely
router.use(protect, requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/resumes', getAdminResumes);
router.patch('/matches/:id/status', updateMatchStatus);
router.get('/matches/:id/insights', getMatchInsights);
router.get('/export/candidates', exportCandidatesCSV);

export default router;
