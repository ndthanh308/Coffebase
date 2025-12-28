/**
 * Admin Users View
 * UCA3: Manage Users
 * Stub page.
 */

export default class AdminUsersView {
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
            <a href="#" onclick="router.navigate('/admin/users')" class="active">Users</a>
          </nav>
          <div class="header-actions">
            <button onclick="adminUsersView.logout()">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 900px;">
            <h1>Admin - Users</h1>
            <p style="color:#666; margin-top:0.25rem;">Sẽ làm API + UI quản lý người dùng (UCA3).</p>
            <button style="margin-top:1rem;" onclick="router.navigate('/admin')">← Quay lại Dashboard</button>
          </div>
        </div>
      </main>
    `;

    window.adminUsersView = this;
  }

  logout() {
    this.stateManager.clearUser();
    this.router.navigate('/');
  }
}
