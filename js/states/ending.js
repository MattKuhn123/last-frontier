// --- Ending State ---
import { canvas, ctx } from '../utils.js';
import { State, game } from '../game.js';
import { setTitleStartCallback } from '../input.js';
import { hideHud } from '../hud.js';
import { resetEnemies } from '../gameObjects/enemies.js';
import { resetBoss, hideBossHealthBar } from '../gameObjects/boss.js';
import { playTrack } from '../music.js';
import { narrative } from '../repository.js';
import { transitionTo } from './transition.js';
import * as title from './title.js';

export function enter(type) {
    game.state = State.ENDING;
    playTrack(narrative.stateMusic[State.ENDING]);
    game.endingType = type;
    hideBossHealthBar();
    hideHud();
    resetEnemies();
    resetBoss();

    setTimeout(() => {
        setTitleStartCallback(() => {
            if (game.state === State.ENDING) {
                setTitleStartCallback(null);
                transitionTo(title.enter);
            }
        });
    }, 500);
}

export function tick() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const ending = narrative.endings[game.endingType];
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
    ctx.fillText('SCORE: ' + game.score.toString().padStart(6, '0'), canvas.width / 2, canvas.height / 2 + 110);
    ctx.fillText('Press ENTER to return to title', canvas.width / 2, canvas.height / 2 + 140);
}
