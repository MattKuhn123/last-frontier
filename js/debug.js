// --- Debug Mode ---

export const config = {
    // Ship
    SHIP_SIZE: 15,
    TURN_SPEED: 0.07,
    THRUST_POWER: 0.1,
    FRICTION: 0.99,
    INVINCIBLE_DURATION: 180,

    // Bullets
    BULLET_SPEED: 7,
    BULLET_LIFETIME: 60,
    MAX_BULLETS: 8,

    // Asteroids
    ASTEROID_SPEED: 1.5,
    ASTEROID_JAGGEDNESS: 0.4,

    // Enemies
    ENEMY_SIZE: 12,
    ENEMY_SPEED: 1.8,
    ENEMY_TURN_SPEED: 0.04,
    ENEMY_FIRE_INTERVAL: 90,
    ENEMY_BULLET_SPEED: 4,

    // Wingmen
    WINGMAN_DURATION: 600,
    WINGMAN_SPEED: 2.5,

    // Boss
    BOSS_SIZE: 30,
    BOSS_MAX_HP: 30,
    BOSS_SPEED: 1.2,

    // Debug
    infiniteLives: false
};

// Metadata for building the panel: group label, key, step value
const fields = [
    { group: 'Ship', key: 'SHIP_SIZE', step: 1 },
    { group: 'Ship', key: 'TURN_SPEED', step: 0.01 },
    { group: 'Ship', key: 'THRUST_POWER', step: 0.01 },
    { group: 'Ship', key: 'FRICTION', step: 0.001 },
    { group: 'Ship', key: 'INVINCIBLE_DURATION', step: 10 },
    { group: 'Bullets', key: 'BULLET_SPEED', step: 1 },
    { group: 'Bullets', key: 'BULLET_LIFETIME', step: 5 },
    { group: 'Bullets', key: 'MAX_BULLETS', step: 1 },
    { group: 'Asteroids', key: 'ASTEROID_SPEED', step: 0.1 },
    { group: 'Asteroids', key: 'ASTEROID_JAGGEDNESS', step: 0.05 },
    { group: 'Enemies', key: 'ENEMY_SIZE', step: 1 },
    { group: 'Enemies', key: 'ENEMY_SPEED', step: 0.1 },
    { group: 'Enemies', key: 'ENEMY_TURN_SPEED', step: 0.01 },
    { group: 'Enemies', key: 'ENEMY_FIRE_INTERVAL', step: 5 },
    { group: 'Enemies', key: 'ENEMY_BULLET_SPEED', step: 0.5 },
    { group: 'Wingmen', key: 'WINGMAN_DURATION', step: 60 },
    { group: 'Wingmen', key: 'WINGMAN_SPEED', step: 0.1 },
    { group: 'Boss', key: 'BOSS_SIZE', step: 1 },
    { group: 'Boss', key: 'BOSS_MAX_HP', step: 1 },
    { group: 'Boss', key: 'BOSS_SPEED', step: 0.1 },
];

export function buildDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (!panel) return;

    let currentGroup = '';

    // Infinite lives checkbox
    const checkRow = document.createElement('label');
    checkRow.className = 'debug-row debug-check';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = config.infiniteLives;
    cb.addEventListener('change', () => { config.infiniteLives = cb.checked; });
    checkRow.appendChild(cb);
    checkRow.appendChild(document.createTextNode(' Infinite Lives'));
    panel.appendChild(checkRow);

    for (const f of fields) {
        // Group header
        if (f.group !== currentGroup) {
            currentGroup = f.group;
            const header = document.createElement('div');
            header.className = 'debug-group';
            header.textContent = currentGroup;
            panel.appendChild(header);
        }

        const row = document.createElement('label');
        row.className = 'debug-row';

        const label = document.createElement('span');
        label.textContent = f.key;
        row.appendChild(label);

        const input = document.createElement('input');
        input.type = 'number';
        input.step = f.step;
        input.value = config[f.key];
        input.addEventListener('input', () => {
            const v = parseFloat(input.value);
            if (!isNaN(v)) config[f.key] = v;
        });
        row.appendChild(input);

        panel.appendChild(row);
    }

    // Toggle on backtick
    document.addEventListener('keydown', e => {
        if (e.code === 'Backquote') {
            panel.classList.toggle('visible');
        }
    });
}
