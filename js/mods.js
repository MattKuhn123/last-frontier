// --- Mod Loader ---
// Reads mod overrides from localStorage and patches the live exported
// objects. Runs at import time (after data modules finish loading).

import { config } from './config.js';
import { shapes } from './shapes.js';
import { missions } from './missions.js';

const MOD_KEYS = {
    config:   'lf-mod-config',
    shapes:   'lf-mod-shapes',
    sfx:      'lf-mod-sfx',
    missions: 'lf-mod-missions'
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

// Apply mods at import time
applyConfigMod();
applyShapesMod();
applyMissionsMod();

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

export function resetAllMods() {
    resetConfigToDefaults();
    resetShapesToDefaults();
    resetMissionsToDefaults();
    localStorage.removeItem(MOD_KEYS.sfx);
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
              localStorage.getItem(MOD_KEYS.missions));
}
