// --- Shared Game State ---
import { resetHud, updateScore, updateLives } from './hud.js';

export const State = {
    SPLASH: 'SPLASH',
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

export const game = {
    state: State.SPLASH,
    score: 0,
    lives: 3,
    currentMissionIndex: 0,
    paused: false,
    endingType: null
};

export const shake = {
    timer: 0,
    duration: 80,
    intensity: 75
};

const hitFlashEl = document.getElementById('hit-flash');

export function triggerScreenShake() {
    shake.timer = shake.duration;
}

export function triggerHitFlash() {
    hitFlashEl.classList.remove('active');
    void hitFlashEl.offsetWidth;
    hitFlashEl.classList.add('active');
}

export function resetGame() {
    game.score = 0;
    game.lives = 3;
    game.currentMissionIndex = 0;
    game.endingType = null;
    resetHud();
    updateScore(game.score);
    updateLives(game.lives);
}
