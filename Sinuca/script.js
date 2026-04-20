// ============================================================================
// SINUCA 8 BALL - PHYSICS ENGINE
// Realistic 2D pool with elastic collisions, drag-to-shoot, 15 balls
// ============================================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  table: '#1b6b3a',
  felt: '#1e7d42',
  feltLight: '#22924d',
  cushion: '#5d3a1a',
  cushionDark: '#3d2b1f',
  cushionHighlight: '#7a5230',
  pocket: '#0a0a0a',
  pocketRing: '#333',
  rail: '#2a1a0a',
};

const BALL_COLORS = [
  '#ffffff', // 0: cue ball
  '#e6c619', // 1: yellow
  '#0044cc', // 2: blue
  '#cc2200', // 3: red
  '#5500aa', // 4: purple
  '#ee6600', // 5: orange
  '#007733', // 6: green
  '#880022', // 7: maroon
  '#111111', // 8: black (8-ball)
  '#e6c619', // 9: yellow stripe
  '#0044cc', // 10: blue stripe
  '#cc2200', // 11: red stripe
  '#5500aa', // 12: purple stripe
  '#ee6600', // 13: orange stripe
  '#007733', // 14: green stripe
  '#880022', // 15: maroon stripe
];

const FRICTION = 0.988;
const WALL_BOUNCE = 0.75;
const BALL_BOUNCE = 0.96;
const MIN_SPEED = 0.15;
const MAX_POWER = 18;
const CUSHION_THICKNESS = 22;
const POCKET_RADIUS_FACTOR = 2.3;

// ============================================================================
// GAME STATE
// ============================================================================

let BALL_RADIUS, TABLE_W, TABLE_H, POCKET_RADIUS;

let game = {
  balls: [],
  cueBall: null,
  pockets: [],
  isMoving: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragCurrentX: 0,
  dragCurrentY: 0,
  score: 0,
  bestScore: parseInt(localStorage.getItem('sinuca_best')) || 0,
  ballsPocketed: 0,
  gameOver: false,
  message: '',
  messageTimer: 0,
};

const scoreDisplay = document.getElementById('current-score');
const bestDisplay = document.getElementById('best-score');
const ballsLeftDisplay = document.getElementById('balls-left');

// ============================================================================
// BALL CLASS
// ============================================================================

class Ball {
  constructor(x, y, color, number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.color = color;
    this.number = number;
    this.radius = BALL_RADIUS;
    this.active = true;
    this.isStripe = number > 8;
    this.pocketAnimation = 0;
  }

  get speed() {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  }

  update() {
    if (!this.active) return;

    this.x += this.vx;
    this.y += this.vy;

    // Friction
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    // Stop when very slow
    if (this.speed < MIN_SPEED) {
      this.vx = 0;
      this.vy = 0;
    }
  }

  draw() {
    if (!this.active) return;

    const r = this.radius;

    // Shadow
    ctx.beginPath();
    ctx.arc(this.x + 2, this.y + 2, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();

    // Ball body
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);

    if (this.number === 0) {
      // Cue ball: white with subtle gradient
      const grad = ctx.createRadialGradient(
        this.x - r * 0.3, this.y - r * 0.3, r * 0.1,
        this.x, this.y, r
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#dddddd');
      ctx.fillStyle = grad;
    } else {
      // Colored ball with gradient
      const grad = ctx.createRadialGradient(
        this.x - r * 0.3, this.y - r * 0.3, r * 0.1,
        this.x, this.y, r
      );
      grad.addColorStop(0, lightenColor(this.color, 30));
      grad.addColorStop(0.7, this.color);
      grad.addColorStop(1, darkenColor(this.color, 30));
      ctx.fillStyle = grad;
    }
    ctx.fill();

    // Stripe band
    if (this.isStripe) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.clip();

      // White band in middle
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x - r, this.y - r * 0.4, r * 2, r * 0.8);

      ctx.restore();

      // Re-draw outline
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Number circle
    if (this.number > 0) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.round(r * 0.65)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.number.toString(), this.x, this.y + 0.5);
    }

    // Specular highlight
    ctx.beginPath();
    ctx.arc(this.x - r * 0.25, this.y - r * 0.3, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();

    // Edge outline
    ctx.beginPath();
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

// ============================================================================
// COLOR HELPERS
// ============================================================================

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0xff) - percent);
  const b = Math.max(0, (num & 0xff) - percent);
  return `rgb(${r},${g},${b})`;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  bestDisplay.textContent = game.bestScore;
  resizeCanvas();
  setupControls();
  window.addEventListener('resize', resizeCanvas);
  document.getElementById('btn-reset').addEventListener('click', () => {
    resetGame();
  });
  gameLoop();
}

function resizeCanvas() {
  const wrapper = document.getElementById('canvas-wrapper');
  const maxW = Math.min(wrapper.clientWidth - 10, 860);
  canvas.width = maxW;
  canvas.height = Math.round(maxW * 0.52);

  BALL_RADIUS = Math.max(6, Math.round(canvas.width / 70));
  TABLE_W = canvas.width;
  TABLE_H = canvas.height;
  POCKET_RADIUS = BALL_RADIUS * POCKET_RADIUS_FACTOR;

  setupPockets();
  resetGame();
}

function setupPockets() {
  const c = CUSHION_THICKNESS;
  const pr = POCKET_RADIUS;
  const w = TABLE_W;
  const h = TABLE_H;

  game.pockets = [
    { x: c - 2,           y: c - 2 },           // top-left
    { x: w / 2,           y: c - 4 },           // top-center
    { x: w - c + 2,       y: c - 2 },           // top-right
    { x: c - 2,           y: h - c + 2 },       // bottom-left
    { x: w / 2,           y: h - c + 4 },       // bottom-center
    { x: w - c + 2,       y: h - c + 2 },       // bottom-right
  ];
}

function resetGame() {
  game.balls = [];
  game.score = 0;
  game.ballsPocketed = 0;
  game.isMoving = false;
  game.isDragging = false;
  game.gameOver = false;
  game.message = '';
  game.messageTimer = 0;
  scoreDisplay.textContent = '0';
  ballsLeftDisplay.textContent = '15';

  const c = CUSHION_THICKNESS;
  const playW = TABLE_W - c * 2;
  const playH = TABLE_H - c * 2;

  // Cue ball
  const cueX = c + playW * 0.25;
  const cueY = c + playH / 2;
  game.cueBall = new Ball(cueX, cueY, BALL_COLORS[0], 0);
  game.balls.push(game.cueBall);

  // Rack position (15 balls in triangle)
  const rackX = c + playW * 0.7;
  const rackY = c + playH / 2;
  const spacing = BALL_RADIUS * 2.05;
  const ballOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  // Shuffle but keep 8-ball in center of 3rd row
  const shuffled = [];
  const nonEight = ballOrder.filter(n => n !== 8);
  // Simple shuffle
  for (let i = nonEight.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nonEight[i], nonEight[j]] = [nonEight[j], nonEight[i]];
  }

  // Place in triangle: rows of 1, 2, 3, 4, 5
  let idx = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const x = rackX + row * spacing * Math.cos(Math.PI / 6);
      const y = rackY + (col - row / 2) * spacing;

      let ballNum;
      if (row === 2 && col === 1) {
        ballNum = 8; // 8-ball in center
      } else {
        ballNum = nonEight[idx++];
      }

      const ball = new Ball(x, y, BALL_COLORS[ballNum], ballNum);
      game.balls.push(ball);
    }
  }
}

// ============================================================================
// GAME LOOP
// ============================================================================

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (game.messageTimer > 0) game.messageTimer--;

  let anyMoving = false;
  for (const ball of game.balls) {
    if (!ball.active) continue;
    if (ball.speed > MIN_SPEED) {
      anyMoving = true;
      ball.update();
      checkWallCollision(ball);
      checkPockets(ball);
    } else {
      ball.vx = 0;
      ball.vy = 0;
    }
  }

  if (anyMoving) {
    resolveAllCollisions();
  }

  game.isMoving = anyMoving;

  // Check if cue ball was pocketed — respawn
  if (!game.cueBall.active && !anyMoving) {
    respawnCueBall();
  }
}

// ============================================================================
// WALL COLLISIONS
// ============================================================================

function checkWallCollision(ball) {
  const c = CUSHION_THICKNESS;
  const r = ball.radius;
  const minX = c + r;
  const maxX = TABLE_W - c - r;
  const minY = c + r;
  const maxY = TABLE_H - c - r;

  if (ball.x < minX) {
    ball.x = minX;
    ball.vx = Math.abs(ball.vx) * WALL_BOUNCE;
    playSound(200, 0.04);
  }
  if (ball.x > maxX) {
    ball.x = maxX;
    ball.vx = -Math.abs(ball.vx) * WALL_BOUNCE;
    playSound(200, 0.04);
  }
  if (ball.y < minY) {
    ball.y = minY;
    ball.vy = Math.abs(ball.vy) * WALL_BOUNCE;
    playSound(200, 0.04);
  }
  if (ball.y > maxY) {
    ball.y = maxY;
    ball.vy = -Math.abs(ball.vy) * WALL_BOUNCE;
    playSound(200, 0.04);
  }
}

// ============================================================================
// POCKET CHECK
// ============================================================================

function checkPockets(ball) {
  for (const pocket of game.pockets) {
    const dx = ball.x - pocket.x;
    const dy = ball.y - pocket.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < POCKET_RADIUS) {
      ball.active = false;
      ball.vx = 0;
      ball.vy = 0;

      if (ball.number === 0) {
        // Cue ball pocketed - penalty
        showMessage('FALTA!');
        playSound(150, 0.2);
      } else {
        // Scored!
        game.score += ball.number;
        game.ballsPocketed++;
        scoreDisplay.textContent = game.score;
        ballsLeftDisplay.textContent = (15 - game.ballsPocketed);
        playSound(600 + ball.number * 40, 0.1);

        if (ball.number === 8) {
          showMessage('BOLA 8!');
        }

        // Check win
        if (game.ballsPocketed >= 15) {
          if (game.score > game.bestScore) {
            game.bestScore = game.score;
            localStorage.setItem('sinuca_best', game.bestScore);
            bestDisplay.textContent = game.bestScore;
          }
          showMessage('PARABÉNS! 🏆');
          game.gameOver = true;
        }
      }
      break;
    }
  }
}

function respawnCueBall() {
  const c = CUSHION_THICKNESS;
  game.cueBall.active = true;
  game.cueBall.x = c + (TABLE_W - c * 2) * 0.25;
  game.cueBall.y = c + (TABLE_H - c * 2) / 2;
  game.cueBall.vx = 0;
  game.cueBall.vy = 0;

  // Make sure we don't overlap another ball
  let attempts = 0;
  while (attempts < 50) {
    let overlap = false;
    for (const b of game.balls) {
      if (b === game.cueBall || !b.active) continue;
      const dx = b.x - game.cueBall.x;
      const dy = b.y - game.cueBall.y;
      if (Math.sqrt(dx*dx + dy*dy) < BALL_RADIUS * 2.5) {
        overlap = true;
        break;
      }
    }
    if (!overlap) break;
    game.cueBall.y += BALL_RADIUS * 2;
    if (game.cueBall.y > TABLE_H - c - BALL_RADIUS) {
      game.cueBall.y = c + BALL_RADIUS + 5;
    }
    attempts++;
  }
}

// ============================================================================
// BALL-BALL COLLISIONS (Elastic 2D)
// ============================================================================

function resolveAllCollisions() {
  const active = game.balls.filter(b => b.active);
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      resolveBallCollision(active[i], active[j]);
    }
  }
}

function resolveBallCollision(b1, b2) {
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = b1.radius + b2.radius;

  if (dist >= minDist || dist === 0) return;

  // Normal vector
  const nx = dx / dist;
  const ny = dy / dist;

  // Relative velocity along collision normal
  const dvx = b1.vx - b2.vx;
  const dvy = b1.vy - b2.vy;
  const dvn = dvx * nx + dvy * ny;

  // Don't resolve if already separating
  if (dvn <= 0) return;

  // Elastic collision (equal mass)
  const impulse = dvn * BALL_BOUNCE;

  b1.vx -= impulse * nx;
  b1.vy -= impulse * ny;
  b2.vx += impulse * nx;
  b2.vy += impulse * ny;

  // Separate overlapping balls
  const overlap = (minDist - dist) / 2 + 0.5;
  b1.x -= overlap * nx;
  b1.y -= overlap * ny;
  b2.x += overlap * nx;
  b2.y += overlap * ny;

  playSound(400, 0.06);
}

// ============================================================================
// DRAWING
// ============================================================================

function draw() {
  drawTable();
  drawPockets();

  // Draw all balls
  for (const ball of game.balls) {
    ball.draw();
  }

  // Draw aiming line when dragging
  if (game.isDragging && !game.isMoving && game.cueBall.active) {
    drawAimLine();
  }

  // Draw cue stick when not moving and not dragging
  if (!game.isMoving && !game.isDragging && game.cueBall.active && !game.gameOver) {
    drawIdleIndicator();
  }

  // Message overlay
  if (game.messageTimer > 0 || game.gameOver) {
    drawMessage();
  }
}

function drawTable() {
  const c = CUSHION_THICKNESS;

  // Outer rail
  ctx.fillStyle = COLORS.rail;
  ctx.fillRect(0, 0, TABLE_W, TABLE_H);

  // Cushion border
  ctx.fillStyle = COLORS.cushion;
  ctx.fillRect(3, 3, TABLE_W - 6, TABLE_H - 6);

  // Felt surface
  const feltGrad = ctx.createRadialGradient(
    TABLE_W / 2, TABLE_H / 2, 0,
    TABLE_W / 2, TABLE_H / 2, TABLE_W * 0.6
  );
  feltGrad.addColorStop(0, COLORS.feltLight);
  feltGrad.addColorStop(1, COLORS.table);
  ctx.fillStyle = feltGrad;
  ctx.fillRect(c, c, TABLE_W - c * 2, TABLE_H - c * 2);

  // Felt texture (subtle dots)
  ctx.fillStyle = 'rgba(0,0,0,0.02)';
  for (let x = c; x < TABLE_W - c; x += 8) {
    for (let y = c; y < TABLE_H - c; y += 8) {
      if (Math.random() > 0.5) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Cushion inner edge highlights
  ctx.fillStyle = COLORS.cushionHighlight;
  ctx.fillRect(c - 3, c, 3, TABLE_H - c * 2); // left
  ctx.fillRect(TABLE_W - c, c, 3, TABLE_H - c * 2); // right
  ctx.fillRect(c, c - 3, TABLE_W - c * 2, 3); // top
  ctx.fillRect(c, TABLE_H - c, TABLE_W - c * 2, 3); // bottom

  // Head string line (dashed)
  const headX = c + (TABLE_W - c * 2) * 0.25;
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(headX, c + 5);
  ctx.lineTo(headX, TABLE_H - c - 5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Foot spot
  const footX = c + (TABLE_W - c * 2) * 0.7;
  const footY = TABLE_H / 2;
  ctx.beginPath();
  ctx.arc(footX, footY, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
}

function drawPockets() {
  for (const pocket of game.pockets) {
    // Pocket hole
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, POCKET_RADIUS + 2, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();

    // Inner gradient
    const grad = ctx.createRadialGradient(
      pocket.x, pocket.y, 0,
      pocket.x, pocket.y, POCKET_RADIUS
    );
    grad.addColorStop(0, '#000');
    grad.addColorStop(0.7, '#111');
    grad.addColorStop(1, '#1a1a1a');
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, POCKET_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function drawAimLine() {
  const cue = game.cueBall;
  const dx = game.dragCurrentX - game.dragStartX;
  const dy = game.dragCurrentY - game.dragStartY;
  const dragDist = Math.sqrt(dx * dx + dy * dy);

  if (dragDist < 5) return;

  // Direction: opposite of drag
  const angle = Math.atan2(dy, dx);
  const shootAngle = angle + Math.PI;

  // Power indicator (capped)
  const power = Math.min(dragDist, 150);
  const powerRatio = power / 150;

  // Aim line (forward)
  const lineLen = 100 + powerRatio * 100;
  const endX = cue.x + Math.cos(shootAngle) * lineLen;
  const endY = cue.y + Math.sin(shootAngle) * lineLen;

  // Dotted aim line
  ctx.strokeStyle = `rgba(255,255,255,${0.15 + powerRatio * 0.2})`;
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cue.x, cue.y);
  ctx.lineTo(endX, endY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ghost ball at aim point (find first collision)
  drawGhostBall(cue, shootAngle, lineLen);

  // Cue stick (behind the ball)
  const stickStartDist = BALL_RADIUS + 6 + power * 0.5;
  const stickLen = 120;
  const stickStartX = cue.x + Math.cos(angle) * stickStartDist;
  const stickStartY = cue.y + Math.sin(angle) * stickStartDist;
  const stickEndX = stickStartX + Math.cos(angle) * stickLen;
  const stickEndY = stickStartY + Math.sin(angle) * stickLen;

  // Stick body
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(stickStartX, stickStartY);
  ctx.lineTo(stickEndX, stickEndY);
  ctx.stroke();

  // Stick tip
  ctx.strokeStyle = '#ddd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(stickStartX, stickStartY);
  ctx.lineTo(
    stickStartX + Math.cos(angle) * (-4),
    stickStartY + Math.sin(angle) * (-4)
  );
  ctx.stroke();
  ctx.lineCap = 'butt';

  // Power meter bar
  drawPowerMeter(powerRatio);
}

function drawGhostBall(cue, angle, maxDist) {
  // Cast a ray and find first ball hit
  const stepSize = 2;
  const steps = Math.ceil(maxDist / stepSize);

  for (let s = 1; s <= steps; s++) {
    const px = cue.x + Math.cos(angle) * s * stepSize;
    const py = cue.y + Math.sin(angle) * s * stepSize;

    for (const ball of game.balls) {
      if (ball === cue || !ball.active) continue;
      const dx = px - ball.x;
      const dy = py - ball.y;
      if (Math.sqrt(dx*dx + dy*dy) < BALL_RADIUS * 2) {
        // Ghost ball
        ctx.beginPath();
        ctx.arc(px, py, BALL_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }
    }

    // Check wall
    const c = CUSHION_THICKNESS;
    if (px < c + BALL_RADIUS || px > TABLE_W - c - BALL_RADIUS ||
        py < c + BALL_RADIUS || py > TABLE_H - c - BALL_RADIUS) {
      return;
    }
  }
}

function drawPowerMeter(ratio) {
  const meterW = 120;
  const meterH = 8;
  const x = TABLE_W / 2 - meterW / 2;
  const y = TABLE_H - CUSHION_THICKNESS + 7;

  // Background
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x - 1, y - 1, meterW + 2, meterH + 2);

  // Empty bar
  ctx.fillStyle = '#222';
  ctx.fillRect(x, y, meterW, meterH);

  // Power fill
  const grad = ctx.createLinearGradient(x, y, x + meterW, y);
  grad.addColorStop(0, '#00ff88');
  grad.addColorStop(0.5, '#ffe600');
  grad.addColorStop(1, '#ff006e');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, meterW * ratio, meterH);

  // Label
  ctx.fillStyle = '#999';
  ctx.font = '8px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('POWER', TABLE_W / 2, y - 3);
}

function drawIdleIndicator() {
  // Pulsing ring around cue ball
  const t = Date.now() * 0.003;
  const alpha = 0.2 + Math.sin(t) * 0.15;
  const r = BALL_RADIUS + 4 + Math.sin(t * 1.5) * 2;

  ctx.beginPath();
  ctx.arc(game.cueBall.x, game.cueBall.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawMessage() {
  const alpha = game.gameOver ? 0.85 : Math.min(1, game.messageTimer / 30);
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.6})`;
  ctx.fillRect(0, TABLE_H / 2 - 25, TABLE_W, 50);

  ctx.fillStyle = '#00ff88';
  ctx.font = `bold ${Math.round(TABLE_W / 30)}px 'Press Start 2P', monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,255,136,0.6)';
  ctx.shadowBlur = 15;
  ctx.fillText(game.message, TABLE_W / 2, TABLE_H / 2);
  ctx.shadowBlur = 0;
}

function showMessage(text) {
  game.message = text;
  game.messageTimer = 90;
}

// ============================================================================
// CONTROLS
// ============================================================================

function setupControls() {
  // Get canvas-relative position
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function getTouchPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.touches[0].clientX - rect.left) * scaleX,
      y: (e.touches[0].clientY - rect.top) * scaleY,
    };
  }

  function isCueBallHit(pos) {
    if (!game.cueBall.active) return false;
    const dx = pos.x - game.cueBall.x;
    const dy = pos.y - game.cueBall.y;
    return Math.sqrt(dx*dx + dy*dy) < BALL_RADIUS * 3;
  }

  // Mouse events
  canvas.addEventListener('mousedown', (e) => {
    if (game.isMoving || game.gameOver) return;
    const pos = getPos(e);

    if (isCueBallHit(pos)) {
      game.isDragging = true;
      game.dragStartX = pos.x;
      game.dragStartY = pos.y;
      game.dragCurrentX = pos.x;
      game.dragCurrentY = pos.y;
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!game.isDragging) return;
    const pos = getPos(e);
    game.dragCurrentX = pos.x;
    game.dragCurrentY = pos.y;
  });

  canvas.addEventListener('mouseup', () => {
    if (game.isDragging) {
      shoot();
      game.isDragging = false;
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (game.isDragging) {
      shoot();
      game.isDragging = false;
    }
  });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (game.isMoving || game.gameOver) return;
    const pos = getTouchPos(e);

    if (isCueBallHit(pos)) {
      game.isDragging = true;
      game.dragStartX = pos.x;
      game.dragStartY = pos.y;
      game.dragCurrentX = pos.x;
      game.dragCurrentY = pos.y;
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!game.isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    game.dragCurrentX = (e.touches[0].clientX - rect.left) * scaleX;
    game.dragCurrentY = (e.touches[0].clientY - rect.top) * scaleY;
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (game.isDragging) {
      shoot();
      game.isDragging = false;
    }
  }, { passive: false });
}

function shoot() {
  const dx = game.dragCurrentX - game.dragStartX;
  const dy = game.dragCurrentY - game.dragStartY;
  const dragDist = Math.sqrt(dx * dx + dy * dy);

  if (dragDist < 8) return;

  const power = Math.min(dragDist / 150, 1) * MAX_POWER;
  const angle = Math.atan2(dy, dx) + Math.PI; // Opposite direction

  game.cueBall.vx = Math.cos(angle) * power;
  game.cueBall.vy = Math.sin(angle) * power;

  playSound(300 + power * 10, 0.1);
}

// ============================================================================
// AUDIO
// ============================================================================

function playSound(freq, duration) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const audioCtx = new AC();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
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