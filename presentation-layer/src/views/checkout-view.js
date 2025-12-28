/**
 * Checkout View
 * UCU06: Add to Cart & Checkout
 * Minimal: collect delivery info + payment method, create order, clear cart
 */

import { apiClient } from '../utils/api-client.js';

export default class CheckoutView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  render() {
    const app = document.getElementById('app');

    const cart = this.stateManager.cart || [];
    const subtotal = this.stateManager.getCartTotal();

    if (cart.length === 0) {
      app.innerHTML = `
        <header class="header">
          <div class="container">
            <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
            <nav class="nav">
              <a href="#" onclick="router.navigate('/')">Trang chủ</a>
              <a href="#" onclick="router.navigate('/menu')">Thực đơn</a>
            </nav>
            <div class="header-actions">
              <button onclick="router.navigate('/cart')">Giỏ hàng (0)</button>
            </div>
          </div>
        </header>

        <main class="main">
          <div class="container">
            <div class="cart-empty">
              <p>Giỏ hàng đang trống. Không thể thanh toán.</p>
              <button onclick="router.navigate('/menu')">Xem thực đơn</button>
            </div>
          </div>
        </main>
      `;
      return;
    }

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')">Thực đơn</a>
          </nav>
          <div class="header-actions">
            <button onclick="router.navigate('/cart')">Giỏ hàng (${cart.length})</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <section class="cart">
            <div class="cart-header">
              <h1>Thanh toán</h1>
              <button class="cart-link" onclick="router.navigate('/cart')">← Quay lại giỏ</button>
            </div>

            <div class="cart-grid">
              <div class="cart-items">
                <div class="auth-card" style="max-width:unset; margin:0;">
                  <h2>Thông tin nhận hàng</h2>
                  <form class="auth-form" onsubmit="checkoutView.handleSubmit(event)">
                    <div>
                      <label for="name">Họ tên</label>
                      <input id="name" type="text" autocomplete="name" required />
                    </div>

                    <div>
                      <label for="phone">Số điện thoại</label>
                      <input id="phone" type="tel" autocomplete="tel" required />
                    </div>

                    <div>
                      <label for="address">Địa chỉ</label>
                      <input id="address" type="text" autocomplete="street-address" required />
                    </div>

                    <div>
                      <label for="pickupLocation">Cửa hàng nhận</label>
                      <input id="pickupLocation" type="text" placeholder="Ví dụ: Coffee Base - CN Quận 1" required />
                    </div>

                    <div>
                      <label for="paymentMethod">Phương thức thanh toán</label>
                      <select id="paymentMethod" required>
                        <option value="cash">Tiền mặt</option>
                        <option value="momo">Momo</option>
                        <option value="zalopay">ZaloPay</option>
                        <option value="card">Thẻ</option>
                        <option value="credit">Điểm tích luỹ</option>
                      </select>
                    </div>

                    <button type="submit">Tạo đơn hàng</button>
                  </form>
                </div>
              </div>

              <aside class="cart-summary">
                <h2>Tóm tắt</h2>
                <div class="cart-summary-row">
                  <span>Tạm tính</span>
                  <strong>${subtotal.toLocaleString('vi-VN')} đ</strong>
                </div>
                <div class="cart-summary-actions">
                  <button onclick="router.navigate('/menu')">Thêm món</button>
                  <button onclick="checkoutView.handleSubmit(event)">Tạo đơn</button>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    `;

    window.checkoutView = this;
  }

  toOrderItems(cart) {
    return (cart || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      customization: item.customization || null
    }));
  }

  async handleSubmit(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    const cart = this.stateManager.cart || [];
    if (cart.length === 0) {
      alert('Giỏ hàng trống.');
      return;
    }

    const name = document.getElementById('name')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const address = document.getElementById('address')?.value?.trim();
    const pickupLocation = document.getElementById('pickupLocation')?.value?.trim();
    const paymentMethod = document.getElementById('paymentMethod')?.value;

    try {
      const order = await apiClient.post('/api/orders', {
        items: this.toOrderItems(cart),
        deliveryInfo: { name, phone, address, pickupLocation },
        paymentMethod
      });

      this.stateManager.clearCart();
      alert('Tạo đơn hàng thành công');
      this.router.navigate(`/orders/${order.id}`);
    } catch (error) {
      const message = error?.message || 'Tạo đơn hàng thất bại';
      alert(message);

      if (String(message).toLowerCase().includes('access token')) {
        this.router.navigate('/login');
      }
    }
  }
}
