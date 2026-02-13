// --- Splash Screen State ---
import { canvas, ctx } from '../utils.js';
import { State, game } from '../game.js';
import { initAudioContext } from '../sounds.js';
import * as title from './title.js';

function onSplashInteraction() {
    document.removeEventListener('keydown', onSplashInteraction);
    document.removeEventListener('click', onSplashInteraction);
    initAudioContext();
    title.enter();
}

export function enter() {
    game.state = State.SPLASH;
    document.addEventListener('keydown', onSplashInteraction);
    document.addEventListener('click', onSplashInteraction);
}

export function tick() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#888';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press any key to start', canvas.width / 2, canvas.height / 2);
}
