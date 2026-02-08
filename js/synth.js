// --- Audio Synthesizer ---
// Pure-function module: generates Float32Array audio samples from parameter objects.
// Extracted from sound-designer.html for use by the game's mod system.

const SAMPLE_RATE = 44100;

export function synthesize(params) {
    const numSamples = Math.floor(SAMPLE_RATE * params.duration);
    const samples = new Float32Array(numSamples);

    // Noise layer
    const noise = new Float32Array(numSamples);
    for (let i = 0; i < numSamples; i++) {
        const progress = i / numSamples;
        noise[i] = (Math.random() * 2 - 1) * Math.pow(1 - progress, params.noiseDecay);
    }

    // Low-pass filter the noise (single-pole IIR)
    const alpha = Math.min(1, (2 * Math.PI * params.noiseFilter) / SAMPLE_RATE);
    let prev = 0;
    for (let i = 0; i < numSamples; i++) {
        prev += alpha * (noise[i] - prev);
        noise[i] = prev;
    }

    // Tone layer
    const tone = new Float32Array(numSamples);
    let phase = 0;
    for (let i = 0; i < numSamples; i++) {
        const progress = i / numSamples;
        const freq = params.toneStart * Math.pow(params.toneEnd / Math.max(1, params.toneStart), progress);
        const envelope = Math.pow(1 - progress, params.toneDecay);
        phase += (2 * Math.PI * freq) / SAMPLE_RATE;

        let s;
        switch (params.toneType) {
            case 'sine':     s = Math.sin(phase); break;
            case 'square':   s = Math.sin(phase) > 0 ? 1 : -1; break;
            case 'sawtooth': s = ((phase % (2 * Math.PI)) / Math.PI) - 1; break;
            case 'triangle':
                const t = (phase % (2 * Math.PI)) / (2 * Math.PI);
                s = 4 * Math.abs(t - 0.5) - 1;
                break;
            default: s = Math.sin(phase);
        }
        tone[i] = s * envelope;
    }

    // Mix
    for (let i = 0; i < numSamples; i++) {
        samples[i] = noise[i] * params.noiseVolume + tone[i] * params.toneVolume;
    }

    // Normalize
    let peak = 0;
    for (let i = 0; i < numSamples; i++) peak = Math.max(peak, Math.abs(samples[i]));
    if (peak > 0) {
        const scale = 0.9 / peak;
        for (let i = 0; i < numSamples; i++) samples[i] *= scale;
    }

    return samples;
}

export { SAMPLE_RATE };
