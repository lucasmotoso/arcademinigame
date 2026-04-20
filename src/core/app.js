// src/core/app.js - Application initialization and orchestration
import { setupNavigation } from '../components/navigation.js';
import { setupGameCards } from '../components/game-cards.js';
import { setupTheme } from '../utils/theme.js';
import { loadHighScores } from '../utils/storage.js';

/**
 * Initialize the entire application
 */
export async function initializeApp() {
  console.log('🎮 Initializing Arcade Mini Game v2.0...');

  try {
    // Setup theme system
    setupTheme();

    // Setup navigation and menu
    setupNavigation();

    // Setup game card interactions
    setupGameCards();

    // Load high scores from storage
    loadHighScores();

    // Setup smooth scrolling
    setupSmoothScroll();

    // Setup lazy loading for images
    setupLazyLoading();

    console.log('✓ Application initialized successfully!');
  } catch (error) {
    console.error('✗ Error initializing application:', error);
  }
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Setup lazy loading for images using Intersection Observer
 */
function setupLazyLoading() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}
