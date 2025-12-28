import express from 'express';
import { MenuService } from '../services/menu-service.js';
import { ReviewService } from '../services/review-service.js';
import { authenticateToken, requireAdmin } from '../security/auth-middleware.js';

const router = express.Router();
const menuService = new MenuService();
const reviewService = new ReviewService();

/**
 * UCU01: View Menu
 * GET /api/menu
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const menu = await menuService.getMenu(category, search);
    res.json(menu);
  } catch (error) {
    next(error);
  }
});

/**
 * UCU04: Search & Filter
 * GET /api/menu/search
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q, category, minPrice, maxPrice, sortBy } = req.query;
    const results = await menuService.searchAndFilter({
      query: q,
      category,
      minPrice,
      maxPrice,
      sortBy
    });
    res.json(results);
  } catch (error) {
    next(error);
  }
});

/**
 * UCU01: Get Product Detail
 * GET /api/menu/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await menuService.getProductById(productId);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * Public: View product reviews
 * GET /api/menu/:id/reviews
 */
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const productId = req.params.id;
    const data = await reviewService.getProductReviews(productId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

/**
 * UCA2: Create Product (Admin only)
 * POST /api/menu
 */
router.post('/', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const productData = req.body;
    const product = await menuService.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * UCA2: Update Product (Admin only)
 * PUT /api/menu/:id
 */
router.put('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    const product = await menuService.updateProduct(productId, productData);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * UCA2: Delete Product (Admin only)
 * DELETE /api/menu/:id
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const productId = req.params.id;
    await menuService.deleteProduct(productId);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

