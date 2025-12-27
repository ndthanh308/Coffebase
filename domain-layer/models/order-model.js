import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

export class OrderModel {
  /**
   * Create new order
   */
  static async create(orderData) {
    const { data, error } = await supabaseClient
      .from('orders')
      .insert([{
        user_id: orderData.userId,
        items: orderData.items,
        delivery_info: orderData.deliveryInfo,
        total: orderData.total,
        payment_method: orderData.paymentMethod,
        status: orderData.status || 'ordered',
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
   * Find order by ID
   */
  static async findById(orderId) {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Find orders by user ID
   */
  static async findByUserId(userId, { status = null, page = 1, limit = 10 } = {}) {
    let query = supabaseClient
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find all orders (Admin)
   */
  static async findAll({ status = null, page = 1, limit = 20 } = {}) {
    let query = supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find orders by date range
   */
  static async findByDateRange(startDate, endDate) {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update order status
   */
  static async updateStatus(orderId, status) {
    const { data, error } = await supabaseClient
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
}

