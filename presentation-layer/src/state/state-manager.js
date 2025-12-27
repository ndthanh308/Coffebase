/**
 * State Manager
 * Manages cart, session, and application state
 */

export class StateManager {
  constructor() {
    this.cart = this.loadCart();
    this.user = this.loadUser();
    this.listeners = [];
  }

  // Cart Management
  addToCart(item) {
    const existingItem = this.cart.find(cartItem => 
      cartItem.productId === item.productId && 
      JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
    );

    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      this.cart.push(item);
    }

    this.saveCart();
    this.notifyListeners('cart', this.cart);
  }

  removeFromCart(index) {
    this.cart.splice(index, 1);
    this.saveCart();
    this.notifyListeners('cart', this.cart);
  }

  updateCartItem(index, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(index);
    } else {
      this.cart[index].quantity = quantity;
      this.saveCart();
      this.notifyListeners('cart', this.cart);
    }
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    this.notifyListeners('cart', this.cart);
  }

  getCartTotal() {
    return this.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  // User Session Management
  setUser(user, token) {
    this.user = user;
    this.token = token;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    this.notifyListeners('user', this.user);
  }

  clearUser() {
    this.user = null;
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.notifyListeners('user', null);
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  isAdmin() {
    return this.user && (this.user.role === 'admin' || this.user.role === 'super_admin');
  }

  // Local Storage Helpers
  loadCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  loadUser() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      this.token = token;
      return JSON.parse(user);
    }
    return null;
  }

  // Event Listeners
  subscribe(listener) {
    this.listeners.push(listener);
  }

  unsubscribe(listener) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      if (typeof listener === 'function') {
        listener(event, data);
      }
    });
  }
}

