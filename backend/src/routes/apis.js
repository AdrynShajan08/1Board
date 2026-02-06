const express = require('express');
const KiteService = require('../services/kiteService');
const AnalyticsService = require('../services/analyticsService');
const DataFetcherJob = require('../jobs/dataFetcher');

const router = express.Router();
const kiteService = new KiteService();
const analyticsService = new AnalyticsService();
const dataFetcher = new DataFetcherJob();

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

// ==================== Authentication Routes ====================

/**
 * GET /api/auth/login-url
 * Get Kite login URL
 */
router.get('/auth/login-url', (req, res) => {
  try {
    const loginURL = kiteService.getLoginURL();
    res.json({ 
      success: true, 
      login_url: loginURL 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/auth/session
 * Generate session from request token
 * Body: { request_token: "xxx" }
 */
router.post('/auth/session', async (req, res) => {
  try {
    const { request_token } = req.body;
    
    if (!request_token) {
      return res.status(400).json({ 
        success: false, 
        error: 'request_token is required' 
      });
    }

    const session = await kiteService.generateSession(request_token);
    
    res.json({ 
      success: true, 
      access_token: session.access_token,
      user_id: session.user_id,
      user_name: session.user_name,
      message: 'Save the access_token in your .env file as KITE_ACCESS_TOKEN'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/auth/validate
 * Validate current session
 */
router.get('/auth/validate', async (req, res) => {
  try {
    const isValid = await kiteService.validateSession();
    res.json({ 
      success: true, 
      is_valid: isValid 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/auth/profile
 * Get user profile
 */
router.get('/auth/profile', async (req, res) => {
  try {
    const profile = await kiteService.getProfile();
    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== Portfolio Routes ====================

/**
 * GET /api/portfolio/summary
 * Get portfolio summary
 */
router.get('/portfolio/summary', async (req, res) => {
  try {
    const summary = await analyticsService.getPortfolioSummary();
    res.json({ 
      success: true, 
      data: summary 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/portfolio/holdings
 * Get current holdings
 */
router.get('/portfolio/holdings', async (req, res) => {
  try {
    const holdings = await analyticsService.getCurrentHoldings();
    res.json({ 
      success: true, 
      data: holdings 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/portfolio/allocation
 * Get portfolio allocation
 */
router.get('/portfolio/allocation', async (req, res) => {
  try {
    const allocation = await analyticsService.getPortfolioAllocation();
    res.json({ 
      success: true, 
      data: allocation 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/portfolio/performance
 * Get historical performance
 * Query params: days (default: 30)
 */
router.get('/portfolio/performance', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const performance = await analyticsService.getHistoricalPerformance(days);
    res.json({ 
      success: true, 
      data: performance 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/portfolio/top-performers
 * Get top performing funds
 * Query params: limit (default: 5)
 */
router.get('/portfolio/top-performers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const topPerformers = await analyticsService.getTopPerformers(limit);
    res.json({ 
      success: true, 
      data: topPerformers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/portfolio/bottom-performers
 * Get bottom performing funds
 * Query params: limit (default: 5)
 */
router.get('/portfolio/bottom-performers', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const bottomPerformers = await analyticsService.getBottomPerformers(limit);
    res.json({ 
      success: true, 
      data: bottomPerformers 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ==================== Data Sync Routes ====================

/**
 * POST /api/sync/fetch-now
 * Manually trigger data fetch
 */
router.post('/sync/fetch-now', async (req, res) => {
  try {
    const success = await dataFetcher.fetchAndStoreHoldings();
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Data fetched and stored successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch data. Check logs for details.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;