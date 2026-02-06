// --- Asteroid System ---
import { canvas, ctx, rand, wrap, dist } from './utils.js';
import { ship } from './ship.js';
import { spawnParticles } from './particles.js';
import { config } from './debug.js';

const ASTEROID_VERTICES = 10;

export let asteroids = [];

export function resetAsteroids() {
    asteroids = [];
}

export function createAsteroid(x, y, size) {
    const sizeRadius = { 3: 50, 2: 25, 1: 12 };
    const r = sizeRadius[size];
    const angle = rand(0, Math.PI * 2);
    const speed = config.ASTEROID_SPEED * (4 - size) * rand(0.5, 1.2);

    const offsets = [];
    for (let i = 0; i < ASTEROID_VERTICES; i++) {
        offsets.push(1 + rand(-config.ASTEROID_JAGGEDNESS, config.ASTEROID_JAGGEDNESS));
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

export function spawnAsteroids(count, sizes) {
    const allowedSizes = sizes || [3];
    for (let i = 0; i < count; i++) {
        let x, y;
        do {
            x = rand(0, canvas.width);
            y = rand(0, canvas.height);
        } while (ship && dist({ x, y }, ship) < 150);
        const size = allowedSizes[Math.floor(rand(0, allowedSizes.length))];
        asteroids.push(createAsteroid(x, y, size));
    }
}

export function splitAsteroid(index) {
    const asteroid = asteroids[index];
    const points = { 3: 20, 2: 50, 1: 100 };
    const earned = points[asteroid.size];

    spawnParticles(asteroid.x, asteroid.y, 6);

    if (asteroid.size > 1) {
        asteroids.push(createAsteroid(asteroid.x, asteroid.y, asteroid.size - 1));
        asteroids.push(createAsteroid(asteroid.x, asteroid.y, asteroid.size - 1));
    }
    asteroids.splice(index, 1);
    return earned;
}

export function updateAsteroids() {
    for (const a of asteroids) {
        a.x += a.dx;
        a.y += a.dy;
        a.rotAngle += a.rotSpeed;
        wrap(a);
    }
}

export function drawAsteroids() {
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
