// ============================================================
// Reusable Shape (Vertex) Editor for Last Frontier tool pages
// ============================================================
//
// Usage:
//   const editor = createShapeEditor({ editCanvas, previewCanvas, ... });
//   editor.refresh();
//   editor.startPreview();
//
// The consumer supplies DOM elements and get/set callbacks for the
// vertex array.  This module owns all mouse interaction, rendering,
// snap/symmetry logic, vertex list display, and the spinning preview.

function createShapeEditor({
    editCanvas,
    previewCanvas,
    vertexListEl,
    jsonOutputEl,
    snapToggleEl,
    symmetryToggleEl,
    getVertices,
    setVertices,
    previewColor  = () => '#4f4',
    previewSize   = () => 20,
    previewLineWidth = () => 1.5,
    previewLabel  = () => '',
    onVerticesChanged = () => {}
}) {
    const editCtx = editCanvas.getContext('2d');
    const previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;

    // Coordinate system: shape coords [-1.5, 1.5] mapped to canvas
    const GRID_RANGE = 1.5;
    const SCALE = editCanvas.width / (GRID_RANGE * 2);
    const CENTER = editCanvas.width / 2;

    let draggingIdx = -1;
    let hoveredIdx = -1;
    let previewAngle = 0;
    let previewRunning = false;

    // --- Coordinate helpers ---
    function toCanvas(sx, sy) {
        return [CENTER + sx * SCALE, CENTER + sy * SCALE];
    }
    function toShape(cx, cy) {
        return [(cx - CENTER) / SCALE, (cy - CENTER) / SCALE];
    }
    function snapVal(v) {
        if (snapToggleEl && !snapToggleEl.checked) return v;
        return Math.round(v / 0.05) * 0.05;
    }
    function roundDisplay(v) {
        return Math.round(v * 100) / 100;
    }

    // --- Shorthand ---
    function verts() { return getVertices(); }

    // --- Distance helpers ---
    function distPt(a, b) {
        return Math.hypot(a[0] - b[0], a[1] - b[1]);
    }
    function distToSegment(p, a, b) {
        const dx = b[0] - a[0], dy = b[1] - a[1];
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return distPt(p, a);
        let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        return distPt(p, [a[0] + t * dx, a[1] + t * dy]);
    }
    function findInsertIndex(vertices, point) {
        if (vertices.length < 2) return vertices.length;
        let minDist = Infinity, bestIdx = 0;
        for (let i = 0; i < vertices.length; i++) {
            const j = (i + 1) % vertices.length;
            const d = distToSegment(point, vertices[i], vertices[j]);
            if (d < minDist) { minDist = d; bestIdx = i + 1; }
        }
        return bestIdx;
    }
    function findVertex(canvasX, canvasY, threshold) {
        const [sx, sy] = toShape(canvasX, canvasY);
        const vertices = verts();
        for (let i = 0; i < vertices.length; i++) {
            if (distPt([sx, sy], vertices[i]) < threshold) return i;
        }
        return -1;
    }

    // --- Symmetry helper ---
    function findMirror(vertices, idx) {
        const [x, y] = vertices[idx];
        if (Math.abs(x) < 0.02) return -1;
        for (let i = 0; i < vertices.length; i++) {
            if (i === idx) continue;
            if (Math.abs(vertices[i][0] + x) < 0.05 && Math.abs(vertices[i][1] - y) < 0.05) {
                return i;
            }
        }
        return -1;
    }

    // --- Edit canvas rendering ---
    function drawEditCanvas() {
        const ctx = editCtx;
        const w = editCanvas.width, h = editCanvas.height;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        // Grid
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        for (let v = -GRID_RANGE; v <= GRID_RANGE; v += 0.25) {
            const [cx, cy] = toCanvas(v, -GRID_RANGE);
            const [cx2, cy2] = toCanvas(v, GRID_RANGE);
            ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx2, cy2); ctx.stroke();
            const [rx, ry] = toCanvas(-GRID_RANGE, v);
            const [rx2, ry2] = toCanvas(GRID_RANGE, v);
            ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx2, ry2); ctx.stroke();
        }

        // Axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(CENTER, 0); ctx.lineTo(CENTER, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, CENTER); ctx.lineTo(w, CENTER); ctx.stroke();

        // Unit circle
        ctx.strokeStyle = '#1f1f1f';
        ctx.beginPath();
        ctx.arc(CENTER, CENTER, SCALE, 0, Math.PI * 2);
        ctx.stroke();

        const vertices = verts();
        if (!vertices || vertices.length === 0) return;

        // Polygon fill
        if (vertices.length >= 3) {
            ctx.fillStyle = 'rgba(68, 255, 68, 0.05)';
            ctx.beginPath();
            for (let i = 0; i < vertices.length; i++) {
                const [cx, cy] = toCanvas(vertices[i][0], vertices[i][1]);
                if (i === 0) ctx.moveTo(cx, cy);
                else ctx.lineTo(cx, cy);
            }
            ctx.closePath();
            ctx.fill();
        }

        // Edges
        ctx.strokeStyle = '#4f4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < vertices.length; i++) {
            const [cx, cy] = toCanvas(vertices[i][0], vertices[i][1]);
            if (i === 0) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
        }
        ctx.closePath();
        ctx.stroke();

        // Vertices
        for (let i = 0; i < vertices.length; i++) {
            const [cx, cy] = toCanvas(vertices[i][0], vertices[i][1]);
            const isHovered = i === hoveredIdx;
            const isDragging = i === draggingIdx;

            ctx.fillStyle = isDragging ? '#fff' : isHovered ? '#8f8' : '#4f4';
            ctx.beginPath();
            ctx.arc(cx, cy, isHovered || isDragging ? 7 : 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#111';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i, cx, cy);
        }
    }

    // --- Preview rendering ---
    function drawPreview() {
        if (!previewCtx) return;
        const ctx = previewCtx;
        const w = previewCanvas.width, h = previewCanvas.height;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, w, h);

        const vertices = verts();
        if (!vertices || vertices.length < 2) {
            if (previewRunning) requestAnimationFrame(drawPreview);
            return;
        }

        const size = previewSize();
        const color = previewColor();
        const lineW = previewLineWidth();
        const label = previewLabel();

        previewAngle += 0.02;

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(previewAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineW;
        ctx.beginPath();
        for (let i = 0; i < vertices.length; i++) {
            const px = vertices[i][0] * size;
            const py = vertices[i][1] * size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        if (label) {
            ctx.fillStyle = '#333';
            ctx.font = '10px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(label, w / 2, h - 6);
        }

        if (previewRunning) requestAnimationFrame(drawPreview);
    }

    // --- Vertex list ---
    function renderVertexList() {
        if (!vertexListEl) return;
        vertexListEl.innerHTML = '';
        const vertices = verts();
        if (!vertices) return;
        for (let i = 0; i < vertices.length; i++) {
            const item = document.createElement('div');
            item.className = 'vertex-item';
            item.innerHTML = `
                <span class="idx">${i}</span>
                <span class="coords">[${roundDisplay(vertices[i][0])}, ${roundDisplay(vertices[i][1])}]</span>
                <span class="del-btn" data-idx="${i}">\u00d7</span>
            `;
            item.querySelector('.del-btn').onclick = () => {
                vertices.splice(i, 1);
                onVerticesChanged();
                refresh();
            };
            vertexListEl.appendChild(item);
        }
    }

    // --- JSON output ---
    function updateJSON() {
        if (!jsonOutputEl) return;
        const vertices = verts();
        if (!vertices) { jsonOutputEl.value = '[]'; return; }
        const formatted = vertices.map(v => `[${roundDisplay(v[0])}, ${roundDisplay(v[1])}]`).join(', ');
        jsonOutputEl.value = `[${formatted}]`;
    }

    // --- Refresh all displays ---
    function refresh() {
        drawEditCanvas();
        renderVertexList();
        updateJSON();
    }

    // --- Mouse events ---
    function getCanvasPos(e) {
        const rect = editCanvas.getBoundingClientRect();
        return [e.clientX - rect.left, e.clientY - rect.top];
    }

    editCanvas.addEventListener('mousedown', (e) => {
        if (e.button === 2) return;
        const [cx, cy] = getCanvasPos(e);
        const hitThreshold = 12 / SCALE;
        const idx = findVertex(cx, cy, hitThreshold);
        if (idx >= 0) {
            draggingIdx = idx;
        } else {
            let [sx, sy] = toShape(cx, cy);
            sx = snapVal(sx);
            sy = snapVal(sy);
            const vertices = verts();
            const insertIdx = findInsertIndex(vertices, [sx, sy]);
            vertices.splice(insertIdx, 0, [sx, sy]);

            if (symmetryToggleEl && symmetryToggleEl.checked && Math.abs(sx) > 0.02) {
                const mirrorPt = [-sx, sy];
                const mirrorIdx = findInsertIndex(vertices, mirrorPt);
                vertices.splice(mirrorIdx, 0, mirrorPt);
            }

            onVerticesChanged();
            refresh();
        }
    });

    editCanvas.addEventListener('mousemove', (e) => {
        const [cx, cy] = getCanvasPos(e);
        if (draggingIdx >= 0) {
            let [sx, sy] = toShape(cx, cy);
            sx = snapVal(sx);
            sy = snapVal(sy);
            const vertices = verts();
            const symmetryOn = symmetryToggleEl && symmetryToggleEl.checked;
            const mirrorIdx = symmetryOn ? findMirror(vertices, draggingIdx) : -1;
            vertices[draggingIdx] = [sx, sy];
            if (mirrorIdx >= 0) vertices[mirrorIdx] = [-sx, sy];
            onVerticesChanged();
            refresh();
        } else {
            const hitThreshold = 12 / SCALE;
            const newHovered = findVertex(cx, cy, hitThreshold);
            if (newHovered !== hoveredIdx) {
                hoveredIdx = newHovered;
                editCanvas.style.cursor = hoveredIdx >= 0 ? 'grab' : 'crosshair';
                drawEditCanvas();
            }
        }
    });

    editCanvas.addEventListener('mouseup', () => { draggingIdx = -1; });

    editCanvas.addEventListener('mouseleave', () => {
        draggingIdx = -1;
        hoveredIdx = -1;
        editCanvas.style.cursor = 'crosshair';
        drawEditCanvas();
    });

    editCanvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const [cx, cy] = getCanvasPos(e);
        const hitThreshold = 12 / SCALE;
        const idx = findVertex(cx, cy, hitThreshold);
        if (idx >= 0) {
            verts().splice(idx, 1);
            onVerticesChanged();
            refresh();
        }
    });

    // --- Public API ---
    return {
        refresh,
        startPreview() {
            if (previewRunning) return;
            previewRunning = true;
            drawPreview();
        },
        stopPreview() {
            previewRunning = false;
        },
        clear() {
            const v = verts();
            v.length = 0;
            onVerticesChanged();
            refresh();
        },
        reset(defaults) {
            const v = verts();
            v.length = 0;
            for (const d of defaults) v.push([...d]);
            onVerticesChanged();
            refresh();
        }
    };
}
