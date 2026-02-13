// --- Mission Complete State ---
import { canvas, ctx } from '../utils.js';
import { State, game } from '../game.js';
import { drawAsteroids } from '../gameObjects/asteroids.js';
import { updateParticles, drawParticles } from '../gameObjects/particles.js';
import { startDialogue } from '../dialogue.js';
import { playTrack } from '../music.js';
import { missions, narrative } from '../repository.js';
import { transitionTo } from './transition.js';
import * as briefing from './briefing.js';
import * as ending from './ending.js';

function advanceToNextMission() {
    game.currentMissionIndex++;
    if (game.currentMissionIndex >= missions.length) {
        transitionTo(() => ending.enter('fight'));
    } else {
        transitionTo(briefing.enter);
    }
}

export function enter() {
    game.state = State.MISSION_COMPLETE;
    playTrack(narrative.stateMusic[State.MISSION_COMPLETE]);
    const mission = missions[game.currentMissionIndex];

    if (mission.completionDialogue.length > 0) {
        startDialogue(mission.completionDialogue, () => {
            advanceToNextMission();
        });
    } else {
        advanceToNextMission();
    }
}

export function tick() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawAsteroids();
    drawParticles();
    updateParticles();
}
