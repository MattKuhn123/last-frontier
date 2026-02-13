// --- Particle / Debris Effects ---
import { ctx, rand } from '../utils.js';

export let particles = [];

export function resetParticles() {
    particles = [];
}

export function spawnParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2);
        const speed = rand(1, 3);
        particles.push({
            x, y,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            life: rand(15, 30),
            color: color || 'rgba(255, 200, 50, 1)'
        });
    }
}

export function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

export function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / 30;
        if (p.color && p.color.startsWith('rgba')) {
            // Replace alpha in rgba string
            ctx.fillStyle = p.color.replace(/[\d.]+\)$/, alpha + ')');
        } else {
            ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
        }
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
}
