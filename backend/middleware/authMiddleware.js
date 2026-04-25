// middleware/authMiddleware.js
// Verifies JWT on every protected route and populates req.user

import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

// ─── Primary auth guard ────────────────────────────────────────────────────────
/**
 * Attach to any route that requires a logged-in user.
 *
 * Expects:  Authorization: Bearer <token>
 * Injects:  req.user = { id, name, email, role }
 */
export function protect(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed authorization header.',
      });
    }

    // Throws if expired or tampered
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, name, email, role, iat, exp }
    next();
  } catch (err) {
    console.error('[authMiddleware] Token error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    res.status(500).json({ success: false, message: 'Authentication error.' });
  }
}

// ─── Role-based access control ─────────────────────────────────────────────────
/**
 * Restrict a route to specific roles.
 * Must be used AFTER `protect`.
 *
 * @example
 *   router.get('/admin-only', protect, requireRole('admin'), handler)
 *   router.get('/any-user',   protect, requireRole('admin', 'student'), handler)
 *
 * @param {...string} roles  Allowed role strings
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
}
