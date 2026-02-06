// --- Boss Fight ---
import { canvas, ctx, rand, dist, angleTo, normalizeAngle } from './utils.js';
import { ship } from './ship.js';
import { addBullet } from './bullets.js';
import { spawnEnemy } from './enemies.js';
import { spawnParticles } from './particles.js';
import { config } from './debug.js';

export let boss = null;

export function resetBoss() {
    boss = null;
}

export function spawnBoss() {
    boss = {
        x: canvas.width / 2,
        y: -50,
        radius: config.BOSS_SIZE,
        angle: Math.PI / 2,
        dx: 0,
        dy: 0.5,
        hp: config.BOSS_MAX_HP,
        maxHp: config.BOSS_MAX_HP,
        phase: 'enter', // enter, fight, defeated
        fireCooldown: 60,
        spreadCooldown: 180,
        summonCooldown: 300,
        flashTimer: 0
    };
    updateBossHealthBar();
}

export function damageBoss() {
    if (!boss || boss.phase !== 'fight') return false;
    boss.hp--;
    boss.flashTimer = 8;
    updateBossHealthBar();
    spawnParticles(boss.x + rand(-20, 20), boss.y + rand(-20, 20), 3, 'rgba(255, 80, 80, 1)');

    if (boss.hp <= 0) {
        boss.phase = 'defeated';
        return true; // signals choice time
    }
    return false;
}

function updateBossHealthBar() {
    const bar = document.getElementById('boss-health-bar');
    const fill = document.getElementById('boss-health-fill');
    if (!boss) {
        if (bar) bar.classList.add('hidden');
        return;
    }
    if (bar) bar.classList.remove('hidden');
    if (fill) fill.style.width = ((boss.hp / boss.maxHp) * 100) + '%';
}

export function hideBossHealthBar() {
    const bar = document.getElementById('boss-health-bar');
    if (bar) bar.classList.add('hidden');
}

export function updateBoss() {
    if (!boss) return;

    if (boss.phase === 'enter') {
        boss.y += boss.dy;
        if (boss.y >= 100) {
            boss.phase = 'fight';
            boss.dy = 0;
        }
        return;
    }

    if (boss.phase === 'defeated') return;

    if (boss.flashTimer > 0) boss.flashTimer--;

    if (!ship) return;

    // Move toward a position above/around the player
    const targetX = ship.x + Math.sin(Date.now() * 0.001) * 200;
    const targetY = Math.min(ship.y - 150, canvas.height * 0.4);
    const toTarget = angleTo(boss, { x: targetX, y: targetY });

    boss.dx += Math.cos(toTarget) * 0.03;
    boss.dy += Math.sin(toTarget) * 0.03;

    const speed = Math.hypot(boss.dx, boss.dy);
    if (speed > config.BOSS_SPEED) {
        boss.dx = (boss.dx / speed) * config.BOSS_SPEED;
        boss.dy = (boss.dy / speed) * config.BOSS_SPEED;
    }

    boss.x += boss.dx;
    boss.y += boss.dy;
    boss.x = Math.max(config.BOSS_SIZE, Math.min(canvas.width - config.BOSS_SIZE, boss.x));
    boss.y = Math.max(config.BOSS_SIZE, Math.min(canvas.height - config.BOSS_SIZE, boss.y));

    // Face the player
    boss.angle = angleTo(boss, ship);

    // Single shots
    boss.fireCooldown--;
    if (boss.fireCooldown <= 0) {
        addBullet(
            boss.x + Math.cos(boss.angle) * config.BOSS_SIZE,
            boss.y + Math.sin(boss.angle) * config.BOSS_SIZE,
            boss.angle, 4, false
        );
        boss.fireCooldown = 40 + rand(-10, 10);
    }

    // Spread shots
    boss.spreadCooldown--;
    if (boss.spreadCooldown <= 0) {
        for (let i = -2; i <= 2; i++) {
            addBullet(
                boss.x + Math.cos(boss.angle) * config.BOSS_SIZE,
                boss.y + Math.sin(boss.angle) * config.BOSS_SIZE,
                boss.angle + i * 0.25, 3.5, false
            );
        }
        boss.spreadCooldown = 150 + rand(-30, 30);
    }

    // Summon fighters
    boss.summonCooldown--;
    if (boss.summonCooldown <= 0) {
        spawnEnemy();
        if (boss.hp < boss.maxHp / 2) spawnEnemy(); // extra when low
        boss.summonCooldown = 360 + rand(-60, 60);
    }
}

export function drawBoss() {
    if (!boss) return;

    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(boss.angle + Math.PI / 2);

    // Flash white when hit
    ctx.strokeStyle = boss.flashTimer > 0 ? '#fff' : '#f44';
    ctx.lineWidth = 2;

    // Large menacing ship shape
    ctx.beginPath();
    ctx.moveTo(0, -config.BOSS_SIZE);
    ctx.lineTo(-config.BOSS_SIZE * 0.6, -config.BOSS_SIZE * 0.3);
    ctx.lineTo(-config.BOSS_SIZE, config.BOSS_SIZE * 0.4);
    ctx.lineTo(-config.BOSS_SIZE * 0.5, config.BOSS_SIZE * 0.8);
    ctx.lineTo(0, config.BOSS_SIZE * 0.5);
    ctx.lineTo(config.BOSS_SIZE * 0.5, config.BOSS_SIZE * 0.8);
    ctx.lineTo(config.BOSS_SIZE, config.BOSS_SIZE * 0.4);
    ctx.lineTo(config.BOSS_SIZE * 0.6, -config.BOSS_SIZE * 0.3);
    ctx.closePath();
    ctx.stroke();

    // Center detail
    ctx.strokeStyle = boss.flashTimer > 0 ? '#faa' : '#a22';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, config.BOSS_SIZE * 0.3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}
