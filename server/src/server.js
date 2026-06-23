import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import env from './config/env.js';
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import topicRoutes from './routes/topics.js';
import exerciseRoutes from './routes/exercises.js';
import testRoutes from './routes/tests.js';
import aiRoutes from './routes/ai.js';
import analyticsRoutes from './routes/analytics.js';
import reportRoutes from './routes/reports.js';

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || env.nodeEnv === 'development') {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many auth attempts, please try again later' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message, err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
});
