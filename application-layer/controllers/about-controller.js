import express from 'express';
import { AboutService } from '../services/about-service.js';

const router = express.Router();
const aboutService = new AboutService();

/**
 * About Us
 * GET /api/about
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await aboutService.getAbout();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
