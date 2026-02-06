const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// --- Constants ---
const SHIP_SIZE = 15;
const TURN_SPEED = 0.07;
const THRUST_POWER = 0.1;
const FRICTION = 0.99;
const BULLET_SPEED = 7;
const BULLET_LIFETIME = 60;
const MAX_BULLETS = 8;
const ASTEROID_SPEED = 1.5;
const ASTEROID_VERTICES = 10;
const ASTEROID_JAGGEDNESS = 0.4;
const INVINCIBLE_DURATION = 180; // frames (~3 sec at 60fps)
const STARTING_LIVES = 3;
const STARTING_LEVEL = 1;
const ASTEROIDS_PER_LEVEL = 4;

// --- Game State ---
let ship, asteroids, bullets, particles;
let score, lives, level, gameOver, paused;
let invincibleTimer;
let keys = {};

// --- Input ---
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'KeyP') paused = !paused;
    if (e.code === 'Enter' && gameOver) initGame();
});
document.addEventListener('keyup', e => { keys[e.code] = false; });

// --- Helpers ---
function rand(min, max) { return Math.random() * (max - min) + min; }

function wrap(obj) {
    if (obj.x < -obj.radius) obj.x = canvas.width + obj.radius;
    if (obj.x > canvas.width + obj.radius) obj.x = -obj.radius;
    if (obj.y < -obj.radius) obj.y = canvas.height + obj.radius;
    if (obj.y > canvas.height + obj.radius) obj.y = -obj.radius;
}

function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

// --- Ship ---
function createShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: SHIP_SIZE,
        angle: -Math.PI / 2,
        dx: 0,
        dy: 0,
        thrusting: false
    };
}

function drawShip() {
    const s = ship;
    const blinking = invincibleTimer > 0 && Math.floor(invincibleTimer / 6) % 2;
    if (blinking) return;

    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle + Math.PI / 2);

    // Ship body
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -SHIP_SIZE);
    ctx.lineTo(-SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
    ctx.lineTo(0, SHIP_SIZE * 0.4);
    ctx.lineTo(SHIP_SIZE * 0.7, SHIP_SIZE * 0.7);
    ctx.closePath();
    ctx.stroke();

    // Thrust flame
    if (s.thrusting && Math.random() > 0.3) {
        ctx.strokeStyle = '#f80';
        ctx.beginPath();
        ctx.moveTo(-SHIP_SIZE * 0.35, SHIP_SIZE * 0.6);
        ctx.lineTo(0, SHIP_SIZE * (0.9 + Math.random() * 0.6));
        ctx.lineTo(SHIP_SIZE * 0.35, SHIP_SIZE * 0.6);
        ctx.stroke();
    }

    ctx.restore();
}

function updateShip() {
    if (keys['ArrowLeft'] || keys['KeyA']) ship.angle -= TURN_SPEED;
    if (keys['ArrowRight'] || keys['KeyD']) ship.angle += TURN_SPEED;

    ship.thrusting = keys['ArrowUp'] || keys['KeyW'];
    if (ship.thrusting) {
        ship.dx += Math.cos(ship.angle) * THRUST_POWER;
        ship.dy += Math.sin(ship.angle) * THRUST_POWER;
    }

    ship.dx *= FRICTION;
    ship.dy *= FRICTION;
    ship.x += ship.dx;
    ship.y += ship.dy;
    wrap(ship);

    if (invincibleTimer > 0) invincibleTimer--;
}

// --- Bullets ---
let shootCooldown = 0;

function shootBullet() {
    if (bullets.length >= MAX_BULLETS || shootCooldown > 0) return;
    bullets.push({
        x: ship.x + Math.cos(ship.angle) * SHIP_SIZE,
        y: ship.y + Math.sin(ship.angle) * SHIP_SIZE,
        dx: Math.cos(ship.angle) * BULLET_SPEED + ship.dx,
        dy: Math.sin(ship.angle) * BULLET_SPEED + ship.dy,
        radius: 2,
        life: BULLET_LIFETIME
    });
    shootCooldown = 8;
}

function drawBullets() {
    ctx.fillStyle = '#fff';
    for (const b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateBullets() {
    if (keys['Space']) shootBullet();
    if (shootCooldown > 0) shootCooldown--;

    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.dx;
        b.y += b.dy;
        b.life--;
        wrap(b);
        if (b.life <= 0) bullets.splice(i, 1);
    }
}

// --- Asteroids ---
function createAsteroid(x, y, size) {
    const sizeRadius = { 3: 50, 2: 25, 1: 12 };
    const r = sizeRadius[size];
    const angle = rand(0, Math.PI * 2);
    const speed = ASTEROID_SPEED * (4 - size) * rand(0.5, 1.2);

    // Generate jagged shape
    const offsets = [];
    for (let i = 0; i < ASTEROID_VERTICES; i++) {
        offsets.push(1 + rand(-ASTEROID_JAGGEDNESS, ASTEROID_JAGGEDNESS));
    }

    return {
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        radius: r,
        size,
        offsets,
        rotAngle: 0,
        rotSpeed: rand(-0.02, 0.02)
    };
}

function spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
        let x, y;
        // Spawn away from ship
        do {
            x = rand(0, canvas.width);
            y = rand(0, canvas.height);
        } while (dist({ x, y }, ship) < 150);
        asteroids.push(createAsteroid(x, y, 3));
    }
}

function drawAsteroids() {
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5;
    for (const a of asteroids) {
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotAngle);
        ctx.beginPath();
        for (let i = 0; i < ASTEROID_VERTICES; i++) {
            const angle = (i / ASTEROID_VERTICES) * Math.PI * 2;
            const r = a.radius * a.offsets[i];
            if (i === 0) ctx.moveTo(r * Math.cos(angle), r * Math.sin(angle));
            else ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }
}

function updateAsteroids() {
    for (const a of asteroids) {
        a.x += a.dx;
        a.y += a.dy;
        a.rotAngle += a.rotSpeed;
        wrap(a);
    }
}

function splitAsteroid(asteroid, index) {
    const points = { 3: 20, 2: 50, 1: 100 };
    score += points[asteroid.size];

    spawnParticles(asteroid.x, asteroid.y, 6);

    if (asteroid.size > 1) {
        asteroids.push(createAsteroid(asteroid.x, asteroid.y, asteroid.size - 1));
        asteroids.push(createAsteroid(asteroid.x, asteroid.y, asteroid.size - 1));
    }
    asteroids.splice(index, 1);
}

// --- Particles (debris effect) ---
function spawnParticles(x, y, count) {
    for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(1, 3);
        particles.push({
            x, y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: rand(15, 30)
        });
    }
}

function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / 30;
        ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

// --- Collisions ---
function checkCollisions() {
    // Bullets vs asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (dist(asteroids[i], bullets[j]) < asteroids[i].radius) {
                bullets.splice(j, 1);
                splitAsteroid(asteroids[i], i);
                break;
            }
        }
    }

    // Ship vs asteroids
    if (invincibleTimer <= 0) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            if (dist(asteroids[i], ship) < asteroids[i].radius + ship.radius * 0.6) {
                lives--;
                spawnParticles(ship.x, ship.y, 15);
                if (lives <= 0) {
                    gameOver = true;
                } else {
                    ship = createShip();
                    invincibleTimer = INVINCIBLE_DURATION;
                }
                break;
            }
        }
    }

    // Next level
    if (asteroids.length === 0) {
        level++;
        spawnAsteroids(ASTEROIDS_PER_LEVEL + level - 1);
    }
}

// --- HUD ---
function drawHUD() {
    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(score.toString().padStart(6, '0'), 20, 35);

    // Lives (small ship icons)
    for (let i = 0; i < lives; i++) {
        ctx.save();
        ctx.translate(30 + i * 25, 60);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-7, 7);
        ctx.lineTo(0, 3);
        ctx.lineTo(7, 7);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    // Level
    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`LEVEL ${level}`, canvas.width - 20, 35);

    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '18px monospace';
        ctx.fillText('Press ENTER to restart', canvas.width / 2, canvas.height / 2 + 20);
    }

    if (paused && !gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '30px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

// --- Game Init & Loop ---
function initGame() {
    ship = createShip();
    asteroids = [];
    bullets = [];
    particles = [];
    score = 0;
    lives = STARTING_LIVES;
    level = STARTING_LEVEL;
    gameOver = false;
    paused = false;
    invincibleTimer = INVINCIBLE_DURATION;
    shootCooldown = 0;
    spawnAsteroids(ASTEROIDS_PER_LEVEL);
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    if (paused || gameOver) {
        drawHUD();
        return;
    }

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update
    updateShip();
    updateBullets();
    updateAsteroids();
    updateParticles();
    checkCollisions();

    // Draw
    drawAsteroids();
    drawShip();
    drawBullets();
    drawParticles();
    drawHUD();
}

initGame();
gameLoop();
