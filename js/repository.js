// --- Centralized Data Repository ---
// All JSON data files are fetched here and exported for use by domain modules.

const [
    shipData,
    bulletData,
    asteroidData,
    enemyData,
    wingmanData,
    bossData,
    soundData,
    musicData,
    speakerData,
    missionData,
    narrativeData
] = await Promise.all([
    fetch('data/ship.json').then(r => r.json()),
    fetch('data/bullets.json').then(r => r.json()),
    fetch('data/asteroids.json').then(r => r.json()),
    fetch('data/enemies.json').then(r => r.json()),
    fetch('data/wingmen.json').then(r => r.json()),
    fetch('data/boss.json').then(r => r.json()),
    fetch('data/sounds.json').then(r => r.json()),
    fetch('data/music.json').then(r => r.json()),
    fetch('data/speakers.json').then(r => r.json()),
    fetch('data/missions.json').then(r => r.json()),
    fetch('data/narrative.json').then(r => r.json())
]);

export const shipDefs = shipData;
export const bulletDefs = bulletData;
export const asteroidDefs = asteroidData;
export const enemyTypes = enemyData;
export const wingmanTypes = wingmanData;
export const bossDefs = bossData;
export const sounds = soundData;
export const trackList = musicData;
export const speakerColors = speakerData;
export const missions = missionData;
export const narrative = narrativeData;
