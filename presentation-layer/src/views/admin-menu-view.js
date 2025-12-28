/**
 * Admin Menu View
 * UCA2: Manage Menu (CRUD)
 */

import { apiClient } from '../utils/api-client.js';

export default class AdminMenuView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;

    this.products = [];
    this.editingId = null;
  }

  async render() {
    const app = document.getElementById('app');

    app.innerHTML = '<div id="loading">Loading admin menu...</div>';
    window.adminMenuView = this;

    try {
      await this.loadProducts();
      this.renderPage();
    } catch (error) {
      console.error('Error loading admin menu:', error);
      app.innerHTML = `
        <div class="error" style="padding:1.25rem;">Không thể tải danh sách sản phẩm. ${this.escapeHtml(error?.message || '')}</div>
      `;

      const msg = String(error?.message || '').toLowerCase();
      if (msg.includes('token') || msg.includes('access')) {
        this.router.navigate('/login');
      }
    }
  }

  async loadProducts() {
    // Admin needs to see both active and inactive products for management.
    // Backend currently filters is_active=true in ProductModel.findAll.
    // For MVP, we'll list active products via /api/menu and still allow CRUD.
    const data = await apiClient.get('/api/menu');
    this.products = Array.isArray(data) ? data : [];
  }

  renderPage() {
    const app = document.getElementById('app');

    const editing = this.editingId
      ? this.products.find((p) => String(p.id) === String(this.editingId))
      : null;

    const formTitle = editing ? 'Sửa sản phẩm' : 'Tạo sản phẩm';
    const submitLabel = editing ? 'Lưu thay đổi' : 'Tạo mới';

    const name = editing?.name || '';
    const description = editing?.description || '';
    const price = editing?.price ?? '';
    const category = editing?.category || 'other';
    const imageUrl = editing?.image_url || '';
    const isActive = editing?.is_active !== undefined ? !!editing.is_active : true;

    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo" onclick="router.navigate('/')">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/admin')">Admin</a>
            <a href="#" onclick="router.navigate('/admin/menu')" class="active">Menu</a>
            <a href="#" onclick="router.navigate('/admin/orders')">Orders</a>
            <a href="#" onclick="router.navigate('/admin/statistics')">Statistics</a>
          </nav>
          <div class="header-actions">
            <button onclick="adminMenuView.logout()">Đăng xuất</button>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <div class="auth-card" style="max-width: 1100px;">
            <div style="display:flex; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
              <div>
                <h1>Admin - Menu</h1>
                <p style="color:#666; margin-top:0.25rem;">UCA2: Quản lý sản phẩm (CRUD)</p>
              </div>
              <div style="display:flex; gap:0.5rem; align-items:flex-start;">
                <button onclick="router.navigate('/admin')">← Dashboard</button>
                <button onclick="adminMenuView.refresh()">Reload</button>
              </div>
            </div>

            <div style="margin-top:1rem; display:grid; grid-template-columns: 1fr; gap:1rem;">
              <div style="border:1px solid rgba(0,0,0,0.12); border-radius:10px; padding:1rem; background:#fff;">
                <h2 style="margin:0;">${this.escapeHtml(formTitle)}</h2>
                <form class="auth-form" style="max-width:unset;" onsubmit="adminMenuView.handleSubmit(event)">
                  <div>
                    <label for="p-name">Tên</label>
                    <input id="p-name" type="text" required value="${this.escapeHtml(name)}" />
                  </div>
                  <div>
                    <label for="p-description">Mô tả</label>
                    <input id="p-description" type="text" value="${this.escapeHtml(description)}" />
                  </div>
                  <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                    <div style="flex:1; min-width:220px;">
                      <label for="p-price">Giá</label>
                      <input id="p-price" type="number" min="0" step="0.01" required value="${this.escapeHtml(String(price))}" />
                    </div>
                    <div style="flex:1; min-width:220px;">
                      <label for="p-category">Danh mục</label>
                      <select id="p-category" style="padding:0.65rem 0.75rem; border:1px solid rgba(0,0,0,0.15); border-radius:6px; background:#fff;">
                        <option value="coffee" ${category === 'coffee' ? 'selected' : ''}>coffee</option>
                        <option value="tea" ${category === 'tea' ? 'selected' : ''}>tea</option>
                        <option value="cake" ${category === 'cake' ? 'selected' : ''}>cake</option>
                        <option value="other" ${category === 'other' ? 'selected' : ''}>other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label for="p-image">Image URL</label>
                    <input id="p-image" type="text" value="${this.escapeHtml(imageUrl)}" placeholder="https://..." />
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <input id="p-active" type="checkbox" ${isActive ? 'checked' : ''} />
                    <label for="p-active" style="margin:0;">Active</label>
                  </div>

                  <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                    <button type="submit">${this.escapeHtml(submitLabel)}</button>
                    ${editing ? '<button type="button" onclick="adminMenuView.cancelEdit()">Huỷ</button>' : ''}
                  </div>
                </form>
              </div>

              <div style="border:1px solid rgba(0,0,0,0.12); border-radius:10px; padding:1rem; background:#fff;">
                <h2 style="margin:0;">Danh sách sản phẩm (${this.products.length})</h2>
                <div style="margin-top:0.75rem; display:grid; gap:0.75rem;">
                  ${this.products.length ? this.products.map((p) => this.renderProductRow(p)).join('') : '<div class="error">Không có sản phẩm.</div>'}
                </div>
              </div>
            </div>

            <p style="margin-top:1rem; color:#666; font-size:0.9rem;">
              Lưu ý: nếu bạn thấy lỗi 403, hãy đăng nhập bằng tài khoản admin (role=admin/super_admin).
            </p>
          </div>
        </div>
      </main>
    `;
  }

  renderProductRow(p) {
    const id = this.escapeHtml(String(p.id));
    const name = this.escapeHtml(p.name || '');
    const price = Number(p.price || 0).toLocaleString('vi-VN');
    const category = this.escapeHtml(p.category || '');
    const img = p.image_url || '/images/placeholder.jpg';

    return `
      <div style="display:flex; gap:0.75rem; align-items:center; border:1px solid rgba(0,0,0,0.10); border-radius:10px; padding:0.75rem;">
        <img src="${this.escapeHtml(img)}" alt="${name}" style="width:56px; height:56px; object-fit:cover; border-radius:10px;" />
        <div style="flex:1; min-width:0;">
          <div style="font-weight:700;">${name}</div>
          <div style="color:#666; font-size:0.92rem;">${category} • ${price} đ</div>
          <div style="color:#999; font-size:0.82rem; word-break:break-all;">${id}</div>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button type="button" onclick="adminMenuView.startEdit('${id}')">Sửa</button>
          <button type="button" onclick="adminMenuView.deleteProduct('${id}')">Xoá</button>
        </div>
      </div>
    `;
  }

  startEdit(productId) {
    this.editingId = productId;
    this.renderPage();
  }

  cancelEdit() {
    this.editingId = null;
    this.renderPage();
  }

  async refresh() {
    try {
      await this.loadProducts();
      this.renderPage();
    } catch (e) {
      alert(e?.message || 'Reload thất bại');
    }
  }

  getFormData() {
    const name = document.getElementById('p-name')?.value?.trim();
    const description = document.getElementById('p-description')?.value?.trim();
    const price = document.getElementById('p-price')?.value;
    const category = document.getElementById('p-category')?.value;
    const image_url = document.getElementById('p-image')?.value?.trim();
    const is_active = !!document.getElementById('p-active')?.checked;

    return {
      name,
      description,
      price,
      category,
      image_url: image_url || null,
      is_active
    };
  }

  async handleSubmit(event) {
    event.preventDefault();

    try {
      const payload = this.getFormData();

      if (this.editingId) {
        await apiClient.put(`/api/menu/${this.editingId}`, payload);
        alert('Đã cập nhật sản phẩm');
      } else {
        await apiClient.post('/api/menu', payload);
        alert('Đã tạo sản phẩm');
      }

      this.editingId = null;
      await this.loadProducts();
      this.renderPage();
    } catch (error) {
      const message = error?.message || 'Thao tác thất bại';
      alert(message);
      const msg = String(message).toLowerCase();
      if (msg.includes('token') || msg.includes('access')) {
        this.router.navigate('/login');
      }
    }
  }

  async deleteProduct(productId) {
    const ok = confirm('Xoá sản phẩm này?');
    if (!ok) return;

    try {
      await apiClient.delete(`/api/menu/${productId}`);
      alert('Đã xoá (soft delete)');
      await this.loadProducts();
      this.renderPage();
    } catch (error) {
      const message = error?.message || 'Xoá thất bại';
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
