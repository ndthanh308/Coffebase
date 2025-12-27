import { OrderModel } from '../../domain-layer/models/order-model.js';
import { PaymentGateway } from '../../infrastructure-layer/gateways/payment-gateway.js';

export class OrderService {
  /**
   * UCU06: Create Order (Add to Cart & Checkout)
   * Business Rules: Cannot checkout if cart is empty, clear cart after successful order
   */
  async createOrder(userId, orderData) {
    const { items, deliveryInfo, paymentMethod } = orderData;

    // Validate cart is not empty
    if (!items || items.length === 0) {
      throw new Error('Cart is empty. Cannot proceed with checkout.');
    }

    // Calculate total
    const total = this.calculateTotal(items);

    // Create order
    const order = await OrderModel.create({
      userId,
      items,
      deliveryInfo,
      total,
      paymentMethod,
      status: 'ordered'
    });

    return order;
  }

  /**
   * UCU07: Get Order by ID (Order Tracking)
   * Business Rules: Real-time status updates
   */
  async getOrderById(orderId, userId) {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if user owns this order or is admin
    if (order.userId !== userId && !this.isAdmin(userId)) {
      throw new Error('Access denied');
    }

    return order;
  }

  /**
   * Get user's order history
   */
  async getUserOrders(userId, { status, page = 1, limit = 10 }) {
    const orders = await OrderModel.findByUserId(userId, { status, page, limit });
    return orders;
  }

  /**
   * UCA4: Get All Orders (Admin only)
   */
  async getAllOrders({ status, page = 1, limit = 20 }) {
    const orders = await OrderModel.findAll({ status, page, limit });
    return orders;
  }

  /**
   * UCA4: Update Order Status (Admin only)
   * Business Rules: All status changes must be accurately recorded in database
   */
  async updateOrderStatus(orderId, status) {
    const validStatuses = ['ordered', 'processing', 'ready', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid order status');
    }

    const order = await OrderModel.updateStatus(orderId, status);
    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  /**
   * UCU08: Process Payment
   * Business Rules: Use HTTPS, store transaction info accurately
   */
  async processPayment(orderId, userId, paymentMethod, paymentData) {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Access denied');
    }

    if (order.status !== 'ordered') {
      throw new Error('Order cannot be paid');
    }

    // Process payment through gateway
    const paymentResult = await PaymentGateway.processPayment({
      orderId,
      amount: order.total,
      paymentMethod,
      paymentData
    });

    // Update order status
    await OrderModel.updateStatus(orderId, 'paid');

    return {
      success: true,
      transactionId: paymentResult.transactionId,
      orderId: order.id
    };
  }

  /**
   * UCU09: Add Review
   * Business Rules: Only completed orders can be reviewed
   */
  async addReview(orderId, userId, productId, rating, comment) {
    const order = await OrderModel.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Access denied');
    }

    if (order.status !== 'completed') {
      throw new Error('Only completed orders can be reviewed');
    }

    // TODO: Implement review creation
    const review = {
      orderId,
      userId,
      productId,
      rating,
      comment,
      createdAt: new Date()
    };

    return review;
  }

  /**
   * Calculate order total
   */
  calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  /**
   * Check if user is admin (placeholder)
   */
  isAdmin(userId) {
    // TODO: Implement admin check
    return false;
  }
}

