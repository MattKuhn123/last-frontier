// --- Title Screen State ---
import { canvas, ctx } from '../utils.js';
import { State, game } from '../game.js';
import { setTitleStartCallback } from '../input.js';
import { hideHud } from '../hud.js';
import { hideDialogue } from '../dialogue.js';
import { hideBossHealthBar } from '../boss.js';
import { playTrack } from '../music.js';
import { narrative } from '../repository.js';
import { transitionTo } from './transition.js';
import * as crawl from './crawl.js';

export function enter() {
    game.state = State.TITLE;
    playTrack(narrative.stateMusic[State.TITLE]);
    hideHud();
    hideDialogue();
    hideBossHealthBar();
    setTitleStartCallback(() => {
        if (game.state === State.TITLE) {
            setTitleStartCallback(null);
            transitionTo(crawl.enter);
        }
    });
}

export function tick() {
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
