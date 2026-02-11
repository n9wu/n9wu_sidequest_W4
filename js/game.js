"use strict";
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// Visual helpers
function drawBackground(t) {
  // sky gradient
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, "#9fdfff");
  g.addColorStop(1, "#cfeeff");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // simple parallax clouds
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 5; i++) {
    const x = ((t * 0.02 * (i + 1)) % (canvas.width + 200)) - 100 - i * 80;
    const y = 60 + i * 20;
    ctx.beginPath();
    ctx.ellipse(x, y, 60, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 40, y + 6, 48, 20, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// simple particle emitter for coin collection
class Particles {
  constructor() {
    this.p = [];
  }
  emit(x, y, color) {
    for (let i = 0; i < 12; i++) {
      this.p.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 1.5) * 200,
        life: 0.6,
        color,
      });
    }
  }
  update(dt) {
    for (let i = this.p.length - 1; i >= 0; i--) {
      const o = this.p[i];
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.vy += 800 * dt;
      o.life -= dt;
      if (o.life <= 0) this.p.splice(i, 1);
    }
  }
  draw(ctx) {
    for (const o of this.p) {
      ctx.globalAlpha = Math.max(0, o.life / 0.6);
      ctx.fillStyle = o.color;
      ctx.fillRect(o.x, o.y, 4, 4);
    }
    ctx.globalAlpha = 1;
  }
}
const particles = new Particles();

const keys = {};
window.addEventListener("keydown", (e) => (keys[e.code] = true));
window.addEventListener("keyup", (e) => (keys[e.code] = false));

function aabb(a, b) {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
}

// helper: rounded rectangle
function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === "undefined") r = 6;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

class Platform {
  constructor(x, y, w, h) {
    Object.assign(this, { x, y, w, h });
  }
  draw(ctx) {
    ctx.fillStyle = "#6b3";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Obstacle {
  constructor(x, y, w, h) {
    Object.assign(this, { x, y, w, h });
  }
  draw(ctx) {
    ctx.fillStyle = "#b33";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Collectible {
  constructor(x, y, r = 8) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.w = r * 2;
    this.h = r * 2;
    this.collected = false;
  }
  draw(ctx) {
    if (this.collected) return;
    // coin with shine
    const cx = this.x + this.r,
      cy = this.y + this.r;
    const grad = ctx.createRadialGradient(
      cx - 2,
      cy - 2,
      2,
      cx,
      cy,
      this.r * 1.6,
    );
    grad.addColorStop(0, "#fff89a");
    grad.addColorStop(0.4, "#ffde5a");
    grad.addColorStop(1, "#d79a00");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, this.r, 0, Math.PI * 2);
    ctx.fill();
    // small highlight
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(cx - 2, cy - 3, this.r * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

class MovingPlatform extends Platform {
  constructor(x, y, w, h, range = 100, speed = 60) {
    super(x, y, w, h);
    this.baseX = x;
    this.range = range;
    this.speed = speed;
    this.dir = 1;
  }
  update(dt) {
    this.x += this.dir * this.speed * dt;
    if (this.x > this.baseX + this.range) {
      this.x = this.baseX + this.range;
      this.dir = -1;
    } else if (this.x < this.baseX) {
      this.x = this.baseX;
      this.dir = 1;
    }
  }
  draw(ctx) {
    ctx.fillStyle = "#5a9";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Enemy {
  constructor(x, y, w = 20, h = 20, range = 80, speed = 50) {
    Object.assign(this, { x, y, w, h, baseX: x, range, speed, dir: 1 });
  }
  update(dt) {
    this.x += this.dir * this.speed * dt;
    if (this.x > this.baseX + this.range) {
      this.x = this.baseX + this.range;
      this.dir = -1;
    } else if (this.x < this.baseX) {
      this.x = this.baseX;
      this.dir = 1;
    }
  }
  draw(ctx) {
    ctx.fillStyle = "#900";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
}

class Player {
  constructor(x, y) {
    this.w = 20;
    this.h = 30;
    this.reset(x, y);
  }
  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpsLeft = 2; // allow double-jump
  }
  update(dt, level) {
    const speed = 160;
    if (keys["ArrowLeft"]) this.vx = -speed;
    else if (keys["ArrowRight"]) this.vx = speed;
    else this.vx = 0;
    if (keys["Space"] || keys["ArrowUp"]) {
      if (this.jumpsLeft > 0) {
        this.vy = -420;
        this.onGround = false;
        this.jumpsLeft -= 1;
      }
    }
    this.vy += 900 * dt;
    // horizontal move
    this.x += this.vx * dt;
    // keep inside canvas
    this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
    // vertical move
    this.y += this.vy * dt;
    this.onGround = false;
    // collision with platforms
    for (const p of level.platforms) {
      const future = { x: this.x, y: this.y, w: this.w, h: this.h };
      if (aabb(future, p)) {
        if (this.vy > 0 && this.y + this.h - this.vy * dt <= p.y) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
          this.jumpsLeft = 2;
        } else if (this.vy < 0 && this.y >= p.y + p.h) {
          this.y = p.y + p.h;
          this.vy = 0;
        } else if (this.vx !== 0) {
          // simple horizontal pushback
          if (this.vx > 0) this.x = p.x - this.w;
          else this.x = p.x + p.w;
        }
      }
    }
  }
  draw(ctx) {
    // rounded player with shadow
    ctx.fillStyle = "#0333cc";
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.w / 2,
      this.y + this.h / 2,
      this.w / 2,
      this.h / 2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(this.x + 4, this.y + this.h - 2, this.w, 4);
  }
}

class Level {
  constructor(data) {
    this.platforms = (data.platforms || []).map(
      (p) => new Platform(p.x, p.y, p.w, p.h),
    );
    // static obstacles
    this.obstacles = (data.obstacles || []).map(
      (o) => new Obstacle(o.x, o.y, o.w, o.h),
    );
    // moving platforms
    this.movingPlatforms = (data.movingPlatforms || []).map(
      (mp) => new MovingPlatform(mp.x, mp.y, mp.w, mp.h, mp.range, mp.speed),
    );
    // coins / collectibles
    this.coins = (data.coins || []).map((c) => new Collectible(c.x, c.y, c.r));
    // enemies
    this.enemies = (data.enemies || []).map(
      (e) =>
        new Enemy(e.x, e.y, e.w || 20, e.h || 20, e.range || 80, e.speed || 50),
    );
    this.playerStart = data.playerStart || { x: 20, y: 100 };
    this.goal = data.goal || { x: 720, y: 300, w: 40, h: 40 };
  }
  draw(ctx) {
    // draw platforms with subtle gradients
    for (const p of this.platforms) {
      ctx.fillStyle = "rgba(40,120,40,1)";
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(p.x, p.y, Math.min(80, p.w), 2);
    }
    for (const mp of this.movingPlatforms) mp.draw(ctx);
    for (const o of this.obstacles) {
      ctx.fillStyle = "#b33";
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
    for (const c of this.coins) c.draw(ctx);
    for (const e of this.enemies) e.draw(ctx);
    // draw goal
    // glowing goal
    const gx = this.goal.x + this.goal.w / 2,
      gy = this.goal.y + this.goal.h / 2;
    const gg = ctx.createRadialGradient(gx, gy, 4, gx, gy, 60);
    gg.addColorStop(0, "rgba(120,255,120,0.9)");
    gg.addColorStop(1, "rgba(120,255,120,0)");
    ctx.fillStyle = gg;
    ctx.fillRect(
      this.goal.x - 40,
      this.goal.y - 40,
      this.goal.w + 80,
      this.goal.h + 80,
    );
    ctx.fillStyle = "#2a2";
    roundRect(
      ctx,
      this.goal.x,
      this.goal.y,
      this.goal.w,
      this.goal.h,
      6,
      true,
      false,
    );
  }
}

class Game {
  constructor(levelDatas) {
    this.levels = levelDatas.map((d) => new Level(d));
    this.idx = 0;
    this.loadLevel(0);
    this.last = performance.now();
    this.win = false;
    this.score = 0;
    requestAnimationFrame(this.loop.bind(this));
  }
  loadLevel(i) {
    this.idx = i;
    this.level = this.levels[i];
    this.player = new Player(
      this.level.playerStart.x,
      this.level.playerStart.y,
    );
    this.win = false;
  }
  nextLevel() {
    // award points for completing a level
    this.score += 5;
    if (this.idx + 1 < this.levels.length) this.loadLevel(this.idx + 1);
    else this.win = true;
  }
  update(dt) {
    if (this.win) return;
    this.player.update(dt, this.level);
    // update moving platforms and enemies
    for (const mp of this.level.movingPlatforms) mp.update(dt);
    for (const e of this.level.enemies) e.update(dt);
    particles.update(dt);
    // obstacles (reset on hit -> -1 point)
    for (const o of this.level.obstacles) {
      if (aabb(this.player, o)) {
        this.player.reset(this.level.playerStart.x, this.level.playerStart.y);
        this.score -= 1;
        break;
      }
    }
    // enemies (reset on hit -> -1 point)
    for (const e of this.level.enemies) {
      if (aabb(this.player, e)) {
        this.player.reset(this.level.playerStart.x, this.level.playerStart.y);
        this.score -= 1;
        break;
      }
    }
    // falling off screen (reset -> -1 point)
    if (this.player.y > canvas.height) {
      this.player.reset(this.level.playerStart.x, this.level.playerStart.y);
      this.score -= 1;
    }
    // collectibles
    for (const c of this.level.coins) {
      if (
        !c.collected &&
        aabb(this.player, { x: c.x, y: c.y, w: c.w, h: c.h })
      ) {
        c.collected = true;
        this.score += 10;
        particles.emit(c.x + c.r, c.y + c.r, "#ffd54d");
      }
    }
    // goal
    const goalRect = {
      x: this.level.goal.x,
      y: this.level.goal.y,
      w: this.level.goal.w,
      h: this.level.goal.h,
    };
    if (aabb(this.player, goalRect)) this.nextLevel();
  }
  draw() {
    drawBackground(performance.now());
    this.level.draw(ctx);
    this.player.draw(ctx);
    particles.draw(ctx);
    // HUD
    // HUD box
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    roundRect(ctx, 8, 8, 140, 56, 8, true, false);
    ctx.fillStyle = "#08304a";
    ctx.font = "600 14px Inter, sans-serif";
    ctx.fillText("Level: " + (this.idx + 1), 18, 28);
    ctx.fillText("Score: " + this.score, 18, 48);
    // Instructions inside canvas (bottom center)
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(
      "Arrow keys to move · Space to jump · Double-jump enabled",
      canvas.width / 2,
      canvas.height - 12,
    );
    ctx.textAlign = "start";
    if (this.win) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.font = "28px sans-serif";
      ctx.fillText("You beat all levels!", 260, 200);
    }
  }
  loop(t) {
    const dt = Math.min(0.05, (t - this.last) / 1000);
    this.last = t;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop.bind(this));
  }
}

fetch("data/levels.json")
  .then((r) => r.json())
  .then((json) => {
    const game = new Game(json.levels);
  })
  .catch((err) => {
    ctx.fillStyle = "#000";
    ctx.fillText("Failed loading levels.json", 20, 20);
    console.error(err);
  });
