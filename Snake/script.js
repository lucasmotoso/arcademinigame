// ============================================================================
// SNAKE — Arcade Neon Edition
// Enhanced rendering, particle effects, progressive speed, game-over animation
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================================================
// CONSTANTS
// ============================================================================

const TILE_COUNT = 20;
const BASE_SPEED = 150; // ms per frame
const SPEED_STEP = 4;   // ms faster per apple
const MIN_SPEED  = 55;

const COLORS = {
  bg:        '#060612',
  grid1:     '#0a0a1e',
  grid2:     '#080818',
  snakeHead: '#00ff88',
  snakeBody: '#00cc6e',
  snakeTail: '#009955',
  apple:     '#ff006e',
  appleGlow: 'rgba(255,0,110,0.25)',
  eyes:      '#060612',
  wall:      '#1a1a3a',
  text:      '#00ff88',
  textDim:   '#00aa66',
};

// ============================================================================
// GAME STATE
// ============================================================================

let game = {
  snake: [],
  direction: { x: 0, y: 0 },
  nextDirection: { x: 0, y: 0 },
  apple: { x: 10, y: 10 },
  score: 0,
  bestScore: 0,
  speed: BASE_SPEED,
  level: 1,
  gameLoop: null,
  isRunning: false,
  hasStarted: false,
  isDead: false,
  deathTimer: 0,
  particles: [],
  eatFlash: 0,
  appleRotation: 0,
};

const scoreDisplay  = document.getElementById('current-score');
const bestDisplay   = document.getElementById('best-score');
const speedDisplay  = document.getElementById('speed-display');
const foodDisplay   = document.getElementById('food-count');

// ============================================================================
// INIT
// ============================================================================

function init() {
  game.bestScore = parseInt(localStorage.getItem('snake_best')) || 0;
  bestDisplay.textContent = game.bestScore;

  resizeCanvas();
  resetGame();
  setupControls();
  window.addEventListener('resize', resizeCanvas);

  // Rendering loop (always running)
  requestAnimationFrame(renderLoop);
}

function resizeCanvas() {
  const wrapper = document.getElementById('canvas-wrapper');
  const maxW = Math.min(wrapper.clientWidth - 16, 480);
  canvas.width = maxW;
  canvas.height = maxW;
}

function resetGame() {
  clearInterval(game.gameLoop);
  game.snake = [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ];
  game.direction = { x: 0, y: 0 };
  game.nextDirection = { x: 0, y: 0 };
  game.score = 0;
  game.speed = BASE_SPEED;
  game.level = 1;
  game.hasStarted = false;
  game.isRunning = false;
  game.isDead = false;
  game.deathTimer = 0;
  game.particles = [];
  game.eatFlash = 0;
  scoreDisplay.textContent = '0';
  speedDisplay.textContent = 'SPD 1';
  spawnApple();
}

function spawnApple() {
  let valid = false;
  let attempts = 0;
  while (!valid && attempts < 300) {
    game.apple.x = Math.floor(Math.random() * TILE_COUNT);
    game.apple.y = Math.floor(Math.random() * TILE_COUNT);
    valid = !game.snake.some(s => s.x === game.apple.x && s.y === game.apple.y);
    attempts++;
  }
}

// ============================================================================
// GAME LOGIC
// ============================================================================

function startGame() {
  if (game.hasStarted) return;
  game.hasStarted = true;
  game.isRunning = true;

  if (game.nextDirection.x === 0 && game.nextDirection.y === 0) {
    game.direction = { x: 0, y: -1 };
    game.nextDirection = { x: 0, y: -1 };
  }

  game.gameLoop = setInterval(update, game.speed);
}

function update() {
  if (!game.isRunning || !game.hasStarted) return;

  game.direction = { ...game.nextDirection };

  if (game.direction.x === 0 && game.direction.y === 0) return;

  const head = {
    x: game.snake[0].x + game.direction.x,
    y: game.snake[0].y + game.direction.y,
  };

  // Wall wrap
  if (head.x < 0) head.x = TILE_COUNT - 1;
  if (head.x >= TILE_COUNT) head.x = 0;
  if (head.y < 0) head.y = TILE_COUNT - 1;
  if (head.y >= TILE_COUNT) head.y = 0;

  // Self collision
  if (game.snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  game.snake.unshift(head);

  // Eat apple?
  if (head.x === game.apple.x && head.y === game.apple.y) {
    game.score += 10;
    scoreDisplay.textContent = game.score;
    spawnApple();
    playBeep(800, 0.08);
    game.eatFlash = 8;

    // Spawn eat particles
    spawnParticles(head.x, head.y, COLORS.apple, 10);

    // Speed up progressively
    const newSpeed = Math.max(MIN_SPEED, BASE_SPEED - game.snake.length * SPEED_STEP);
    if (newSpeed !== game.speed) {
      game.speed = newSpeed;
      game.level = Math.floor((BASE_SPEED - game.speed) / SPEED_STEP) + 1;
      speedDisplay.textContent = 'SPD ' + game.level;
      clearInterval(game.gameLoop);
      game.gameLoop = setInterval(update, game.speed);
    }
  } else {
    game.snake.pop();
  }
}

function gameOver() {
  playBeep(150, 0.3);
  game.isRunning = false;
  game.isDead = true;
  game.deathTimer = 0;
  clearInterval(game.gameLoop);

  // Spawn death particles all along the snake
  game.snake.forEach((seg, i) => {
    setTimeout(() => {
      spawnParticles(seg.x, seg.y, COLORS.snakeHead, 4);
    }, i * 30);
  });

  if (game.score > game.bestScore) {
    game.bestScore = game.score;
    localStorage.setItem('snake_best', game.bestScore);
    bestDisplay.textContent = game.bestScore;
  }

  setTimeout(() => {
    resetGame();
  }, 2000);
}

function changeDirection(x, y) {
  if (game.isDead) return;

  if (!game.hasStarted) {
    game.nextDirection = { x, y };
    startGame();
    return;
  }

  // Prevent 180° turn
  if (x === -game.direction.x && y === -game.direction.y &&
      (game.direction.x !== 0 || game.direction.y !== 0)) return;

  game.nextDirection = { x, y };
  playBeep(600, 0.02);
}

// ============================================================================
// PARTICLES
// ============================================================================

function spawnParticles(tileX, tileY, color, count) {
  const cellSize = canvas.width / TILE_COUNT;
  const cx = tileX * cellSize + cellSize / 2;
  const cy = tileY * cellSize + cellSize / 2;

  for (let i = 0; i < count; i++) {
    game.particles.push({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 1.0,
      color: color,
      size: Math.random() * 3 + 1,
    });
  }
}

function updateParticles() {
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.03;
    if (p.life <= 0) game.particles.splice(i, 1);
  }
}

// ============================================================================
// RENDERING (60fps independent of game speed)
// ============================================================================

function renderLoop() {
  if (game.eatFlash > 0) game.eatFlash--;
  game.appleRotation += 0.05;
  updateParticles();
  if (game.isDead) game.deathTimer++;
  draw();
  requestAnimationFrame(renderLoop);
}

function draw() {
  const cs = canvas.width / TILE_COUNT;

  // ── Background ──
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Grid pattern (checkerboard)
  for (let i = 0; i < TILE_COUNT; i++) {
    for (let j = 0; j < TILE_COUNT; j++) {
      ctx.fillStyle = (i + j) % 2 === 0 ? COLORS.grid1 : COLORS.grid2;
      ctx.fillRect(i * cs, j * cs, cs, cs);
    }
  }

  // ── Eat flash ──
  if (game.eatFlash > 0) {
    ctx.fillStyle = `rgba(0,255,136,${game.eatFlash * 0.01})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // ── Apple ──
  drawApple(cs);

  // ── Snake ──
  drawSnake(cs);

  // ── Particles ──
  drawParticles();

  // ── Start / Game Over message ──
  if (!game.hasStarted && !game.isDead) {
    drawOverlay('PRESS ARROW KEY', 'TO START', COLORS.text);
  }

  if (game.isDead) {
    drawDeathScreen();
  }
}

function drawApple(cs) {
  const ax = game.apple.x * cs + cs / 2;
  const ay = game.apple.y * cs + cs / 2;
  const r  = cs / 2 - 2;

  // Pulsing glow
  const pulse = 0.6 + Math.sin(game.appleRotation * 2) * 0.15;
  ctx.shadowColor = COLORS.apple;
  ctx.shadowBlur = 12 * pulse;

  // Apple body
  ctx.beginPath();
  ctx.arc(ax, ay, r, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(ax - r * 0.2, ay - r * 0.3, r * 0.1, ax, ay, r);
  grad.addColorStop(0, '#ff4488');
  grad.addColorStop(0.7, COLORS.apple);
  grad.addColorStop(1, '#aa0044');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Specular highlight
  ctx.beginPath();
  ctx.arc(ax - r * 0.25, ay - r * 0.3, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();

  // Small leaf/stem
  ctx.fillStyle = '#00cc55';
  ctx.beginPath();
  ctx.ellipse(ax + 1, ay - r + 1, 2, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake(cs) {
  const len = game.snake.length;

  game.snake.forEach((seg, i) => {
    const x = seg.x * cs;
    const y = seg.y * cs;
    const pad = 1;
    const size = cs - pad * 2;

    // Color gradient along body
    const t = i / Math.max(1, len - 1);
    const r = Math.round(0 + t * 0);
    const g = Math.round(255 - t * 100);
    const b = Math.round(136 - t * 60);

    // Death animation: fade out from tail
    let alpha = 1;
    if (game.isDead) {
      const fadeIdx = Math.floor(game.deathTimer / 3);
      if (len - 1 - i < fadeIdx) alpha = 0.15;
    }

    ctx.globalAlpha = alpha;

    if (i === 0) {
      // HEAD — rounded with glow
      ctx.shadowColor = COLORS.snakeHead;
      ctx.shadowBlur = 8;
      ctx.fillStyle = COLORS.snakeHead;
      roundRect(x + pad, y + pad, size, size, 5);
      ctx.shadowBlur = 0;

      // Eyes
      drawEyes(seg, cs);
    } else {
      // Body segment
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      roundRect(x + pad, y + pad, size, size, 3);

      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      roundRect(x + pad + 2, y + pad + 2, size - 4, size - 4, 2);
    }

    ctx.globalAlpha = 1;
  });
}

function drawEyes(head, cs) {
  const dir = game.direction;
  const cx = head.x * cs + cs / 2;
  const cy = head.y * cs + cs / 2;
  const eyeR = Math.max(2, cs * 0.12);
  const offset = cs * 0.22;

  let e1x, e1y, e2x, e2y;

  if (dir.x === 1) {        // right
    e1x = cx + offset; e1y = cy - offset;
    e2x = cx + offset; e2y = cy + offset;
  } else if (dir.x === -1) { // left
    e1x = cx - offset; e1y = cy - offset;
    e2x = cx - offset; e2y = cy + offset;
  } else if (dir.y === -1) { // up
    e1x = cx - offset; e1y = cy - offset;
    e2x = cx + offset; e2y = cy - offset;
  } else {                    // down / idle
    e1x = cx - offset; e1y = cy + offset;
    e2x = cx + offset; e2y = cy + offset;
  }

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(e1x, e1y, eyeR + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(e2x, e2y, eyeR + 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.eyes;
  ctx.beginPath();
  ctx.arc(e1x + dir.x * 1, e1y + dir.y * 1, eyeR * 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(e2x + dir.x * 1, e2y + dir.y * 1, eyeR * 0.65, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles() {
  game.particles.forEach(p => {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawOverlay(line1, line2, color) {
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = 'rgba(6,6,18,0.75)';
  ctx.fillRect(0, h / 2 - 35, w, 70);

  ctx.fillStyle = color;
  ctx.font = `bold ${Math.round(w / 30)}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,255,136,0.5)';
  ctx.shadowBlur = 12;
  ctx.fillText(line1, w / 2, h / 2 - 6);

  if (line2) {
    ctx.font = `${Math.round(w / 45)}px 'Press Start 2P', monospace`;
    ctx.fillText(line2, w / 2, h / 2 + 20);
  }
  ctx.shadowBlur = 0;
}

function drawDeathScreen() {
  const w = canvas.width;
  const h = canvas.height;
  const t = Math.min(1, game.deathTimer / 30);

  ctx.fillStyle = `rgba(6,6,18,${t * 0.7})`;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = COLORS.secondary;
  ctx.font = `bold ${Math.round(w / 22)}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(255,0,110,0.6)';
  ctx.shadowBlur = 15;
  ctx.fillText('GAME OVER', w / 2, h / 2 - 10);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#888';
  ctx.font = `${Math.round(w / 45)}px 'Press Start 2P', monospace`;
  ctx.fillText('SCORE: ' + game.score, w / 2, h / 2 + 22);
}

// ============================================================================
// HELPERS
// ============================================================================

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// ============================================================================
// CONTROLS
// ============================================================================

function setupControls() {
  // Keyboard
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W': changeDirection(0, -1);  break;
      case 'ArrowDown':  case 's': case 'S': changeDirection(0,  1);  break;
      case 'ArrowLeft':  case 'a': case 'A': changeDirection(-1, 0);  break;
      case 'ArrowRight': case 'd': case 'D': changeDirection(1,  0);  break;
    }
  });

  // Touch buttons
  document.getElementById('btn-up').addEventListener('click',    () => changeDirection(0, -1));
  document.getElementById('btn-down').addEventListener('click',  () => changeDirection(0, 1));
  document.getElementById('btn-left').addEventListener('click',  () => changeDirection(-1, 0));
  document.getElementById('btn-right').addEventListener('click', () => changeDirection(1, 0));

  // Swipe on canvas
  let touchStartX, touchStartY;
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!touchStartX) return;

    if (!game.hasStarted && !game.isDead) {
      changeDirection(0, -1);
      return;
    }

    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const minSwipe = 25;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > minSwipe) changeDirection(1, 0);
      else if (dx < -minSwipe) changeDirection(-1, 0);
    } else {
      if (dy > minSwipe) changeDirection(0, 1);
      else if (dy < -minSwipe) changeDirection(0, -1);
    }
  }, { passive: false });
}

// ============================================================================
// AUDIO
// ============================================================================

function playBeep(freq, duration) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const audioCtx = new AC();
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.value = 0.06;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) { /* audio not supported */ }
}

// ============================================================================
// START
// ============================================================================

window.onload = init;