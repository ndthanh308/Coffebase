/**
 * Admin Reviews View
 * UCA6: Manage Reviews
 * Stub page.
 */

export default class AdminReviewsView {
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
            <a href="#" onclick="router.navigate('/admin')">Admin</a>
            <a href="#" onclick="router.navigate('/admin/reviews')" class="active">Reviews</a>
          </nav>
          <div class="header-actions">
            <button onclick="adminReviewsView.logout()">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 900px;">
            <h1>Admin - Reviews</h1>
            <p style="color:#666; margin-top:0.25rem;">Sẽ làm duyệt/ẩn/xoá đánh giá (UCA6).</p>
            <button style="margin-top:1rem;" onclick="router.navigate('/admin')">← Quay lại Dashboard</button>
          </div>
        </div>
      </main>
    `;

    window.adminReviewsView = this;
  }

  logout() {
    this.stateManager.clearUser();
    this.router.navigate('/');
  }
}
