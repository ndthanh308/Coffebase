import { OrderModel } from '../../domain-layer/models/order-model.js';
import { ProductModel } from '../../domain-layer/models/product-model.js';

export class AnalyticsService {
  /**
   * UCA5: Get Statistics
   * Business Rules: Reports must be generated within 5 seconds max
   */
  async getStatistics({ period = 'day', startDate, endDate }) {
    const dateRange = this.getDateRange(period, startDate, endDate);

    const [revenue, orderCount, topProducts] = await Promise.all([
      this.getRevenueData(dateRange),
      this.getOrderCount(dateRange),
      this.getTopProductsData(dateRange, 5)
    ]);

    return {
      period,
      dateRange,
      revenue,
      orderCount,
      topProducts,
      averageOrderValue: revenue.total / (orderCount || 1)
    };
  }

  /**
   * Get revenue by period
   */
  async getRevenue({ period = 'day', startDate, endDate }) {
    const dateRange = this.getDateRange(period, startDate, endDate);
    return await this.getRevenueData(dateRange);
  }

  /**
   * Get top selling products
   */
  async getTopProducts({ period = 'day', limit = 10 }) {
    const dateRange = this.getDateRange(period);
    return await this.getTopProductsData(dateRange, limit);
  }

  /**
   * Get revenue data
   */
  async getRevenueData(dateRange) {
    const orders = await OrderModel.findByDateRange(dateRange.start, dateRange.end);
    
    const total = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
    const dailyBreakdown = this.groupByDate(orders, 'created_at');

    return {
      total,
      dailyBreakdown
    };
  }

  /**
   * Get order count
   */
  async getOrderCount(dateRange) {
    const orders = await OrderModel.findByDateRange(dateRange.start, dateRange.end);
    return orders.length;
  }

  /**
   * Get top products data
   */
  async getTopProductsData(dateRange, limit) {
    const orders = await OrderModel.findByDateRange(dateRange.start, dateRange.end);
    
    // Aggregate product sales
    const productSales = {};
    orders.forEach(order => {
      const items = Array.isArray(order.items) ? order.items : [];
      items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    // Sort and limit
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);

    return topProducts;
  }

  /**
   * Get date range based on period
   */
  getDateRange(period, startDate, endDate) {
    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case 'day':
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date();
          break;
        case 'week':
          start = new Date(now.setDate(now.getDate() - 7));
          end = new Date();
          break;
        case 'month':
          start = new Date(now.setMonth(now.getMonth() - 1));
          end = new Date();
          break;
        default:
          start = new Date(now.setHours(0, 0, 0, 0));
          end = new Date();
      }
    }

    return { start, end };
  }

  /**
   * Group orders by date
   */
  groupByDate(orders, dateField) {
    const grouped = {};
    orders.forEach(order => {
      const raw = order?.[dateField];
      if (!raw) return;
      const parsed = new Date(raw);
      if (Number.isNaN(parsed.getTime())) return;
      const date = parsed.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = 0;
      }
      grouped[date] += parseFloat(order.total) || 0;
    });
    return grouped;
  }
}

