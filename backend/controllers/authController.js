// controllers/authController.js
// Handles user registration and login

import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import db     from '../db.js';
import 'dotenv/config';

const JWT_SECRET     = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS    = 12; // bcrypt work factor — higher = slower to brute-force

// ─── Helper: build a signed JWT ──────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password, role? }   role defaults to "student"
// ──────────────────────────────────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { name, email, password, role = 'student' } = req.body;

    // ── Validate required fields ───────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and password are required.',
      });
    }

    // ── Validate email format ──────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    // ── Validate password strength ─────────────────────────────────────────
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    // ── Validate role ──────────────────────────────────────────────────────
    const allowedRoles = ['student', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `role must be one of: ${allowedRoles.join(', ')}.`,
      });
    }

    // ── Check for duplicate email ──────────────────────────────────────────
    const existingUser = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email.toLowerCase().trim());

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ── Hash password ──────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ── Insert user ────────────────────────────────────────────────────────
    const result = db
      .prepare(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
      )
      .run(name.trim(), email.toLowerCase().trim(), hashedPassword, role);

    const newUser = db
      .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
      .get(result.lastInsertRowid);

    // ── Issue token so user is logged in immediately after register ────────
    const token = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: newUser,
      },
    });
  } catch (err) {
    console.error('[authController] register error:', err.message);
    return res.status(500).json({ success: false, message: 'Registration failed.' });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ──────────────────────────────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // ── Validate input ─────────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required.',
      });
    }

    // ── Look up user ───────────────────────────────────────────────────────
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email.toLowerCase().trim());

    // Deliberately vague — don't reveal whether the email exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Verify password ────────────────────────────────────────────────────
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Build safe user object (no password) ──────────────────────────────
    const safeUser = {
      id:         user.id,
      name:       user.name,
      email:      user.email,
      role:       user.role,
      created_at: user.created_at,
    };

    // ── Sign and return JWT ────────────────────────────────────────────────
    const token = signToken(safeUser);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (err) {
    console.error('[authController] login error:', err.message);
    return res.status(500).json({ success: false, message: 'Login failed.' });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me   (protected — requires valid JWT)
// Returns the currently authenticated user's profile
// ──────────────────────────────────────────────────────────────────────────────
export function getMe(req, res) {
  try {
    // req.user is populated by the protect middleware
    const user = db
      .prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?')
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error('[authController] getMe error:', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch profile.' });
  }
}
