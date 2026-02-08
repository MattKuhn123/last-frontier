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

## Dev Tools

### Sound Designer (`sound-designer.html`)

Browser-based tool for creating game sound effects. Open it directly in your browser.

- Adjust **Noise** (decay, filter, volume) and **Tone** (waveform, frequency sweep, decay, volume) layers with sliders
- **Play** to hear the result instantly, or enable **Auto-play** to hear changes as you tweak
- Built-in presets: Explosion, Laser, Hit, Powerup, Thud
- **Save Preset** stores custom sounds in localStorage
- **Download** exports a `.wav` file — move it to `sfx/` and reference it in `music.js`

### Ship Designer (`ship-designer.html`)

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
- **Download shapes.js** generates the full module with all 4 ship types

To apply your designs: click **Download shapes.js** and replace `js/shapes.js` with the downloaded file.
