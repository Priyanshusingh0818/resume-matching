import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './db.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { generalLimiter, authLimiter } from './middleware/rateLimiter.js';
import config from './config/index.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import jobRoutes from './routes/jobs.js';
import resumeRoutes from './routes/resumes.js';
import resumeRoute from './routes/resume.js';
import matchRoutes from './routes/matches.js';
import profileRoutes from './routes/profile.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';

const app = express();

// Middleware
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '5mb' }));
app.use(generalLimiter);

// Request logger
app.use((req, _res, next) => {
  if (req.method !== 'OPTIONS') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health check
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'SmartMatch AI Backend API v2.0',
    version: '2.0.0',
  });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/resume', resumeRoute);
app.use('/api/matches', matchRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.originalUrl} not found.` } });
});

// Global error handler
app.use(globalErrorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`\n✅ SmartMatch AI Backend v2.0 running on http://localhost:${PORT}\n`);
});
