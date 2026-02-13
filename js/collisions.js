// --- Collision Detection ---
import { dist } from './utils.js';
import { ship, invincibleTimer, resetShip, setInvincible } from './gameObjects/ship.js';
import { bullets } from './gameObjects/bullets.js';
import { asteroids, splitAsteroid } from './gameObjects/asteroids.js';
import { enemies, destroyEnemy } from './gameObjects/enemies.js';
import { boss, damageBoss } from './gameObjects/boss.js';
import { pickup, collectPickup } from './gameObjects/wingmen.js';


export function checkCollisions(gameState) {
    let scoreGained = 0;
    let playerDied = false;
    let bossDefeated = false;
    let wingmanCollected = null;

    // Friendly bullets vs asteroids
    for (let i = asteroids.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (bullets[j].friendly && dist(asteroids[i], bullets[j]) < asteroids[i].radius) {
                bullets.splice(j, 1);
                scoreGained += splitAsteroid(i);
                break;
            }
        }
    }

    // Friendly bullets vs enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (bullets[j].friendly && dist(enemies[i], bullets[j]) < enemies[i].radius) {
                bullets.splice(j, 1);
                scoreGained += destroyEnemy(i);
                break;
            }
        }
    }

    // Friendly bullets vs boss
    if (boss && boss.phase === 'fight') {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (bullets[j].friendly && dist(boss, bullets[j]) < boss.radius) {
                bullets.splice(j, 1);
                if (damageBoss()) {
                    bossDefeated = true;
                }
                break;
            }
        }
    }

    // Ship vs asteroids
    if (ship && invincibleTimer <= 0) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
            if (dist(asteroids[i], ship) < asteroids[i].radius + ship.radius * 0.6) {
                playerDied = true;
                break;
            }
        }
    }

    // Ship vs enemy bullets
    if (ship && invincibleTimer <= 0 && !playerDied) {
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (!bullets[j].friendly && dist(ship, bullets[j]) < ship.radius * 0.6) {
                bullets.splice(j, 1);
                playerDied = true;
                break;
            }
        }
    }

    // Ship vs enemies (collision)
    if (ship && invincibleTimer <= 0 && !playerDied) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (dist(enemies[i], ship) < enemies[i].radius + ship.radius * 0.6) {
                destroyEnemy(i);
                playerDied = true;
                break;
            }
        }
    }

    // Ship vs boss (collision)
    if (ship && boss && boss.phase === 'fight' && invincibleTimer <= 0 && !playerDied) {
        if (dist(boss, ship) < boss.radius + ship.radius * 0.6) {
            playerDied = true;
        }
    }

    // Ship vs wingman pickup
    if (ship && pickup) {
        if (dist(ship, pickup) < pickup.radius + ship.radius) {
            wingmanCollected = collectPickup();
        }
    }

    return { scoreGained, playerDied, bossDefeated, wingmanCollected };
}
