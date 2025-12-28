/**
 * Profile View
 * Minimal account page: show current user and allow logout
 */

import { apiClient } from '../utils/api-client.js';

export default class ProfileView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  async render() {
    const app = document.getElementById('app');
    app.innerHTML = '<div id="loading">Loading profile...</div>';

    try {
      const me = await apiClient.get('/api/auth/me');
      this.renderProfile(me);
    } catch (error) {
      console.error('Error loading profile:', error);
      app.innerHTML = '<div class="error">Không thể tải thông tin tài khoản.</div>';

      const message = String(error?.message || '').toLowerCase();
      if (message.includes('access token') || message.includes('token')) {
        this.router.navigate('/login');
      }
    }
  }

  renderProfile(me) {
    const app = document.getElementById('app');
    const email = me?.email || this.stateManager.user?.email || '';
    const role = me?.role || this.stateManager.user?.role || '';

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')">Thực đơn</a>
            <a href="#" onclick="router.navigate('/about')">Về chúng tôi</a>
          </nav>
          <div class="header-actions">
            <button onclick="router.navigate('/cart')">Giỏ hàng (${this.stateManager.cart.length})</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 640px;">
            <h1>Tài khoản</h1>
            <p>Quản lý phiên đăng nhập của bạn.</p>

            <div style="margin-top: 1rem; display:grid; gap:0.5rem;">
              <div><strong>Email:</strong> ${this.escapeHtml(email)}</div>
              <div><strong>Vai trò:</strong> ${this.escapeHtml(role)}</div>
            </div>

            <div style="margin-top: 1rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
              <button onclick="profileView.logout()">Đăng xuất</button>
              <button class="cart-link" onclick="router.navigate('/orders')">Xem đơn hàng</button>
            </div>
          </div>
        </div>
      </main>
    `;

    window.profileView = this;
  }

  logout() {
    this.stateManager.clearUser();
    this.router.navigate('/');
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
