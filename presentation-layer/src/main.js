/**
 * Coffee Base Frontend - Main Entry Point
 * SPA (Single Page Application) Router
 */

import { Router } from './router/router.js';
import { StateManager } from './state/state-manager.js';

// Initialize state management
const stateManager = new StateManager();

// Initialize router
const router = new Router(stateManager);

// Start the application
document.addEventListener('DOMContentLoaded', () => {
  router.init();
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
  router.handleRoute();
});

