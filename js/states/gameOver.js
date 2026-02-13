// --- Game Over State ---
import { canvas, ctx } from '../utils.js';
import { State, game, resetGame } from '../game.js';
import { setTitleStartCallback } from '../input.js';
import { hideDialogue } from '../dialogue.js';
import { hideHud } from '../hud.js';
import { hideBossHealthBar } from '../boss.js';
import { updateParticles, drawParticles } from '../particles.js';
import { playTrack } from '../music.js';
import { narrative } from '../repository.js';
import { transitionTo } from './transition.js';
import * as briefing from './briefing.js';

export function enter() {
    game.state = State.GAME_OVER;
    playTrack(narrative.stateMusic[State.GAME_OVER]);
    hideDialogue();
    hideBossHealthBar();
    hideHud();

    setTitleStartCallback(() => {
        if (game.state === State.GAME_OVER) {
            setTitleStartCallback(null);
            transitionTo(() => {
                resetGame();
                briefing.enter();
            });
        }
    });
}

export function tick() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawParticles();
    updateParticles();

    ctx.fillStyle = '#fff';
    ctx.font = '40px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(narrative.gameOver.title, canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.fillText(narrative.gameOver.prompt, canvas.width / 2, canvas.height / 2 + 25);
}
