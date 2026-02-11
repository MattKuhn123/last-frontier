# Data Externalization TODO

Remaining hardcoded game data that should be moved to `data/` JSON files, following the project's data-driven architecture.


## Medium Impact


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
