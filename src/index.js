// src/index.js - Main entry point for Arcade Mini Game
import { initializeApp } from './core/app.js';

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
