// src/components/game-cards.js - Game card interactions
export function setupGameCards() {
  const gameCards = document.querySelectorAll('.game-card');

  if (gameCards.length === 0) {
    console.warn('⚠️ No game cards found in DOM');
    return;
  }

  gameCards.forEach((card) => {
    // Hover effects for desktop
    card.addEventListener('mouseenter', () => {
      card.classList.add('active');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('active');
    });

    // Touch support for mobile
    card.addEventListener('touchstart', () => {
      card.classList.add('active');
    });

    card.addEventListener('touchend', () => {
      setTimeout(() => {
        card.classList.remove('active');
      }, 300);
    });
  });
}
