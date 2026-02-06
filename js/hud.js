// --- DOM-Based HUD ---
const hudEl = document.getElementById('hud');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const missionTitleEl = document.getElementById('mission-title');

let lastScore = -1;
let lastLives = -1;

export function updateScore(n) {
    if (n === lastScore) return;
    lastScore = n;
    scoreEl.textContent = n.toString().padStart(6, '0');
}

export function updateLives(n) {
    if (n === lastLives) return;
    lastLives = n;
    livesEl.innerHTML = '';
    for (let i = 0; i < n; i++) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '-10 -12 20 22');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M0,-10 L-7,7 L0,3 L7,7 Z');
        path.setAttribute('stroke', '#fff');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        livesEl.appendChild(svg);
    }
}

let missionTitleTimeout = null;

export function showMissionTitle(text) {
    missionTitleEl.textContent = text;
    missionTitleEl.classList.add('visible');
    clearTimeout(missionTitleTimeout);
    missionTitleTimeout = setTimeout(() => {
        missionTitleEl.classList.remove('visible');
    }, 3000);
}

export function hideMissionTitle() {
    missionTitleEl.classList.remove('visible');
    clearTimeout(missionTitleTimeout);
}

export function showHud() {
    hudEl.classList.remove('hidden');
}

export function hideHud() {
    hudEl.classList.add('hidden');
}

export function resetHud() {
    lastScore = -1;
    lastLives = -1;
    updateScore(0);
    updateLives(3);
    hideMissionTitle();
}
