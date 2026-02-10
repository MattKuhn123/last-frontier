// --- Syndicate Enemy Ships ---
import { canvas, ctx, rand, wrap, dist, angleTo, normalizeAngle, strokeShape } from './utils.js';
import { ship } from './ship.js';
import { addBullet } from './bullets.js';
import { spawnParticles } from './particles.js';

// Enemy type definitions — loaded from data/enemies.json
export const enemyTypes = {};
const res = await fetch('data/enemies.json');
Object.assign(enemyTypes, await res.json());

export let enemies = [];

export function resetEnemies() {
    enemies = [];
}

export function spawnEnemy(type) {
    // Spawn at a random screen edge
    const side = Math.floor(rand(0, 4));
    let x, y;
    switch (side) {
        case 0: x = rand(0, canvas.width); y = -20; break;
        case 1: x = canvas.width + 20; y = rand(0, canvas.height); break;
        case 2: x = rand(0, canvas.width); y = canvas.height + 20; break;
        case 3: x = -20; y = rand(0, canvas.height); break;
    }

    const def = enemyTypes[type] || enemyTypes.normal;
    enemies.push({
        x, y,
        radius: enemyTypes.size,
        angle: ship ? angleTo({ x, y }, ship) : rand(0, Math.PI * 2),
        dx: 0,
        dy: 0,
        fireCooldown: rand(30, enemyTypes.fireInterval),
        color: def.color
    });
}

export function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!ship) continue;

        // Rotate toward player
        const targetAngle = angleTo(e, ship);
        const diff = normalizeAngle(targetAngle - e.angle);
        if (Math.abs(diff) > enemyTypes.turnSpeed) {
            e.angle += diff > 0 ? enemyTypes.turnSpeed : -enemyTypes.turnSpeed;
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
        if (speed > enemyTypes.speed) {
            e.dx = (e.dx / speed) * enemyTypes.speed;
            e.dy = (e.dy / speed) * enemyTypes.speed;
        }

        e.x += e.dx;
        e.y += e.dy;
        wrap(e);

        // Fire at player
        e.fireCooldown--;
        if (e.fireCooldown <= 0) {
            addBullet(
                e.x + Math.cos(e.angle) * enemyTypes.size,
                e.y + Math.sin(e.angle) * enemyTypes.size,
                e.angle, enemyTypes.bulletSpeed, false
            );
            e.fireCooldown = enemyTypes.fireInterval + rand(-20, 20);
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
        strokeShape(ctx, enemyTypes.shape, enemyTypes.size);

        ctx.restore();
    }
}
