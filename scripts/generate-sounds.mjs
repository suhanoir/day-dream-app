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

  // Write 16-bit PCM samples with gentle soft-knee limiting
  for (let i = 0; i < numSamples; i++) {
    let s = samples[i];
    if (s > 0.95) s = 0.95 + (s - 0.95) * 0.2;
    if (s < -0.95) s = -0.95 + (s + 0.95) * 0.2;
    s = Math.max(-1.0, Math.min(1.0, s));
    const intSample = Math.round(s < 0 ? s * 32768 : s * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

// 1. UI Click: Ultra-subtle wooden tactile click (0.035s)
function generateUiClick() {
  const duration = 0.035;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const freq = 1100 * (1 - progress * 0.75);
    const envelope = Math.exp(-progress * 22);
    const val = Math.sin(2 * Math.PI * freq * t) + 0.25 * Math.sin(4 * Math.PI * freq * t);
    samples[i] = val * envelope * 0.4;
  }
  return samples;
}

// 2. Dream Created: Warm marimba / acoustic Rhodes pluck (0.48s)
// Communicates: "Your dream has been added." Quiet, calm, welcoming.
function generateDreamCreated() {
  const duration = 0.48;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 440.0, start: 0.0, dur: 0.38, amp: 0.35 },    // A4
    { freq: 554.37, start: 0.06, dur: 0.38, amp: 0.38 },  // C#5
    { freq: 659.25, start: 0.12, dur: 0.34, amp: 0.40 },  // E5
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const attack = Math.min(1.0, t / 0.003);
      const decay = Math.exp(-progress * 9.5);
      const env = attack * decay;
      const val =
        Math.sin(2 * Math.PI * note.freq * t) * 0.7 +
        Math.sin(2 * Math.PI * (note.freq * 2) * t) * 0.22 +
        Math.sin(2 * Math.PI * (note.freq * 3) * t) * 0.08;
      samples[startSample + i] += val * env * note.amp;
    }
  }
  return samples;
}

// 3. Dream Completed: The Emotional Centerpiece (1.35s)
// Structure: Soft warm pedal foundation + rising celestial glass triad with warm resonance
// Communicates: "I finally did it." Profound, emotional, respectful life milestone.
function generateDreamComplete() {
  const duration = 1.35;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  // Warm foundation pad note (C4 261.63Hz + G4 392Hz)
  const padDuration = 1.2;
  const padSamples = Math.floor(padDuration * SAMPLE_RATE);
  for (let i = 0; i < padSamples && i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / padDuration;
    const attack = Math.min(1.0, t / 0.1);
    const decay = Math.exp(-progress * 3.5);
    const env = attack * decay;
    const padVal =
      Math.sin(2 * Math.PI * 261.63 * t) * 0.16 +
      Math.sin(2 * Math.PI * 392.0 * t) * 0.10;
    samples[i] += padVal * env;
  }

  // Ascending acoustic chime triad: E5 -> G#5 -> B5 -> E6
  const chimes = [
    { freq: 659.25, start: 0.05, dur: 1.15, amp: 0.32 },  // E5
    { freq: 830.61, start: 0.14, dur: 1.10, amp: 0.35 },  // G#5
    { freq: 987.77, start: 0.24, dur: 1.05, amp: 0.38 },  // B5
    { freq: 1318.51, start: 0.35, dur: 0.95, amp: 0.30 }, // E6 (golden high sparkle)
  ];

  for (const note of chimes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const attack = Math.min(1.0, t / 0.005);
      const decay = Math.exp(-progress * 4.2);
      const env = attack * decay;
      const val =
        Math.sin(2 * Math.PI * note.freq * t) * 0.60 +
        Math.sin(2 * Math.PI * (note.freq * 2) * t) * 0.24 +
        Math.sin(2 * Math.PI * (note.freq * 3.01) * t) * 0.12 +
        Math.sin(2 * Math.PI * (note.freq * 4.16) * t) * 0.04;
      samples[startSample + i] += val * env * note.amp;
    }
  }
  return samples;
}

// 4. Keepsake Created: Soft crystal glass / memory resonance (0.58s)
// Communicates: "A memory being preserved in time."
function generateKeepsakeCreated() {
  const duration = 0.58;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 739.99, start: 0.0, dur: 0.55, amp: 0.35 },   // F#5
    { freq: 1108.73, start: 0.05, dur: 0.50, amp: 0.32 }, // C#6
    { freq: 1479.98, start: 0.10, dur: 0.44, amp: 0.22 }, // F#6
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const attack = Math.min(1.0, t / 0.008);
      const decay = Math.exp(-progress * 6.5);
      const env = attack * decay;
      const val =
        Math.sin(2 * Math.PI * note.freq * t) * 0.7 +
        Math.sin(2 * Math.PI * (note.freq * 2) * t) * 0.2 +
        Math.sin(2 * Math.PI * (note.freq * 2.76) * t) * 0.1;
      samples[startSample + i] += val * env * note.amp;
    }
  }
  return samples;
}

// 5. Memory Photo Added: Gentle camera-like chime with airy texture (0.22s)
// Soft, calm confirmation when a photo is added to the Keepsake album.
function generateMemoryPhotoAdded() {
  const duration = 0.22;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const noiseEnv = Math.exp(-progress * 45);
    const noise = (Math.random() * 2 - 1) * noiseEnv * 0.15;
    const chimeEnv = Math.exp(-progress * 16);
    const chime = Math.sin(2 * Math.PI * 1046.5 * t) * chimeEnv * 0.35;
    samples[i] = noise + chime;
  }
  return samples;
}

// 6. Memory Cover Changed: Soft two-note chime (0.30s)
// Communicates: "Cover updated." Short, elegant.
function generateMemoryCoverChanged() {
  const duration = 0.30;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 783.99, start: 0.0, dur: 0.24, amp: 0.35 },   // G5
    { freq: 1046.50, start: 0.07, dur: 0.22, amp: 0.38 }, // C6
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const attack = Math.min(1.0, t / 0.003);
      const decay = Math.exp(-progress * 14);
      const env = attack * decay;
      const val =
        Math.sin(2 * Math.PI * note.freq * t) +
        0.2 * Math.sin(4 * Math.PI * note.freq * t);
      samples[startSample + i] += val * env * note.amp;
    }
  }
  return samples;
}

// 7. Keepsake Saved: Reassuring ascending two-note chime (0.44s)
// Communicates: "The Keepsake was saved safely."
function generateKeepsakeSaved() {
  const duration = 0.44;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 698.46, start: 0.0, dur: 0.36, amp: 0.32 },   // F5
    { freq: 880.00, start: 0.08, dur: 0.34, amp: 0.36 },  // A5
    { freq: 1046.50, start: 0.16, dur: 0.28, amp: 0.40 }, // C6
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const attack = Math.min(1.0, t / 0.004);
      const decay = Math.exp(-progress * 9);
      const env = attack * decay;
      const val =
        Math.sin(2 * Math.PI * note.freq * t) * 0.75 +
        Math.sin(2 * Math.PI * (note.freq * 2) * t) * 0.25;
      samples[startSample + i] += val * env * note.amp;
    }
  }
  return samples;
}

// 8. Journal Saved: Warm acoustic felted piano note (0.40s)
// Communicates: "Personal memory recorded." Warm, contemplative, quiet.
function generateJournalSaved() {
  const duration = 0.40;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 293.66, amp: 0.30 }, // D4
    { freq: 369.99, amp: 0.26 }, // F#4
    { freq: 440.00, amp: 0.28 }, // A4
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const attack = Math.min(1.0, t / 0.008);
    const decay = Math.exp(-progress * 8.5);
    const env = attack * decay;

    let sum = 0;
    for (const n of notes) {
      const tone =
        Math.sin(2 * Math.PI * n.freq * t) * 0.7 +
        Math.sin(2 * Math.PI * (n.freq * 2) * t) * 0.2 +
        Math.sin(2 * Math.PI * (n.freq * 3) * t) * 0.08 +
        Math.sin(2 * Math.PI * (n.freq * 4) * t) * 0.02;
      sum += tone * n.amp;
    }
    samples[i] = sum * env;
  }
  return samples;
}

// 9. Theme Changed: Soft glass shimmer / airy tonal sweep (0.52s)
// Atmospheric transition that complements the Liquid Glass aesthetic.
function generateThemeChanged() {
  const duration = 0.52;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const freq = 587.33 + 292.67 * Math.pow(progress, 0.7);
    const attack = Math.min(1.0, t / 0.03);
    const decay = Math.exp(-progress * 6.8);
    const env = attack * decay;
    const shimmer =
      Math.sin(2 * Math.PI * freq * t) * 0.6 +
      Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.25 +
      Math.sin(2 * Math.PI * (freq * 2.02) * t) * 0.15;
    samples[i] = shimmer * env * 0.35;
  }
  return samples;
}

// 10. Notification: Single celestial soft chime (0.46s)
// Non-aggressive, pure, peaceful notification tone.
function generateNotification() {
  const duration = 0.46;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const progress = t / duration;
    const attack = Math.min(1.0, t / 0.015);
    const decay = Math.exp(-progress * 7.5);
    const env = attack * decay;
    const val =
      Math.sin(2 * Math.PI * 880.0 * t) * 0.65 +
      Math.sin(2 * Math.PI * 1320.0 * t) * 0.35;
    samples[i] = val * env * 0.38;
  }
  return samples;
}

// 11. Error: Calm low two-tone signal (0.28s)
// Understated, soft, never harsh or loud.
function generateError() {
  const duration = 0.28;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const notes = [
    { freq: 349.23, start: 0.0, dur: 0.13 },  // F4
    { freq: 293.66, start: 0.11, dur: 0.16 }, // D4
  ];

  for (const note of notes) {
    const startSample = Math.floor(note.start * SAMPLE_RATE);
    const noteSamples = Math.floor(note.dur * SAMPLE_RATE);
    for (let i = 0; i < noteSamples && (startSample + i) < numSamples; i++) {
      const t = i / SAMPLE_RATE;
      const progress = i / noteSamples;
      const env = Math.exp(-progress * 8.5);
      const val = Math.sin(2 * Math.PI * note.freq * t);
      samples[startSample + i] += val * env * 0.32;
    }
  }
  return samples;
}

// 12. Ambient Calm Space: 12.0s seamless loop of gentle atmospheric pad
// Warm sanctuary room ambience with breathing harmonic drone.
function generateAmbientCalmSpace() {
  const duration = 12.0;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(numSamples);

  const droneFrequencies = [174.61, 261.63, 440.0];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const lfo = 0.8 + 0.2 * Math.sin(2 * Math.PI * (1 / duration) * t);

    let droneSum = 0;
    for (let d = 0; d < droneFrequencies.length; d++) {
      const f = droneFrequencies[d];
      const phase = d * 0.33;
      droneSum +=
        Math.sin(2 * Math.PI * f * t + phase) * 0.35 +
        Math.sin(2 * Math.PI * (f * 2) * t) * 0.10;
    }

    const air = (Math.sin(t * 123.4) * Math.cos(t * 456.7)) * 0.04;
    samples[i] = (droneSum + air) * lfo * 0.18;
  }

  // Crossfade boundary (0.5s) to guarantee zero click on loop restart
  const fadeDuration = 0.5;
  const fadeSamples = Math.floor(fadeDuration * SAMPLE_RATE);
  for (let i = 0; i < fadeSamples; i++) {
    const progress = i / fadeSamples;
    const startGain = progress;
    const endGain = 1 - progress;
    const tailIndex = numSamples - fadeSamples + i;
    const blended = samples[i] * startGain + samples[tailIndex] * endGain;
    samples[i] = blended;
    samples[tailIndex] = blended;
  }

  return samples;
}

// Sound asset generation matrix
const sounds = [
  // Primary UI
  { path: 'public/sounds/ui/click.wav', fn: generateUiClick },
  // Dream Lifecycle
  { path: 'public/sounds/dream/created.wav', fn: generateDreamCreated },
  { path: 'public/sounds/dream/complete.wav', fn: generateDreamComplete },
  // Memory & Keepsake
  { path: 'public/sounds/memory/keepsake-created.wav', fn: generateKeepsakeCreated },
  { path: 'public/sounds/memory/photo-added.wav', fn: generateMemoryPhotoAdded },
  { path: 'public/sounds/memory/cover-changed.wav', fn: generateMemoryCoverChanged },
  { path: 'public/sounds/memory/keepsake-saved.wav', fn: generateKeepsakeSaved },
  { path: 'public/sounds/memory/journal-saved.wav', fn: generateJournalSaved },
  // Atmospheric
  { path: 'public/sounds/theme/changed.wav', fn: generateThemeChanged },
  { path: 'public/sounds/ambient/calm-space.wav', fn: generateAmbientCalmSpace },
  // Feedback
  { path: 'public/sounds/feedback/notification.wav', fn: generateNotification },
  { path: 'public/sounds/feedback/error.wav', fn: generateError },
  // Legacy aliases for full backward compatibility
  { path: 'public/sounds/success/success.wav', fn: generateDreamCreated },
  { path: 'public/sounds/success/dream-complete.wav', fn: generateDreamComplete },
  { path: 'public/sounds/navigation/nav.wav', fn: generateUiClick },
  { path: 'public/sounds/notification/notification.wav', fn: generateNotification },
  { path: 'public/sounds/feedback/delete.wav', fn: generateUiClick },
];

console.log('Synthesizing DayDream Professional Sound Library...');
for (const s of sounds) {
  const fullPath = path.join(rootDir, s.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const samples = s.fn();
  const wavBuffer = createWavBuffer(samples);
  fs.writeFileSync(fullPath, wavBuffer);
  console.log(`✓ Synthesized ${s.path} (${wavBuffer.length} bytes, ${(samples.length / SAMPLE_RATE).toFixed(2)}s)`);
}
console.log('All DayDream professional audio assets synthesized successfully!');
