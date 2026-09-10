import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SAMPLE_RATE = 44100;

function createWavBuffer(samples) {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buffer.writeUInt32LE(SAMPLE_RATE, 24); // SampleRate
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(2, 32);  // BlockAlign (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Write 16-bit PCM samples
  for (let i = 0; i < numSamples; i++) {
    // Clamp to -1.0 .. 1.0
    const s = Math.max(-1.0, Math.min(1.0, samples[i]));
    const intSample = Math.round(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

// 1. UI Click: Tactile 1200Hz -> 400Hz micro-click (0.04s)
function generateUiClick() {
  const duration = 0.04;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    // Pitch drop for wooden tactile feel
    const freq = 1200 * (1 - progress * 0.7);
    // Envelope: quick attack, fast exponential decay
    const envelope = Math.exp(-progress * 18);
    // Sine + subtle harmonic
    const val = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(4 * Math.PI * freq * t);
    samples[i] = val * envelope * 0.6;
  }
  return samples;
}

// 2. Navigation: Gentle 520Hz sine-warmth swell (0.12s)
function generateNavigation() {
  const duration = 0.12;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    // Gentle upward pitch inflection: 520Hz -> 580Hz
    const freq = 520 + 60 * progress;
    // Envelope: smooth bell/hanning shape
    const envelope = Math.sin(Math.PI * progress);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.45;
  }
  return samples;
}

// 3. Success: Warm ascending major triad E5 -> G#5 -> B5 (0.36s)
function generateSuccess() {
  const duration = 0.38;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Notes: E5 (659Hz), G#5 (831Hz), B5 (988Hz)
  const notes = [
    { freq: 659.25, start: 0.0, dur: 0.28 },
    { freq: 830.61, start: 0.08, dur: 0.28 },
    { freq: 987.77, start: 0.16, dur: 0.22 },
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const envelope = Math.exp(-progress * 8);
      // Pure sine + gentle 2nd harmonic
      const val = Math.sin(2 * Math.PI * note.freq * t) + 0.2 * Math.sin(4 * Math.PI * note.freq * t);
      samples[startSample + i] += val * envelope * 0.35;
    }
  }
  return samples;
}

// 4. Dream Complete: Ethereal harmonic shimmer F#5 -> A#5 -> C#6 -> F#6 with resonant bell decay (1.1s)
function generateDreamComplete() {
  const duration = 1.15;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 739.99, start: 0.0, dur: 1.0 },   // F#5
    { freq: 932.33, start: 0.09, dur: 0.95 },  // A#5
    { freq: 1108.73, start: 0.18, dur: 0.9 }, // C#6
    { freq: 1479.98, start: 0.27, dur: 0.85 }, // F#6
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      // Soft bell envelope with long resonant decay
      const envelope = Math.exp(-progress * 4.2);
      // Rich crystalline harmonics
      const val =
        Math.sin(2 * Math.PI * note.freq * t) * 0.6 +
        Math.sin(2 * Math.PI * (note.freq * 2) * t) * 0.25 +
        Math.sin(2 * Math.PI * (note.freq * 3.01) * t) * 0.1;
      samples[startSample + i] += val * envelope * 0.28;
    }
  }
  return samples;
}

// 5. Delete: Soft neutral woodblock tap (0.09s)
function generateDelete() {
  const duration = 0.09;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const freq = 240 * Math.exp(-progress * 3);
    const envelope = Math.exp(-progress * 15);
    const val = Math.sin(2 * Math.PI * freq * t) + 0.3 * Math.sin(2 * Math.PI * 480 * t);
    samples[i] = val * envelope * 0.45;
  }
  return samples;
}

// 6. Error / Warning: Calm double low chime 349Hz -> 293Hz (0.28s)
function generateError() {
  const duration = 0.28;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 349.23, start: 0.0, dur: 0.13 },  // F4
    { freq: 293.66, start: 0.12, dur: 0.16 }, // D4
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const envelope = Math.exp(-progress * 7);
      const val = Math.sin(2 * Math.PI * note.freq * t);
      samples[startSample + i] += val * envelope * 0.38;
    }
  }
  return samples;
}

// 7. Notification: Soft dreamy celestial chime A5 + E6 (0.48s)
function generateNotification() {
  const duration = 0.48;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    // Harmonic bell envelope (attack + decay)
    const attack = Math.min(1.0, t / 0.02);
    const decay = Math.exp(-progress * 6);
    const envelope = attack * decay;

    // A5 (880Hz) + E6 (1320Hz) perfect fifth harmony
    const val =
      Math.sin(2 * Math.PI * 880 * t) * 0.55 +
      Math.sin(2 * Math.PI * 1320 * t) * 0.35 +
      Math.sin(2 * Math.PI * 1760 * t) * 0.1;

    samples[i] = val * envelope * 0.45;
  }
  return samples;
}

const sounds = [
  { path: 'public/sounds/ui/click.wav', fn: generateUiClick },
  { path: 'public/sounds/navigation/nav.wav', fn: generateNavigation },
  { path: 'public/sounds/success/success.wav', fn: generateSuccess },
  { path: 'public/sounds/success/dream-complete.wav', fn: generateDreamComplete },
  { path: 'public/sounds/feedback/delete.wav', fn: generateDelete },
  { path: 'public/sounds/feedback/error.wav', fn: generateError },
  { path: 'public/sounds/notification/notification.wav', fn: generateNotification },
];

console.log('Synthesizing DayDream sound library...');
for (const s of sounds) {
  const fullPath = path.join(rootDir, s.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const samples = s.fn();
  const wavBuffer = createWavBuffer(samples);
  fs.writeFileSync(fullPath, wavBuffer);
  console.log(`✓ Generated ${s.path} (${wavBuffer.length} bytes)`);
}
console.log('All DayDream audio assets generated successfully!');
