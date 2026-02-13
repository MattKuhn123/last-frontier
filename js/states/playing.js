// --- Playing State ---
import { canvas, ctx } from '../utils.js';
import { State, game, shake, triggerScreenShake, triggerHitFlash } from '../game.js';
import { ship, createShip, resetShip, updateShip, drawShip, setInvincible } from '../gameObjects/ship.js';
import { shipDefs, missions } from '../repository.js';
import { infiniteLives } from '../debug.js';
import { resetBullets, updateBullets, drawBullets } from '../gameObjects/bullets.js';
import { asteroids, resetAsteroids, spawnAsteroids, updateAsteroids, drawAsteroids } from '../gameObjects/asteroids.js';
import { resetParticles, spawnParticles, updateParticles, drawParticles } from '../gameObjects/particles.js';
import { enemies, resetEnemies, spawnEnemy, updateEnemies, drawEnemies } from '../gameObjects/enemies.js';
import { resetWingmen, spawnWingmanPickup, updateWingmen, drawWingmen, activeWingman } from '../gameObjects/wingmen.js';
import { resetBoss, spawnBoss, updateBoss, drawBoss } from '../gameObjects/boss.js';
import { checkCollisions } from '../collisions.js';
import { updateScore, updateLives, showMissionTitle } from '../hud.js';
import { playTrack } from '../music.js';
import { playSFX } from '../sounds.js';
import { transitionTo } from './transition.js';
import * as missionComplete from './missionComplete.js';
import * as bossChoice from './bossChoice.js';
import * as gameOver from './gameOver.js';

let enemySpawnTimer = 0;
let enemiesSpawned = 0;
let surviveTimer = 0;
let wingmanSpawned = false;

// Pause listener
document.addEventListener('keydown', e => {
    if (e.code === 'KeyP' && game.state === State.PLAYING) {
        game.paused = !game.paused;
    }
});

export function enter() {
    game.state = State.PLAYING;
    game.paused = false;
    const mission = missions[game.currentMissionIndex];
    playTrack(mission.music);

    createShip();
    setInvincible(shipDefs.invincibleDuration);
    resetBullets();
    resetAsteroids();
    resetParticles();
    resetEnemies();
    resetWingmen();
    resetBoss();

    spawnAsteroids(mission.asteroidCount, mission.asteroidSizes);

    enemySpawnTimer = mission.enemySpawnInterval > 0 ? 120 : 0;
    enemiesSpawned = 0;
    surviveTimer = mission.surviveTime ? mission.surviveTime * 60 : 0;
    wingmanSpawned = false;

    if (mission.objective === 'boss') {
        spawnBoss();
    }

    showMissionTitle(mission.title);
    updateScore(game.score);
    updateLives(game.lives);
}

function handlePlayerDeath() {
    spawnParticles(ship.x, ship.y, 15);
    triggerScreenShake();
    playSFX('explosion');
    triggerHitFlash();
    if (infiniteLives()) {
        resetShip();
        return;
    }
    game.lives--;
    updateLives(game.lives);
    if (game.lives <= 0) {
        transitionTo(gameOver.enter);
    } else {
        resetShip();
    }
}

function checkObjectives() {
    const mission = missions[game.currentMissionIndex];

    if (mission.objective === 'clear') {
        if (asteroids.length === 0 && enemies.length === 0 && enemiesSpawned >= mission.enemies) {
            transitionTo(missionComplete.enter);
        }
    } else if (mission.objective === 'survive') {
        surviveTimer--;
        if (surviveTimer <= 0) {
            transitionTo(missionComplete.enter);
        }
    }
}

function handleSpawning() {
    const mission = missions[game.currentMissionIndex];

    const canSpawnMore = mission.objective === 'survive'
        ? enemies.length < mission.enemies
        : enemiesSpawned < mission.enemies;
    if (mission.enemySpawnInterval > 0 && canSpawnMore) {
        enemySpawnTimer--;
        if (enemySpawnTimer <= 0) {
            spawnEnemy(mission.enemyType);
            enemiesSpawned++;
            enemySpawnTimer = mission.enemySpawnInterval;
        }
    }

    if (mission.wingmanAvailable && !wingmanSpawned && !activeWingman) {
        if (enemiesSpawned > 0 || asteroids.length < mission.asteroidCount) {
            wingmanSpawned = true;
            spawnWingmanPickup(mission.wingmanType);
        }
    }

    if (mission.objective === 'survive' && asteroids.length < 3) {
        spawnAsteroids(2, mission.asteroidSizes);
    }
}

function drawPaused() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
}

function drawSurviveTimer() {
    const mission = missions[game.currentMissionIndex];
    if (mission.objective === 'survive' && surviveTimer > 0) {
        const secs = Math.ceil(surviveTimer / 60);
        ctx.fillStyle = '#ff0';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SURVIVE: ' + secs + 's', canvas.width / 2, 30);
    }
}

export function tick() {
    if (game.paused) {
        drawPaused();
        return;
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update
    updateShip();
    updateBullets();
    updateAsteroids();
    updateEnemies();
    updateWingmen();
    updateBoss();
    updateParticles();

    // Collisions
    const result = checkCollisions();
    if (result.scoreGained) {
        game.score += result.scoreGained;
        updateScore(game.score);
    }
    if (result.playerDied) {
        handlePlayerDeath();
        if (game.state !== State.PLAYING) return;
    }
    if (result.bossDefeated) {
        transitionTo(bossChoice.enter);
        return;
    }

    // Spawning
    handleSpawning();

    // Check objectives
    if (game.state === State.PLAYING) {
        checkObjectives();
    }

    // Screen shake + draw
    ctx.save();
    if (shake.timer > 0) {
        const intensity = shake.intensity * (shake.timer / shake.duration);
        ctx.translate(
            (Math.random() - 0.5) * intensity,
            (Math.random() - 0.5) * intensity
        );
        shake.timer--;
    }

    drawAsteroids();
    drawEnemies();
    drawBoss();
    drawShip();
    drawBullets();
    drawWingmen();
    drawParticles();
    drawSurviveTimer();

    ctx.restore();
}
