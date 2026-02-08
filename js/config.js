// --- Game Configuration ---

export const config = {
    // Ship
    SHIP_SIZE: 15,
    TURN_SPEED: 0.04,
    THRUST_POWER: 0.05,
    FRICTION: 0.99,
    INVINCIBLE_DURATION: 180,

    // Bullets
    BULLET_SPEED: 6,
    BULLET_LIFETIME: 60,
    MAX_BULLETS: 8,

    // Asteroids
    ASTEROID_SPEED: 0.5,
    ASTEROID_JAGGEDNESS: 0.4,

    // Enemies
    ENEMY_SIZE: 12,
    ENEMY_SPEED: 1.0,
    ENEMY_TURN_SPEED: 0.04,
    ENEMY_FIRE_INTERVAL: 90,
    ENEMY_BULLET_SPEED: 4,

    // Wingmen
    WINGMAN_DURATION: 600,
    WINGMAN_SPEED: 2.0,

    // Boss
    BOSS_SIZE: 30,
    BOSS_MAX_HP: 30,
    BOSS_SPEED: 0.7,

    // Debug
    infiniteLives: false
};
