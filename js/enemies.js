// --- Syndicate Enemy Ships ---
import { canvas, ctx, rand, wrap, dist, angleTo, normalizeAngle } from './utils.js';
import { ship } from './ship.js';
import { addBullet } from './bullets.js';
import { spawnParticles } from './particles.js';
import { config } from './debug.js';
import { shapes, strokeShape } from './shapes.js';

export let enemies = [];

export function resetEnemies() {
    enemies = [];
}

export function spawnEnemy() {
    // Spawn at a random screen edge
    const side = Math.floor(rand(0, 4));
    let x, y;
    switch (side) {
        case 0: x = rand(0, canvas.width); y = -20; break;
        case 1: x = canvas.width + 20; y = rand(0, canvas.height); break;
        case 2: x = rand(0, canvas.width); y = canvas.height + 20; break;
        case 3: x = -20; y = rand(0, canvas.height); break;
    }

    enemies.push({
        x, y,
        radius: config.ENEMY_SIZE,
        angle: ship ? angleTo({ x, y }, ship) : rand(0, Math.PI * 2),
        dx: 0,
        dy: 0,
        fireCooldown: rand(30, config.ENEMY_FIRE_INTERVAL),
        color: '#f44'
    });
}

export function spawnCorruptEnemy() {
    spawnEnemy();
    const e = enemies[enemies.length - 1];
    e.color = '#88f'; // blue for corrupt law enforcement
}

export function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!ship) continue;

        // Rotate toward player
        const targetAngle = angleTo(e, ship);
        const diff = normalizeAngle(targetAngle - e.angle);
        if (Math.abs(diff) > config.ENEMY_TURN_SPEED) {
            e.angle += diff > 0 ? config.ENEMY_TURN_SPEED : -config.ENEMY_TURN_SPEED;
        } else {
            e.angle = targetAngle;
        }

        // Thrust toward player if not too close
        const d = dist(e, ship);
        if (d > 120) {
            e.dx += Math.cos(e.angle) * 0.06;
            e.dy += Math.sin(e.angle) * 0.06;
        } else if (d < 80) {
            e.dx -= Math.cos(e.angle) * 0.03;
            e.dy -= Math.sin(e.angle) * 0.03;
        }

        // Clamp speed
        const speed = Math.hypot(e.dx, e.dy);
        if (speed > config.ENEMY_SPEED) {
            e.dx = (e.dx / speed) * config.ENEMY_SPEED;
            e.dy = (e.dy / speed) * config.ENEMY_SPEED;
        }

        e.x += e.dx;
        e.y += e.dy;
        wrap(e);

        // Fire at player
        e.fireCooldown--;
        if (e.fireCooldown <= 0) {
            addBullet(
                e.x + Math.cos(e.angle) * config.ENEMY_SIZE,
                e.y + Math.sin(e.angle) * config.ENEMY_SIZE,
                e.angle, config.ENEMY_BULLET_SPEED, false
            );
            e.fireCooldown = config.ENEMY_FIRE_INTERVAL + rand(-20, 20);
        }
    }
}

export function destroyEnemy(index) {
    const e = enemies[index];
    spawnParticles(e.x, e.y, 10, 'rgba(255, 80, 80, 1)');
    enemies.splice(index, 1);
    return 200;
}

export function drawEnemies() {
    for (const e of enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.rotate(e.angle + Math.PI / 2);

        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1.5;
        strokeShape(ctx, shapes.enemy, config.ENEMY_SIZE);

        ctx.restore();
    }
}
