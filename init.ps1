# PowerShell script to initialize Arcade Mini Game 2.0 project
# Run this script in the project root directory

Write-Host "🎮 Initializing Arcade Mini Game 2.0..." -ForegroundColor Cyan
Write-Host ""

# Create directory structure
$directories = @(
    "src",
    "src/core",
    "src/components",
    "src/games",
    "src/games/pong",
    "src/games/snake",
    "src/games/sinuca",
    "src/styles",
    "src/utils",
    "dist",
    ".vscode"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Created: $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✓ Directory structure created successfully!" -ForegroundColor Green
Write-Host ""

# Create src/index.js
$indexJs = @"
import { initializeApp } from './core/app.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
"@

Set-Content -Path "src/index.js" -Value $indexJs
Write-Host "✓ Created: src/index.js" -ForegroundColor Green

# Create src/core/app.js
$appJs = @"
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
"@

Set-Content -Path "src/core/app.js" -Value $appJs
Write-Host "✓ Created: src/core/app.js" -ForegroundColor Green

# Create src/components/navigation.js
$navJs = @"
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
"@

Set-Content -Path "src/components/navigation.js" -Value $navJs
Write-Host "✓ Created: src/components/navigation.js" -ForegroundColor Green

# Create src/components/game-cards.js
$cardsJs = @"
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
"@

Set-Content -Path "src/components/game-cards.js" -Value $cardsJs
Write-Host "✓ Created: src/components/game-cards.js" -ForegroundColor Green

# Create src/utils/theme.js
$themeJs = @"
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
"@

Set-Content -Path "src/utils/theme.js" -Value $themeJs
Write-Host "✓ Created: src/utils/theme.js" -ForegroundColor Green

# Create src/utils/storage.js
$storageJs = @"
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
  scores[game] = scores[game].slice(0, 10);
  
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
}

export function getTopScores(game, limit = 10) {
  const scores = loadHighScores();
  return scores[game]?.slice(0, limit) || [];
}
"@

Set-Content -Path "src/utils/storage.js" -Value $storageJs
Write-Host "✓ Created: src/utils/storage.js" -ForegroundColor Green

# Create .vscode/settings.json
$vscodeSettings = @"
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ritwickdey.liveserver"
  ],
  "settings": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    }
  }
}
"@

Set-Content -Path ".vscode/settings.json" -Value $vscodeSettings
Write-Host "✓ Created: .vscode/settings.json" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Project initialization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. npm install" -ForegroundColor Yellow
Write-Host "2. npm run dev" -ForegroundColor Yellow
Write-Host ""
