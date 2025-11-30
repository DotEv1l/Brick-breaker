const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const MAX_SPEED = 7;
const BASE_SPEED = 5; 

let running = false;
const keys = { left: false, right: false };

let paddle;
let ball;
let bricks = [];
let score = 0;
let lives = 3;
let level = 1;

let difficulty = "normal";
let rng = Math.random;
let currentSeed = null;

const META_KEY = 'bb_meta_v1';
const RUN_KEY  = 'bb_run_v1';

const UPGRADE_COSTS = {
  paddleWidth: [20, 40, 80],
  extraLife:   [50, 100]
};

let meta = null;

function showMainMenu() {
  running = false;

  const menu = document.getElementById('mainMenu');
  const gameScreen = document.getElementById('gameScreen');

  if (menu) menu.style.display = 'flex';
  if (gameScreen) gameScreen.style.display = 'none';
}

function showGameScreen() {
  const menu = document.getElementById('mainMenu');
  const gameScreen = document.getElementById('gameScreen');

  if (menu) menu.style.display = 'none';
  if (gameScreen) gameScreen.style.display = 'block';
}

function mulberry32(seed) {
  return function() {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function initSeed() {
    const seedInput = document.getElementById('seedInput');
    const uiSeed = document.getElementById('uiSeed');

    let seedValue = seedInput ? seedInput.value.trim() : "";

    if (!seedValue) {
        seedValue = Math.floor(rng() * 1_000_000);
    }

    seedValue = Number(seedValue) || 1;

    currentSeed = seedValue;
    rng = mulberry32(seedValue);

    if (uiSeed) uiSeed.textContent = seedValue;
}

const DIFFICULTY = {
    easy: {
        hpMult: 0.7,
        rowBonusMult: 0.8,
        extraHpChance: 0.05,
        rows: 4,
        patternWeight: "simple"
    },
    normal: {
        hpMult: 1.0,
        rowBonusMult: 1.0,
        extraHpChance: 0.15,
        rows: 5,
        patternWeight: "mixed"
    },
    hard: {
        hpMult: 1.4,
        rowBonusMult: 1.3,
        extraHpChance: 0.30,
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

const menuNewRunBtn = document.getElementById('menuNewRun');
if (menuNewRunBtn) {
  menuNewRunBtn.addEventListener('click', () => {
    showGameScreen();
    initGame();
  });
}

const menuContinueBtn = document.getElementById('menuContinue');
if (menuContinueBtn) {
  menuContinueBtn.addEventListener('click', () => {
    showGameScreen();
    loadRun();
  });
}

const menuUpgradesBtn = document.getElementById('menuUpgrades');
if (menuUpgradesBtn) {
  menuUpgradesBtn.addEventListener('click', () => {
    openUpgradesMenu();
  });
}

const newRunBtn = document.getElementById('btnNewRun');
if (newRunBtn) {
  newRunBtn.addEventListener('click', () => {
    showGameScreen();
    initGame();
  });
}

/* Helpers for the paddle and lives */
function getStartingLives() {
  if (!meta || !meta.upgrades) return 3;
  return 3 + (meta.upgrades.extraLife || 0);
}

function getPaddleWidth() {
  if (!meta || !meta.upgrades) return 100;
  // each level = +20px width
  return 100 + (meta.upgrades.paddleWidth || 0) * 20;
}

class Paddle {
  constructor() {
    this.w = getPaddleWidth();
    this.h = 16;
    this.x = (canvas.width - this.w) / 2;
    this.y = 520;
    this.v = 8;
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

    let spd = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
    if (spd > MAX_SPEED) {
      this.vx = (this.vx / spd) * MAX_SPEED;
      this.vy = (this.vy / spd) * MAX_SPEED;
    }


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

        let spd = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (spd > MAX_SPEED) {
          this.vx = (this.vx / spd) * MAX_SPEED;
          this.vy = (this.vy / spd) * MAX_SPEED;
        }

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

        this.vx = hitPos * BASE_SPEED;
        this.vy = -Math.abs(this.vy);

        let spd = Math.sqrt(this.vx*this.vx + this.vy*this.vy);
        if (spd > MAX_SPEED) {
            this.vx = (this.vx / spd) * MAX_SPEED;
            this.vy = (this.vy / spd) * MAX_SPEED;
        }
      }
    }

    if (this.y - this.r > canvas.height) {
      lives--;

      if (lives <= 0) {
        running = false;
        clearRun();
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
  
function pickPattern(difficulty) {
  switch (difficulty) {
      case "easy":
        return PATTERNS_SIMPLE[Math.floor(rng()*PATTERNS_SIMPLE.length)];
      case "hard":
        return PATTERNS_DENSE[Math.floor(rng()*PATTERNS_DENSE.length)];
      default:
        return PATTERNS_MIXED[Math.floor(rng()*PATTERNS_MIXED.length)];
  }
}

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

      if (rng() < set.extraHpChance) hp++;

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

    meta = loadMeta();
    const reward = 10 * level;
    meta.currency = (meta.currency || 0) + reward;
    saveMeta();

    saveRun(true);

    const nextBtn = document.getElementById('btnNext');
    if (nextBtn) nextBtn.disabled = false;
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

  // If game isnt initialized yet, dont try to draw
  if (!paddle || !ball) return;

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

  const nextBtn = document.getElementById('btnNext');
  if (nextBtn) nextBtn.disabled = true; 

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

const continueBtn = document.getElementById('btnContinue');
if (continueBtn) {
  continueBtn.addEventListener('click', () => {
    showGameScreen();
    loadRun();
  });
}

const nextBtn = document.getElementById('btnNext');
if (nextBtn) {
  nextBtn.disabled = true;
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
    openUpgradesMenu();
  });
}

const abandonBtn= document.getElementById('btnAbandonRun');
if (abandonBtn) {
  abandonBtn.addEventListener('click', () => {
    const ok = confirm('Abandon current run? You will lose the progress made this run!');
    if (!ok) return;

    clearRun();
    running = false;

    const offCanvasEl = document.getElementById('pauseMenu');
    if (offCanvasEl) {
      const offcanvas =
        bootstrap.Offcanvas.getInstance(offCanvasEl) ||
        new bootstrap.Offcanvas(offCanvasEl);
      offcanvas.hide();
    }

    showMainMenu();
  });
}

const buyPaddleBtn = document.getElementById('btnBuyPaddle');
if (buyPaddleBtn) {
  buyPaddleBtn.addEventListener('click', () => {
    buyUpgrade('paddleWidth');
  });
}

const buyLifeBtn = document.getElementById('btnBuyLife');
if (buyLifeBtn) {
  buyLifeBtn.addEventListener('click', () => {
    buyUpgrade('extraLife');
  });
}

function openUpgradesMenu() {
  meta = loadMeta();

  const pwLevel = meta.upgrades.paddleWidth || 0;
  const elLevel = meta.upgrades.extraLife || 0;

  const nextPwCost = UPGRADE_COSTS.paddleWidth[pwLevel];
  const nextElCost = UPGRADE_COSTS.extraLife[elLevel];

  const elCurrency = document.getElementById('upCurrency');
  const elPWLevel  = document.getElementById('upPWLevel');
  const elPWCost   = document.getElementById('upPWCost');
  const elELLevel  = document.getElementById('upELLevel');
  const elELCost   = document.getElementById('upELCost');
  const btnPW      = document.getElementById('btnBuyPaddle');
  const btnEL      = document.getElementById('btnBuyLife');

  if (elCurrency) elCurrency.textContent = meta.currency ?? 0;
  if (elPWLevel)  elPWLevel.textContent  = pwLevel;
  if (elPWCost)   elPWCost.textContent   = nextPwCost ?? 'MAX';
  if (elELLevel)  elELLevel.textContent  = elLevel;
  if (elELCost)   elELCost.textContent   = nextElCost ?? 'MAX';

  if (btnPW) btnPW.disabled = nextPwCost == null;
  if (btnEL) btnEL.disabled = nextElCost == null;

  const modalEl = document.getElementById('upgradesModal');
  if (!modalEl) return;

  const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modal.show();
}

function buyUpgrade(key) {
  meta = loadMeta();

  const level   = meta.upgrades[key] || 0;
  const costArr = UPGRADE_COSTS[key];
  const cost    = costArr[level];

  if (cost == null) {
    alert('This upgrade is already at max level.');
    return;
  }

  if (meta.currency < cost) {
    alert(`Not enough currency. Need ${cost}, you have ${meta.currency}.`);
    return;
  }

  meta.currency -= cost;
  meta.upgrades[key] = level + 1;
  saveMeta();

  // Refresh the modal contents to show new levels and currency
  openUpgradesMenu();
}

function loadMeta() {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) {
      return {
        currency: 0,
        upgrades: {
          paddleWidth: 0,
          extraLife: 0
        }
      };
    }
    const data = JSON.parse(raw);
    // harden defaults
    if (!data.upgrades) {
      data.upgrades = { paddleWidth: 0, extraLife: 0 };
    } else {
      if (typeof data.upgrades.paddleWidth !== 'number') data.upgrades.paddleWidth = 0;
      if (typeof data.upgrades.extraLife !== 'number') data.upgrades.extraLife = 0;
    }
    if (typeof data.currency !== 'number') data.currency = 0;
    return data;
  } catch (e) {
    console.warn('Failed to load meta, resetting.', e);
    return {
      currency: 0,
      upgrades: {
        paddleWidth: 0,
        extraLife: 0
      }
    };
  }
}

function saveRun(pendingNextLevel = false) {
  const targetLevel = pendingNextLevel ? level + 1 : level;

  const data = {
    seed: currentSeed,
    level: targetLevel,
    score: score,
    lives: lives,
    difficulty: difficulty
  };

  localStorage.setItem(RUN_KEY, JSON.stringify(data));
}

function clearRun() {
  localStorage.removeItem(RUN_KEY);
}

function loadRun() {
  const raw = localStorage.getItem(RUN_KEY);
  if (!raw) {
    alert('No saved run found.');
    return;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse run save, clearing.', e);
    clearRun();
    alert('Saved run was corrupted and has been cleared.');
    return;
  }

  meta = loadMeta();  // <-- make sure upgrades are loaded

  difficulty = data.difficulty || 'normal';
  currentSeed = data.seed || 1;
  rng = mulberry32(currentSeed);

  score = data.score || 0;
  level = data.level || 1;
  lives = data.lives || getStartingLives();

  for (let lv = 1; lv <= level; lv++) {
    buildLevel(lv);
  }

  const nextBtn = document.getElementById('btnNext');
  if (nextBtn) nextBtn.disabled = true;

  paddle = new Paddle();
  ball = new Ball();
  ball.reset(paddle);

  running = true;
}

function saveMeta() {
  if (!meta) return;
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function initGame() {
  meta = loadMeta();

  score = 0;
  lives = getStartingLives();
  level = 1;

  initSeed();

  const nextBtn = document.getElementById('btnNext');
  if (nextBtn) nextBtn.disabled = true;

  paddle = new Paddle();
  ball = new Ball();
  ball.reset(paddle);

  buildLevel(level);

  running = true;
}

showMainMenu();
requestAnimationFrame(loop);