// --- Narrative Data ---
// Data lives in data/narrative.json; this module fetches it at import time.

export const narrative = {};

const res = await fetch('data/narrative.json');
Object.assign(narrative, await res.json());
