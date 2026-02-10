// --- Debug Panel ---
import { shipDefs } from './ship.js';
import { bulletDefs } from './bullets.js';
import { asteroidDefs } from './asteroids.js';
import { enemyTypes } from './enemies.js';
import { wingmanTypes } from './wingmen.js';
import { bossDefs } from './boss.js';
import {
    shipDefsDefaults, bulletDefsDefaults,
    asteroidDefsDefaults, enemiesDefaults, wingmenDefaults, bossDefsDefaults
} from './mods.js';

let _infiniteLives = false;
export function infiniteLives() { return _infiniteLives; }

// Metadata for building the panel: group label, obj, key, step value
const fields = [
    { group: 'Ship', obj: shipDefs, key: 'size', step: 1 },
    { group: 'Ship', obj: shipDefs, key: 'turnSpeed', step: 0.01 },
    { group: 'Ship', obj: shipDefs, key: 'thrustPower', step: 0.01 },
    { group: 'Ship', obj: shipDefs, key: 'friction', step: 0.001 },
    { group: 'Ship', obj: shipDefs, key: 'invincibleDuration', step: 10 },
    { group: 'Bullets', obj: bulletDefs, key: 'speed', step: 1 },
    { group: 'Bullets', obj: bulletDefs, key: 'lifetime', step: 5 },
    { group: 'Bullets', obj: bulletDefs, key: 'maxBullets', step: 1 },
    { group: 'Bullets', obj: bulletDefs, key: 'shootCooldown', step: 1 },
    { group: 'Asteroids', obj: asteroidDefs, key: 'speed', step: 0.1 },
    { group: 'Asteroids', obj: asteroidDefs, key: 'jaggedness', step: 0.05 },
    { group: 'Enemies', obj: enemyTypes, key: 'size', step: 1 },
    { group: 'Enemies', obj: enemyTypes, key: 'speed', step: 0.1 },
    { group: 'Enemies', obj: enemyTypes, key: 'turnSpeed', step: 0.01 },
    { group: 'Enemies', obj: enemyTypes, key: 'fireInterval', step: 5 },
    { group: 'Enemies', obj: enemyTypes, key: 'bulletSpeed', step: 0.5 },
    { group: 'Wingmen', obj: wingmanTypes, key: 'duration', step: 60 },
    { group: 'Wingmen', obj: wingmanTypes, key: 'speed', step: 0.1 },
    { group: 'Boss', obj: bossDefs, key: 'size', step: 1 },
    { group: 'Boss', obj: bossDefs, key: 'maxHp', step: 1 },
    { group: 'Boss', obj: bossDefs, key: 'speed', step: 0.1 },
];

// Map each domain object to its defaults and localStorage key
const domainMeta = [
    { obj: shipDefs,     defaults: shipDefsDefaults,     modKey: 'lf-mod-ship' },
    { obj: bulletDefs,   defaults: bulletDefsDefaults,    modKey: 'lf-mod-bullets' },
    { obj: asteroidDefs, defaults: asteroidDefsDefaults,  modKey: 'lf-mod-asteroids' },
    { obj: enemyTypes,   defaults: enemiesDefaults,       modKey: 'lf-mod-enemies' },
    { obj: wingmanTypes, defaults: wingmenDefaults,       modKey: 'lf-mod-wingmen' },
    { obj: bossDefs,     defaults: bossDefsDefaults,      modKey: 'lf-mod-boss' },
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
    cb.checked = _infiniteLives;
    cb.addEventListener('change', () => { _infiniteLives = cb.checked; });
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
        input.value = f.obj[f.key];
        input.addEventListener('input', () => {
            const v = parseFloat(input.value);
            if (!isNaN(v)) f.obj[f.key] = v;
        });
        row.appendChild(input);

        panel.appendChild(row);
    }

    // Save as Mod button
    const saveRow = document.createElement('div');
    saveRow.className = 'debug-group';
    saveRow.textContent = 'Mods';
    panel.appendChild(saveRow);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save as Mod';
    saveBtn.style.cssText = 'background:transparent;border:1px solid #fa4;color:#fa4;' +
        'font-family:Courier New,monospace;font-size:11px;padding:4px 12px;cursor:pointer;' +
        'width:100%;margin-top:4px;';
    saveBtn.addEventListener('click', () => {
        let totalChanges = 0;
        for (const dm of domainMeta) {
            const diff = {};
            for (const key of Object.keys(dm.defaults)) {
                if (typeof dm.defaults[key] !== 'object' && dm.obj[key] !== dm.defaults[key]) {
                    diff[key] = dm.obj[key];
                }
            }
            if (Object.keys(diff).length > 0) {
                localStorage.setItem(dm.modKey, JSON.stringify(diff));
                totalChanges += Object.keys(diff).length;
            } else {
                localStorage.removeItem(dm.modKey);
            }
        }
        if (totalChanges === 0) {
            saveBtn.textContent = 'No changes';
        } else {
            saveBtn.textContent = 'Saved!';
        }
        setTimeout(() => { saveBtn.textContent = 'Save as Mod'; }, 1500);
    });
    panel.appendChild(saveBtn);

    // Toggle on backtick
    document.addEventListener('keydown', e => {
        if (e.code === 'Backquote') {
            panel.classList.toggle('visible');
        }
    });
}
