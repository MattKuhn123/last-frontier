// --- Radio-Comm Dialogue System ---
import { setDialogueAdvanceCallback } from './input.js';

const TYPEWRITER_SPEED = 30; // ms per character

const SPEAKER_COLORS = {
    SIERRA: '#4f4',
    TANGO: '#48f',
    HQ: '#ff0',
    BOSS: '#f44',
    INTEL: '#f90',
    DISPATCH: '#aaf'
};

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
    speakerEl.style.color = SPEAKER_COLORS[line.speaker] || '#aaa';
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
