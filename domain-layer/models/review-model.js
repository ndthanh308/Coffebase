import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

export class ReviewModel {
  static async findOne({ orderId, userId, productId }) {
    const { data, error } = await supabaseClient
      .from('reviews')
      .select('*')
      .eq('order_id', orderId)
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || null;
  }

  static async create({ orderId, userId, productId, rating, comment }) {
    const { data, error } = await supabaseClient
      .from('reviews')
      .insert([
        {
          order_id: orderId,
          user_id: userId,
          product_id: productId,
          rating,
          comment: comment || null,
          // MVP: no admin moderation UI yet, so approve immediately.
          is_approved: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  static async listByProductId({ productId, limit = 50, offset = 0, approvedOnly = true } = {}) {
    let query = supabaseClient
      .from('reviews')
      .select('id, rating, comment, created_at, user_id, users(email)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (approvedOnly) {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }

  static async listRatingsByProductId({ productId, approvedOnly = true } = {}) {
    let query = supabaseClient
      .from('reviews')
      .select('rating')
      .eq('product_id', productId);

    if (approvedOnly) {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }
}
