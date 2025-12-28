/**
 * Menu View
 * UCU01: View Menu - Display all products
 */

import { apiClient } from '../utils/api-client.js';

export default class MenuView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  async render(params = {}) {
    const app = document.getElementById('app');
    app.innerHTML = '<div id="loading">Loading menu...</div>';

    try {
      // Get query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const category = urlParams.get('category') || params.category;
      const search = urlParams.get('search') || params.search;

      // Fetch menu from API
      const menu = await apiClient.get('/api/menu', { category, search });

      this.renderMenu(menu);
    } catch (error) {
      console.error('Error loading menu:', error);
      app.innerHTML = '<div class="error">Không thể tải thực đơn. Vui lòng thử lại sau.</div>';
    }
  }

  renderMenu(products) {
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')" class="active">Thực đơn</a>
            <a href="#" onclick="router.navigate('/about')">Về chúng tôi</a>
          </nav>
          <div class="header-actions">
            <button onclick="router.navigate('/cart')">Giỏ hàng (${this.stateManager.cart.length})</button>
          </div>
        </div>
      </header>

      <main class="main">
        <section class="menu-header">
          <h1>Thực đơn</h1>
          <div class="search-filter-bar">
            <input type="text" id="search-input" placeholder="Tìm kiếm..." />
            <div class="filter-buttons">
              <button onclick="menuView.filterByCategory('coffee')">Cà phê</button>
              <button onclick="menuView.filterByCategory('tea')">Trà & Sữa</button>
              <button onclick="menuView.filterByCategory('cake')">Bánh</button>
              <button onclick="menuView.filterByCategory(null)">Tất cả</button>
            </div>
          </div>
        </section>

        <section class="products-grid">
          ${products.length === 0 ? `
            <div class="error" style="grid-column: 1 / -1;">
              Không có sản phẩm phù hợp bộ lọc.
            </div>
          ` : products.map(product => `
            <div class="product-card">
              <img src="${product.image_url || '/images/placeholder.jpg'}" alt="${product.name}" />
              <h3>${product.name}</h3>
              <p>${product.description || ''}</p>
              <div class="product-footer">
                <span class="price">${product.price.toLocaleString('vi-VN')} đ</span>
                <button class="btn-add" onclick="menuView.addToCart('${product.id}')">+</button>
              </div>
            </div>
          `).join('')}
        </section>
      </main>
    `;

    // Store reference for event handlers
    window.menuView = this;

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const value = (searchInput.value || '').trim();
        this.router.navigate(value ? `/menu?search=${encodeURIComponent(value)}` : '/menu');
      });
    }
  }

  async addToCart(productId) {
    // Navigate to product detail for customization
    this.router.navigate(`/product/${productId}`);
  }

  filterByCategory(category) {
    const url = category ? `/menu?category=${category}` : '/menu';
    this.router.navigate(url);
  }
}

