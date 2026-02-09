# Data Externalization TODO

Remaining hardcoded game data that should be moved to `data/` JSON files, following the project's data-driven architecture.

## High Impact

### Narrative Text → `data/narrative.json`
- Opening crawl lines (main.js lines 91-116, 25 lines of story text)
- Boss choice speech (main.js line 336)
- Both ending narratives — join and fight (main.js lines 511-545)
- Game over text ("MISSION FAILED", "Press ENTER to try again")
- Title screen text ("LAST FRONTIER", "YEAR 2746", controls legend)

### State Music Mapping → `data/state-music.json`
- `stateMusic` object in main.js (lines 52-61) maps game states to track names
- Currently: title→zen, crawl→strategy, briefing→strategy, mission_complete→easy, ending→victory, game_over→you-lost

### Asteroid Definitions → `data/asteroids.json`
- Size-to-radius mapping: 3→50, 2→25, 1→12 (asteroids.js lines 16-17)
- Point values: 3→20, 2→50, 1→100 (asteroids.js line 53)
- Vertex count: 10 (asteroids.js line 7)
- Color: `#aaa` (asteroids.js line 76)

### Boss Attack Patterns → expand `data/config.json` or new `data/boss.json`
- Attack cooldown ranges: single shot 40±10, spread 150±30, summon 360±60 (boss.js lines 113, 126, 134)
- Spread shot angle spacing: 0.25 rad (boss.js line 123)
- Movement sine wave: amplitude 200, frequency 0.001 (boss.js lines 84-85)
- Boss colors: normal `#f44`, flash `#fff`, detail `#faa`/`#a22` (boss.js lines 146-153)
- Entry position threshold, spawn velocity (boss.js lines 23-31)

## Medium Impact

### Enemy Destruction Particles
- `destroyEnemy()` always uses `rgba(255, 80, 80, 1)` regardless of enemy type color (enemies.js line 93)
- Should derive particle color from `enemyTypes[type].color`

### Bullet Colors
- Friendly: `#fff`, enemy: `#f44` (bullets.js line 45)
- Could live in config or a colors file

### Crawl Timing
- Fade in: 40 frames, hold: 320 frames, fade out: 30 frames, gap: 10 frames (main.js lines 121-124)
- Transition fade: 60 frames, hold: 30 frames (main.js lines 75-76)

### Screen Shake
- Duration: 80 frames, intensity: 75 (main.js lines 21-23)

## Lower Impact

### Wingman Behavior Constants
- Turn speed: 0.08 rad/frame (wingmen.js line 113)
- Approach distance: 100 (wingmen.js line 118)
- Fire range: 400 (wingmen.js line 125)
- Orbit distance from player: 150 (wingmen.js line 138)
- Friction: 0.98 (wingmen.js line 152)
- Pickup radius: 15, pulse speed: 0.05 (wingmen.js lines 9-10)

### Enemy Movement Thresholds
- Approach distance: 120, retreat distance: 80 (enemies.js lines 59, 62)
- Acceleration values: 0.06 toward, 0.03 away (enemies.js lines 60-64)
- Destruction score: 200 points (enemies.js line 95)

### Other
- Default lives: 3 (main.js line 234, hud.js line 63)
- Typewriter speed: 30ms per character (dialogue.js line 5)
- Ship thrust flame color: `#f80` (ship.js line 70)
- Default speaker fallback color: `#aaa` (dialogue.js line 19)
