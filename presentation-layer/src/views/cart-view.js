/**
 * Cart View
 * MVP: show cart items, update quantity, remove, subtotal
 */

export default class CartView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  render() {
    const app = document.getElementById('app');

    const cart = this.stateManager.cart || [];
    const subtotal = this.stateManager.getCartTotal();

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
              <h1>Giỏ hàng</h1>
              <button class="cart-link" onclick="router.navigate('/menu')">+ Thêm món</button>
            </div>

            ${cart.length === 0 ? this.renderEmpty() : this.renderCart(cart, subtotal)}
          </section>
        </div>
      </main>
    `;

    window.cartView = this;
  }

  renderEmpty() {
    return `
      <div class="cart-empty">
        <p>Giỏ hàng đang trống.</p>
        <button onclick="router.navigate('/menu')">Xem thực đơn</button>
      </div>
    `;
  }

  renderCart(cart, subtotal) {
    return `
      <div class="cart-grid">
        <div class="cart-items">
          ${cart
            .map((item, index) => {
              const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
              return `
                <div class="cart-item">
                  <div class="cart-item-main">
                    <div class="cart-item-title">${this.escapeHtml(item.name || 'Sản phẩm')}</div>
                    <div class="cart-item-meta">${this.formatCustomization(item.customization)}</div>
                    <div class="cart-item-price">${Number(item.price || 0).toLocaleString('vi-VN')} đ / món</div>
                  </div>

                  <div class="cart-item-actions">
                    <input
                      class="cart-qty"
                      type="number"
                      min="1"
                      value="${Number(item.quantity || 1)}"
                      onchange="cartView.updateQuantity(${index}, this.value)"
                    />
                    <div class="cart-item-line">${lineTotal.toLocaleString('vi-VN')} đ</div>
                    <button class="cart-remove" onclick="cartView.remove(${index})">Xoá</button>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>

        <aside class="cart-summary">
          <h2>Tóm tắt</h2>
          <div class="cart-summary-row">
            <span>Tạm tính</span>
            <strong>${subtotal.toLocaleString('vi-VN')} đ</strong>
          </div>
          <div class="cart-summary-actions">
            <button onclick="router.navigate('/menu')">Tiếp tục mua</button>
            <button onclick="router.navigate('/checkout')">Thanh toán</button>
          </div>
        </aside>
      </div>
    `;
  }

  updateQuantity(index, value) {
    const parsed = parseInt(value, 10);
    const qty = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    this.stateManager.updateCartItem(index, qty);
    this.render();
  }

  remove(index) {
    this.stateManager.removeFromCart(index);
    this.render();
  }

  formatCustomization(customization) {
    if (!customization) return '';

    const parts = [];
    if (customization.size) parts.push(`Size: ${customization.size}`);
    if (customization.sugar != null) parts.push(`Đường: ${customization.sugar}%`);
    if (customization.ice != null) parts.push(`Đá: ${customization.ice}%`);
    if (Array.isArray(customization.toppings) && customization.toppings.length > 0) {
      parts.push(`Topping: ${customization.toppings.join(', ')}`);
    }

    return parts.join(' • ');
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
