// --- Ship Shape Definitions ---
// Vertex data lives in data/shapes.json; this module fetches it at import time.
// The shapes object is created first, then populated, so all modules
// share the same mutable reference.

export const shapes = {};

const res = await fetch('data/shapes.json');
Object.assign(shapes, await res.json());

// Draws a shape polygon. Call within a ctx.save()/restore() block
// that has already set translate, rotate, strokeStyle, and lineWidth.
export function strokeShape(ctx, vertices, size) {
    ctx.beginPath();
    for (let i = 0; i < vertices.length; i++) {
        const px = vertices[i][0] * size;
        const py = vertices[i][1] * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
}
