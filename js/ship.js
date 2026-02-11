// --- Player Ship ---
import { canvas, ctx, wrap, strokeShape } from './utils.js';
import { keys } from './input.js';
import { shipDefs } from './data.js';

export let ship = null;
export let invincibleTimer = 0;

export function createShip() {
    ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: shipDefs.size,
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
    invincibleTimer = shipDefs.invincibleDuration;
}

export function setInvincible(frames) {
    invincibleTimer = frames;
}

export function updateShip() {
    if (keys['ArrowLeft'] || keys['KeyA']) ship.angle -= shipDefs.turnSpeed;
    if (keys['ArrowRight'] || keys['KeyD']) ship.angle += shipDefs.turnSpeed;

    ship.thrusting = keys['ArrowUp'] || keys['KeyW'];
    if (ship.thrusting) {
        ship.dx += Math.cos(ship.angle) * shipDefs.thrustPower;
        ship.dy += Math.sin(ship.angle) * shipDefs.thrustPower;
    }

    ship.dx *= shipDefs.friction;
    ship.dy *= shipDefs.friction;
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
    strokeShape(ctx, shipDefs.shape, shipDefs.size);

    if (ship.thrusting && Math.random() > 0.3) {
        ctx.strokeStyle = '#f80';
        ctx.beginPath();
        ctx.moveTo(-shipDefs.size * 0.35, shipDefs.size * 0.6);
        ctx.lineTo(0, shipDefs.size * (0.9 + Math.random() * 0.6));
        ctx.lineTo(shipDefs.size * 0.35, shipDefs.size * 0.6);
        ctx.stroke();
    }

    ctx.restore();
}
