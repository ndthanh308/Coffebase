/**
 * Admin Promotions View
 * UCA7: Manage Promotions
 * Stub page.
 */

export default class AdminPromotionsView {
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
            <a href="#" onclick="router.navigate('/admin/promotions')" class="active">Promotions</a>
          </nav>
          <div class="header-actions">
            <button onclick="adminPromotionsView.logout()">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 900px;">
            <h1>Admin - Promotions</h1>
            <p style="color:#666; margin-top:0.25rem;">Sẽ làm tạo/sửa/xoá khuyến mãi (UCA7).</p>
            <button style="margin-top:1rem;" onclick="router.navigate('/admin')">← Quay lại Dashboard</button>
          </div>
        </div>
      </main>
    `;

    window.adminPromotionsView = this;
  }

  logout() {
    this.stateManager.clearUser();
    this.router.navigate('/');
  }
}
