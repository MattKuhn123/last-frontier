// --- Mod Loader ---
// Reads mod overrides from localStorage and patches the live exported
// objects. Runs at import time (after data modules finish loading).

import { config } from './config.js';
import { shapes } from './shapes.js';
import { missions } from './missions.js';
import { sounds } from './sounds.js';
import { wingmanTypes } from './wingmen.js';
import { enemyTypes } from './enemies.js';
import { speakerColors } from './dialogue.js';
import { narrative } from './narrative.js';
import { asteroidDefs } from './asteroids.js';
import { bossDefs } from './boss.js';

const MOD_KEYS = {
    config:   'lf-mod-config',
    shapes:   'lf-mod-shapes',
    sfx:      'lf-mod-sfx',
    missions: 'lf-mod-missions',
    wingmen:  'lf-mod-wingmen',
    enemies:  'lf-mod-enemies',
    speakers:  'lf-mod-speakers',
    narrative: 'lf-mod-narrative',
    asteroids: 'lf-mod-asteroids',
    boss:      'lf-mod-boss'
};

// Store original defaults for reset (exported for diff computation)
export const configDefaults = { ...config };
const shapesDefaults = {};
for (const key of Object.keys(shapes)) {
    if (Array.isArray(shapes[key])) {
        shapesDefaults[key] = shapes[key].map(v => [...v]);
    }
}

// Deep-copy the original missions array for reset
const missionsDefaults = JSON.parse(JSON.stringify(missions));

// Deep-copy the original sounds for reset
const soundsDefaults = JSON.parse(JSON.stringify(sounds));

// Deep-copy the original wingman/enemy types for reset
const wingmenDefaults = JSON.parse(JSON.stringify(wingmanTypes));
const enemiesDefaults = JSON.parse(JSON.stringify(enemyTypes));
const speakersDefaults = JSON.parse(JSON.stringify(speakerColors));
const narrativeDefaults = JSON.parse(JSON.stringify(narrative));
const asteroidDefsDefaults = JSON.parse(JSON.stringify(asteroidDefs));
const bossDefsDefaults = JSON.parse(JSON.stringify(bossDefs));

function loadJSON(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function applyConfigMod() {
    const mod = loadJSON(MOD_KEYS.config);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        if (key in configDefaults) {
            config[key] = mod[key];
        }
    }
}

function applyShapesMod() {
    const mod = loadJSON(MOD_KEYS.shapes);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        if (key in shapesDefaults) {
            shapes[key] = mod[key].map(v => [...v]);
        }
    }
}

function applyMissionsMod() {
    const mod = loadJSON(MOD_KEYS.missions);
    if (!mod || !Array.isArray(mod)) return;
    // Replace array contents in-place to preserve the live binding reference
    missions.splice(0, missions.length, ...mod);
}

function applySfxMod() {
    const mod = loadJSON(MOD_KEYS.sfx);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        sounds[key] = mod[key];
    }
}

function applyWingmenMod() {
    const mod = loadJSON(MOD_KEYS.wingmen);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        wingmanTypes[key] = mod[key];
    }
}

function applyEnemiesMod() {
    const mod = loadJSON(MOD_KEYS.enemies);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        enemyTypes[key] = mod[key];
    }
}

function applySpeakersMod() {
    const mod = loadJSON(MOD_KEYS.speakers);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        speakerColors[key] = mod[key];
    }
}

function applyNarrativeMod() {
    const mod = loadJSON(MOD_KEYS.narrative);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        narrative[key] = mod[key];
    }
}

function applyAsteroidsMod() {
    const mod = loadJSON(MOD_KEYS.asteroids);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        if (key in asteroidDefsDefaults) {
            asteroidDefs[key] = mod[key];
        }
    }
}

function applyBossMod() {
    const mod = loadJSON(MOD_KEYS.boss);
    if (!mod) return;
    for (const key of Object.keys(mod)) {
        if (key in bossDefsDefaults) {
            bossDefs[key] = mod[key];
        }
    }
}

// Apply mods at import time
applyConfigMod();
applyShapesMod();
applyMissionsMod();
applySfxMod();
applyWingmenMod();
applyEnemiesMod();
applySpeakersMod();
applyNarrativeMod();
applyAsteroidsMod();
applyBossMod();

// --- Public API for future UI use ---

export function resetConfigToDefaults() {
    for (const key of Object.keys(configDefaults)) {
        config[key] = configDefaults[key];
    }
    localStorage.removeItem(MOD_KEYS.config);
}

export function resetShapesToDefaults() {
    for (const key of Object.keys(shapesDefaults)) {
        shapes[key] = shapesDefaults[key].map(v => [...v]);
    }
    localStorage.removeItem(MOD_KEYS.shapes);
}

export function resetMissionsToDefaults() {
    missions.splice(0, missions.length, ...JSON.parse(JSON.stringify(missionsDefaults)));
    localStorage.removeItem(MOD_KEYS.missions);
}

export function resetSfxToDefaults() {
    for (const key of Object.keys(soundsDefaults)) {
        sounds[key] = JSON.parse(JSON.stringify(soundsDefaults[key]));
    }
    localStorage.removeItem(MOD_KEYS.sfx);
}

export function resetWingmenToDefaults() {
    // Remove any added keys
    for (const key of Object.keys(wingmanTypes)) {
        if (!(key in wingmenDefaults)) delete wingmanTypes[key];
    }
    // Restore defaults
    for (const key of Object.keys(wingmenDefaults)) {
        wingmanTypes[key] = JSON.parse(JSON.stringify(wingmenDefaults[key]));
    }
    localStorage.removeItem(MOD_KEYS.wingmen);
}

export function resetEnemiesToDefaults() {
    for (const key of Object.keys(enemyTypes)) {
        if (!(key in enemiesDefaults)) delete enemyTypes[key];
    }
    for (const key of Object.keys(enemiesDefaults)) {
        enemyTypes[key] = JSON.parse(JSON.stringify(enemiesDefaults[key]));
    }
    localStorage.removeItem(MOD_KEYS.enemies);
}

export function resetSpeakersToDefaults() {
    for (const key of Object.keys(speakerColors)) {
        if (!(key in speakersDefaults)) delete speakerColors[key];
    }
    for (const key of Object.keys(speakersDefaults)) {
        speakerColors[key] = JSON.parse(JSON.stringify(speakersDefaults[key]));
    }
    localStorage.removeItem(MOD_KEYS.speakers);
}

export function resetNarrativeToDefaults() {
    for (const key of Object.keys(narrative)) {
        if (!(key in narrativeDefaults)) delete narrative[key];
    }
    for (const key of Object.keys(narrativeDefaults)) {
        narrative[key] = JSON.parse(JSON.stringify(narrativeDefaults[key]));
    }
    localStorage.removeItem(MOD_KEYS.narrative);
}

export function resetAsteroidsToDefaults() {
    for (const key of Object.keys(asteroidDefs)) {
        if (!(key in asteroidDefsDefaults)) delete asteroidDefs[key];
    }
    for (const key of Object.keys(asteroidDefsDefaults)) {
        asteroidDefs[key] = JSON.parse(JSON.stringify(asteroidDefsDefaults[key]));
    }
    localStorage.removeItem(MOD_KEYS.asteroids);
}

export function resetBossToDefaults() {
    for (const key of Object.keys(bossDefs)) {
        if (!(key in bossDefsDefaults)) delete bossDefs[key];
    }
    for (const key of Object.keys(bossDefsDefaults)) {
        bossDefs[key] = JSON.parse(JSON.stringify(bossDefsDefaults[key]));
    }
    localStorage.removeItem(MOD_KEYS.boss);
}

export function resetAllMods() {
    resetConfigToDefaults();
    resetShapesToDefaults();
    resetMissionsToDefaults();
    resetSfxToDefaults();
    resetWingmenToDefaults();
    resetEnemiesToDefaults();
    resetSpeakersToDefaults();
    resetNarrativeToDefaults();
    resetAsteroidsToDefaults();
    resetBossToDefaults();
}

export function saveConfigMod(partial) {
    localStorage.setItem(MOD_KEYS.config, JSON.stringify(partial));
}

export function saveShapesMod(partial) {
    localStorage.setItem(MOD_KEYS.shapes, JSON.stringify(partial));
}

export function hasActiveMods() {
    return !!(localStorage.getItem(MOD_KEYS.config) ||
              localStorage.getItem(MOD_KEYS.shapes) ||
              localStorage.getItem(MOD_KEYS.sfx) ||
              localStorage.getItem(MOD_KEYS.missions) ||
              localStorage.getItem(MOD_KEYS.wingmen) ||
              localStorage.getItem(MOD_KEYS.enemies) ||
              localStorage.getItem(MOD_KEYS.speakers) ||
              localStorage.getItem(MOD_KEYS.narrative) ||
              localStorage.getItem(MOD_KEYS.asteroids) ||
              localStorage.getItem(MOD_KEYS.boss));
}
