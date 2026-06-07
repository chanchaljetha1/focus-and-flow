const SOUNDS = ["rain", "lofi", "brown-noise", "cafe", "forest"] as const;
export type SoundName = (typeof SOUNDS)[number] | "silence";

const STORAGE_KEY = "ff_last_sound";

let ctx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let currentGain: GainNode | null = null;
const bufferCache = new Map<string, AudioBuffer>();

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export async function loadSound(name: string): Promise<AudioBuffer> {
  if (bufferCache.has(name)) return bufferCache.get(name)!;
  const audioCtx = getCtx();
  const res = await fetch(`/audio/${name}.ogg`);
  const arrayBuffer = await res.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  bufferCache.set(name, audioBuffer);
  return audioBuffer;
}

export function stopLoop(): void {
  if (!ctx || !currentGain || !currentSource) return;

  const audioCtx = ctx;
  const gain = currentGain;
  const source = currentSource;

  currentSource = null;
  currentGain = null;

  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.2);

  setTimeout(() => {
    try { source.stop(); } catch { /* already stopped */ }
  }, 220);
}

export async function playLoop(name: SoundName): Promise<void> {
  stopLoop();
  if (name === "silence") return;

  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  const buffer = await loadSound(name);

  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.7, audioCtx.currentTime);
  gainNode.connect(audioCtx.destination);

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gainNode);
  source.start();

  currentSource = source;
  currentGain = gainNode;

  localStorage.setItem(STORAGE_KEY, name);
}

export async function playCompletionSound(): Promise<void> {
  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") await audioCtx.resume();
  const now = audioCtx.currentTime;

  // Three ascending soft chime tones: E4 → G#4 → B4
  const tones = [
    { freq: 330, start: 0,    stop: 1.4 },
    { freq: 415, start: 0.35, stop: 1.6 },
    { freq: 494, start: 0.7,  stop: 2.2 },
  ];

  for (const { freq, start, stop } of tones) {
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now + start);
    gain.gain.linearRampToValueAtTime(0.55, now + start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + stop);
    gain.connect(audioCtx.destination);

    const osc = audioCtx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + start);
    osc.connect(gain);
    osc.start(now + start);
    osc.stop(now + stop);
  }
}

export function initAudio(): void {
  getCtx();
}

export function getSharedAudioCtx(): AudioContext {
  return getCtx();
}

export async function preloadAll(): Promise<void> {
  await Promise.allSettled(SOUNDS.map(loadSound));
}

export function getLastSound(): SoundName {
  if (typeof window === "undefined") return "rain";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ([...SOUNDS, "silence"] as string[]).includes(stored)) {
    return stored as SoundName;
  }
  return "rain";
}
