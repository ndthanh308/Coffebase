/**
 * Product Detail View (Customization)
 * UCU05: Customize Drink
 */

import { apiClient } from '../utils/api-client.js';

export default class ProductDetailView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;

    this.product = null;
    this.reviewData = { stats: { count: 0, average: 0 }, reviews: [] };
    this.customization = {
      size: 'M',
      sugar: '100',
      ice: '100',
      toppings: []
    };
    this.quantity = 1;
  }

  async render(params = {}) {
    const app = document.getElementById('app');
    app.innerHTML = '<div id="loading">Loading product...</div>';

    try {
      const productId = params.id;
      const product = await apiClient.get(`/api/menu/${productId}`);
      this.product = product;

      try {
        this.reviewData = await apiClient.get(`/api/menu/${productId}/reviews`);
      } catch (e) {
        console.warn('Could not load reviews:', e);
        this.reviewData = { stats: { count: 0, average: 0 }, reviews: [] };
      }

      this.renderProduct();
    } catch (error) {
      console.error('Error loading product:', error);
      app.innerHTML = '<div class="error">Không thể tải sản phẩm. Vui lòng thử lại sau.</div>';
    }
  }

  renderProduct() {
    const app = document.getElementById('app');
    const product = this.product;

    const stats = this.reviewData?.stats || { count: 0, average: 0 };
    const reviews = this.reviewData?.reviews || [];

    const imageUrl = product.image_url || '/images/placeholder.jpg';
    const basePrice = Number(product.price || 0);
    const finalPrice = this.calculateFinalPrice(basePrice, this.customization, this.quantity);

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')" class="active">Thực đơn</a>
          </nav>
          <div class="header-actions">
            <button onclick="router.navigate('/cart')">Giỏ hàng (${this.stateManager.cart.length})</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="product-detail">
            <div>
              <img src="${imageUrl}" alt="${product.name}" />
            </div>

            <div class="product-detail-card">
              <h1>${product.name}</h1>
              <p>${product.description || ''}</p>

              <div class="option-group">
                <h3>Kích cỡ</h3>
                <div class="option-row">
                  ${this.renderRadio('size', 'S', 'S')}
                  ${this.renderRadio('size', 'M', 'M')}
                  ${this.renderRadio('size', 'L', 'L')}
                </div>
              </div>

              <div class="option-group">
                <h3>Mức đường</h3>
                <div class="option-row">
                  ${this.renderRadio('sugar', '100', '100%')}
                  ${this.renderRadio('sugar', '70', '70%')}
                  ${this.renderRadio('sugar', '50', '50%')}
                  ${this.renderRadio('sugar', '0', 'Không đường')}
                </div>
              </div>

              <div class="option-group">
                <h3>Mức đá</h3>
                <div class="option-row">
                  ${this.renderRadio('ice', '100', '100%')}
                  ${this.renderRadio('ice', '70', '70%')}
                  ${this.renderRadio('ice', '50', '50%')}
                  ${this.renderRadio('ice', '0', 'Không đá')}
                </div>
              </div>

              <div class="option-group">
                <h3>Topping</h3>
                <div class="option-row">
                  ${this.renderTopping('Pearl', 'Trân châu')}
                  ${this.renderTopping('Cheese', 'Kem cheese')}
                  ${this.renderTopping('Jelly', 'Thạch')}
                </div>
                <p style="margin-top:0.25rem; font-size:0.9rem;">(Tạm tính +5.000đ mỗi topping)</p>
              </div>

              <div class="option-group">
                <h3>Số lượng</h3>
                <div class="quantity-row">
                  <input id="qty" type="number" min="1" value="${this.quantity}" onchange="productDetailView.onQuantityChange(this.value)" />
                </div>
              </div>

              <div class="product-detail-actions">
                <button onclick="router.navigate('/menu')">Quay lại</button>
                <button onclick="productDetailView.addToCart()">Thêm vào giỏ</button>
                <span class="price">${finalPrice.toLocaleString('vi-VN')} đ</span>
              </div>

              <div class="option-group">
                <h3>Đánh giá (${stats.count || 0})</h3>
                <p style="margin-top:0.25rem; font-size:0.95rem;">Điểm trung bình: <strong>${(stats.average || 0).toFixed(1)}</strong> / 5</p>
                ${reviews.length ? this.renderReviews(reviews) : '<p style="margin-top:0.5rem;">Chưa có đánh giá nào.</p>'}
              </div>
            </div>
          </div>
        </div>
      </main>
    `;

    window.productDetailView = this;
  }

  renderReviews(reviews) {
    const toStars = (rating) => {
      const r = Math.max(1, Math.min(5, Number(rating) || 0));
      return `${'★'.repeat(r)}${'☆'.repeat(5 - r)}`;
    };

    const escapeHtml = (str) => {
      if (str === null || str === undefined) return '';
      return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    };

    const items = reviews
      .map((r) => {
        const comment = r.comment ? `<div style="margin-top:0.25rem;">${escapeHtml(r.comment)}</div>` : '';
        const who = escapeHtml(r.reviewer || 'Ẩn danh');
        const stars = toStars(r.rating);
        return `
          <div style="padding:0.75rem 0; border-top:1px solid #eee;">
            <div style="display:flex; justify-content:space-between; gap:1rem;">
              <div><strong>${who}</strong></div>
              <div style="white-space:nowrap;">${stars}</div>
            </div>
            ${comment}
          </div>
        `;
      })
      .join('');

    return `<div style="margin-top:0.5rem;">${items}</div>`;
  }

  renderRadio(field, value, label) {
    const checked = this.customization[field] === value ? 'checked' : '';
    return `
      <label>
        <input type="radio" name="${field}" value="${value}" ${checked} onchange="productDetailView.onOptionChange('${field}', '${value}')" />
        ${label}
      </label>
    `;
  }

  renderTopping(value, label) {
    const checked = this.customization.toppings.includes(value) ? 'checked' : '';
    return `
      <label>
        <input type="checkbox" value="${value}" ${checked} onchange="productDetailView.onToppingToggle('${value}', this.checked)" />
        ${label}
      </label>
    `;
  }

  onOptionChange(field, value) {
    this.customization[field] = value;
    this.renderProduct();
  }

  onToppingToggle(value, enabled) {
    const next = new Set(this.customization.toppings);
    if (enabled) next.add(value);
    else next.delete(value);
    this.customization.toppings = Array.from(next);
    this.renderProduct();
  }

  onQuantityChange(value) {
    const parsed = parseInt(value, 10);
    this.quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    this.renderProduct();
  }

  calculateFinalPrice(basePrice, customization, quantity) {
    // Simple placeholder calculation aligned with docs (auto-calc final price), can be improved later.
    const multipliers = { S: 1.0, M: 1.2, L: 1.5 };
    const sizeMultiplier = multipliers[customization.size] || 1.0;

    const toppingCost = (customization.toppings?.length || 0) * 5000;
    const perItem = Math.round(basePrice * sizeMultiplier + toppingCost);

    return perItem * (quantity || 1);
  }

  addToCart() {
    if (!this.product) return;

    const basePrice = Number(this.product.price || 0);
    const perItemPrice = this.calculateFinalPrice(basePrice, this.customization, 1);

    this.stateManager.addToCart({
      productId: this.product.id,
      name: this.product.name,
      price: perItemPrice,
      quantity: this.quantity,
      customization: {
        size: this.customization.size,
        sugar: this.customization.sugar,
        ice: this.customization.ice,
        toppings: [...this.customization.toppings]
      }
    });

    alert('Đã thêm vào giỏ hàng');
    this.router.navigate('/menu');
  }
}
