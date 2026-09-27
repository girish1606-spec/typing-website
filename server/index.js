import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase } from './models/dbStore.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import typingRoutes from './routes/typingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import developerRoutes from './routes/developerRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const APP_ORIGIN = process.env.APP_ORIGIN || 'http://localhost:5173';

// -------------------------------------------------------------
// Security & Utility Middlewares
// -------------------------------------------------------------
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow local development ports or specified origin
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === APP_ORIGIN) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, lockable in prod
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply general API rate limiter
app.use('/api', apiLimiter);

// -------------------------------------------------------------
// API Routes Mounting
// -------------------------------------------------------------
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/typing', typingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/developer', developerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    name: 'TYPE SPEED API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on TYPE SPEED server.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong. Please try again.',
    ...(isDev && { error: err.toString() })
  });
});

// -------------------------------------------------------------
// Start Server after Database Initialization
// -------------------------------------------------------------
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 TYPE SPEED Backend Server is running at http://localhost:${PORT}`);
      console.log(`🔐 Developer portal API available at http://localhost:${PORT}/api/developer`);
    });
  } catch (error) {
    console.error('Fatal server boot error:', error);
    process.exit(1);
  }
}

startServer();
