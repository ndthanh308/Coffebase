/**
 * Router - Navigation & Route Handling
 * Implements SPA routing with navigation guards
 */

export class Router {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.routes = {
      '/': () => this.renderView('home'),
      '/menu': () => this.renderView('menu'),
      '/product/:id': (params) => this.renderView('product-detail', params),
      '/cart': () => this.renderView('cart'),
      '/checkout': () => this.renderView('checkout'),
      '/orders': () => this.renderView('order-tracking'),
      '/orders/:id': (params) => this.renderView('order-detail', params),
      '/profile': () => this.renderView('profile'),
      '/login': () => this.renderView('login'),
      '/signup': () => this.renderView('signup'),
      // Admin routes
      '/admin': () => this.renderView('admin-dashboard'),
      '/admin/menu': () => this.renderView('admin-menu'),
      '/admin/orders': () => this.renderView('admin-orders'),
      '/admin/users': () => this.renderView('admin-users'),
      '/admin/statistics': () => this.renderView('admin-statistics'),
      '/admin/reviews': () => this.renderView('admin-reviews'),
      '/admin/promotions': () => this.renderView('admin-promotions')
    };
  }

  init() {
    this.handleRoute();
  }

  handleRoute() {
    const path = window.location.pathname;
    const route = this.findRoute(path);
    
    if (route) {
      // Navigation Guard: Check authentication for protected routes
      if (this.requiresAuth(route.path) && !this.stateManager.isAuthenticated()) {
        this.navigate('/login');
        return;
      }

      // Navigation Guard: Check admin role for admin routes
      if (this.requiresAdmin(route.path) && !this.stateManager.isAdmin()) {
        this.navigate('/');
        return;
      }

      route.handler(route.params);
    } else {
      this.render404();
    }
  }

  findRoute(path) {
    for (const [routePath, handler] of Object.entries(this.routes)) {
      const params = this.matchRoute(routePath, path);
      if (params !== null) {
        return { path: routePath, handler, params };
      }
    }
    return null;
  }

  matchRoute(routePath, path) {
    const routeParts = routePath.split('/');
    const pathParts = path.split('/');

    if (routeParts.length !== pathParts.length) {
      return null;
    }

    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].substring(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        return null;
      }
    }

    return Object.keys(params).length > 0 ? params : {};
  }

  requiresAuth(path) {
    const protectedRoutes = ['/cart', '/checkout', '/orders', '/profile', '/admin'];
    return protectedRoutes.some(route => path.startsWith(route));
  }

  requiresAdmin(path) {
    return path.startsWith('/admin');
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  renderView(viewName, params = {}) {
    // Import and render the view
    import(`../views/${viewName}-view.js`)
      .then(module => {
        const View = module.default;
        const view = new View(this.stateManager, this);
        view.render(params);
      })
      .catch(error => {
        console.error(`Error loading view: ${viewName}`, error);
        this.render404();
      });
  }

  render404() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="error-page">
        <h1>404</h1>
        <p>Page not found</p>
        <button onclick="router.navigate('/')">Go Home</button>
      </div>
    `;
  }
}

// Make router accessible globally for navigation
// Will be set to the Router instance in main.js
window.router = window.router;
document.addEventListener('DOMContentLoaded', () => {
  // Router will be initialized in main.js
});

