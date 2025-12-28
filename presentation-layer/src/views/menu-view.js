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
      const minPrice = urlParams.get('minPrice') || params.minPrice;
      const maxPrice = urlParams.get('maxPrice') || params.maxPrice;
      const sortBy = urlParams.get('sortBy') || params.sortBy;

      // Fetch menu from API
      const menu = await apiClient.get('/api/menu/search', {
        q: search,
        category,
        minPrice,
        maxPrice,
        sortBy
      });

      this.renderMenu(menu);
    } catch (error) {
      console.error('Error loading menu:', error);
      app.innerHTML = '<div class="error">Không thể tải thực đơn. Vui lòng thử lại sau.</div>';
    }
  }

  renderMenu(products) {
    const app = document.getElementById('app');

    const urlParams = new URLSearchParams(window.location.search);
    const currentSearch = urlParams.get('search') || '';
    const currentMin = urlParams.get('minPrice') || '';
    const currentMax = urlParams.get('maxPrice') || '';
    const currentSort = urlParams.get('sortBy') || 'name';

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
            <input type="text" id="search-input" placeholder="Tìm kiếm..." value="${this.escapeHtml(currentSearch)}" />
            <div class="filter-buttons">
              <button onclick="menuView.filterByCategory('coffee')">Cà phê</button>
              <button onclick="menuView.filterByCategory('tea')">Trà & Sữa</button>
              <button onclick="menuView.filterByCategory('cake')">Bánh</button>
              <button onclick="menuView.filterByCategory(null)">Tất cả</button>
            </div>
            <div class="advanced-filters" style="margin-top: 0.75rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
              <input type="number" id="min-price" placeholder="Giá từ" value="${this.escapeHtml(currentMin)}" style="max-width:140px; padding:0.65rem 0.75rem; border:1px solid rgba(0,0,0,0.15); border-radius:6px;" />
              <input type="number" id="max-price" placeholder="Giá đến" value="${this.escapeHtml(currentMax)}" style="max-width:140px; padding:0.65rem 0.75rem; border:1px solid rgba(0,0,0,0.15); border-radius:6px;" />
              <select id="sort-by" style="max-width:180px; padding:0.65rem 0.75rem; border:1px solid rgba(0,0,0,0.15); border-radius:6px; background:#fff;">
                <option value="name" ${currentSort === 'name' ? 'selected' : ''}>Sắp xếp: Tên</option>
                <option value="price" ${currentSort === 'price' ? 'selected' : ''}>Sắp xếp: Giá</option>
              </select>
              <button onclick="menuView.applyAdvancedFilters()">Áp dụng</button>
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
        const params = new URLSearchParams(window.location.search);
        if (value) params.set('search', value);
        else params.delete('search');
        this.router.navigate(params.toString() ? `/menu?${params.toString()}` : '/menu');
      });
    }
  }

  async addToCart(productId) {
    // Navigate to product detail for customization
    this.router.navigate(`/product/${productId}`);
  }

  filterByCategory(category) {
    const params = new URLSearchParams(window.location.search);
    if (category) params.set('category', category);
    else params.delete('category');
    this.router.navigate(params.toString() ? `/menu?${params.toString()}` : '/menu');
  }

  applyAdvancedFilters() {
    const params = new URLSearchParams(window.location.search);
    const minPrice = document.getElementById('min-price')?.value?.trim();
    const maxPrice = document.getElementById('max-price')?.value?.trim();
    const sortBy = document.getElementById('sort-by')?.value;
    const search = document.getElementById('search-input')?.value?.trim();

    if (search) params.set('search', search);
    else params.delete('search');

    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    if (sortBy) params.set('sortBy', sortBy);
    else params.delete('sortBy');

    this.router.navigate(params.toString() ? `/menu?${params.toString()}` : '/menu');
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

