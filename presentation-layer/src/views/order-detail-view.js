/**
 * Order Detail View
 * UCU07: Order Tracking (detail)
 */

import { apiClient } from '../utils/api-client.js';

export default class OrderDetailView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;

    this.paymentMethod = 'card';
  }

  async render(params = {}) {
    const app = document.getElementById('app');
    app.innerHTML = '<div id="loading">Loading order...</div>';

    try {
      const orderId = params.id;
      const order = await apiClient.get(`/api/orders/${orderId}`);
      this.renderOrder(order);
    } catch (error) {
      console.error('Error loading order:', error);
      app.innerHTML = '<div class="error">Không thể tải chi tiết đơn hàng.</div>';

      const message = String(error?.message || '').toLowerCase();
      if (message.includes('access token') || message.includes('token')) {
        this.router.navigate('/login');
      }
    }
  }

  renderOrder(order) {
    const app = document.getElementById('app');

    const items = Array.isArray(order?.items) ? order.items : [];
    const total = Number(order?.total || 0);
    const status = order?.status || 'ordered';
    const createdAt = order?.created_at ? new Date(order.created_at) : null;
    const delivery = order?.delivery_info || {};

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
              <h1>Chi tiết đơn hàng</h1>
              <button class="cart-link" onclick="router.navigate('/orders')">← Danh sách đơn</button>
            </div>

            <div class="cart-grid">
              <div class="cart-items">
                <div class="auth-card" style="max-width:unset; margin:0;">
                  <h2>Thông tin đơn</h2>
                  <p style="margin-top:0.5rem; color:#666;">Mã đơn: <strong>${this.escapeHtml(order.id)}</strong></p>
                  <p style="margin-top:0.25rem; color:#666;">Trạng thái: <strong>${this.escapeHtml(status)}</strong></p>
                  ${createdAt ? `<p style="margin-top:0.25rem; color:#666;">Tạo lúc: <strong>${createdAt.toLocaleString('vi-VN')}</strong></p>` : ''}

                  <h3 style="margin-top:1rem;">Giao hàng / Nhận tại cửa hàng</h3>
                  <p style="margin-top:0.25rem; color:#666;">Tên: <strong>${this.escapeHtml(delivery.name || '')}</strong></p>
                  <p style="margin-top:0.25rem; color:#666;">SĐT: <strong>${this.escapeHtml(delivery.phone || '')}</strong></p>
                  <p style="margin-top:0.25rem; color:#666;">Địa chỉ: <strong>${this.escapeHtml(delivery.address || '')}</strong></p>
                  <p style="margin-top:0.25rem; color:#666;">Cửa hàng nhận: <strong>${this.escapeHtml(delivery.pickupLocation || '')}</strong></p>

                  <h3 style="margin-top:1rem;">Món đã đặt</h3>
                  <div class="cart-items" style="margin-top:0.75rem;">
                    ${items.length === 0 ? `<div class="error">Đơn hàng không có sản phẩm.</div>` : items.map((it) => this.renderItem(it)).join('')}
                  </div>

                  ${(status === 'paid' || status === 'completed') ? `
                    <h3 style="margin-top:1rem;">Đánh giá</h3>
                    <div style="margin-top:0.75rem; display:grid; gap:0.75rem;">
                      ${items.map((it) => this.renderReviewForm(order.id, it)).join('')}
                    </div>
                  ` : ''}

                  ${status === 'ordered' ? `
                    <h3 style="margin-top:1rem;">Thanh toán</h3>
                    <div class="auth-form" style="margin-top:0.75rem;">
                      <div>
                        <label for="paymentMethod">Phương thức</label>
                        <select id="paymentMethod" onchange="orderDetailView.onPaymentMethodChange(this.value)">
                          <option value="card">Thẻ</option>
                          <option value="credit">Điểm tích luỹ</option>
                          <option value="momo">Momo</option>
                          <option value="zalopay">ZaloPay</option>
                        </select>
                      </div>
                      <button type="button" onclick="orderDetailView.pay('${this.escapeHtml(order.id)}')">Thanh toán</button>
                      <p style="margin-top:0.5rem; color:#666; font-size:0.9rem;">
                        (Momo/ZaloPay cần cấu hình key; Thẻ/Điểm dùng chế độ mô phỏng.)
                      </p>
                    </div>
                  ` : ''}
                </div>
              </div>

              <aside class="cart-summary">
                <h2>Tóm tắt</h2>
                <div class="cart-summary-row">
                  <span>Tổng tiền</span>
                  <strong>${total.toLocaleString('vi-VN')} đ</strong>
                </div>
                <div class="cart-summary-actions">
                  <button onclick="router.navigate('/menu')">Đặt thêm</button>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    `;

    window.orderDetailView = this;
  }

  renderReviewForm(orderId, item) {
    const productId = item?.productId;
    if (!productId) return '';
    const safeProductId = this.escapeHtml(String(productId));
    const name = item?.name || 'Sản phẩm';

    return `
      <div class="cart-item">
        <div class="cart-item-main">
          <div class="cart-item-title">${this.escapeHtml(name)}</div>
          <div class="auth-form" style="margin-top:0.5rem;">
            <div>
              <label for="rating-${safeProductId}">Số sao</label>
              <select id="rating-${safeProductId}">
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>
            <div>
              <label for="comment-${safeProductId}">Nhận xét</label>
              <input id="comment-${safeProductId}" type="text" placeholder="Viết nhận xét..." />
            </div>
            <button type="button" onclick="orderDetailView.submitReview('${this.escapeHtml(orderId)}','${safeProductId}')">Gửi đánh giá</button>
          </div>
        </div>
      </div>
    `;
  }

  async submitReview(orderId, productId) {
    try {
      const rating = document.getElementById(`rating-${productId}`)?.value;
      const comment = document.getElementById(`comment-${productId}`)?.value;

      await apiClient.post(`/api/orders/${orderId}/review`, {
        productId,
        rating,
        comment
      });

      alert('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      const message = error?.message || 'Gửi đánh giá thất bại';
      alert(message);
      const lower = String(message).toLowerCase();
      if (lower.includes('access token') || lower.includes('token')) {
        this.router.navigate('/login');
      }
    }
  }

  onPaymentMethodChange(method) {
    this.paymentMethod = method;
  }

  async pay(orderId) {
    try {
      const result = await apiClient.post(`/api/orders/${orderId}/payment`, {
        paymentMethod: this.paymentMethod,
        paymentData: {}
      });
      alert(`Thanh toán thành công. Mã giao dịch: ${result.transactionId}`);
      this.render({ id: orderId });
    } catch (error) {
      const message = error?.message || 'Thanh toán thất bại';
      alert(message);
      const lower = String(message).toLowerCase();
      if (lower.includes('access token') || lower.includes('token')) {
        this.router.navigate('/login');
      }
    }
  }

  renderItem(item) {
    const name = item?.name || 'Sản phẩm';
    const qty = Number(item?.quantity || 0);
    const price = Number(item?.price || 0);
    const line = price * qty;

    const customization = item?.customization
      ? this.escapeHtml(JSON.stringify(item.customization))
      : '';

    return `
      <div class="cart-item">
        <div class="cart-item-main">
          <div class="cart-item-title">${this.escapeHtml(name)} × ${qty}</div>
          ${customization ? `<div class="cart-item-meta">Tuỳ chọn: ${customization}</div>` : ''}
          <div class="cart-item-price">${price.toLocaleString('vi-VN')} đ / món</div>
        </div>
        <div class="cart-item-actions">
          <div class="cart-item-line">${line.toLocaleString('vi-VN')} đ</div>
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
