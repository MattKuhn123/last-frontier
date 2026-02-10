// --- Debug ---
let _infiniteLives = false;
export function infiniteLives() { return _infiniteLives; }

// Toggle on backtick
document.addEventListener('keydown', e => {
    if (e.code === 'Backquote') {
        _infiniteLives = !_infiniteLives;
    }
});
