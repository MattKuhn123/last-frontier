// --- Boss Fight ---
import { canvas, ctx, rand, dist, angleTo, normalizeAngle, strokeShape } from './utils.js';
import { ship } from './ship.js';
import { addBullet } from './bullets.js';
import { spawnEnemy } from './enemies.js';
import { spawnParticles } from './particles.js';

export const bossDefs = {};
Object.assign(bossDefs, await fetch('data/boss.json').then(r => r.json()));

export let boss = null;

export function resetBoss() {
    boss = null;
}

export function spawnBoss() {
    boss = {
        x: canvas.width / 2,
        y: bossDefs.entry.spawnY,
        radius: bossDefs.size,
        angle: Math.PI / 2,
        dx: 0,
        dy: bossDefs.entry.velocity,
        hp: bossDefs.maxHp,
        maxHp: bossDefs.maxHp,
        phase: 'enter', // enter, fight, defeated
        fireCooldown: bossDefs.attacks.singleShot.initialCooldown,
        spreadCooldown: bossDefs.attacks.spread.initialCooldown,
        summonCooldown: bossDefs.attacks.summon.initialCooldown,
        flashTimer: 0
    };
    updateBossHealthBar();
}

export function damageBoss() {
    if (!boss || boss.phase !== 'fight') return false;
    boss.hp--;
    boss.flashTimer = bossDefs.flashDuration;
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
        if (boss.y >= bossDefs.entry.targetY) {
            boss.phase = 'fight';
            boss.dy = 0;
        }
        return;
    }

    if (boss.phase === 'defeated') return;

    if (boss.flashTimer > 0) boss.flashTimer--;

    if (!ship) return;

    // Move toward a position above/around the player
    const targetX = ship.x + Math.sin(Date.now() * bossDefs.movement.sineFrequency) * bossDefs.movement.sineAmplitude;
    const targetY = Math.min(ship.y - 150, canvas.height * 0.4);
    const toTarget = angleTo(boss, { x: targetX, y: targetY });

    boss.dx += Math.cos(toTarget) * bossDefs.movement.acceleration;
    boss.dy += Math.sin(toTarget) * bossDefs.movement.acceleration;

    const speed = Math.hypot(boss.dx, boss.dy);
    if (speed > bossDefs.speed) {
        boss.dx = (boss.dx / speed) * bossDefs.speed;
        boss.dy = (boss.dy / speed) * bossDefs.speed;
    }

    boss.x += boss.dx;
    boss.y += boss.dy;
    boss.x = Math.max(bossDefs.size, Math.min(canvas.width - bossDefs.size, boss.x));
    boss.y = Math.max(bossDefs.size, Math.min(canvas.height - bossDefs.size, boss.y));

    // Face the player
    boss.angle = angleTo(boss, ship);

    // Single shots
    boss.fireCooldown--;
    if (boss.fireCooldown <= 0) {
        addBullet(
            boss.x + Math.cos(boss.angle) * bossDefs.size,
            boss.y + Math.sin(boss.angle) * bossDefs.size,
            boss.angle, bossDefs.attacks.singleShot.speed, false
        );
        boss.fireCooldown = bossDefs.attacks.singleShot.cooldown + rand(-bossDefs.attacks.singleShot.cooldownVariance, bossDefs.attacks.singleShot.cooldownVariance);
    }

    // Spread shots
    boss.spreadCooldown--;
    if (boss.spreadCooldown <= 0) {
        for (let i = -bossDefs.attacks.spread.count; i <= bossDefs.attacks.spread.count; i++) {
            addBullet(
                boss.x + Math.cos(boss.angle) * bossDefs.size,
                boss.y + Math.sin(boss.angle) * bossDefs.size,
                boss.angle + i * bossDefs.attacks.spread.angleSpacing, bossDefs.attacks.spread.speed, false
            );
        }
        boss.spreadCooldown = bossDefs.attacks.spread.cooldown + rand(-bossDefs.attacks.spread.cooldownVariance, bossDefs.attacks.spread.cooldownVariance);
    }

    // Summon fighters
    boss.summonCooldown--;
    if (boss.summonCooldown <= 0) {
        spawnEnemy();
        if (boss.hp < boss.maxHp / 2) spawnEnemy(); // extra when low
        boss.summonCooldown = bossDefs.attacks.summon.cooldown + rand(-bossDefs.attacks.summon.cooldownVariance, bossDefs.attacks.summon.cooldownVariance);
    }
}

export function drawBoss() {
    if (!boss) return;

    ctx.save();
    ctx.translate(boss.x, boss.y);
    ctx.rotate(boss.angle + Math.PI / 2);

    // Flash white when hit
    ctx.strokeStyle = boss.flashTimer > 0 ? bossDefs.colors.flash : bossDefs.colors.normal;
    ctx.lineWidth = bossDefs.lineWidth;

    // Large menacing ship shape
    strokeShape(ctx, bossDefs.shape, bossDefs.size);

    // Center detail
    ctx.strokeStyle = boss.flashTimer > 0 ? bossDefs.colors.detailFlash : bossDefs.colors.detailNormal;
    ctx.lineWidth = bossDefs.detailLineWidth;
    ctx.beginPath();
    ctx.arc(0, 0, bossDefs.size * bossDefs.detailRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}
