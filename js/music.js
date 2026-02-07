// --- Music System (Web Audio API) ---

let audioCtx = null;
let gainNode = null;
let currentTrack = null; // base name of currently playing track
let playId = 0;          // cancellation counter
let currentSources = []; // active AudioBufferSourceNodes
const bufferCache = new Map();

export function initAudioContext() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function resetGain() {
    if (!gainNode || !audioCtx) return;
    gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
}

async function loadBuffer(url) {
    if (bufferCache.has(url)) return bufferCache.get(url);
    try {
        const res = await fetch(url);
        if (!res.ok) {
            bufferCache.set(url, null);
            return null;
        }
        const arrayBuf = await res.arrayBuffer();
        const audioBuf = await audioCtx.decodeAudioData(arrayBuf);
        bufferCache.set(url, audioBuf);
        return audioBuf;
    } catch {
        bufferCache.set(url, null);
        return null;
    }
}

function stopSources() {
    currentSources.forEach(s => {
        try { s.stop(); } catch {}
    });
    currentSources = [];
}

export async function playTrack(baseName) {
    if (baseName === null) return;          // null = keep current
    if (baseName === currentTrack) return;  // same track = no-op
    if (!audioCtx) return;

    resetGain();

    const myId = ++playId;
    const oldTrack = currentTrack;
    currentTrack = baseName;

    // Stop current sources
    stopSources();

    // Play old track's outro if it exists
    if (oldTrack) {
        const outroBuf = await loadBuffer(`music/${oldTrack}-outro.wav`);
        if (myId !== playId) return;
        if (outroBuf) {
            const outroSrc = audioCtx.createBufferSource();
            outroSrc.buffer = outroBuf;
            outroSrc.connect(gainNode);
            outroSrc.start();
            currentSources.push(outroSrc);
            // Wait for outro to finish
            await new Promise(resolve => { outroSrc.onended = resolve; });
            if (myId !== playId) return;
        }
    }

    // Load new track's intro and loop
    const [introBuf, loopBuf] = await Promise.all([
        loadBuffer(`music/${baseName}-intro.wav`),
        loadBuffer(`music/${baseName}-loop.wav`)
    ]);
    if (myId !== playId) return;

    stopSources(); // clear any leftover outro source

    if (!loopBuf) return; // no loop = nothing to play

    const now = audioCtx.currentTime;
    let loopStartTime = now;

    // Play intro if it exists
    if (introBuf) {
        const introSrc = audioCtx.createBufferSource();
        introSrc.buffer = introBuf;
        introSrc.connect(gainNode);
        introSrc.start(now);
        currentSources.push(introSrc);
        loopStartTime = now + introBuf.duration;
    }

    // Schedule loop (gapless after intro)
    const loopSrc = audioCtx.createBufferSource();
    loopSrc.buffer = loopBuf;
    loopSrc.loop = true;
    loopSrc.connect(gainNode);
    loopSrc.start(loopStartTime);
    currentSources.push(loopSrc);
}

export function stopTrack() {
    playId++;
    currentTrack = null;
    stopSources();
    resetGain();
}

export async function playExplosionSFX() {
    if (!audioCtx) return;
    const buf = await loadBuffer('sfx/explosion.wav');
    if (!buf) return;
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start();
}

export function fadeOut(durationSecs) {
    if (!audioCtx || !gainNode) return;
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(0, now + durationSecs);
}
