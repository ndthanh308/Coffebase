/**
 * Signup View
 * UCU02: Sign Up
 */

import { apiClient } from '../utils/api-client.js';

export default class SignupView {
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
            <h1>Đăng ký</h1>
            <p>Tạo tài khoản để đặt hàng nhanh hơn.</p>

            <form class="auth-form" onsubmit="signupView.handleSubmit(event)">
              <div>
                <label for="email">Email</label>
                <input id="email" type="email" autocomplete="email" required />
              </div>

              <div>
                <label for="password">Mật khẩu</label>
                <input id="password" type="password" autocomplete="new-password" required />
              </div>

              <div>
                <label for="confirmPassword">Xác nhận mật khẩu</label>
                <input id="confirmPassword" type="password" autocomplete="new-password" required />
              </div>

              <button type="submit">Tạo tài khoản</button>
            </form>

            <div class="auth-links">
              <a href="#" onclick="router.navigate('/login')">Đã có tài khoản? Đăng nhập</a>
              <a href="#" onclick="router.navigate('/')">Quay lại trang chủ</a>
            </div>
          </div>
        </div>
      </main>
    `;

    window.signupView = this;
  }

  async handleSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    try {
      const result = await apiClient.post('/api/auth/signup', {
        email,
        password,
        confirmPassword
      });

      this.stateManager.setUser(result.user, result.token);
      this.router.navigate('/');
    } catch (error) {
      const message = error?.message || 'Đăng ký thất bại';
      alert(message);
    }
  }
}
