/**
 * Home View
 * Customer Home Page
 */

export default class HomeView {
  constructor(stateManager, router) {
    this.stateManager = stateManager;
    this.router = router;
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <header class="header">
        <div class="container">
          <div class="logo">Coffee Base</div>
          <nav class="nav">
            <a href="#" onclick="router.navigate('/')">Trang chủ</a>
            <a href="#" onclick="router.navigate('/menu')">Thực đơn</a>
            <a href="#">Khuyến mãi</a>
            <a href="#" onclick="router.navigate('/about')">Về chúng tôi</a>
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
        <section class="hero">
          <h1>Chào mừng đến với Coffee Base</h1>
          <p>Đặt hàng nhanh chóng, nhận ngay tại cửa hàng</p>
          <button onclick="router.navigate('/menu')">Xem thực đơn</button>
        </section>

        <section class="promotions">
          <h2>Khuyến mãi nổi bật</h2>
          <div class="promotion-cards">
            <!-- Promotion cards will be loaded here -->
          </div>
        </section>

        <section class="menu-categories">
          <h2>Danh mục thực đơn</h2>
          <div class="category-filters">
            <button onclick="router.navigate('/menu?category=coffee')">Cà phê</button>
            <button onclick="router.navigate('/menu?category=tea')">Trà & Sữa</button>
            <button onclick="router.navigate('/menu?category=cake')">Bánh</button>
          </div>
          <div class="search-bar">
            <input type="text" placeholder="Tìm kiếm..." id="search-input">
            <button onclick="homeView.handleSearch()">Tìm</button>
          </div>
        </section>
      </main>
    `;

    window.homeView = this;
  }

  handleSearch() {
    const query = document.getElementById('search-input').value;
    this.router.navigate(`/menu?search=${encodeURIComponent(query)}`);
  }
}

