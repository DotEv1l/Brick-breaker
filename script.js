const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let running = false;
const keys = { left: false, right: false };

let paddle;
let ball;
let bricks = [];
let score = 0;
let lives = 3;
let level = 1;

let difficulty = "normal";

const DIFFICULTY = {
    easy: {
        hpMult: 0.7,
        rowBonusMult: 0.8,
        extraHpChance: 0.05,
        scoreMult: 0.8,
        rows: 4,
        patternWeight: "simple"
    },
    normal: {
        hpMult: 1.0,
        rowBonusMult: 1.0,
        extraHpChance: 0.15,
        scoreMult: 1.0,
        rows: 5,
        patternWeight: "mixed"
    },
    hard: {
        hpMult: 1.4,
        rowBonusMult: 1.3,
        extraHpChance: 0.30,
        scoreMult: 1.25,
        rows: 6,
        patternWeight: "dense"
    }
};

const PATTERNS_SIMPLE = [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,1,0,1,0,1,0,1,0]
];

const PATTERNS_MIXED = [
    [0,1,1,0,0,1,1,0,0,1],
    [0,0,1,1,1,1,1,1,0,0],
    [0,1,1,1,0,0,1,1,1,0]
];

const PATTERNS_DENSE = [
    [1,1,0,0,1,1,0,0,1,1],
    [1,1,1,0,1,0,1,1,1,0]
];

function pickPattern(difficulty) {
    switch (difficulty) {
        case "easy":   return PATTERNS_SIMPLE[Math.floor(Math.random()*PATTERNS_SIMPLE.length)];
        case "hard":   return PATTERNS_DENSE[Math.floor(Math.random()*PATTERNS_DENSE.length)];
        default:       return PATTERNS_MIXED[Math.floor(Math.random()*PATTERNS_MIXED.length)];
    }
}

class Paddle {
  constructor() {
    this.x = 350; this.y = 520; this.w = 100; this.h = 16; this.v = 8;
  }
  update() {
    if (keys.left) this.x -= this.v;
    if (keys.right) this.x += this.v;
    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
  }
  draw(ctx) {
    ctx.fillStyle = '#9db9e8';
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Ball {
  constructor() {
    this.r = 7;
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.launched = false;
  }

  reset(p) {
    this.launched = false;
    this.x = p.x + p.w / 2;
    this.y = p.y - this.r - 1;
    this.vx = 0;
    this.vy = 0;
  }

  launch(speed = 5) {
    if (this.launched) return;
    this.launched = true;
    this.vx = 0;
    this.vy = -speed;
  }

  update(p) {
    if (!this.launched) {
      this.x = p.x + p.w / 2;
      this.y = p.y - this.r - 1;
      return;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x - this.r <= 0) {
      this.x = this.r;
      this.vx *= -1;
    }
    if (this.x + this.r >= canvas.width) {
      this.x = canvas.width - this.r;
      this.vx *= -1;
    }

    if (this.y - this.r <= 0) {
      this.y = this.r;
      this.vy *= -1;
    }

    for (const brick of bricks) {
      if (!brick.alive) continue;

      const overlapX = this.x + this.r >= brick.x && this.x - this.r <= brick.x + brick.w;
      const overlapY = this.y + this.r >= brick.y && this.y - this.r <= brick.y + brick.h;

      if (overlapX && overlapY) {
        const died = brick.hit();
        if (died) {
          score += brick.maxHp * 10;
        }

        const wasGoingDown = this.vy > 0;
        if (wasGoingDown) {
          this.y = brick.y - this.r;
        } else {
          this.y = brick.y + brick.h + this.r;
        }

        this.vy *= -1;
        break;
      }
    }

    if (this.vy > 0) {
      const withinX = this.x >= p.x && this.x <= p.x + p.w;
      const hitY = this.y + this.r >= p.y && this.y + this.r <= p.y + p.h;

      if (withinX && hitY) {
        this.y = p.y - this.r;

        const paddleCenter = p.x + p.w / 2;
        const hitPos = (this.x - paddleCenter) / (p.w / 2);
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy) || 5;

        this.vx = hitPos * speed;
        this.vy = -Math.abs(this.vy);
      }
    }

    if (this.y - this.r > canvas.height) {
      lives--;

      if (lives <= 0) {
        running = false;
        showGameOver();
        return;
      }

      this.reset(p);
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = '#e7eefc';
    ctx.fill();
  }
}

class Brick {
  constructor(x, y, w, h, hp = 1) {
    this.x = x; this.y = y;
    this.w = w; this.h = h;
    this.hp = hp;
    this.maxHp = hp;
    this.alive = true;
  }
  hit() {
    this.hp--;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  draw(ctx) {
    if (!this.alive) return;

    const ratio = this.hp / this.maxHp;
    const t = Math.max(0, Math.min(1, ratio));

    let color;
    if (t > 0.66) color = "#4caf50";
    else if (t > 0.33) color = "#cddc39";
    else if (t > 0.20) color = "#ff9800";
    else color = "#f44336";

    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class PowerUp {}
class LevelGen {}
class PlayerStats {}

function buildLevel(level) {
  bricks = [];
  const set = DIFFICULTY[difficulty];

  const rows = set.rows;
  const cols = 10;
  const padding = 4;

  const brickW = (canvas.width - padding * (cols + 1)) / cols;
  const brickH = 20;
  const offsetY = 60;

  for (let r = 0; r < rows; r++) {
    const pattern = pickPattern(difficulty);

    for (let c = 0; c < cols; c++) {
      if (!pattern[c]) continue;

      const x = padding + c * (brickW + padding);
      const y = offsetY + r * (brickH + padding);

      let baseHp = 1 + Math.floor((level - 1) * 0.7);
      baseHp = Math.ceil(baseHp * set.hpMult);

      let rowBonus = Math.floor(r / 2);
      rowBonus = Math.ceil(rowBonus * set.rowBonusMult);

      let hp = baseHp + rowBonus;

      if (Math.random() < set.extraHpChance) hp++;

      bricks.push(new Brick(x, y, brickW, brickH, hp));
    }
  }
}

function update() {
  if (!running || !paddle || !ball) return;
  paddle.update();
  ball.update(paddle);

  if (allBricksCleared()) {
    running = false;
  }
}

function updateHud() {
  const elScore = document.getElementById('uiScore');
  const elLevel = document.getElementById('uiLevel');
  const elLives = document.getElementById('uiLives');

  if (elScore) elScore.textContent = score;
  if (elLevel) elLevel.textContent = level;
  if (elLives) elLives.textContent = lives;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  paddle.draw(ctx);
  ball.draw(ctx);
  for (const brick of bricks) {
    brick.draw(ctx);
  }
}

function showGameOver() {
  const modalEl = document.getElementById('gameOverModal');
  if (!modalEl) return;

  const finalScoreEl = document.getElementById('goScore');
  const finalLevelEl = document.getElementById('goLevel');
  if (finalScoreEl) finalScoreEl.textContent = score;
  if (finalLevelEl) finalLevelEl.textContent = level;

  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

function loop() {
  update();
  draw();
  updateHud();
  requestAnimationFrame(loop);
}

function allBricksCleared() {
  return bricks.length > 0 && bricks.every(b => !b.alive);
}

function nextLevel() {
  level++;
  paddle = new Paddle();
  ball.reset(paddle);
  buildLevel(level);
  running = true;
}

addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'Space' && !ball.launched) {
    ball.launch();
  }
});

addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

const launchBtn = document.getElementById('btnLaunch');
if (launchBtn) {
  launchBtn.addEventListener('click', () => {
    if (!ball.launched) {
      ball.launch();
    }
  });
}

const nextBtn = document.getElementById('btnNext');
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    nextLevel();
  });
}

const playAgainBtn = document.getElementById('btnPlayAgain');
if (playAgainBtn) {
  playAgainBtn.addEventListener('click', () => {
    const modalEl = document.getElementById('gameOverModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
    initGame();
  });
}

const upgradesBtn = document.getElementById('btnGoUpgrades');
if (upgradesBtn) {
  upgradesBtn.addEventListener('click', () => {
    alert('Upgrades screen is not implemented yet. This will be the meta-progression hub.');
  });
}

function initGame() {
  score = 0;
  lives = 3;
  level = 1;

  paddle = new Paddle();
  ball = new Ball();
  ball.reset(paddle);

  buildLevel(level);

  running = true;
  requestAnimationFrame(loop);
}

initGame();