// --- Bullet System ---
import { ctx, wrap } from './utils.js';
import { keys } from './input.js';
import { ship } from './ship.js';
import { config } from './config.js';

export let bullets = [];
let shootCooldown = 0;

export function resetBullets() {
    bullets = [];
    shootCooldown = 0;
}

function shootBullet() {
    if (bullets.length >= config.MAX_BULLETS || shootCooldown > 0 || !ship) return;
    bullets.push({
        x: ship.x + Math.cos(ship.angle) * config.SHIP_SIZE,
        y: ship.y + Math.sin(ship.angle) * config.SHIP_SIZE,
        dx: Math.cos(ship.angle) * config.BULLET_SPEED + ship.dx,
        dy: Math.sin(ship.angle) * config.BULLET_SPEED + ship.dy,
        radius: 2,
        life: config.BULLET_LIFETIME,
        friendly: true
    });
    shootCooldown = 8;
}

export function updateBullets() {
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

export function drawBullets() {
    for (const b of bullets) {
        ctx.fillStyle = b.friendly ? '#fff' : '#f44';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Add a bullet from an arbitrary source (enemies, wingmen)
export function addBullet(x, y, angle, speed, friendly) {
    bullets.push({
        x, y,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        radius: 2,
        life: config.BULLET_LIFETIME,
        friendly
    });
}
