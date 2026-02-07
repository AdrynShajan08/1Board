const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Coin MF Dashboard API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        loginURL: 'GET /api/auth/login-url',
        session: 'POST /api/auth/session',
        validate: 'GET /api/auth/validate',
        profile: 'GET /api/auth/profile'
      },
      portfolio: {
        summary: 'GET /api/portfolio/summary',
        holdings: 'GET /api/portfolio/holdings',
        allocation: 'GET /api/portfolio/allocation',
        performance: 'GET /api/portfolio/performance?days=30',
        topPerformers: 'GET /api/portfolio/top-performers?limit=5',
        bottomPerformers: 'GET /api/portfolio/bottom-performers?limit=5'
      },
      sync: {
        fetchNow: 'POST /api/sync/fetch-now'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('✓ Database models synchronized');

    // Start listening
    app.listen(PORT, () => {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('  Coin MF Dashboard API Server');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('Available endpoints:');
      console.log(`  → API Documentation: http://localhost:${PORT}/`);
      console.log(`  → Health Check: http://localhost:${PORT}/api/health`);
      console.log('\n✓ Server is ready to accept requests\n');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;