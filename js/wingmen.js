// --- Wingman Power-ups ---
import { canvas, ctx, rand, wrap, dist, angleTo, normalizeAngle, strokeShape } from './utils.js';
import { ship } from './ship.js';
import { enemies } from './enemies.js';
import { asteroids } from './asteroids.js';
import { addBullet } from './bullets.js';
const PICKUP_RADIUS = 15;
const PICKUP_PULSE_SPEED = 0.05;

// Wingman definitions — loaded from data/wingmen.json
export const wingmanTypes = {};
const res = await fetch('data/wingmen.json');
Object.assign(wingmanTypes, await res.json());

export let pickup = null;
export let activeWingman = null;

export function resetWingmen() {
    pickup = null;
    activeWingman = null;
}

export function spawnWingmanPickup(type) {
    let x, y;
    do {
        x = rand(80, canvas.width - 80);
        y = rand(80, canvas.height - 80);
    } while (ship && dist({ x, y }, ship) < 120);

    pickup = {
        x, y,
        radius: PICKUP_RADIUS,
        type: type || 'sierra',
        pulse: 0
    };
}

export function collectPickup() {
    if (!pickup) return null;
    const type = pickup.type;
    pickup = null;
    activateWingman(type);
    return type;
}

function activateWingman(type) {
    const def = wingmanTypes[type];
    // Enter from a random edge
    const side = Math.floor(rand(0, 4));
    let x, y;
    switch (side) {
        case 0: x = rand(0, canvas.width); y = -30; break;
        case 1: x = canvas.width + 30; y = rand(0, canvas.height); break;
        case 2: x = rand(0, canvas.width); y = canvas.height + 30; break;
        case 3: x = -30; y = rand(0, canvas.height); break;
    }

    activeWingman = {
        x, y,
        radius: 12,
        angle: 0,
        dx: 0, dy: 0,
        timer: def.duration,
        fireCooldown: 0,
        ...def
    };
}

export function updateWingmen() {
    // Update pickup pulse
    if (pickup) {
        pickup.pulse += PICKUP_PULSE_SPEED;
    }

    if (!activeWingman) return;

    activeWingman.timer--;
    if (activeWingman.timer <= 0) {
        activeWingman = null;
        return;
    }

    // Find target
    let target = null;
    let minDist = Infinity;

    if (activeWingman.targetPriority === 'enemies' && enemies.length > 0) {
        // Prefer enemies
        for (const e of enemies) {
            const d = dist(activeWingman, e);
            if (d < minDist) { minDist = d; target = e; }
        }
    }

    if (!target) {
        // Target nearest anything
        for (const e of enemies) {
            const d = dist(activeWingman, e);
            if (d < minDist) { minDist = d; target = e; }
        }
        for (const a of asteroids) {
            const d = dist(activeWingman, a);
            if (d < minDist) { minDist = d; target = a; }
        }
    }

    if (target) {
        const targetAngle = angleTo(activeWingman, target);
        const diff = normalizeAngle(targetAngle - activeWingman.angle);
        activeWingman.angle += diff > 0
            ? Math.min(diff, 0.08)
            : Math.max(diff, -0.08);

        // Move toward a flanking position
        const d = dist(activeWingman, target);
        if (d > 100) {
            activeWingman.dx += Math.cos(activeWingman.angle) * 0.1;
            activeWingman.dy += Math.sin(activeWingman.angle) * 0.1;
        }

        // Fire
        activeWingman.fireCooldown--;
        if (activeWingman.fireCooldown <= 0 && d < 400) {
            addBullet(
                activeWingman.x + Math.cos(activeWingman.angle) * 14,
                activeWingman.y + Math.sin(activeWingman.angle) * 14,
                activeWingman.angle, 6, true, activeWingman.color
            );
            activeWingman.fireCooldown = activeWingman.fireRate;
        }
    } else {
        // Orbit near the player
        if (ship) {
            const toPlayer = angleTo(activeWingman, ship);
            const d = dist(activeWingman, ship);
            if (d > 150) {
                activeWingman.dx += Math.cos(toPlayer) * 0.05;
                activeWingman.dy += Math.sin(toPlayer) * 0.05;
            }
            activeWingman.angle = toPlayer;
        }
    }

    // Clamp speed
    const speed = Math.hypot(activeWingman.dx, activeWingman.dy);
    if (speed > activeWingman.speed) {
        activeWingman.dx = (activeWingman.dx / speed) * activeWingman.speed;
        activeWingman.dy = (activeWingman.dy / speed) * activeWingman.speed;
    }
    activeWingman.dx *= 0.98;
    activeWingman.dy *= 0.98;

    activeWingman.x += activeWingman.dx;
    activeWingman.y += activeWingman.dy;
    wrap(activeWingman);
}

export function drawWingmen() {
    // Draw pickup
    if (pickup) {
        const glow = 0.5 + 0.5 * Math.sin(pickup.pulse);
        const def = wingmanTypes[pickup.type];
        ctx.save();
        ctx.translate(pickup.x, pickup.y);

        // Glow ring
        ctx.strokeStyle = def.color;
        ctx.globalAlpha = 0.3 + glow * 0.4;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, PICKUP_RADIUS + glow * 5, 0, Math.PI * 2);
        ctx.stroke();

        // Inner icon (small ship)
        ctx.globalAlpha = 0.8 + glow * 0.2;
        ctx.strokeStyle = def.color;
        ctx.lineWidth = 1.5;
        strokeShape(ctx, def.shape, 8);

        ctx.restore();
    }

    // Draw active wingman
    if (activeWingman) {
        const w = activeWingman;
        ctx.save();
        ctx.translate(w.x, w.y);
        ctx.rotate(w.angle + Math.PI / 2);

        // Ship shape
        ctx.strokeStyle = w.color;
        ctx.lineWidth = 1.5;
        strokeShape(ctx, w.shape, 12);

        // Timer indicator (fading glow)
        if (w.timer < 180) {
            ctx.globalAlpha = 0.3 + 0.3 * Math.sin(w.timer * 0.2);
            ctx.strokeStyle = w.color;
            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2 * (w.timer / w.duration));
            ctx.stroke();
        }

        ctx.restore();
    }
}
