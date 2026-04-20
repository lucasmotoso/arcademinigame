//=============================================================================
// PONG - Refactored with Neon Effects, Touch Support, and Modern Canvas Rendering
//=============================================================================

Pong = {

  Defaults: {
    width:        640,
    height:       480,
    wallWidth:    12,
    paddleWidth:  14,
    paddleHeight: 90,
    paddleSpeed:  2,
    ballSpeed:    4,
    ballAccel:    8,
    ballRadius:   7,
    sound:        false
  },

  Colors: {
    walls:           '#00ff88',
    ball:            '#ff006e',
    score:           '#00d4ff',
    footprint:       'rgba(255,0,110,0.15)',
    predictionGuess: '#ffe600',
    predictionExact: '#ff006e',
    paddle1:         '#00ff88',
    paddle2:         '#00d4ff',
    centerLine:      'rgba(0,255,136,0.15)',
    wallGlow:        'rgba(0,255,136,0.3)',
    ballGlow:        'rgba(255,0,110,0.5)',
    trailColor:      'rgba(255,0,110,0.08)',
  },

  Images: [
    "images/press1.png",
    "images/press2.png",
    "images/winner.png"
  ],

  Levels: [
    {aiReaction: 0.2, aiError:  40},
    {aiReaction: 0.3, aiError:  50},
    {aiReaction: 0.4, aiError:  60},
    {aiReaction: 0.5, aiError:  70},
    {aiReaction: 0.6, aiError:  80},
    {aiReaction: 0.7, aiError:  90},
    {aiReaction: 0.8, aiError: 100},
    {aiReaction: 0.9, aiError: 110},
    {aiReaction: 1.0, aiError: 120},
    {aiReaction: 1.1, aiError: 130},
    {aiReaction: 1.2, aiError: 140},
    {aiReaction: 1.3, aiError: 150},
    {aiReaction: 1.4, aiError: 160},
    {aiReaction: 1.5, aiError: 170},
    {aiReaction: 1.6, aiError: 180},
    {aiReaction: 1.7, aiError: 190},
    {aiReaction: 1.8, aiError: 200}
  ],

  //-----------------------------------------------------------------------------

  initialize: function(runner, cfg) {
    Game.loadImages(Pong.Images, function(images) {
      this.cfg         = cfg;
      this.runner      = runner;
      this.width       = runner.width;
      this.height      = runner.height;
      this.images      = images;
      this.playing     = false;
      this.scores      = [0, 0];
      this.trail       = [];
      this.particles   = [];
      this.menu        = Object.construct(Pong.Menu,   this);
      this.court       = Object.construct(Pong.Court,  this);
      this.leftPaddle  = Object.construct(Pong.Paddle, this, false);
      this.rightPaddle = Object.construct(Pong.Paddle, this, true);
      this.ball        = Object.construct(Pong.Ball,   this);
      this.sounds      = Object.construct(Pong.Sounds, this);
      this.setupTouch();
      this.runner.start();
    }.bind(this));
  },

  startDemo:         function() { this.start(0); },
  startSinglePlayer: function() { this.start(1); },
  startDoublePlayer: function() { this.start(2); },

  start: function(numPlayers) {
    if (!this.playing) {
      this.scores = [0, 0];
      this.playing = true;
      this.trail = [];
      this.particles = [];
      this.numPlayers = numPlayers;
      this.leftPaddle.setAuto(numPlayers < 1, this.level(0));
      this.rightPaddle.setAuto(numPlayers < 2, this.level(1));
      this.ball.reset();
      this.runner.hideCursor();
    }
  },

  stop: function(ask) {
    if (this.playing) {
      if (!ask || this.runner.confirm('Abandonar o jogo em progresso?')) {
        this.playing = false;
        this.leftPaddle.setAuto(false);
        this.rightPaddle.setAuto(false);
        this.runner.showCursor();
      }
    }
  },

  level: function(playerNo) {
    return 8 + (this.scores[playerNo] - this.scores[playerNo ? 0 : 1]);
  },

  goal: function(playerNo) {
    this.sounds.goal();
    this.scores[playerNo] += 1;
    // Spawn particles
    this.spawnGoalParticles(playerNo);
    if (this.scores[playerNo] == 9) {
      this.menu.declareWinner(playerNo);
      this.stop();
    } else {
      this.ball.reset(playerNo);
      this.leftPaddle.setLevel(this.level(0));
      this.rightPaddle.setLevel(this.level(1));
    }
  },

  spawnGoalParticles: function(playerNo) {
    var x = playerNo === 0 ? this.width - 20 : 20;
    var y = this.height / 2;
    for (var i = 0; i < 20; i++) {
      this.particles.push({
        x: x,
        y: y + Game.random(-50, 50),
        vx: Game.random(-3, 3),
        vy: Game.random(-4, 4),
        life: 1.0,
        color: playerNo === 0 ? Pong.Colors.paddle1 : Pong.Colors.paddle2,
        size: Game.random(2, 6)
      });
    }
  },

  spawnHitParticles: function(x, y) {
    for (var i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: Game.random(-2, 2),
        vy: Game.random(-2, 2),
        life: 1.0,
        color: Pong.Colors.ball,
        size: Game.random(1, 4)
      });
    }
  },

  update: function(dt) {
    this.leftPaddle.update(dt, this.ball);
    this.rightPaddle.update(dt, this.ball);

    // Update particles
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    if (this.playing) {
      var dx = this.ball.dx;
      var dy = this.ball.dy;
      this.ball.update(dt, this.leftPaddle, this.rightPaddle);

      // Track ball trail
      this.trail.push({x: this.ball.x, y: this.ball.y, life: 1.0});
      if (this.trail.length > 25) this.trail.shift();
      for (var t = 0; t < this.trail.length; t++) {
        this.trail[t].life -= 0.04;
      }
      this.trail = this.trail.filter(function(t) { return t.life > 0; });

      if (this.ball.dx < 0 && dx > 0) {
        this.sounds.ping();
        this.spawnHitParticles(this.ball.x, this.ball.y);
      } else if (this.ball.dx > 0 && dx < 0) {
        this.sounds.pong();
        this.spawnHitParticles(this.ball.x, this.ball.y);
      } else if (this.ball.dy * dy < 0) {
        this.sounds.wall();
      }

      if (this.ball.left > this.width)
        this.goal(0);
      else if (this.ball.right < 0)
        this.goal(1);
    }
  },

  draw: function(ctx) {
    // Background
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, this.width, this.height);

    // Background grid
    ctx.strokeStyle = 'rgba(0,255,136,0.02)';
    ctx.lineWidth = 0.5;
    for (var gx = 0; gx < this.width; gx += 30) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, this.height);
      ctx.stroke();
    }
    for (var gy = 0; gy < this.height; gy += 30) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(this.width, gy);
      ctx.stroke();
    }

    this.court.draw(ctx, this.scores[0], this.scores[1]);
    this.leftPaddle.draw(ctx);
    this.rightPaddle.draw(ctx);

    if (this.playing) {
      // Draw trail
      for (var t = 0; t < this.trail.length; t++) {
        var tr = this.trail[t];
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, this.ball.radius * tr.life, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,0,110,' + (tr.life * 0.2) + ')';
        ctx.fill();
      }

      this.ball.draw(ctx);
    } else {
      this.menu.draw(ctx);
    }

    // Draw particles
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  onkeydown: function(keyCode) {
    switch(keyCode) {
      case Game.KEY.ZERO: this.startDemo();            break;
      case Game.KEY.ONE:  this.startSinglePlayer();    break;
      case Game.KEY.TWO:  this.startDoublePlayer();    break;
      case Game.KEY.ESC:  this.stop(true);             break;
      case Game.KEY.Q:    if (!this.leftPaddle.auto)  this.leftPaddle.moveUp();    break;
      case Game.KEY.A:    if (!this.leftPaddle.auto)  this.leftPaddle.moveDown();  break;
      case Game.KEY.P:    if (!this.rightPaddle.auto) this.rightPaddle.moveUp();   break;
      case Game.KEY.L:    if (!this.rightPaddle.auto) this.rightPaddle.moveDown(); break;
    }
  },

  onkeyup: function(keyCode) {
    switch(keyCode) {
      case Game.KEY.Q: if (!this.leftPaddle.auto)  this.leftPaddle.stopMovingUp();    break;
      case Game.KEY.A: if (!this.leftPaddle.auto)  this.leftPaddle.stopMovingDown();  break;
      case Game.KEY.P: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingUp();   break;
      case Game.KEY.L: if (!this.rightPaddle.auto) this.rightPaddle.stopMovingDown(); break;
    }
  },

  showStats:       function(on) { this.cfg.stats = on; },
  showFootprints:  function(on) { this.cfg.footprints = on; this.ball.footprints = []; },
  showPredictions: function(on) { this.cfg.predictions = on; },
  enableSound:     function(on) { this.cfg.sound = on; },

  setupTouch: function() {
    var self = this;
    var canvas = this.runner.canvas;

    // Touch on canvas to start game
    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      if (!self.playing) {
        self.startSinglePlayer();
        return;
      }
    }, {passive: false});

    // Touch zones for paddle control
    var leftZone = document.getElementById('touch-left');
    var rightZone = document.getElementById('touch-right');

    if (leftZone) {
      leftZone.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!self.playing) { self.startSinglePlayer(); return; }
        var rect = leftZone.getBoundingClientRect();
        var y = e.touches[0].clientY - rect.top;
        if (y < rect.height / 2) {
          if (!self.leftPaddle.auto) self.leftPaddle.moveUp();
        } else {
          if (!self.leftPaddle.auto) self.leftPaddle.moveDown();
        }
      }, {passive: false});

      leftZone.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (!self.leftPaddle.auto) {
          self.leftPaddle.stopMovingUp();
          self.leftPaddle.stopMovingDown();
        }
      }, {passive: false});
    }

    if (rightZone) {
      rightZone.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!self.playing) { self.startDoublePlayer(); return; }
        var rect = rightZone.getBoundingClientRect();
        var y = e.touches[0].clientY - rect.top;
        if (y < rect.height / 2) {
          if (!self.rightPaddle.auto) self.rightPaddle.moveUp();
        } else {
          if (!self.rightPaddle.auto) self.rightPaddle.moveDown();
        }
      }, {passive: false});

      rightZone.addEventListener('touchend', function(e) {
        e.preventDefault();
        if (!self.rightPaddle.auto) {
          self.rightPaddle.stopMovingUp();
          self.rightPaddle.stopMovingDown();
        }
      }, {passive: false});
    }
  },

  //=============================================================================
  // MENU
  //=============================================================================

  Menu: {

    initialize: function(pong) {
      this.pong = pong;
      this.winner = null;
      // Try to load images, fall back to text rendering
      try {
        var press1 = pong.images["images/press1.png"];
        var press2 = pong.images["images/press2.png"];
        var winner = pong.images["images/winner.png"];
        if (press1 && press1.width > 0) {
          this.press1  = { image: press1, x: 10, y: pong.cfg.wallWidth };
          this.press2  = { image: press2, x: (pong.width - press2.width - 10), y: pong.cfg.wallWidth };
          this.winner1 = { image: winner, x: (pong.width/2) - winner.width - pong.cfg.wallWidth, y: 6 * pong.cfg.wallWidth };
          this.winner2 = { image: winner, x: (pong.width/2) + pong.cfg.wallWidth, y: 6 * pong.cfg.wallWidth };
          this.hasImages = true;
        } else {
          this.hasImages = false;
        }
      } catch(e) {
        this.hasImages = false;
      }
    },

    declareWinner: function(playerNo) {
      this.winner = playerNo;
    },

    draw: function(ctx) {
      if (this.hasImages) {
        if (this.press1 && this.press1.image) ctx.drawImage(this.press1.image, this.press1.x, this.press1.y);
        if (this.press2 && this.press2.image) ctx.drawImage(this.press2.image, this.press2.x, this.press2.y);
        if (this.winner == 0 && this.winner1)
          ctx.drawImage(this.winner1.image, this.winner1.x, this.winner1.y);
        else if (this.winner == 1 && this.winner2)
          ctx.drawImage(this.winner2.image, this.winner2.x, this.winner2.y);
      } else {
        // Text-based menu fallback
        var w = this.pong.width;
        var h = this.pong.height;

        ctx.fillStyle = '#00ff88';
        ctx.font = "bold 28px 'Press Start 2P', monospace";
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,255,136,0.6)';
        ctx.shadowBlur = 15;
        ctx.fillText('PONG', w/2, h * 0.25);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#00d4ff';
        ctx.font = "10px 'Press Start 2P', monospace";
        ctx.fillText('Press 1 - Single Player', w/2, h * 0.45);
        ctx.fillText('Press 2 - Two Players', w/2, h * 0.55);
        ctx.fillText('Press 0 - Demo', w/2, h * 0.65);

        if (this.winner !== null && this.winner !== undefined) {
          ctx.fillStyle = '#ffe600';
          ctx.font = "16px 'Press Start 2P', monospace";
          ctx.shadowColor = 'rgba(255,230,0,0.6)';
          ctx.shadowBlur = 10;
          ctx.fillText('PLAYER ' + (this.winner + 1) + ' WINS!', w/2, h * 0.82);
          ctx.shadowBlur = 0;
        }

        // Blinking text
        if (Math.floor(Date.now() / 500) % 2 === 0) {
          ctx.fillStyle = '#ff006e';
          ctx.font = "8px 'Press Start 2P', monospace";
          ctx.fillText('INSERT COIN TO PLAY', w/2, h * 0.92);
        }
      }
    }
  },

  //=============================================================================
  // SOUNDS
  //=============================================================================

  Sounds: {

    initialize: function(pong) {
      this.game      = pong;
      this.supported = Game.ua.hasAudio;
      if (this.supported) {
        this.files = {
          ping: Game.createAudio("sounds/ping.wav"),
          pong: Game.createAudio("sounds/pong.wav"),
          wall: Game.createAudio("sounds/wall.wav"),
          goal: Game.createAudio("sounds/goal.wav")
        };
      }
    },

    play: function(name) {
      if (this.supported && this.game.cfg.sound && this.files[name])
        this.files[name].play();
    },

    ping: function() { this.play('ping'); },
    pong: function() { this.play('pong'); },
    wall: function() { this.play('wall'); },
    goal: function() { this.play('goal');}
  },

  //=============================================================================
  // COURT - Neon styled
  //=============================================================================

  Court: {

    initialize: function(pong) {
      var w  = pong.width;
      var h  = pong.height;
      var ww = pong.cfg.wallWidth;

      this.ww    = ww;
      this.walls = [];
      this.walls.push({x: 0, y: 0,      width: w, height: ww});
      this.walls.push({x: 0, y: h - ww, width: w, height: ww});
      var nMax = (h / (ww*2));
      for(var n = 0 ; n < nMax ; n++) {
        this.walls.push({x: (w / 2) - (ww / 2),
                         y: (ww / 2) + (ww * 2 * n),
                         width: ww, height: ww});
      }

      var sw = 3*ww;
      var sh = 4*ww;
      this.score1 = {x: 0.5 + (w/2) - 1.5*ww - sw, y: 2*ww, w: sw, h: sh};
      this.score2 = {x: 0.5 + (w/2) + 1.5*ww,      y: 2*ww, w: sw, h: sh};
    },

    draw: function(ctx, scorePlayer1, scorePlayer2) {
      // Walls with glow
      ctx.fillStyle = Pong.Colors.walls;
      ctx.shadowColor = Pong.Colors.wallGlow;
      ctx.shadowBlur = 8;
      for(var n = 0 ; n < 2 ; n++) // Only top and bottom walls get glow
        ctx.fillRect(this.walls[n].x, this.walls[n].y, this.walls[n].width, this.walls[n].height);
      ctx.shadowBlur = 0;

      // Center line (dimmer)
      ctx.fillStyle = Pong.Colors.centerLine;
      for(var n = 2 ; n < this.walls.length ; n++)
        ctx.fillRect(this.walls[n].x, this.walls[n].y, this.walls[n].width, this.walls[n].height);

      // Scores with glow
      ctx.shadowColor = 'rgba(0,212,255,0.4)';
      ctx.shadowBlur = 10;
      this.drawDigit(ctx, scorePlayer1, this.score1.x, this.score1.y, this.score1.w, this.score1.h);
      this.drawDigit(ctx, scorePlayer2, this.score2.x, this.score2.y, this.score2.w, this.score2.h);
      ctx.shadowBlur = 0;
    },

    drawDigit: function(ctx, n, x, y, w, h) {
      ctx.fillStyle = Pong.Colors.score;
      var dw = dh = this.ww*4/5;
      var blocks = Pong.Court.DIGITS[n];
      if (blocks[0]) ctx.fillRect(x, y, w, dh);
      if (blocks[1]) ctx.fillRect(x, y, dw, h/2);
      if (blocks[2]) ctx.fillRect(x+w-dw, y, dw, h/2);
      if (blocks[3]) ctx.fillRect(x, y + h/2 - dh/2, w, dh);
      if (blocks[4]) ctx.fillRect(x, y + h/2, dw, h/2);
      if (blocks[5]) ctx.fillRect(x+w-dw, y + h/2, dw, h/2);
      if (blocks[6]) ctx.fillRect(x, y+h-dh, w, dh);
    },

    DIGITS: [
      [1, 1, 1, 0, 1, 1, 1],
      [0, 0, 1, 0, 0, 1, 0],
      [1, 0, 1, 1, 1, 0, 1],
      [1, 0, 1, 1, 0, 1, 1],
      [0, 1, 1, 1, 0, 1, 0],
      [1, 1, 0, 1, 0, 1, 1],
      [1, 1, 0, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 0, 1, 0]
    ]
  },

  //=============================================================================
  // PADDLE - Neon colored with glow
  //=============================================================================

  Paddle: {

    initialize: function(pong, rhs) {
      this.pong   = pong;
      this.rhs    = rhs;
      this.width  = pong.cfg.paddleWidth;
      this.height = pong.cfg.paddleHeight;
      this.minY   = pong.cfg.wallWidth;
      this.maxY   = pong.height - pong.cfg.wallWidth - this.height;
      this.speed  = (this.maxY - this.minY) / pong.cfg.paddleSpeed;
      this.color  = rhs ? Pong.Colors.paddle2 : Pong.Colors.paddle1;
      this.setpos(rhs ? pong.width - this.width : 0, this.minY + (this.maxY - this.minY)/2);
      this.setdir(0);
    },

    setpos: function(x, y) {
      this.x      = x;
      this.y      = y;
      this.left   = this.x;
      this.right  = this.left + this.width;
      this.top    = this.y;
      this.bottom = this.y + this.height;
    },

    setdir: function(dy) {
      this.up   = (dy < 0 ? -dy : 0);
      this.down = (dy > 0 ?  dy : 0);
    },

    setAuto: function(on, level) {
      if (on && !this.auto) {
        this.auto = true;
        this.setLevel(level);
      }
      else if (!on && this.auto) {
        this.auto = false;
        this.setdir(0);
      }
    },

    setLevel: function(level) {
      if (this.auto)
        this.level = Pong.Levels[level];
    },

    update: function(dt, ball) {
      if (this.auto)
        this.ai(dt, ball);

      var amount = this.down - this.up;
      if (amount != 0) {
        var y = this.y + (amount * dt * this.speed);
        if (y < this.minY)
          y = this.minY;
        else if (y > this.maxY)
          y = this.maxY;
        this.setpos(this.x, y);
      }
    },

    ai: function(dt, ball) {
      if (((ball.x < this.left) && (ball.dx < 0)) ||
          ((ball.x > this.right) && (ball.dx > 0))) {
        this.stopMovingUp();
        this.stopMovingDown();
        return;
      }

      this.predict(ball, dt);

      if (this.prediction) {
        if (this.prediction.y < (this.top + this.height/2 - 5)) {
          this.stopMovingDown();
          this.moveUp();
        }
        else if (this.prediction.y > (this.bottom - this.height/2 + 5)) {
          this.stopMovingUp();
          this.moveDown();
        }
        else {
          this.stopMovingUp();
          this.stopMovingDown();
        }
      }
    },

    predict: function(ball, dt) {
      if (this.prediction &&
          ((this.prediction.dx * ball.dx) > 0) &&
          ((this.prediction.dy * ball.dy) > 0) &&
          (this.prediction.since < this.level.aiReaction)) {
        this.prediction.since += dt;
        return;
      }

      var pt  = Pong.Helper.ballIntercept(ball, {left: this.left, right: this.right, top: -10000, bottom: 10000}, ball.dx * 10, ball.dy * 10);
      if (pt) {
        var t = this.minY + ball.radius;
        var b = this.maxY + this.height - ball.radius;

        while ((pt.y < t) || (pt.y > b)) {
          if (pt.y < t) {
            pt.y = t + (t - pt.y);
          }
          else if (pt.y > b) {
            pt.y = t + (b - t) - (pt.y - b);
          }
        }
        this.prediction = pt;
      }
      else {
        this.prediction = null;
      }

      if (this.prediction) {
        this.prediction.since = 0;
        this.prediction.dx = ball.dx;
        this.prediction.dy = ball.dy;
        this.prediction.radius = ball.radius;
        this.prediction.exactX = this.prediction.x;
        this.prediction.exactY = this.prediction.y;
        var closeness = (ball.dx < 0 ? ball.x - this.right : this.left - ball.x) / this.pong.width;
        var error = this.level.aiError * closeness;
        this.prediction.y = this.prediction.y + Game.random(-error, error);
      }
    },

    draw: function(ctx) {
      // Paddle glow
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.shadowBlur = 0;

      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

      if (this.prediction && this.pong.cfg.predictions) {
        ctx.strokeStyle = Pong.Colors.predictionExact;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.exactY - this.prediction.radius, this.prediction.radius*2, this.prediction.radius*2);
        ctx.strokeStyle = Pong.Colors.predictionGuess;
        ctx.strokeRect(this.prediction.x - this.prediction.radius, this.prediction.y - this.prediction.radius, this.prediction.radius*2, this.prediction.radius*2);
      }
    },

    moveUp:         function() { this.up   = 1; },
    moveDown:       function() { this.down = 1; },
    stopMovingUp:   function() { this.up   = 0; },
    stopMovingDown: function() { this.down = 0; }

  },

  //=============================================================================
  // BALL - Neon with glow
  //=============================================================================

  Ball: {

    initialize: function(pong) {
      this.pong    = pong;
      this.radius  = pong.cfg.ballRadius;
      this.minX    = this.radius;
      this.maxX    = pong.width - this.radius;
      this.minY    = pong.cfg.wallWidth + this.radius;
      this.maxY    = pong.height - pong.cfg.wallWidth - this.radius;
      this.speed   = (this.maxX - this.minX) / pong.cfg.ballSpeed;
      this.accel   = pong.cfg.ballAccel;
    },

    reset: function(playerNo) {
      this.footprints = [];
      this.setpos(playerNo == 1 ?   this.maxX : this.minX,  Game.random(this.minY, this.maxY));
      this.setdir(playerNo == 1 ? -this.speed : this.speed, this.speed);
    },

    setpos: function(x, y) {
      this.x      = x;
      this.y      = y;
      this.left   = this.x - this.radius;
      this.top    = this.y - this.radius;
      this.right  = this.x + this.radius;
      this.bottom = this.y + this.radius;
    },

    setdir: function(dx, dy) {
      this.dxChanged = ((this.dx < 0) != (dx < 0));
      this.dyChanged = ((this.dy < 0) != (dy < 0));
      this.dx = dx;
      this.dy = dy;
    },

    footprint: function() {
      if (this.pong.cfg.footprints) {
        if (!this.footprintCount || this.dxChanged || this.dyChanged) {
          this.footprints.push({x: this.x, y: this.y});
          if (this.footprints.length > 50)
            this.footprints.shift();
          this.footprintCount = 5;
        }
        else {
          this.footprintCount--;
        }
      }
    },

    update: function(dt, leftPaddle, rightPaddle) {
      pos = Pong.Helper.accelerate(this.x, this.y, this.dx, this.dy, this.accel, dt);

      if ((pos.dy > 0) && (pos.y > this.maxY)) {
        pos.y = this.maxY;
        pos.dy = -pos.dy;
      }
      else if ((pos.dy < 0) && (pos.y < this.minY)) {
        pos.y = this.minY;
        pos.dy = -pos.dy;
      }

      var paddle = (pos.dx < 0) ? leftPaddle : rightPaddle;
      var pt     = Pong.Helper.ballIntercept(this, paddle, pos.nx, pos.ny);

      if (pt) {
        switch(pt.d) {
          case 'left':
          case 'right':
            pos.x = pt.x;
            pos.dx = -pos.dx;
            break;
          case 'top':
          case 'bottom':
            pos.y = pt.y;
            pos.dy = -pos.dy;
            break;
        }

        if (paddle.up)
          pos.dy = pos.dy * (pos.dy < 0 ? 0.5 : 1.5);
        else if (paddle.down)
          pos.dy = pos.dy * (pos.dy > 0 ? 0.5 : 1.5);
      }

      this.setpos(pos.x,  pos.y);
      this.setdir(pos.dx, pos.dy);
      this.footprint();
    },

    draw: function(ctx) {
      var r = this.radius;

      // Ball glow
      ctx.shadowColor = Pong.Colors.ballGlow;
      ctx.shadowBlur = 15;

      // Ball body
      ctx.fillStyle = Pong.Colors.ball;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Inner highlight
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.beginPath();
      ctx.arc(this.x - 1, this.y - 1, r * 0.5, 0, Math.PI * 2);
      ctx.fill();

      if (this.pong.cfg.footprints) {
        var max = this.footprints.length;
        ctx.strokeStyle = Pong.Colors.footprint;
        for(var n = 0 ; n < max ; n++) {
          ctx.beginPath();
          ctx.arc(this.footprints[n].x, this.footprints[n].y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  },

  //=============================================================================
  // HELPER
  //=============================================================================

  Helper: {

    accelerate: function(x, y, dx, dy, accel, dt) {
      var x2  = x + (dt * dx) + (accel * dt * dt * 0.5);
      var y2  = y + (dt * dy) + (accel * dt * dt * 0.5);
      var dx2 = dx + (accel * dt) * (dx > 0 ? 1 : -1);
      var dy2 = dy + (accel * dt) * (dy > 0 ? 1 : -1);
      return { nx: (x2-x), ny: (y2-y), x: x2, y: y2, dx: dx2, dy: dy2 };
    },

    intercept: function(x1, y1, x2, y2, x3, y3, x4, y4, d) {
      var denom = ((y4-y3) * (x2-x1)) - ((x4-x3) * (y2-y1));
      if (denom != 0) {
        var ua = (((x4-x3) * (y1-y3)) - ((y4-y3) * (x1-x3))) / denom;
        if ((ua >= 0) && (ua <= 1)) {
          var ub = (((x2-x1) * (y1-y3)) - ((y2-y1) * (x1-x3))) / denom;
          if ((ub >= 0) && (ub <= 1)) {
            var x = x1 + (ua * (x2-x1));
            var y = y1 + (ua * (y2-y1));
            return { x: x, y: y, d: d};
          }
        }
      }
      return null;
    },

    ballIntercept: function(ball, rect, nx, ny) {
      var pt;
      if (nx < 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                   rect.right  + ball.radius,
                                   rect.top    - ball.radius,
                                   rect.right  + ball.radius,
                                   rect.bottom + ball.radius,
                                   "right");
      }
      else if (nx > 0) {
        pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                   rect.left   - ball.radius,
                                   rect.top    - ball.radius,
                                   rect.left   - ball.radius,
                                   rect.bottom + ball.radius,
                                   "left");
      }
      if (!pt) {
        if (ny < 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                     rect.left   - ball.radius,
                                     rect.bottom + ball.radius,
                                     rect.right  + ball.radius,
                                     rect.bottom + ball.radius,
                                     "bottom");
        }
        else if (ny > 0) {
          pt = Pong.Helper.intercept(ball.x, ball.y, ball.x + nx, ball.y + ny,
                                     rect.left   - ball.radius,
                                     rect.top    - ball.radius,
                                     rect.right  + ball.radius,
                                     rect.top    - ball.radius,
                                     "top");
        }
      }
      return pt;
    }

  }

  //=============================================================================

}; // Pong
