/**
 * Admin Statistics View
 * UCA5: View Statistics
 */

import { apiClient } from '../utils/api-client.js';

export default class AdminStatisticsView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;

    this.period = 'day';
    this.data = null;
  }

  async render() {
    const app = document.getElementById('app');

    app.innerHTML = '<div id="loading">Loading statistics...</div>';
    window.adminStatisticsView = this;

    try {
      await this.loadStatistics();
      this.renderPage();
    } catch (error) {
      console.error('Error loading statistics:', error);
      app.innerHTML = `
        <div class="error" style="padding:1.25rem;">Không thể tải thống kê. ${this.escapeHtml(error?.message || '')}</div>
      `;

      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('token') || msg.includes('access')) {
        this.router.navigate('/login');
      }
    }
  }

  async loadStatistics() {
    this.data = await apiClient.get('/api/analytics/statistics', { period: this.period });
  }

  renderPage() {
    const app = document.getElementById('app');

    const stats = this.data || {};
    const revenueTotal = Number(stats?.revenue?.total || 0);
    const orderCount = Number(stats?.orderCount || 0);
    const aov = Number(stats?.averageOrderValue || 0);
    const topProducts = Array.isArray(stats?.topProducts) ? stats.topProducts : [];
    const breakdown = stats?.revenue?.dailyBreakdown || {};

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/admin')">Admin</a>
            <a href="#" onclick="router.navigate('/admin/statistics')" class="active">Statistics</a>
            <a href="#" onclick="router.navigate('/admin/orders')">Orders</a>
            <a href="#" onclick="router.navigate('/admin/menu')">Menu</a>
          </nav>
          <div class="header-actions">
            <button onclick="adminStatisticsView.logout()">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 1100px;">
            <div style="display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
              <div>
                <h1>Admin - Statistics</h1>
                <p style="color:#666; margin-top:0.25rem;">UCA5: Thống kê doanh thu & đơn hàng</p>
              </div>
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:flex-start;">
                <select onchange="adminStatisticsView.setPeriod(this.value)" style="padding:0.65rem 0.75rem; border:1px solid rgba(0,0,0,0.15); border-radius:6px; background:#fff;">
                  <option value="day" ${this.period === 'day' ? 'selected' : ''}>Today</option>
                  <option value="week" ${this.period === 'week' ? 'selected' : ''}>Last 7 days</option>
                  <option value="month" ${this.period === 'month' ? 'selected' : ''}>Last 30 days</option>
                </select>
                <button onclick="adminStatisticsView.refresh()">Reload</button>
                <button onclick="router.navigate('/admin')">← Dashboard</button>
              </div>
            </div>

            <div style="margin-top:1rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:0.75rem;">
              ${this.kpiCard('Doanh thu', `${revenueTotal.toLocaleString('vi-VN')} đ`)}
              ${this.kpiCard('Số đơn', `${orderCount.toLocaleString('vi-VN')}`)}
              ${this.kpiCard('Giá trị đơn TB', `${Math.round(aov).toLocaleString('vi-VN')} đ`)}
            </div>

            <div style="margin-top:1rem; display:grid; grid-template-columns: 1fr; gap:1rem;">
              <div style="border:1px solid rgba(0,0,0,0.12); border-radius:10px; padding:1rem; background:#fff;">
                <h2 style="margin:0;">Top sản phẩm</h2>
                <div style="margin-top:0.75rem; display:grid; gap:0.5rem;">
                  ${topProducts.length ? topProducts.map((p) => this.renderTopProductRow(p)).join('') : '<div class="error">Chưa có dữ liệu top sản phẩm.</div>'}
                </div>
              </div>

              <div style="border:1px solid rgba(0,0,0,0.12); border-radius:10px; padding:1rem; background:#fff;">
                <h2 style="margin:0;">Doanh thu theo ngày</h2>
                <div style="margin-top:0.75rem;">
                  ${this.renderBreakdownTable(breakdown)}
                </div>
              </div>
            </div>

            <p style="margin-top:1rem; color:#666; font-size:0.9rem;">
              Nguồn dữ liệu: `/api/analytics/statistics` (admin-only).
            </p>
          </div>
        </div>
      </main>
    `;
  }

  kpiCard(title, value) {
    return `
      <div style="border:1px solid rgba(0,0,0,0.12); border-radius:10px; padding:0.9rem; background:#fff;">
        <div style="color:#666; font-size:0.9rem;">${this.escapeHtml(title)}</div>
        <div style="margin-top:0.25rem; font-weight:800; font-size:1.25rem;">${this.escapeHtml(value)}</div>
      </div>
    `;
  }

  renderTopProductRow(p) {
    const name = this.escapeHtml(String(p?.name || ''));
    const qty = Number(p?.quantity || 0).toLocaleString('vi-VN');
    const rev = Number(p?.revenue || 0).toLocaleString('vi-VN');

    return `
      <div style="display:flex; justify-content:space-between; gap:1rem; border-top:1px solid #eee; padding-top:0.5rem;">
        <div style="min-width:0;">
          <div style="font-weight:700;">${name}</div>
          <div style="color:#666; font-size:0.9rem;">SL: ${qty}</div>
        </div>
        <div style="white-space:nowrap; font-weight:700;">${rev} đ</div>
      </div>
    `;
  }

  renderBreakdownTable(breakdown) {
    const entries = Object.entries(breakdown || {}).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    if (!entries.length) return '<div class="error">Chưa có dữ liệu breakdown.</div>';

    const rows = entries
      .map(([date, value]) => {
        const v = Number(value || 0).toLocaleString('vi-VN');
        return `<tr><td style="padding:0.5rem 0; border-top:1px solid #eee;">${this.escapeHtml(date)}</td><td style="padding:0.5rem 0; border-top:1px solid #eee; text-align:right; font-weight:700;">${this.escapeHtml(v)} đ</td></tr>`;
      })
      .join('');

    return `
      <table style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left; color:#666; font-weight:600; padding-bottom:0.5rem;">Ngày</th>
            <th style="text-align:right; color:#666; font-weight:600; padding-bottom:0.5rem;">Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  async setPeriod(period) {
    this.period = period || 'day';
    await this.refresh();
  }

  async refresh() {
    try {
      await this.loadStatistics();
      this.renderPage();
    } catch (e) {
      alert(e?.message || 'Reload thất bại');
    }
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
