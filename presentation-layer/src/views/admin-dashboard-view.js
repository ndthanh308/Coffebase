/**
 * Admin Dashboard View
 * UCA1: Admin Login (post-login landing)
 * Minimal dashboard + navigation to other admin sections.
 */

export default class AdminDashboardView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  render() {
    const app = document.getElementById('app');

    const email = this.stateManager.user?.email || '';
    const role = this.stateManager.user?.role || '';

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/admin')" class="active">Admin</a>
            <a href="#" onclick="router.navigate('/admin/menu')">Menu</a>
            <a href="#" onclick="router.navigate('/admin/orders')">Orders</a>
            <a href="#" onclick="router.navigate('/admin/statistics')">Statistics</a>
            <a href="#" onclick="router.navigate('/admin/users')">Users</a>
            <a href="#" onclick="router.navigate('/admin/reviews')">Reviews</a>
            <a href="#" onclick="router.navigate('/admin/promotions')">Promotions</a>
          </nav>
          <div class="header-actions">
            <button onclick="adminDashboardView.logout()">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 900px;">
            <h1>Admin Dashboard</h1>
            <p style="margin-top:0.25rem; color:#666;">Xin chào <strong>${this.escapeHtml(email)}</strong> (${this.escapeHtml(role)})</p>

            <div style="margin-top:1rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:0.75rem;">
              ${this.card('Quản lý Menu', 'Tạo/Sửa/Xoá sản phẩm', "/admin/menu")}
              ${this.card('Quản lý Đơn hàng', 'Xem & cập nhật trạng thái', "/admin/orders")}
              ${this.card('Thống kê', 'Doanh thu, top sản phẩm', "/admin/statistics")}
              ${this.card('Người dùng', 'Quản lý tài khoản', "/admin/users")}
              ${this.card('Đánh giá', 'Duyệt/ẩn đánh giá', "/admin/reviews")}
              ${this.card('Khuyến mãi', 'Tạo mã giảm giá', "/admin/promotions")}
            </div>

            <p style="margin-top:1rem; color:#666; font-size:0.95rem;">
              (MVP: các trang admin sẽ được làm dần theo UCA2–UCA7.)
            </p>
          </div>
        </div>
      </main>
    `;

    window.adminDashboardView = this;
  }

  card(title, desc, path) {
    return `
      <div style="border:1px solid rgba(0,0,0,0.12); border-radius:10px; padding:0.9rem; background:#fff;">
        <div style="font-weight:700;">${this.escapeHtml(title)}</div>
        <div style="margin-top:0.25rem; color:#666; font-size:0.95rem;">${this.escapeHtml(desc)}</div>
        <div style="margin-top:0.75rem;">
          <button onclick="router.navigate('${path}')">Mở</button>
        </div>
      </div>
    `;
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
