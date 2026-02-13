// --- Opening Crawl State ---
import { canvas, ctx } from '../utils.js';
import { State, game, resetGame } from '../game.js';
import { setTitleStartCallback } from '../input.js';
import { playTrack } from '../music.js';
import { narrative } from '../repository.js';
import * as briefing from './briefing.js';

let lineIndex = 0;
let fadeTimer = 0;
let alpha = 0;
const FADE_IN = 40;
const HOLD = 320;
const FADE_OUT = 30;
const GAP = 10;

function startNewGame() {
    resetGame();
    briefing.enter();
}

export function enter() {
    game.state = State.CRAWL;
    playTrack(narrative.stateMusic[State.CRAWL]);
    lineIndex = 0;
    fadeTimer = 0;
    alpha = 0;
    setTitleStartCallback(() => {
        if (game.state === State.CRAWL) {
            setTitleStartCallback(null);
            startNewGame();
        }
    });
}

export function tick() {
    // Update
    fadeTimer++;

    if (narrative.crawl[lineIndex] === "") {
        if (fadeTimer >= GAP) {
            fadeTimer = 0;
            lineIndex++;
            if (lineIndex >= narrative.crawl.length) {
                setTitleStartCallback(null);
                startNewGame();
                return;
            }
        }
        alpha = 0;
    } else if (fadeTimer <= FADE_IN) {
        alpha = fadeTimer / FADE_IN;
    } else if (fadeTimer <= FADE_IN + HOLD) {
        alpha = 1;
    } else if (fadeTimer <= FADE_IN + HOLD + FADE_OUT) {
        alpha = 1 - (fadeTimer - FADE_IN - HOLD) / FADE_OUT;
    } else {
        fadeTimer = 0;
        lineIndex++;
        alpha = 0;
        if (lineIndex >= narrative.crawl.length) {
            setTitleStartCallback(null);
            startNewGame();
            return;
        }
    }

    // Draw
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (lineIndex < narrative.crawl.length && narrative.crawl[lineIndex] !== "") {
        ctx.fillStyle = `rgba(170, 170, 170, ${alpha})`;
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(narrative.crawl[lineIndex], canvas.width / 2, canvas.height / 2);
    }

    ctx.fillStyle = '#444';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('[ENTER] Skip', canvas.width / 2, canvas.height - 30);
}
