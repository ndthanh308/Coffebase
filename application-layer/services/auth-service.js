import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../../domain-layer/models/user-model.js';
import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

export class AuthService {
  /**
   * UCU02: Sign Up
   * Business Rules: Password must be 8+ chars, include number, uppercase, lowercase, special char
   */
  async signUp(email, password, confirmPassword) {
    // Validate password match
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Validate password strength
    this.validatePassword(password);

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      role: 'customer'
    });

    // Generate JWT token
    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * UCU02: Sign Up with Google OAuth
   */
  async signUpWithGoogle(googleToken) {
    // TODO: Verify Google token and extract user info
    // For now, placeholder implementation
    throw new Error('Google OAuth not implemented yet');
  }

  /**
   * UCU03: Login
   * Business Rules: Session expires after inactivity
   */
  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * UCA1: Admin Login
   * Business Rules: RBAC - only admin role can access admin dashboard
   */
  async adminLogin(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.role !== 'admin' && user.role !== 'super_admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    delete user.password;
    return user;
  }

  /**
   * Validate password strength
   */
  validatePassword(password) {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  /**
   * Generate JWT token
   */
  generateToken(userId, role) {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(
      { id: userId, role },
      secret,
      { expiresIn }
    );
  }
}

