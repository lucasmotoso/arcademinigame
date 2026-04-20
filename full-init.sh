#!/bin/bash
# Complete project initialization script for Arcade Mini Game 2.0
# This script creates the full project structure and initializes all files

set -e

echo "🎮 Inicializando Arcade Mini Game 2.0..."

# Create directory structure
mkdir -p src/{core,components,games/{pong,snake,sinuca},styles,utils}
mkdir -p dist .vscode

echo "✓ Estrutura de diretórios criada"

# Create src/core/app.js
cat > src/core/app.js << 'EOF'
// Application core initialization
import { setupNavigation } from '../components/navigation.js';
import { setupGameCards } from '../components/game-cards.js';
import { setupTheme } from '../utils/theme.js';
import { loadHighScores } from '../utils/storage.js';

export async function initializeApp() {
  console.log('🎮 Initializing Arcade Mini Game v2.0...');
  
  try {
    setupTheme();
    setupNavigation();
    setupGameCards();
    loadHighScores();
    setupSmoothScroll();
    setupLazyLoading();
    console.log('✓ Application initialized successfully!');
  } catch (error) {
    console.error('✗ Error initializing:', error);
  }
}

function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

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
EOF

echo "✓ src/core/app.js criado"

# Create src/components/navigation.js
cat > src/components/navigation.js << 'EOF'
export function setupNavigation() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
    
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }
}
EOF

echo "✓ src/components/navigation.js criado"

# Create src/components/game-cards.js
cat > src/components/game-cards.js << 'EOF'
export function setupGameCards() {
  const gameCards = document.querySelectorAll('.game-card');
  
  gameCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('hover');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hover');
    });
  });
}
EOF

echo "✓ src/components/game-cards.js criado"

# Create src/utils/theme.js
cat > src/utils/theme.js << 'EOF'
const THEME_KEY = 'arcade-theme';

export function setupTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  
  applyTheme(savedTheme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}
EOF

echo "✓ src/utils/theme.js criado"

# Create src/utils/storage.js
cat > src/utils/storage.js << 'EOF'
const SCORES_KEY = 'arcade-scores';

export function loadHighScores() {
  const scores = localStorage.getItem(SCORES_KEY);
  return scores ? JSON.parse(scores) : {};
}

export function saveScore(game, score, playerName = 'Player') {
  const scores = loadHighScores();
  if (!scores[game]) scores[game] = [];
  
  scores[game].push({ score, playerName, date: new Date().toISOString() });
  scores[game].sort((a, b) => b.score - a.score);
  scores[game] = scores[game].slice(0, 10); // Keep top 10
  
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

export function getTopScores(game, limit = 10) {
  const scores = loadHighScores();
  return scores[game]?.slice(0, limit) || [];
}
EOF

echo "✓ src/utils/storage.js criado"

# Create src/index.js
cat > src/index.js << 'EOF'
import { initializeApp } from './core/app.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
EOF

echo "✓ src/index.js criado"

# Create src/styles/main.scss (will be compiled to CSS)
cat > src/styles/main.scss << 'EOF'
// Main styles for Arcade Mini Game 2.0
// Variables and color system

:root {
  --primary: #00ff88;
  --secondary: #ff006e;
  --accent: #00d4ff;
  --dark: #0a0e27;
  --light: #f0f0f0;
  --neon-glow: 0 0 10px rgba(0, 255, 136, 0.5);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', monospace;
  background: var(--dark);
  color: var(--light);
  transition: background-color 0.3s ease;
}

.header {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.1), rgba(0, 212, 255, 0.1));
  border-bottom: 2px solid var(--primary);
  padding: 1rem 2rem;
}

.hero {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: radial-gradient(circle, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.game-card {
  border: 2px solid var(--primary);
  transition: all 0.3s ease;
  cursor: pointer;
}

.game-card:hover {
  box-shadow: var(--neon-glow), 0 0 20px rgba(255, 0, 110, 0.5);
  transform: translateY(-5px);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary);
  color: var(--dark);
}

.btn-primary:hover {
  box-shadow: var(--neon-glow);
}

@media (max-width: 768px) {
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .header {
    padding: 1rem;
  }
}
EOF

echo "✓ src/styles/main.scss criado"

echo ""
echo "✅ Projeto inicializado com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. npm install"
echo "2. npm run dev"
echo ""
