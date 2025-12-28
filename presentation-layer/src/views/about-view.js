/**
 * About View (Về chúng tôi)
 * Shows group intro then member cards
 */

import { apiClient } from '../utils/api-client.js';

export default class AboutView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  async render() {
    const app = document.getElementById('app');
    app.innerHTML = '<div id="loading">Loading...</div>';

    try {
      const data = await apiClient.get('/api/about');
      this.renderPage(data);
    } catch (error) {
      console.error('Error loading about:', error);
      app.innerHTML = '<div class="error">Không thể tải trang Về chúng tôi.</div>';
    }
  }

  renderPage(data) {
    const app = document.getElementById('app');

    const groupName = data?.group?.name || 'Newbie Coders';
    const groupDescription = data?.group?.description || '';
    const members = Array.isArray(data?.members) ? data.members : [];

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')">Thực đơn</a>
            <a href="#" onclick="router.navigate('/about')" class="active">Về chúng tôi</a>
          </nav>
          <div class="header-actions">
            ${this.stateManager.isAuthenticated()
              ? `<button onclick="router.navigate('/profile')">Tài khoản</button>`
              : `<button onclick="router.navigate('/login')">Đăng nhập</button>`
            }
            <button onclick="router.navigate('/cart')">Giỏ hàng (${this.stateManager.cart.length})</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <section class="about-hero">
            <h1>${this.escapeHtml(groupName)}</h1>
            <p>${this.escapeHtml(groupDescription)}</p>
          </section>

          <section class="about-team">
            <h2>Thành viên</h2>
            <div class=\"team-list\">
              ${members.map((m) => this.renderMember(m)).join('')}
            </div>
          </section>
        </div>
      </main>
    `;

    window.aboutView = this;
  }

  renderMember(member) {
    const imageUrl = member.image_url || '/images/placeholder.jpg';
    const name = member.name || '';
    const title = member.title || '';
    const motto = member.motto || '';
    const roles = Array.isArray(member.roles) ? member.roles : [];

    return `
      <div class="team-card">
        <div class="team-avatar">
          <img src="${imageUrl}" alt="${this.escapeHtml(name)}" />
        </div>
        <div class="team-body">
          <div class="team-name">${this.escapeHtml(name)}</div>
          <div class="team-title">${this.escapeHtml(title)}</div>
          ${roles.length ? `<div class="team-roles">${roles.map((r) => `<span class=\"team-pill\">${this.escapeHtml(r)}</span>`).join('')}</div>` : ''}
          <div class="team-motto">“${this.escapeHtml(motto)}”</div>
        </div>
      </div>
    `;
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
