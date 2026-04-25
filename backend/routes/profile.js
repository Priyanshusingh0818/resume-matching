import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

// Require user to be authenticated to view or change their profile
router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
