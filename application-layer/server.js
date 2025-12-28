import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import cors from 'cors';
import { errorHandler } from '../infrastructure-layer/logger/error-handler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Import routes
import authRoutes from './controllers/auth-controller.js';
import menuRoutes from './controllers/menu-controller.js';
import orderRoutes from './controllers/order-controller.js';
import analyticsRoutes from './controllers/analytics-controller.js';

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST;

const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://127.0.0.1:5173']
)
  .map((o) => o.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Coffee Base API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = HOST
  ? app.listen(PORT, HOST, () => {
      console.log(`🚀 Coffee Base API server running on http://${HOST}:${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    })
  : app.listen(PORT, () => {
      console.log(`🚀 Coffee Base API server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

export { server };

export default app;

