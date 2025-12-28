/**
 * Order Tracking View (Order History)
 * UCU07: Order Tracking (history)
 */

import { apiClient } from '../utils/api-client.js';

export default class OrderTrackingView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  async render() {
    const app = document.getElementById('app');
    app.innerHTML = '<div id="loading">Loading orders...</div>';

    try {
      const orders = await apiClient.get('/api/orders');
      this.renderOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      app.innerHTML = '<div class="error">Không thể tải danh sách đơn hàng.</div>';

      const message = String(error?.message || '').toLowerCase();
      if (message.includes('access token') || message.includes('token')) {
        this.router.navigate('/login');
      }
    }
  }

  renderOrders(orders) {
    const app = document.getElementById('app');

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')">Thực đơn</a>
            <a href="#" onclick="router.navigate('/orders')" class="active">Đơn hàng</a>
          </nav>
          <div class="header-actions">
            <button onclick="router.navigate('/cart')">Giỏ hàng (${this.stateManager.cart.length})</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <section class="cart">
            <div class="cart-header">
              <h1>Đơn hàng của tôi</h1>
              <button class="cart-link" onclick="router.navigate('/menu')">+ Đặt thêm</button>
            </div>

            ${orders.length === 0 ? `
              <div class="cart-empty">
                <p>Bạn chưa có đơn hàng nào.</p>
                <button onclick="router.navigate('/menu')">Xem thực đơn</button>
              </div>
            ` : `
              <div class="cart-items">
                ${orders.map((o) => this.renderOrderRow(o)).join('')}
              </div>
            `}
          </section>
        </div>
      </main>
    `;

    window.orderTrackingView = this;
  }

  renderOrderRow(order) {
    const id = order.id;
    const status = order.status || 'ordered';
    const total = Number(order.total || 0);
    const createdAt = order.created_at ? new Date(order.created_at) : null;

    return `
      <div class="cart-item">
        <div class="cart-item-main">
          <div class="cart-item-title">Mã đơn: ${this.escapeHtml(id)}</div>
          <div class="cart-item-meta">Trạng thái: ${this.escapeHtml(status)}${createdAt ? ` • ${createdAt.toLocaleString('vi-VN')}` : ''}</div>
          <div class="cart-item-price">Tổng: ${total.toLocaleString('vi-VN')} đ</div>
        </div>

        <div class="cart-item-actions">
          <button onclick="router.navigate('/orders/${id}')">Xem chi tiết</button>
        </div>
      </div>
    `;
  }

  escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
