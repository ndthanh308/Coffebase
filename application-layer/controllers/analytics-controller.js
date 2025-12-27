import express from 'express';
import { AnalyticsService } from '../services/analytics-service.js';
import { authenticateToken, requireAdmin } from '../security/auth-middleware.js';

const router = express.Router();
const analyticsService = new AnalyticsService();

/**
 * UCA5: View Statistics
 * GET /api/analytics/statistics
 */
router.get('/statistics', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;
    const statistics = await analyticsService.getStatistics({ period, startDate, endDate });
    res.json(statistics);
  } catch (error) {
    next(error);
  }
});

/**
 * Get sales revenue by period
 * GET /api/analytics/revenue
 */
router.get('/revenue', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;
    const revenue = await analyticsService.getRevenue({ period, startDate, endDate });
    res.json(revenue);
  } catch (error) {
    next(error);
  }
});

/**
 * Get top selling products
 * GET /api/analytics/top-products
 */
router.get('/top-products', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { period, limit } = req.query;
    const products = await analyticsService.getTopProducts({ period, limit });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

export default router;

