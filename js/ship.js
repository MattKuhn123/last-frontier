// --- Player Ship ---
import { canvas, ctx, wrap } from './utils.js';
import { keys } from './input.js';
import { config } from './debug.js';
import { shapes, strokeShape } from './shapes.js';

export let ship = null;
export let invincibleTimer = 0;

export function createShip() {
    ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: config.SHIP_SIZE,
        angle: -Math.PI / 2,
        dx: 0,
        dy: 0,
        thrusting: false
    };
    return ship;
}

export function resetShip() {
    ship.x = canvas.width / 2;
    ship.y = canvas.height / 2;
    ship.dx = 0;
    ship.dy = 0;
    ship.angle = -Math.PI / 2;
    ship.thrusting = false;
    invincibleTimer = config.INVINCIBLE_DURATION;
}

export function setInvincible(frames) {
    invincibleTimer = frames;
}

export function updateShip() {
    if (keys['ArrowLeft'] || keys['KeyA']) ship.angle -= config.TURN_SPEED;
    if (keys['ArrowRight'] || keys['KeyD']) ship.angle += config.TURN_SPEED;

    ship.thrusting = keys['ArrowUp'] || keys['KeyW'];
    if (ship.thrusting) {
        ship.dx += Math.cos(ship.angle) * config.THRUST_POWER;
        ship.dy += Math.sin(ship.angle) * config.THRUST_POWER;
    }

    ship.dx *= config.FRICTION;
    ship.dy *= config.FRICTION;
    ship.x += ship.dx;
    ship.y += ship.dy;
    wrap(ship);

    if (invincibleTimer > 0) invincibleTimer--;
}

export function drawShip() {
    if (!ship) return;
    const blinking = invincibleTimer > 0 && Math.floor(invincibleTimer / 6) % 2;
    if (blinking) return;

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle + Math.PI / 2);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    strokeShape(ctx, shapes.player, config.SHIP_SIZE);

    if (ship.thrusting && Math.random() > 0.3) {
        ctx.strokeStyle = '#f80';
        ctx.beginPath();
        ctx.moveTo(-config.SHIP_SIZE * 0.35, config.SHIP_SIZE * 0.6);
        ctx.lineTo(0, config.SHIP_SIZE * (0.9 + Math.random() * 0.6));
        ctx.lineTo(config.SHIP_SIZE * 0.35, config.SHIP_SIZE * 0.6);
        ctx.stroke();
    }

    ctx.restore();
}
