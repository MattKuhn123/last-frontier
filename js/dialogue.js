// --- Radio-Comm Dialogue System ---
import { setDialogueAdvanceCallback } from './input.js';
import { wingmanTypes } from './wingmen.js';

const TYPEWRITER_SPEED = 30; // ms per character

// NPC speakers loaded from data; wingman speakers derived automatically
export const speakerColors = {};
const res = await fetch('data/speakers.json');
Object.assign(speakerColors, await res.json());

function getSpeakerColor(name) {
    // Check NPC speakers first
    if (speakerColors[name]) return speakerColors[name].color;
    // Check wingman types (keyed by lowercase, display name is uppercase)
    for (const key of Object.keys(wingmanTypes)) {
        if (wingmanTypes[key].name === name) return wingmanTypes[key].color;
    }
    return '#aaa';
}

let dialogueLines = [];
let currentLineIndex = 0;
let currentCharIndex = 0;
let typewriterInterval = null;
let isTyping = false;
let onCompleteCallback = null;

const speakerEl = document.getElementById('dialogue-speaker');
const textEl = document.getElementById('dialogue-text');
const boxEl = document.getElementById('dialogue-box');
const promptEl = document.getElementById('dialogue-prompt');

export function startDialogue(lines, onComplete) {
    dialogueLines = lines;
    currentLineIndex = 0;
    onCompleteCallback = onComplete;
    boxEl.classList.remove('hidden');
    showLine(0);
    setDialogueAdvanceCallback(advanceDialogue);
}

function showLine(index) {
    if (index >= dialogueLines.length) {
        endDialogue();
        return;
    }

    const line = dialogueLines[index];
    speakerEl.textContent = line.speaker + ':';
    speakerEl.style.color = getSpeakerColor(line.speaker);
    textEl.textContent = '';
    currentCharIndex = 0;
    isTyping = true;
    if (promptEl) promptEl.classList.add('hidden');

    clearInterval(typewriterInterval);
    typewriterInterval = setInterval(() => {
        if (currentCharIndex < line.text.length) {
            textEl.textContent += line.text[currentCharIndex];
            currentCharIndex++;
        } else {
            clearInterval(typewriterInterval);
            isTyping = false;
            if (promptEl) promptEl.classList.remove('hidden');
        }
    }, TYPEWRITER_SPEED);
}

function advanceDialogue() {
    if (isTyping) {
        // Complete current line instantly
        clearInterval(typewriterInterval);
        textEl.textContent = dialogueLines[currentLineIndex].text;
        isTyping = false;
        if (promptEl) promptEl.classList.remove('hidden');
        return;
    }

    currentLineIndex++;
    if (currentLineIndex >= dialogueLines.length) {
        endDialogue();
    } else {
        showLine(currentLineIndex);
    }
}

function endDialogue() {
    clearInterval(typewriterInterval);
    boxEl.classList.add('hidden');
    setDialogueAdvanceCallback(null);
    if (onCompleteCallback) {
        const cb = onCompleteCallback;
        onCompleteCallback = null;
        cb();
    }
}

export function hideDialogue() {
    clearInterval(typewriterInterval);
    boxEl.classList.add('hidden');
    setDialogueAdvanceCallback(null);
    onCompleteCallback = null;
    isTyping = false;
}
