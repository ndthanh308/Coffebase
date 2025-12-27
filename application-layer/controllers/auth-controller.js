import express from 'express';
import { AuthService } from '../services/auth-service.js';
import { authenticateToken, requireAdmin } from '../security/auth-middleware.js';

const router = express.Router();
const authService = new AuthService();

/**
 * UCU02: Sign Up
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res, next) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const result = await authService.signUp(email, password, confirmPassword);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * UCU02: Sign Up with Google OAuth
 * POST /api/auth/signup/google
 */
router.post('/signup/google', async (req, res, next) => {
  try {
    const { googleToken } = req.body;
    const result = await authService.signUpWithGoogle(googleToken);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * UCU03: Login
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * UCA1: Admin Login
 * POST /api/auth/admin/login
 */
router.post('/admin/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.adminLogin(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getUserProfile(userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * Logout (client-side token removal, but can add server-side token blacklist)
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, async (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // But we can add token blacklisting here if needed
  res.json({ message: 'Logged out successfully' });
});

export default router;

