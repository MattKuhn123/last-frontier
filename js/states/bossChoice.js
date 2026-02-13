// --- Boss Choice State ---
import { canvas, ctx } from '../utils.js';
import { State, game } from '../game.js';
import { drawAsteroids } from '../asteroids.js';
import { updateParticles, drawParticles } from '../particles.js';
import { playTrack } from '../music.js';
import { narrative } from '../repository.js';
import { transitionTo } from './transition.js';
import * as ending from './ending.js';

export function enter() {
    game.state = State.BOSS_CHOICE;
    playTrack(narrative.stateMusic[State.BOSS_CHOICE]);
    const choiceEl = document.getElementById('boss-choice');
    const speechEl = document.getElementById('boss-speech');
    choiceEl.classList.remove('hidden');
    speechEl.textContent = narrative.bossChoice;

    document.getElementById('choice-join').onclick = () => {
        choiceEl.classList.add('hidden');
        transitionTo(() => ending.enter('join'));
    };
    document.getElementById('choice-fight').onclick = () => {
        choiceEl.classList.add('hidden');
        transitionTo(() => ending.enter('fight'));
    };
}

export function tick() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawAsteroids();
    drawParticles();
    updateParticles();
}
