// --- Game Configuration ---
// Data lives in data/config.json; this module fetches it at import time.
// The config object is created first, then populated via Object.assign,
// so all modules share the same mutable reference.

export const config = {};

const res = await fetch('data/config.json');
Object.assign(config, await res.json());
