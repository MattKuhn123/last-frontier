// One-time script: generates sfx/explosion.wav
// Run with: node generate-explosion.js

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const DURATION = 0.4; // seconds
const NUM_SAMPLES = Math.floor(SAMPLE_RATE * DURATION);

// Generate samples as floating point first
const samples = new Float32Array(NUM_SAMPLES);

for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;          // time in seconds
    const progress = i / NUM_SAMPLES;   // 0 to 1

    // Noise burst: white noise with fast exponential decay
    const noise = (Math.random() * 2 - 1) * Math.pow(1 - progress, 3);

    // Bass rumble: sine wave sweeping from 80Hz down to 30Hz
    const freq = 80 * Math.pow(30 / 80, progress);
    const rumble = Math.sin(2 * Math.PI * freq * t) * Math.pow(1 - progress, 2);

    // Mix: noise is the crunch, rumble is the low-end punch
    samples[i] = noise * 0.5 + rumble * 0.4;
}

// Simple low-pass filter (single-pole IIR) to soften the noise
const cutoff = 0.08; // lower = more filtering
let prev = 0;
for (let i = 0; i < NUM_SAMPLES; i++) {
    prev = prev + cutoff * (samples[i] - prev);
    samples[i] = prev;
}

// A second pass without the filter to blend filtered + unfiltered
// Actually let's just re-generate with the mix we want:
// Re-do it properly: generate filtered noise + unfiltered rumble
const filtered = new Float32Array(NUM_SAMPLES);
const raw = new Float32Array(NUM_SAMPLES);

for (let i = 0; i < NUM_SAMPLES; i++) {
    const t = i / SAMPLE_RATE;
    const progress = i / NUM_SAMPLES;

    // Noise with decay
    raw[i] = (Math.random() * 2 - 1) * Math.pow(1 - progress, 3);

    // Bass rumble
    const freq = 80 * Math.pow(30 / 80, progress);
    const rumble = Math.sin(2 * Math.PI * freq * t) * Math.pow(1 - progress, 2);
    filtered[i] = rumble;
}

// Low-pass the noise
prev = 0;
for (let i = 0; i < NUM_SAMPLES; i++) {
    prev = prev + 0.15 * (raw[i] - prev);
    raw[i] = prev;
}

// Final mix
for (let i = 0; i < NUM_SAMPLES; i++) {
    samples[i] = raw[i] * 0.6 + filtered[i] * 0.5;
}

// Normalize to prevent clipping
let peak = 0;
for (let i = 0; i < NUM_SAMPLES; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
}
if (peak > 0) {
    const scale = 0.9 / peak;
    for (let i = 0; i < NUM_SAMPLES; i++) {
        samples[i] *= scale;
    }
}

// Convert to 16-bit PCM
const pcm = Buffer.alloc(NUM_SAMPLES * 2);
for (let i = 0; i < NUM_SAMPLES; i++) {
    const val = Math.max(-1, Math.min(1, samples[i]));
    const int16 = val < 0 ? val * 32768 : val * 32767;
    pcm.writeInt16LE(Math.round(int16), i * 2);
}

// Build WAV file
const numChannels = 1;
const bitsPerSample = 16;
const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
const blockAlign = numChannels * (bitsPerSample / 8);
const dataSize = pcm.length;
const fileSize = 36 + dataSize;

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(fileSize, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);          // fmt chunk size
header.writeUInt16LE(1, 20);           // PCM format
header.writeUInt16LE(numChannels, 22);
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(byteRate, 28);
header.writeUInt16LE(blockAlign, 32);
header.writeUInt16LE(bitsPerSample, 34);
header.write('data', 36);
header.writeUInt32LE(dataSize, 40);

const wav = Buffer.concat([header, pcm]);
const outPath = path.join(__dirname, 'sfx', 'explosion.wav');
fs.writeFileSync(outPath, wav);

console.log(`Written ${outPath} (${wav.length} bytes, ${DURATION}s, ${SAMPLE_RATE}Hz mono)`);
