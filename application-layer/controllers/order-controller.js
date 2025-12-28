import express from 'express';
import { OrderService } from '../services/order-service.js';
import { authenticateToken, requireAdmin } from '../security/auth-middleware.js';

const router = express.Router();
const orderService = new OrderService();

/**
 * UCU06: Add to Cart & Checkout
 * POST /api/orders
 */
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;
    const order = await orderService.createOrder(userId, orderData);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * Get user's order history
 * GET /api/orders
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page, limit } = req.query;
    const orders = await orderService.getUserOrders(userId, { status, page, limit });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * UCA4: Get All Orders (Admin only)
 * GET /api/orders/admin/all
 */
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const orders = await orderService.getAllOrders({ status, page, limit });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * UCU07: Order Tracking
 * GET /api/orders/:id
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const order = await orderService.getOrderById(orderId, userId);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * UCU08: Payment
 * POST /api/orders/:id/payment
 */
router.post('/:id/payment', authenticateToken, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { paymentMethod, paymentData } = req.body;
    const result = await orderService.processPayment(orderId, userId, paymentMethod, paymentData);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * UCA4: Update Order Status (Admin only)
 * PUT /api/orders/:id/status
 */
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(orderId, status);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * UCU09: Rate & Review
 * POST /api/orders/:id/review
 */
router.post('/:id/review', authenticateToken, async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;
    const review = await orderService.addReview(orderId, userId, productId, rating, comment);
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

export default router;

