// routes/auth.js — Express router for /api/auth

import { Router }            from 'express';
import { register, login, getMe, changePassword } from '../controllers/authController.js';
import { protect }           from '../middleware/authMiddleware.js';

const router = Router();

// POST   /api/auth/register  →  create account + return JWT
// POST   /api/auth/login     →  verify credentials + return JWT
// GET    /api/auth/me        →  return current user (JWT required)
// PUT    /api/auth/password  →  change password (JWT required)

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
router.put('/password',  protect, changePassword);

export default router;
