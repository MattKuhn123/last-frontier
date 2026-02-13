// --- Briefing State ---
import { canvas, ctx } from '../utils.js';
import { State, game } from '../game.js';
import { createShip } from '../gameObjects/ship.js';
import { resetBullets } from '../gameObjects/bullets.js';
import { resetAsteroids, drawAsteroids } from '../gameObjects/asteroids.js';
import { resetParticles, updateParticles, drawParticles } from '../gameObjects/particles.js';
import { resetEnemies } from '../gameObjects/enemies.js';
import { resetWingmen } from '../gameObjects/wingmen.js';
import { resetBoss, hideBossHealthBar } from '../gameObjects/boss.js';
import { updateScore, updateLives, showHud } from '../hud.js';
import { startDialogue } from '../dialogue.js';
import { playTrack } from '../music.js';
import { missions, narrative } from '../repository.js';
import { transitionTo } from './transition.js';
import * as playing from './playing.js';

export function enter() {
    game.state = State.BRIEFING;
    playTrack(narrative.stateMusic[State.BRIEFING]);
    const mission = missions[game.currentMissionIndex];

    createShip();
    resetBullets();
    resetAsteroids();
    resetParticles();
    resetEnemies();
    resetWingmen();
    resetBoss();
    hideBossHealthBar();
    showHud();
    updateScore(game.score);
    updateLives(game.lives);

    startDialogue(mission.briefing, () => {
        transitionTo(playing.enter);
    });
}

export function tick() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawAsteroids();
    drawParticles();
    updateParticles();
}
