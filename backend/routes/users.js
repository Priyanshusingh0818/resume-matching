// routes/users.js — Express router for /api/users

import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = Router();

// GET    /api/users        → list all users
// POST   /api/users        → create a user
// GET    /api/users/:id    → get one user
// PUT    /api/users/:id    → update a user
// DELETE /api/users/:id    → delete a user

router.get('/',      getAllUsers);
router.post('/',     createUser);
router.get('/:id',   getUserById);
router.put('/:id',   updateUser);
router.delete('/:id', deleteUser);

export default router;
