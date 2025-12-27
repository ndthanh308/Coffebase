import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

export class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || null;
  }

  /**
   * Find user by ID
   */
  static async findById(userId) {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Create new user
   */
  static async create(userData) {
    const { data, error } = await supabaseClient
      .from('users')
      .insert([{
        email: userData.email,
        password: userData.password,
        role: userData.role || 'customer',
        credit_points: 0,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Update user
   */
  static async update(userId, userData) {
    const { data, error } = await supabaseClient
      .from('users')
      .update(userData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Update credit points
   */
  static async updateCreditPoints(userId, points) {
    const { data, error } = await supabaseClient
      .from('users')
      .update({ credit_points: points })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
}

