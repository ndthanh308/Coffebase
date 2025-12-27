import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

export class ProductModel {
  /**
   * Find all products with optional filters
   */
  static async findAll({ category = null, search = null } = {}) {
    let query = supabaseClient
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Find product by ID
   */
  static async findById(productId) {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Search and filter products
   */
  static async searchAndFilter({ query, category, minPrice, maxPrice, sortBy }) {
    let dbQuery = supabaseClient
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (query) {
      dbQuery = dbQuery.ilike('name', `%${query}%`);
    }

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }

    if (minPrice) {
      dbQuery = dbQuery.gte('price', minPrice);
    }

    if (maxPrice) {
      dbQuery = dbQuery.lte('price', maxPrice);
    }

    // Sort
    const sortField = sortBy === 'price' ? 'price' : 'name';
    dbQuery = dbQuery.order(sortField);

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create product
   */
  static async create(productData) {
    const { data, error } = await supabaseClient
      .from('products')
      .insert([{
        name: productData.name,
        description: productData.description || '',
        price: parseFloat(productData.price),
        category: productData.category || 'other',
        image_url: productData.image_url || null,
        is_active: productData.is_active !== undefined ? productData.is_active : true,
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
   * Update product
   */
  static async update(productId, productData) {
    const updateData = { ...productData };
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete product (soft delete by setting is_active = false)
   */
  static async delete(productId) {
    const { data, error } = await supabaseClient
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data;
  }
}

