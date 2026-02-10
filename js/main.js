// --- Main Entry Point ---
import { canvas, ctx } from './utils.js';
import { keys, setTitleStartCallback } from './input.js';
import { ship, shipDefs, createShip, resetShip, updateShip, drawShip, setInvincible } from './ship.js';
import { buildDebugPanel, infiniteLives } from './debug.js';
import { bullets, resetBullets, updateBullets, drawBullets } from './bullets.js';
import { asteroids, resetAsteroids, spawnAsteroids, updateAsteroids, drawAsteroids } from './asteroids.js';
import { particles, resetParticles, spawnParticles, updateParticles, drawParticles } from './particles.js';
import { enemies, resetEnemies, spawnEnemy, updateEnemies, drawEnemies } from './enemies.js';
import { resetWingmen, spawnWingmanPickup, updateWingmen, drawWingmen, activeWingman } from './wingmen.js';
import { boss, resetBoss, spawnBoss, updateBoss, drawBoss, hideBossHealthBar } from './boss.js';
import { checkCollisions } from './collisions.js';
import { updateScore, updateLives, showMissionTitle, resetHud, showHud, hideHud } from './hud.js';
import { startDialogue, hideDialogue } from './dialogue.js';
import { missions } from './missions.js';
import { playTrack, stopTrack, fadeOut, initAudioContext, playExplosionSFX } from './music.js';
import { hasActiveMods, resetAllMods } from './mods.js';
import { narrative } from './narrative.js';

// --- Screen Shake ---
const SHAKE_DURATION = 80;
let shakeTimer = 0;
let shakeIntensity = 75;

function triggerScreenShake() {
    shakeTimer = SHAKE_DURATION;
}

// --- Hit Flash ---
const hitFlashEl = document.getElementById('hit-flash');

function triggerHitFlash() {
    hitFlashEl.classList.remove('active');
    // Force reflow so re-adding the class restarts the animation
    void hitFlashEl.offsetWidth;
    hitFlashEl.classList.add('active');
}

// --- Game States ---
const State = {
    TITLE: 'TITLE',
    CRAWL: 'CRAWL',
    BRIEFING: 'BRIEFING',
    PLAYING: 'PLAYING',
    MISSION_COMPLETE: 'MISSION_COMPLETE',
    BOSS_CHOICE: 'BOSS_CHOICE',
    ENDING: 'ENDING',
    GAME_OVER: 'GAME_OVER',
    TRANSITION: 'TRANSITION'
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

// --- Transition System ---
const TRANSITION_FADE_FRAMES = 60;  // ~1s music fade
const TRANSITION_HOLD_FRAMES = 30;  // ~0.5s silence
const TRANSITION_TOTAL = TRANSITION_FADE_FRAMES + TRANSITION_HOLD_FRAMES;
let transitionTimer = 0;
let transitionCallback = null;

function transitionTo(callback) {
    if (state === State.TRANSITION) return;
    state = State.TRANSITION;
    transitionTimer = TRANSITION_TOTAL;
    transitionCallback = callback;
    hideDialogue();
    fadeOut(TRANSITION_FADE_FRAMES / 60);
}

// --- Opening Crawl ---
let crawlLineIndex = 0;
let crawlFadeTimer = 0;
let crawlAlpha = 0;
const CRAWL_FADE_IN = 40;    // frames to fade in
const CRAWL_HOLD = 320;       // frames to hold at full
const CRAWL_FADE_OUT = 30;   // frames to fade out
const CRAWL_GAP = 10;        // frames of black between lines

function startCrawl() {
    state = State.CRAWL;
    playTrack(narrative.stateMusic[State.CRAWL]);
    crawlLineIndex = 0;
    crawlFadeTimer = 0;
    crawlAlpha = 0;
    setTitleStartCallback(() => {
        if (state === State.CRAWL) {
            setTitleStartCallback(null);
            startNewGame();
        }
    });
}

function updateCrawl() {
    crawlFadeTimer++;

    // Skip blank lines quickly
    if (narrative.crawl[crawlLineIndex] === "") {
        if (crawlFadeTimer >= CRAWL_GAP) {
            crawlFadeTimer = 0;
            crawlLineIndex++;
            if (crawlLineIndex >= narrative.crawl.length) {
                setTitleStartCallback(null);
                startNewGame();
            }
        }
        crawlAlpha = 0;
        return;
    }

    if (crawlFadeTimer <= CRAWL_FADE_IN) {
        crawlAlpha = crawlFadeTimer / CRAWL_FADE_IN;
    } else if (crawlFadeTimer <= CRAWL_FADE_IN + CRAWL_HOLD) {
        crawlAlpha = 1;
    } else if (crawlFadeTimer <= CRAWL_FADE_IN + CRAWL_HOLD + CRAWL_FADE_OUT) {
        crawlAlpha = 1 - (crawlFadeTimer - CRAWL_FADE_IN - CRAWL_HOLD) / CRAWL_FADE_OUT;
    } else {
        // Move to next line
        crawlFadeTimer = 0;
        crawlLineIndex++;
        crawlAlpha = 0;
        if (crawlLineIndex >= narrative.crawl.length) {
            setTitleStartCallback(null);
            startNewGame();
        }
    }
}

function drawCrawl() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (crawlLineIndex < narrative.crawl.length && narrative.crawl[crawlLineIndex] !== "") {
        ctx.fillStyle = `rgba(170, 170, 170, ${crawlAlpha})`;
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(narrative.crawl[crawlLineIndex], canvas.width / 2, canvas.height / 2);
    }

    // Skip prompt
    ctx.fillStyle = '#444';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ENTER] Skip', canvas.width / 2, canvas.height - 30);
}

// --- Title Toolbar (tool links + mod indicator) ---
const titleToolbar = document.getElementById('title-toolbar');
const modIndicator = document.getElementById('mod-indicator');

function showTitleToolbar() {
    titleToolbar.classList.remove('hidden');
    if (hasActiveMods()) {
        modIndicator.classList.remove('hidden');
    } else {
        modIndicator.classList.add('hidden');
    }
}

function hideTitleToolbar() {
    titleToolbar.classList.add('hidden');
}

document.getElementById('reset-mods-btn').addEventListener('click', () => {
    resetAllMods();
    modIndicator.classList.add('hidden');
});

// --- Title Screen ---
function showTitle() {
    state = State.TITLE;
    playTrack(narrative.stateMusic[State.TITLE]);
    hideHud();
    hideDialogue();
    hideBossHealthBar();
    showTitleToolbar();
    setTitleStartCallback(() => {
        if (state === State.TITLE) {
            setTitleStartCallback(null);
            hideTitleToolbar();
            transitionTo(startCrawl);
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
    playTrack(narrative.stateMusic[State.BRIEFING]);
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
        transitionTo(startMission);
    });
}

// --- Mission Start ---
function startMission() {
    state = State.PLAYING;
    const mission = missions[currentMissionIndex];
    playTrack(mission.music);

    createShip();
    setInvincible(shipDefs.invincibleDuration);
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
    playTrack(narrative.stateMusic[State.MISSION_COMPLETE]);
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
        transitionTo(() => showEnding('fight')); // shouldn't happen, boss handles this
    } else {
        transitionTo(startBriefing);
    }
}

// --- Boss Choice ---
function showBossChoice() {
    state = State.BOSS_CHOICE;
    playTrack(narrative.stateMusic[State.BOSS_CHOICE]);
    const choiceEl = document.getElementById('boss-choice');
    const speechEl = document.getElementById('boss-speech');
    choiceEl.classList.remove('hidden');
    speechEl.textContent = narrative.bossChoice;

    document.getElementById('choice-join').onclick = () => {
        choiceEl.classList.add('hidden');
        transitionTo(() => showEnding('join'));
    };
    document.getElementById('choice-fight').onclick = () => {
        choiceEl.classList.add('hidden');
        transitionTo(() => showEnding('fight'));
    };
}

// --- Endings ---
function showEnding(type) {
    state = State.ENDING;
    playTrack(narrative.stateMusic[State.ENDING]);
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
                transitionTo(showTitle);
            }
        });
    }, 500);
}

// --- Game Over ---
function triggerGameOver() {
    state = State.GAME_OVER;
    playTrack(narrative.stateMusic[State.GAME_OVER]);
    hideDialogue();
    hideBossHealthBar();
    hideHud();

    setTitleStartCallback(() => {
        if (state === State.GAME_OVER) {
            setTitleStartCallback(null);
            transitionTo(startNewGame);
        }
    });
}

// --- Player Death ---
function handlePlayerDeath() {
    spawnParticles(ship.x, ship.y, 15);
    triggerScreenShake();
    playExplosionSFX();
    triggerHitFlash();
    if (infiniteLives()) {
        resetShip();
        return;
    }
    lives--;
    updateLives(lives);
    if (lives <= 0) {
        transitionTo(triggerGameOver);
    } else {
        resetShip();
    }
}

// --- Check Mission Objectives ---
function checkObjectives() {
    const mission = missions[currentMissionIndex];

    if (mission.objective === 'clear') {
        if (asteroids.length === 0 && enemies.length === 0 && enemiesSpawned >= mission.enemies) {
            transitionTo(missionComplete);
        }
    } else if (mission.objective === 'survive') {
        surviveTimer--;
        if (surviveTimer <= 0) {
            transitionTo(missionComplete);
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
            spawnEnemy(mission.enemyType);
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
    ctx.fillText(narrative.title.name, canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = '#888';
    ctx.font = '14px monospace';
    ctx.fillText(narrative.title.subtitle, canvas.width / 2, canvas.height / 2 - 25);

    ctx.fillStyle = '#666';
    ctx.font = '16px monospace';
    ctx.fillText(narrative.title.prompt, canvas.width / 2, canvas.height / 2 + 30);

    ctx.fillStyle = '#444';
    ctx.font = '12px monospace';
    ctx.fillText(narrative.title.controls, canvas.width / 2, canvas.height / 2 + 70);
}

function drawGameOverScreen() {
    ctx.fillStyle = '#fff';
    ctx.font = '40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(narrative.gameOver.title, canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText(narrative.gameOver.prompt, canvas.width / 2, canvas.height / 2 + 25);
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

    const ending = narrative.endings[endingType];
    ctx.fillStyle = ending.color;
    ctx.font = '28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ending.title, canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px monospace';
    ending.lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, canvas.height / 2 - 10 + i * 25);
    });

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
const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;
let lastFrameTime = 0;

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    const elapsed = timestamp - lastFrameTime;
    if (elapsed < FRAME_DURATION) return;
    lastFrameTime = timestamp - (elapsed % FRAME_DURATION);

    switch (state) {
        case State.TITLE:
            drawTitleScreen();
            break;

        case State.CRAWL:
            updateCrawl();
            drawCrawl();
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
                transitionTo(showBossChoice);
                break;
            }

            // Spawning
            handleSpawning();

            // Check objectives
            if (state === State.PLAYING) {
                checkObjectives();
            }

            // Apply screen shake
            ctx.save();
            if (shakeTimer > 0) {
                const intensity = shakeIntensity * (shakeTimer / SHAKE_DURATION);
                ctx.translate(
                    (Math.random() - 0.5) * intensity,
                    (Math.random() - 0.5) * intensity
                );
                shakeTimer--;
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

            ctx.restore();
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

        case State.TRANSITION:
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            transitionTimer--;
            if (transitionTimer <= 0) {
                stopTrack();
                transitionCallback();
            }
            break;
    }
}

// --- Start ---
buildDebugPanel();

// Resume AudioContext on first user interaction (browser autoplay policy)
function onFirstInteraction() {
    initAudioContext();
    document.removeEventListener('keydown', onFirstInteraction);
    document.removeEventListener('click', onFirstInteraction);
    playTrack(narrative.stateMusic[state]);
}
document.addEventListener('keydown', onFirstInteraction);
document.addEventListener('click', onFirstInteraction);

showTitle();
gameLoop();
