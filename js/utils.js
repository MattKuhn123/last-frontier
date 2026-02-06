// --- Shared Helpers ---
export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

export function rand(min, max) {
    return Math.random() * (max - min) + min;
}

export function wrap(obj) {
    if (obj.x < -obj.radius) obj.x = canvas.width + obj.radius;
    if (obj.x > canvas.width + obj.radius) obj.x = -obj.radius;
    if (obj.y < -obj.radius) obj.y = canvas.height + obj.radius;
    if (obj.y > canvas.height + obj.radius) obj.y = -obj.radius;
}

export function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angleTo(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
}

export function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
}
