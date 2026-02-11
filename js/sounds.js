// --- Sound Effects ---
// Data lives in data/sounds.json; this module fetches it at import time.

import { synthesize, SAMPLE_RATE } from './synth.js';

export const sounds = {};

const res = await fetch('data/sounds.json');
Object.assign(sounds, await res.json());

let audioCtx = null;
const synthBufferCache = new Map();

export function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function synthToBuffer(params) {
    const samples = synthesize(params);
    const buf = audioCtx.createBuffer(1, samples.length, SAMPLE_RATE);
    buf.getChannelData(0).set(samples);
    return buf;
}

export function playExplosionSFX() {
    if (!audioCtx) return;

    const params = sounds.explosion;
    const cacheKey = JSON.stringify(params);
    let buf = synthBufferCache.get(cacheKey);
    if (!buf) {
        buf = synthToBuffer(params);
        synthBufferCache.set(cacheKey, buf);
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start();
}
