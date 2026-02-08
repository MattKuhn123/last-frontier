// --- Ship Shape Definitions ---
// Each shape is an array of [x, y] vertex pairs normalized to size 1.
// Nose points "up" at (0, -1). The game rotates to face movement direction.

export const shapes = {
    player: [
        [0, -1], [-0.7, 0.7], [0, 0.4], [0.7, 0.7]
    ],
    enemy: [
        [0, -1], [-0.8, 0.3], [-0.4, 0.7], [0, 0.4], [0.4, 0.7], [0.8, 0.3]
    ],
    wingman: [
        [0, -1], [-0.67, 0.67], [0, 0.33], [0.67, 0.67]
    ],
    boss: [
        [0, -1], [-0.6, -0.3], [-1, 0.4], [-0.5, 0.8], [0, 0.5], [0.5, 0.8], [1, 0.4], [0.6, -0.3]
    ]
};

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
