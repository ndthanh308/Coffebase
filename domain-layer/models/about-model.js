import { supabaseClient } from '../../infrastructure-layer/database/supabase-client.js';

export class AboutModel {
  static async listActive() {
    const { data, error } = await supabaseClient
      .from('about_us')
      .select('*')
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return data || [];
  }
}
