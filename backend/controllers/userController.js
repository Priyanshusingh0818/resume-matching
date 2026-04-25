// controllers/userController.js — Request handlers for /api/users

import User from '../models/User.js';

/**
 * GET /api/users
 * Return all users (no passwords).
 */
export function getAllUsers(req, res) {
  try {
    const users = User.getAll();
    res.json({ success: true, data: users });
  } catch (err) {
    console.error('[userController] getAllUsers error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

/**
 * GET /api/users/:id
 * Return a single user by ID.
 */
export function getUserById(req, res) {
  try {
    const user = User.getById(Number(req.params.id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('[userController] getUserById error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
}

/**
 * POST /api/users
 * Create a new user.
 * Body: { name, email, password, role? }
 */
export function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'name, email, and password are required.' });
    }

    const result = User.create({ name, email, password, role });
    res.status(201).json({ success: true, data: { id: result.id } });
  } catch (err) {
    console.error('[userController] createUser error:', err.message);
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
}

/**
 * PUT /api/users/:id
 * Update a user.
 * Body: { name, email, role }
 */
export function updateUser(req, res) {
  try {
    const { name, email, role } = req.body;
    const id = Number(req.params.id);

    const existing = User.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    User.update(id, {
      name: name ?? existing.name,
      email: email ?? existing.email,
      role: role ?? existing.role,
    });
    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    console.error('[userController] updateUser error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
}

/**
 * DELETE /api/users/:id
 * Delete a user.
 */
export function deleteUser(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = User.getById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    User.delete(id);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('[userController] deleteUser error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
}
