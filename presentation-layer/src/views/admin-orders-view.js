/**
 * Admin Orders View
 * UCA4: Manage Orders
 */

import { apiClient } from '../utils/api-client.js';

export default class AdminOrdersView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;

    this.orders = [];
  }

  async render() {
    const app = document.getElementById('app');

    app.innerHTML = '<div id="loading">Loading admin orders...</div>';
    window.adminOrdersView = this;

    try {
      await this.loadOrders();
      this.renderPage();
    } catch (error) {
      console.error('Error loading admin orders:', error);
      app.innerHTML = `
        <div class="error" style="padding:1.25rem;">Không thể tải đơn hàng. ${this.escapeHtml(error?.message || '')}</div>
      `;

      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('token') || msg.includes('access')) {
        this.router.navigate('/login');
      }
    }
  }

  async loadOrders() {
    const data = await apiClient.get('/api/orders/admin/all', { page: 1, limit: 50 });
    this.orders = Array.isArray(data) ? data : [];
  }

  renderPage() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/admin')">Admin</a>
            <a href="#" onclick="router.navigate('/admin/orders')" class="active">Orders</a>
            <a href="#" onclick="router.navigate('/admin/menu')">Menu</a>
            <a href="#" onclick="router.navigate('/admin/statistics')">Statistics</a>
          </nav>
          <div class="header-actions">
            <button onclick="adminOrdersView.logout()">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 1100px;">
            <div style="display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
              <div>
                <h1>Admin - Orders</h1>
                <p style="color:#666; margin-top:0.25rem;">UCA4: Quản lý đơn hàng (xem & cập nhật trạng thái)</p>
              </div>
              <div style="display:flex; gap:0.5rem; align-items:flex-start;">
                <button onclick="router.navigate('/admin')">← Dashboard</button>
                <button onclick="adminOrdersView.refresh()">Reload</button>
              </div>
            </div>

            <div style="margin-top:1rem; display:grid; gap:0.75rem;">
              ${this.orders.length ? this.orders.map((o) => this.renderOrderRow(o)).join('') : '<div class="error">Chưa có đơn hàng.</div>'}
            </div>

            <p style="margin-top:1rem; color:#666; font-size:0.9rem;">
              Lưu ý: chỉ admin/super_admin mới truy cập được.
            </p>
          </div>
        </div>
      </main>
    `;
  }

  renderOrderRow(order) {
    const id = this.escapeHtml(String(order.id || ''));
    const userId = this.escapeHtml(String(order.user_id || ''));
    const status = this.escapeHtml(String(order.status || 'ordered'));
    const total = Number(order.total || 0).toLocaleString('vi-VN');
    const createdAt = order.created_at ? new Date(order.created_at) : null;
    const createdText = createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString('vi-VN') : '';
    const items = Array.isArray(order.items) ? order.items : [];

    const statuses = ['ordered', 'paid', 'processing', 'ready', 'completed', 'cancelled'];
    const options = statuses
      .map((s) => `<option value="${s}" ${s === status ? 'selected' : ''}>${s}</option>`)
      .join('');

    return `
      <div style="border:1px solid rgba(0,0,0,0.10); border-radius:10px; padding:0.9rem; background:#fff;">
        <div style="display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
          <div style="min-width:280px;">
            <div style="font-weight:700;">#${id}</div>
            <div style="margin-top:0.25rem; color:#666; font-size:0.92rem;">User: ${userId}</div>
            <div style="margin-top:0.25rem; color:#666; font-size:0.92rem;">Items: ${items.length} • Total: ${total} đ</div>
            ${createdText ? `<div style="margin-top:0.25rem; color:#999; font-size:0.85rem;">${this.escapeHtml(createdText)}</div>` : ''}
          </div>
          <div style="display:flex; gap:0.5rem; align-items:flex-end; flex-wrap:wrap;">
            <div>
              <div style="font-size:0.85rem; color:#666; margin-bottom:0.25rem;">Status</div>
              <select id="status-${id}" style="padding:0.65rem 0.75rem; border:1px solid rgba(0,0,0,0.15); border-radius:6px; background:#fff;">
                ${options}
              </select>
            </div>
            <button type="button" onclick="adminOrdersView.updateStatus('${id}')">Cập nhật</button>
          </div>
        </div>
      </div>
    `;
  }

  async refresh() {
    try {
      await this.loadOrders();
      this.renderPage();
    } catch (e) {
      alert(e?.message || 'Reload thất bại');
    }
  }

  async updateStatus(orderId) {
    const status = document.getElementById(`status-${orderId}`)?.value;
    if (!status) {
      alert('Thiếu status');
      return;
    }

    try {
      await apiClient.put(`/api/orders/${orderId}/status`, { status });
      alert('Đã cập nhật trạng thái');
      await this.loadOrders();
      this.renderPage();
    } catch (error) {
      const message = error?.message || 'Cập nhật thất bại';
      alert(message);
      const msg = String(message).toLowerCase();
      if (msg.includes('token') || msg.includes('access')) {
        this.router.navigate('/login');
      }
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
