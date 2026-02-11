// --- Music System (BeepBox Synth) ---

// Load track data at import time (top-level await)
const res = await fetch('data/music.json');
const trackList = await res.json();
const trackMap = new Map(trackList.map(t => [t.name, t.url]));

let currentSynth = null;
let currentTrack = null;
let fadeInterval = null;

function clearFade() {
    if (fadeInterval !== null) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }
}

export function playTrack(baseName) {
    if (baseName === null) return;
    if (baseName === currentTrack) return;

    clearFade();

    if (currentSynth) {
        currentSynth.pause();
        currentSynth.deactivateAudio();
        currentSynth = null;
    }

    currentTrack = baseName;

    const url = trackMap.get(baseName);
    if (!url) return;

    currentSynth = new beepbox.Synth(url);
    currentSynth.volume = 1;
    currentSynth.play();
}

export function stopTrack() {
    clearFade();
    if (currentSynth) {
        currentSynth.pause();
        currentSynth.deactivateAudio();
        currentSynth = null;
    }
    currentTrack = null;
}

export function fadeOut(durationSecs) {
    if (!currentSynth) return;
    clearFade();

    const steps = 20;
    const stepTime = (durationSecs * 1000) / steps;
    const volumeStep = currentSynth.volume / steps;
    const synth = currentSynth;

    fadeInterval = setInterval(() => {
        synth.volume = Math.max(0, synth.volume - volumeStep);
        if (synth.volume <= 0) {
            clearFade();
        }
    }, stepTime);
}
