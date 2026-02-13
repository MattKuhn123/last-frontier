// --- Transition State ---
import { canvas, ctx } from '../utils.js';
import { State, game } from '../game.js';
import { hideDialogue } from '../dialogue.js';
import { fadeOut, stopTrack } from '../music.js';

const FADE_FRAMES = 60;
const HOLD_FRAMES = 30;
const TOTAL = FADE_FRAMES + HOLD_FRAMES;

let timer = 0;
let callback = null;

export function transitionTo(cb) {
    if (game.state === State.TRANSITION) return;
    game.state = State.TRANSITION;
    timer = TOTAL;
    callback = cb;
    hideDialogue();
    fadeOut(FADE_FRAMES / 60);
}

export function tick() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    timer--;
    if (timer <= 0) {
        stopTrack();
        callback();
    }
}
