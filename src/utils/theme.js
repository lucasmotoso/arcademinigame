// src/utils/theme.js - Dark/Light theme system
const THEME_KEY = 'arcade-theme';
const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
};

/**
 * Setup theme system with toggle functionality
 */
export function setupTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem(THEME_KEY) || THEMES.DARK;

  // Apply saved theme on load
  applyTheme(savedTheme);

  // Setup theme toggle button if it exists
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const currentTheme =
        document.documentElement.getAttribute('data-theme') || THEMES.DARK;
      const newTheme =
        currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      updateThemeToggleText(newTheme);
    });

    // Set initial toggle text
    updateThemeToggleText(savedTheme);
  }
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  // Update meta theme color
  const themeColor = theme === THEMES.DARK ? '#0a0e27' : '#f0f0f0';
  let metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!metaTheme) {
    metaTheme = document.createElement('meta');
    metaTheme.setAttribute('name', 'theme-color');
    document.head.appendChild(metaTheme);
  }
  metaTheme.setAttribute('content', themeColor);
}

/**
 * Update theme toggle button text/emoji
 */
function updateThemeToggleText(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = theme === THEMES.DARK ? '☀️' : '🌙';
    themeToggle.setAttribute(
      'aria-label',
      theme === THEMES.DARK ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || THEMES.DARK;
}
