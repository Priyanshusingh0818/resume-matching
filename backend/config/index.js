import 'dotenv/config';

const config = {
  port: parseInt(process.env.PORT || '5000', 10),

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: 'llama-3.3-70b-versatile',
    maxRetries: 3,
    timeoutMs: 30000,
    temperature: 0.1,
  },

  scoring: {
    weights: {
      skills: 0.40,
      experience: 0.25,
      education: 0.10,
      keywords: 0.15,
      quality: 0.10,
    },
    skillCategories: {
      hard: 1.0,
      framework: 0.9,
      tool: 0.8,
      soft: 0.5,
    },
  },

  rateLimit: {
    general: { windowMs: 15 * 60 * 1000, max: 500 },
    ai: { windowMs: 15 * 60 * 1000, max: 60 },
    auth: { windowMs: 15 * 60 * 1000, max: 50 },
  },

  upload: {
    maxFileSizeMB: 10,
  },
};

// Validate critical config at startup
if (!config.groq.apiKey) {
  console.warn('[config] ⚠ GROQ_API_KEY is not set. AI features will use fallback responses.');
}
if (config.jwt.secret === 'fallback_dev_secret_change_me') {
  console.warn('[config] ⚠ JWT_SECRET is using default value. Set a strong secret in .env');
}

export default config;
