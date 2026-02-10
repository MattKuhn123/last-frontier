# Last Frontier

A narrative asteroids game built with HTML5 canvas and ES modules.

## Playing

The game uses ES modules, so it must be served over HTTP (not opened as a `file://` URL). Start any local server from the project root:

```
npx http-server .
```

Then open `http://localhost:8080` in your browser. Python works too:

```
python -m http.server
```

If you're using an IDE like WebStorm or VS Code (with Live Server), opening `index.html` from the IDE works out of the box.

## Mods

Players can customize the game using the built-in tools — links appear at the bottom of the title screen. Each tool has an **Apply to Game** button that saves changes to localStorage. The game loads these overrides at startup.

- **Config** — tweak ship speed, bullet lifetime, boss HP, and all other physics values
- **Ships** — redesign the player, enemy, wingman, and boss ship shapes
- **Sounds** — design a custom explosion sound effect with noise + tone synthesis
- **Missions** — add, remove, reorder missions and edit all properties including dialogue

When mods are active, the title screen shows **MODS ACTIVE** with a **Reset Mods** button to clear everything back to defaults.

The in-game debug panel (toggle with `` ` ``) also has a **Save as Mod** button — tweak values at runtime, save, and they persist across reloads.

## Dev Tools

### Dev Server (`dev-server.js`)

The tools' **Download** buttons export JSON data files that you can manually drop into the `data/` directory. If you want one-click convenience, the dev server adds write endpoints so the tools can overwrite data files directly:

```
node dev-server.js
```

This serves the game at `http://localhost:8080` just like `http-server`, but also exposes `POST /api/save-config`, `/api/save-shapes`, `/api/save-missions`, and `/api/save-sfx/<file>.wav`. When the tools detect they're running on `localhost:8080`, a **Save as Default** button appears that writes directly to `data/config.json`, `data/shapes.json`, `data/missions.json`, or `sfx/*.wav`.

A plain static server (`npx http-server`) can't write files, so the **Save as Default** buttons only appear with the dev server. The **Download** buttons and **Apply to Game** (localStorage mods) work everywhere regardless.

### Sound Designer (`_tools/sound-designer.html`)

Browser-based tool for creating game sound effects. Open it directly in your browser.

- Adjust **Noise** (decay, filter, volume) and **Tone** (waveform, frequency sweep, decay, volume) layers with sliders
- **Play** to hear the result instantly, or enable **Auto-play** to hear changes as you tweak
- Built-in presets: Explosion, Laser, Hit, Powerup, Thud
- **Save Preset** stores custom sounds in localStorage
- **Apply to Game** saves synth params to localStorage — the game synthesizes the sound at runtime instead of playing the `.wav`
- **Download** exports a `.wav` file — move it to `sfx/` and reference it in `music.js`

### Ship Designer (`_tools/ship-designer.html`)

Browser-based tool for designing ship shapes. Open it directly in your browser.

- Select a ship type at the top: **Player**, **Enemy**, **Wingman**, **Boss**
- **Click** on the grid to add a vertex (inserted into the nearest edge)
- **Drag** a vertex to reposition it
- **Right-click** a vertex to delete it
- **Snap** keeps coordinates to clean 0.05 increments
- **Symmetry** mirrors X-axis movement to the opposite vertex
- The rotating preview on the right shows the ship at game scale
- **Save Preset** stores shapes in localStorage for later
- **Copy JSON** copies the vertex array to clipboard
- **Apply to Game** saves changed shapes to localStorage as a mod
- **Download shapes.json** exports the vertex data for all 4 ship types

### Mission Editor (`_tools/mission-editor.html`)

Browser-based tool for editing the game's mission sequence. Open it directly in your browser.

- **Mission list** on the left shows all missions with objective tags — click to select, drag to reorder
- **Add/delete** missions with the + button and per-mission x button
- **Detail editor** on the right edits all mission properties: title, music, objective type, asteroid/enemy counts, spawn intervals, enemy type, wingman settings
- **Survive time** field appears only for survive-objective missions
- **Dialogue editors** for briefing and completion — add, remove, reorder lines with speaker and text fields
- **Save Preset** stores mission sets in localStorage for later
- **Apply to Game** saves the full mission array to localStorage as a mod — the game replaces its entire mission sequence on next load
- Unlike config/shapes mods (which are partial patches), mission mods replace the entire array since missions can be added, removed, and reordered
