import config from '../config/index.js';

// Simple in-memory rate limiter (no external dependencies)
const stores = {};

function createLimiter(name, windowMs, maxRequests) {
  stores[name] = {};

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const store = stores[name];

    if (!store[key] || now - store[key].windowStart > windowMs) {
      store[key] = { windowStart: now, count: 0 };
    }

    store[key].count++;

    if (store[key].count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
        },
      });
    }

    next();
  };
}

export const generalLimiter = createLimiter(
  'general',
  config.rateLimit.general.windowMs,
  config.rateLimit.general.max
);

export const aiLimiter = createLimiter(
  'ai',
  config.rateLimit.ai.windowMs,
  config.rateLimit.ai.max
);

export const authLimiter = createLimiter(
  'auth',
  config.rateLimit.auth.windowMs,
  config.rateLimit.auth.max
);
