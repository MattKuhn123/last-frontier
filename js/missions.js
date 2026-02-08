// --- Mission Definitions ---
// Data lives in data/missions.json; this module fetches it at import time.
// Top-level await blocks the module graph until the data is loaded,
// so all downstream imports see a fully populated array.

const res = await fetch('data/missions.json');
export const missions = await res.json();
