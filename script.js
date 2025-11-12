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

startNewRun(seed);
nextLevel();
applyUpgrade(upgradeType);
saveMetaProgress();
loadMetaProgress();

function initGame() {

}

function update() {

}

function draw(ctx) {
    ctx.fillStyle = '#9db9e8';
    ctx.fillRect(this.x, this.y, this.w, this.h);
}

function loop() {

}

requestAnimationFrame(loop);