// --- Sound Parameters ---
// Data lives in data/sounds.json; this module fetches it at import time.

export const sounds = {};

const res = await fetch('data/sounds.json');
Object.assign(sounds, await res.json());
