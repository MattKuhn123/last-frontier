// --- Main Entry Point ---
import { State, game } from './game.js';
import * as splash from './states/splash.js';
import * as title from './states/title.js';
import * as crawl from './states/crawl.js';
import * as briefing from './states/briefing.js';
import * as playing from './states/playing.js';
import * as missionComplete from './states/missionComplete.js';
import * as bossChoice from './states/bossChoice.js';
import * as ending from './states/ending.js';
import * as gameOver from './states/gameOver.js';
import * as transition from './states/transition.js';

const stateModules = {
    [State.SPLASH]: splash,
    [State.TITLE]: title,
    [State.CRAWL]: crawl,
    [State.BRIEFING]: briefing,
    [State.PLAYING]: playing,
    [State.MISSION_COMPLETE]: missionComplete,
    [State.BOSS_CHOICE]: bossChoice,
    [State.ENDING]: ending,
    [State.GAME_OVER]: gameOver,
    [State.TRANSITION]: transition
};

const TARGET_FPS = 60;
const FRAME_DURATION = 1000 / TARGET_FPS;
let lastFrameTime = 0;

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);

    const elapsed = timestamp - lastFrameTime;
    if (elapsed < FRAME_DURATION) return;
    lastFrameTime = timestamp - (elapsed % FRAME_DURATION);

    stateModules[game.state].tick();
}

splash.enter();
gameLoop();
