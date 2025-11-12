const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let running = false;
const keys = { left: false, right: false };
let paddle;

class Paddle {
    constructor() {
        this.x = 350; this.y = 520; this.w = 100; this.h = 16; this.v = 8;
    }
    update() {
        if (keys.left)  this.x -= this.v;
        if (keys.right) this.x += this.v;
        this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
    }
    draw(ctx) {
        ctx.fillStyle = '#9db9e8';
        ctx.fillRect(this.x, this.y, this.w, this.h);
    }
}

class Ball {}
class Brick {}
class PowerUp {}
class LevelGen {}
class PlayerStats {}

function update() {
    if (!running || !paddle) return;
    paddle.update();
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paddle.draw(ctx);
}
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA')  keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
});
addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA')  keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

function initGame() {
    paddle = new Paddle();
    running = true;
    requestAnimationFrame(loop);
}
initGame();