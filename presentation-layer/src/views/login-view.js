/**
 * Login View
 * UCU03: Login
 */

import { apiClient } from '../utils/api-client.js';

export default class LoginView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  render() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')">Thực đơn</a>
          </nav>
          <div class="header-actions">
            <button onclick="router.navigate('/cart')">Giỏ hàng (${this.stateManager.cart.length})</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card">
            <h1>Đăng nhập</h1>
            <p>Đăng nhập để đặt hàng và theo dõi đơn.</p>

            <form class="auth-form" onsubmit="loginView.handleSubmit(event)">
              <div>
                <label for="email">Email</label>
                <input id="email" type="email" autocomplete="email" required />
              </div>

              <div>
                <label for="password">Mật khẩu</label>
                <input id="password" type="password" autocomplete="current-password" required />
              </div>

              <button type="submit">Đăng nhập</button>
            </form>

            <div class="auth-links">
              <a href="#" onclick="router.navigate('/signup')">Chưa có tài khoản? Đăng ký</a>
              <a href="#" onclick="router.navigate('/')">Quay lại trang chủ</a>
            </div>
          </div>
        </div>
      </main>
    `;

    window.loginView = this;
  }

  async handleSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value;

    try {
      const result = await apiClient.post('/api/auth/login', { email, password });
      this.stateManager.setUser(result.user, result.token);

      if (this.stateManager.isAdmin()) {
        this.router.navigate('/admin');
      } else {
        this.router.navigate('/');
      }
    } catch (error) {
      const message = error?.message || 'Đăng nhập thất bại';
      // Keep UX minimal: alert is fine for now (placeholder).
      alert(message);
    }
  }
}
