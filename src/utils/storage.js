// src/utils/storage.js - LocalStorage manager for scores and preferences
const SCORES_KEY = 'arcade-scores';
const PREFS_KEY = 'arcade-prefs';

/**
 * Load all high scores from localStorage
 */
export function loadHighScores() {
  try {
    const scores = localStorage.getItem(SCORES_KEY);
    return scores ? JSON.parse(scores) : {};
  } catch (error) {
    console.error('Error loading scores:', error);
    return {};
  }
}

/**
 * Save a score for a game
 */
export function saveScore(game, score, playerName = 'Player') {
  try {
    const scores = loadHighScores();

    if (!scores[game]) {
      scores[game] = [];
    }

    scores[game].push({
      score,
      playerName,
      date: new Date().toISOString(),
    });

    // Sort by score descending
    scores[game].sort((a, b) => b.score - a.score);

    // Keep only top 10 scores
    scores[game] = scores[game].slice(0, 10);

    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    return true;
  } catch (error) {
    console.error('Error saving score:', error);
    return false;
  }
}

/**
 * Get top scores for a specific game
 */
export function getTopScores(game, limit = 10) {
  const scores = loadHighScores();
  return scores[game]?.slice(0, limit) || [];
}

/**
 * Clear scores for a game
 */
export function clearScores(game) {
  try {
    const scores = loadHighScores();
    delete scores[game];
    localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    return true;
  } catch (error) {
    console.error('Error clearing scores:', error);
    return false;
  }
}

/**
 * Load user preferences
 */
export function loadPreferences() {
  try {
    const prefs = localStorage.getItem(PREFS_KEY);
    return prefs
      ? JSON.parse(prefs)
      : {
          volume: 1,
          difficulty: 'normal',
          soundEnabled: true,
          hapticEnabled: true,
        };
  } catch (error) {
    console.error('Error loading preferences:', error);
    return {
      volume: 1,
      difficulty: 'normal',
      soundEnabled: true,
      hapticEnabled: true,
    };
  }
}

/**
 * Save user preferences
 */
export function savePreferences(prefs) {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
}

/**
 * Export all data (for backup)
 */
export function exportData() {
  return {
    scores: loadHighScores(),
    preferences: loadPreferences(),
    exportDate: new Date().toISOString(),
  };
}

/**
 * Clear all local data
 */
export function clearAllData() {
  try {
    localStorage.removeItem(SCORES_KEY);
    localStorage.removeItem(PREFS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}
