import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import env from './config/env.js';
import connectDB from './config/db.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import errorHandler, { notFound } from './middleware/error.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import companyRoutes from './routes/company.routes.js';
import problemRoutes from './routes/problem.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';
import seoRoutes from './routes/seo.routes.js';

// Progress controller for dashboard (separate route)
import { getDashboard } from './controllers/progress.controller.js';
import { protect } from './middleware/auth.middleware.js';

const app = express();

// Connect to Database here because Vercel bypasses server.js
// and imports app.js directly as a serverless function.
connectDB();

// Trust the first proxy (Vercel) so express-rate-limit and req.ip
// correctly resolve the client IP from the X-Forwarded-For header.
app.set('trust proxy', 1);

// ──────────────────────────────────────────
// Security Middleware
// ──────────────────────────────────────────
app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ──────────────────────────────────────────
// Request Parsing
// ──────────────────────────────────────────
app.use(express.json({ limit: '40mb' }));
app.use(express.urlencoded({ extended: true, limit: '40mb' }));

// ──────────────────────────────────────────
// Logging
// ──────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ──────────────────────────────────────────
// Rate Limiting
// ──────────────────────────────────────────
// app.use('/api', generalLimiter);

// ──────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy.',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ──────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', protect, getDashboard);
app.use('/api/seo', seoRoutes);

// ──────────────────────────────────────────
// 404 & Error Handling (must be last)
// ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
