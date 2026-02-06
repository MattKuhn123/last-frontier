// --- Main Entry Point ---
import { canvas, ctx } from './utils.js';
import { keys, setTitleStartCallback } from './input.js';
import { ship, createShip, resetShip, updateShip, drawShip, setInvincible } from './ship.js';
import { config, buildDebugPanel } from './debug.js';
import { bullets, resetBullets, updateBullets, drawBullets } from './bullets.js';
import { asteroids, resetAsteroids, spawnAsteroids, updateAsteroids, drawAsteroids } from './asteroids.js';
import { particles, resetParticles, updateParticles, drawParticles } from './particles.js';
import { enemies, resetEnemies, spawnEnemy, spawnCorruptEnemy, updateEnemies, drawEnemies } from './enemies.js';
import { resetWingmen, spawnWingmanPickup, updateWingmen, drawWingmen, activeWingman } from './wingmen.js';
import { boss, resetBoss, spawnBoss, updateBoss, drawBoss, hideBossHealthBar } from './boss.js';
import { checkCollisions } from './collisions.js';
import { updateScore, updateLives, showMissionTitle, resetHud, showHud, hideHud } from './hud.js';
import { startDialogue, hideDialogue } from './dialogue.js';
import { missions } from './missions.js';

// --- Game States ---
const State = {
    TITLE: 'TITLE',
    BRIEFING: 'BRIEFING',
    PLAYING: 'PLAYING',
    MISSION_COMPLETE: 'MISSION_COMPLETE',
    BOSS_CHOICE: 'BOSS_CHOICE',
    ENDING: 'ENDING',
    GAME_OVER: 'GAME_OVER'
};

let state = State.TITLE;
let score = 0;
let lives = 3;
let currentMissionIndex = 0;
let enemySpawnTimer = 0;
let enemiesSpawned = 0;
let surviveTimer = 0;
let wingmanSpawned = false;
let paused = false;
let endingType = null; // 'join' or 'fight'

// --- Title Screen ---
function showTitle() {
    state = State.TITLE;
    hideHud();
    hideDialogue();
    hideBossHealthBar();
    setTitleStartCallback(() => {
        if (state === State.TITLE) {
            setTitleStartCallback(null);
            startNewGame();
        }
    });
}

function startNewGame() {
    score = 0;
    lives = 3;
    currentMissionIndex = 0;
    endingType = null;
    resetHud();
    updateScore(score);
    updateLives(lives);
    startBriefing();
}

// --- Briefing ---
function startBriefing() {
    state = State.BRIEFING;
    const mission = missions[currentMissionIndex];

    // Clear gameplay
    createShip();
    resetBullets();
    resetAsteroids();
    resetParticles();
    resetEnemies();
    resetWingmen();
    resetBoss();
    hideBossHealthBar();
    showHud();
    updateScore(score);
    updateLives(lives);

    startDialogue(mission.briefing, () => {
        startMission();
    });
}

// --- Mission Start ---
function startMission() {
    state = State.PLAYING;
    const mission = missions[currentMissionIndex];

    createShip();
    setInvincible(config.INVINCIBLE_DURATION);
    resetBullets();
    resetAsteroids();
    resetParticles();
    resetEnemies();
    resetWingmen();
    resetBoss();

    // Spawn asteroids
    spawnAsteroids(mission.asteroidCount, mission.asteroidSizes);

    // Setup enemy spawning
    enemySpawnTimer = mission.enemySpawnInterval > 0 ? 120 : 0; // initial delay
    enemiesSpawned = 0;

    // Survive timer
    surviveTimer = mission.surviveTime ? mission.surviveTime * 60 : 0; // convert to frames

    // Wingman pickup
    wingmanSpawned = false;

    // Boss
    if (mission.objective === 'boss') {
        spawnBoss();
    }

    showMissionTitle(mission.title);
    updateScore(score);
    updateLives(lives);
}

// --- Mission Complete ---
function missionComplete() {
    state = State.MISSION_COMPLETE;
    const mission = missions[currentMissionIndex];

    if (mission.completionDialogue.length > 0) {
        startDialogue(mission.completionDialogue, () => {
            advanceToNextMission();
        });
    } else {
        advanceToNextMission();
    }
}

function advanceToNextMission() {
    currentMissionIndex++;
    if (currentMissionIndex >= missions.length) {
        showEnding('fight'); // shouldn't happen, boss handles this
    } else {
        startBriefing();
    }
}

// --- Boss Choice ---
function showBossChoice() {
    state = State.BOSS_CHOICE;
    const choiceEl = document.getElementById('boss-choice');
    const speechEl = document.getElementById('boss-speech');
    choiceEl.classList.remove('hidden');
    speechEl.textContent = "You've proven yourself, Cole. I could use someone like you. The Syndicate could give you everything — power, freedom, purpose. Or you can keep fighting for people who will never know your name. What do you say?";

    document.getElementById('choice-join').onclick = () => {
        choiceEl.classList.add('hidden');
        showEnding('join');
    };
    document.getElementById('choice-fight').onclick = () => {
        choiceEl.classList.add('hidden');
        showEnding('fight');
    };
}

// --- Endings ---
function showEnding(type) {
    state = State.ENDING;
    endingType = type;
    hideBossHealthBar();
    hideHud();
    resetEnemies();
    resetBoss();

    // Show ending after a brief pause
    setTimeout(() => {
        setTitleStartCallback(() => {
            if (state === State.ENDING) {
                setTitleStartCallback(null);
                showTitle();
            }
        });
    }, 500);
}

// --- Game Over ---
function triggerGameOver() {
    state = State.GAME_OVER;
    hideDialogue();
    hideBossHealthBar();
    hideHud();

    setTitleStartCallback(() => {
        if (state === State.GAME_OVER) {
            setTitleStartCallback(null);
            startNewGame();
        }
    });
}

// --- Player Death ---
function handlePlayerDeath() {
    if (config.infiniteLives) {
        resetShip();
        return;
    }
    lives--;
    updateLives(lives);
    if (lives <= 0) {
        triggerGameOver();
    } else {
        resetShip();
    }
}

// --- Check Mission Objectives ---
function checkObjectives() {
    const mission = missions[currentMissionIndex];

    if (mission.objective === 'clear') {
        if (asteroids.length === 0 && enemies.length === 0 && enemiesSpawned >= mission.enemies) {
            missionComplete();
        }
    } else if (mission.objective === 'survive') {
        surviveTimer--;
        if (surviveTimer <= 0) {
            missionComplete();
        }
    }
    // 'boss' objective is handled by boss defeat
}

// --- Spawn Logic ---
function handleSpawning() {
    const mission = missions[currentMissionIndex];

    // Enemy spawning
    const canSpawnMore = mission.objective === 'survive'
        ? enemies.length < mission.enemies  // survive: cap concurrent enemies
        : enemiesSpawned < mission.enemies; // clear: cap total enemies
    if (mission.enemySpawnInterval > 0 && canSpawnMore) {
        enemySpawnTimer--;
        if (enemySpawnTimer <= 0) {
            if (mission.enemyType === 'corrupt') {
                spawnCorruptEnemy();
            } else {
                spawnEnemy();
            }
            enemiesSpawned++;
            enemySpawnTimer = mission.enemySpawnInterval;
        }
    }

    // Wingman pickup spawning
    if (mission.wingmanAvailable && !wingmanSpawned && !activeWingman) {
        // Spawn pickup after a delay once some action has happened
        if (enemiesSpawned > 0 || asteroids.length < mission.asteroidCount) {
            wingmanSpawned = true;
            spawnWingmanPickup(mission.wingmanType);
        }
    }

    // Survive mode: replenish asteroids
    if (mission.objective === 'survive' && asteroids.length < 3) {
        spawnAsteroids(2, mission.asteroidSizes);
    }
}

// --- Pause ---
document.addEventListener('keydown', e => {
    if (e.code === 'KeyP' && state === State.PLAYING) {
        paused = !paused;
    }
});

// --- Draw State Screens ---
function drawTitleScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LAST FRONTIER', canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText('YEAR 2746', canvas.width / 2, canvas.height / 2 - 25);

    ctx.fillStyle = '#666';
    ctx.font = '16px monospace';
    ctx.fillText('Press ENTER to begin', canvas.width / 2, canvas.height / 2 + 30);

    ctx.fillStyle = '#444';
    ctx.font = '12px monospace';
    ctx.fillText('ARROWS/WASD: Move  |  SPACE: Shoot  |  P: Pause', canvas.width / 2, canvas.height / 2 + 70);
}

function drawGameOverScreen() {
    ctx.fillStyle = '#fff';
    ctx.font = '40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION FAILED', canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText('Press ENTER to try again', canvas.width / 2, canvas.height / 2 + 25);
}

function drawPausedScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '30px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
}

function drawEndingScreen() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (endingType === 'join') {
        ctx.fillStyle = '#f44';
        ctx.font = '28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU JOINED THE SYNDICATE', canvas.width / 2, canvas.height / 2 - 60);

        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        const lines = [
            'Cole holstered his weapon and took the hand offered.',
            'Kira and Jax never heard from him again.',
            'The Syndicate grew stronger.',
            'And the frontier grew darker.'
        ];
        lines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, canvas.height / 2 - 10 + i * 25);
        });
    } else {
        ctx.fillStyle = '#4f4';
        ctx.font = '28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('THE SYNDICATE FALLS', canvas.width / 2, canvas.height / 2 - 60);

        ctx.fillStyle = '#aaa';
        ctx.font = '14px monospace';
        const lines = [
            'Cole pulled the trigger.',
            'The Syndicate crumbled without its leader.',
            'Kira went back to fixing ships. Jax retired for real this time.',
            'And Cole? He just kept flying.'
        ];
        lines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, canvas.height / 2 - 10 + i * 25);
        });
    }

    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.fillText('SCORE: ' + score.toString().padStart(6, '0'), canvas.width / 2, canvas.height / 2 + 110);
    ctx.fillText('Press ENTER to return to title', canvas.width / 2, canvas.height / 2 + 140);
}

function drawSurviveTimer() {
    const mission = missions[currentMissionIndex];
    if (mission.objective === 'survive' && surviveTimer > 0) {
        const secs = Math.ceil(surviveTimer / 60);
        ctx.fillStyle = '#ff0';
        ctx.font = '18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SURVIVE: ' + secs + 's', canvas.width / 2, 30);
    }
}

// --- Main Game Loop ---
function gameLoop() {
    requestAnimationFrame(gameLoop);

    switch (state) {
        case State.TITLE:
            drawTitleScreen();
            break;

        case State.BRIEFING:
        case State.MISSION_COMPLETE:
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw some ambient asteroids for visual interest
            drawAsteroids();
            drawParticles();
            updateParticles();
            break;

        case State.PLAYING:
            if (paused) {
                drawPausedScreen();
                break;
            }

            // Clear
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
                score += result.scoreGained;
                updateScore(score);
            }
            if (result.playerDied) {
                handlePlayerDeath();
                if (state !== State.PLAYING) break; // died for good
            }
            if (result.bossDefeated) {
                showBossChoice();
                break;
            }

            // Spawning
            handleSpawning();

            // Check objectives
            if (state === State.PLAYING) {
                checkObjectives();
            }

            // Draw
            drawAsteroids();
            drawEnemies();
            drawBoss();
            drawShip();
            drawBullets();
            drawWingmen();
            drawParticles();
            drawSurviveTimer();
            break;

        case State.BOSS_CHOICE:
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawAsteroids();
            drawParticles();
            updateParticles();
            break;

        case State.ENDING:
            drawEndingScreen();
            break;

        case State.GAME_OVER:
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawParticles();
            updateParticles();
            drawGameOverScreen();
            break;
    }
}

// --- Start ---
buildDebugPanel();
showTitle();
gameLoop();
