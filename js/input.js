// --- Input Handling ---
export const keys = {};

let dialogueAdvanceCallback = null;
let bossChoiceCallback = null;
let titleStartCallback = null;

export function setDialogueAdvanceCallback(cb) { dialogueAdvanceCallback = cb; }
export function setBossChoiceCallback(cb) { bossChoiceCallback = cb; }
export function setTitleStartCallback(cb) { titleStartCallback = cb; }

document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.code === 'Enter') {
        if (dialogueAdvanceCallback) {
            dialogueAdvanceCallback();
            return; // don't register as gameplay key
        }
        if (titleStartCallback) {
            titleStartCallback();
            return;
        }
    }
    keys[e.code] = true;
});

document.addEventListener('keyup', e => {
    keys[e.code] = false;
});
