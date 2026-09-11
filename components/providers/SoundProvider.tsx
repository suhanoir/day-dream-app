"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  SoundType,
  SOUND_CONFIG,
  SOUND_STORAGE_KEYS,
  DEFAULT_SOUND_SETTINGS,
} from "@/lib/sound/soundConfig";

interface SoundContextType {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  volume: number;
  setVolume: (val: number) => void;
  ambientEnabled: boolean;
  setAmbientEnabled: (val: boolean) => void;
  playSound: (type: SoundType, customVolume?: number) => void;
}

const SoundContext = createContext<SoundContextType>({
  enabled: DEFAULT_SOUND_SETTINGS.ENABLED,
  setEnabled: () => {},
  volume: DEFAULT_SOUND_SETTINGS.VOLUME,
  setVolume: () => {},
  ambientEnabled: DEFAULT_SOUND_SETTINGS.AMBIENT_ENABLED,
  setAmbientEnabled: () => {},
  playSound: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState<boolean>(
    DEFAULT_SOUND_SETTINGS.ENABLED
  );
  const [volume, setVolumeState] = useState<number>(
    DEFAULT_SOUND_SETTINGS.VOLUME
  );
  const [ambientEnabled, setAmbientEnabledState] = useState<boolean>(
    DEFAULT_SOUND_SETTINGS.AMBIENT_ENABLED
  );

  // Audio nodes & cache refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sfxGainRef = useRef<GainNode | null>(null);
  const ambientGainRef = useRef<GainNode | null>(null);
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientHtmlAudioRef = useRef<HTMLAudioElement | null>(null);

  const audioBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const lastPlayTimestampRef = useRef<Map<string, number>>(new Map());
  const isUnlockedRef = useRef<boolean>(false);

  // Read preferences from localStorage on mount
  useEffect(() => {
    try {
      const storedEnabled = localStorage.getItem(SOUND_STORAGE_KEYS.ENABLED);
      if (storedEnabled !== null) {
        setEnabledState(storedEnabled === "true");
      }
      const storedVolume = localStorage.getItem(SOUND_STORAGE_KEYS.VOLUME);
      if (storedVolume !== null) {
        const parsed = parseFloat(storedVolume);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          setVolumeState(parsed);
        }
      }
      const storedAmbient = localStorage.getItem(
        SOUND_STORAGE_KEYS.AMBIENT_ENABLED
      );
      if (storedAmbient !== null) {
        setAmbientEnabledState(storedAmbient === "true");
      }
    } catch {
      // Ignore localStorage access restrictions in private browsing
    }
  }, []);

  const setEnabled = useCallback((val: boolean) => {
    setEnabledState(val);
    try {
      localStorage.setItem(SOUND_STORAGE_KEYS.ENABLED, String(val));
    } catch {
      // Ignore
    }
  }, []);

  const setVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    try {
      localStorage.setItem(SOUND_STORAGE_KEYS.VOLUME, clamped.toFixed(2));
    } catch {
      // Ignore
    }
  }, []);

  const setAmbientEnabled = useCallback((val: boolean) => {
    setAmbientEnabledState(val);
    try {
      localStorage.setItem(SOUND_STORAGE_KEYS.AMBIENT_ENABLED, String(val));
    } catch {
      // Ignore
    }
  }, []);

  // Preload sound into AudioContext cache
  const loadSoundBuffer = useCallback(
    async (type: SoundType, ctx: AudioContext): Promise<AudioBuffer | null> => {
      const config = SOUND_CONFIG[type];
      if (!config) return null;

      const cacheKey = config.src;
      if (audioBufferCacheRef.current.has(cacheKey)) {
        return audioBufferCacheRef.current.get(cacheKey)!;
      }
      try {
        const res = await fetch(config.src);
        const arrayBuffer = await res.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        audioBufferCacheRef.current.set(cacheKey, audioBuffer);
        return audioBuffer;
      } catch {
        return null;
      }
    },
    []
  );

  // Initialize or resume Web Audio graph
  const getAudioContext = useCallback((): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioContextClass) return null;

        const ctx = new AudioContextClass();
        const masterGain = ctx.createGain();
        const sfxGain = ctx.createGain();
        const ambientGain = ctx.createGain();

        masterGain.gain.setValueAtTime(volume, ctx.currentTime);
        sfxGain.gain.setValueAtTime(1.0, ctx.currentTime);
        ambientGain.gain.setValueAtTime(0.0001, ctx.currentTime);

        sfxGain.connect(masterGain);
        ambientGain.connect(masterGain);
        masterGain.connect(ctx.destination);

        audioCtxRef.current = ctx;
        masterGainRef.current = masterGain;
        sfxGainRef.current = sfxGain;
        ambientGainRef.current = ambientGain;
      }

      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  }, [volume]);

  // Sync master volume changes to Web Audio gain
  useEffect(() => {
    if (audioCtxRef.current && masterGainRef.current) {
      try {
        const ctx = audioCtxRef.current;
        const target = enabled ? volume : 0;
        masterGainRef.current.gain.setTargetAtTime(target, ctx.currentTime, 0.05);
      } catch {
        // Ignore
      }
    }
  }, [enabled, volume]);

  // Ambient sound lifecycle management
  useEffect(() => {
    const shouldPlayAmbient = enabled && ambientEnabled && volume > 0;
    const ctx = audioCtxRef.current;

    if (shouldPlayAmbient) {
      // Start or fade in ambient loop
      if (ctx && ambientGainRef.current && isUnlockedRef.current) {
        try {
          const config = SOUND_CONFIG["ambient"];
          const targetGain = volume * config.volumeWeight;

          if (!ambientSourceRef.current) {
            loadSoundBuffer("ambient", ctx).then((buf) => {
              if (!buf || !ctx || ctx.state === "closed") return;
              // Check again in case state changed while fetching
              if (!ambientSourceRef.current) {
                const source = ctx.createBufferSource();
                source.buffer = buf;
                source.loop = true;
                source.connect(ambientGainRef.current!);
                ambientGainRef.current!.gain.setValueAtTime(
                  0.0001,
                  ctx.currentTime
                );
                ambientGainRef.current!.gain.linearRampToValueAtTime(
                  targetGain,
                  ctx.currentTime + 2.0
                );
                source.start(0);
                ambientSourceRef.current = source;
              }
            });
          } else {
            ambientGainRef.current.gain.linearRampToValueAtTime(
              targetGain,
              ctx.currentTime + 1.5
            );
          }
        } catch {
          // Fallback to HTML5 audio loop
          if (!ambientHtmlAudioRef.current) {
            const audio = new Audio(SOUND_CONFIG["ambient"].src);
            audio.loop = true;
            audio.volume = volume * SOUND_CONFIG["ambient"].volumeWeight;
            audio.play().catch(() => {});
            ambientHtmlAudioRef.current = audio;
          }
        }
      }
    } else {
      // Stop or fade out ambient loop
      if (ctx && ambientGainRef.current && ambientSourceRef.current) {
        try {
          ambientGainRef.current.gain.linearRampToValueAtTime(
            0.0001,
            ctx.currentTime + 1.2
          );
          const currentSource = ambientSourceRef.current;
          setTimeout(() => {
            try {
              currentSource.stop();
              currentSource.disconnect();
            } catch {
              // Ignore
            }
            if (ambientSourceRef.current === currentSource) {
              ambientSourceRef.current = null;
            }
          }, 1300);
        } catch {
          ambientSourceRef.current = null;
        }
      }

      if (ambientHtmlAudioRef.current) {
        try {
          ambientHtmlAudioRef.current.pause();
          ambientHtmlAudioRef.current = null;
        } catch {
          // Ignore
        }
      }
    }
  }, [enabled, ambientEnabled, volume, loadSoundBuffer]);

  // Unlock AudioContext on first user gesture (Safari & Chrome autoplay policies)
  useEffect(() => {
    const unlock = () => {
      if (isUnlockedRef.current) return;
      isUnlockedRef.current = true;
      const ctx = getAudioContext();
      if (ctx) {
        // Preload core priority sounds in background
        const prioritySounds: SoundType[] = [
          "dream.created",
          "dream.completed",
          "keepsake.saved",
          "memory.journalSaved",
          "theme.changed",
        ];
        prioritySounds.forEach((sound) => {
          loadSoundBuffer(sound, ctx).catch(() => {});
        });

        // Trigger ambient loop if enabled
        if (ambientEnabled && enabled && volume > 0) {
          loadSoundBuffer("ambient", ctx).then((buf) => {
            if (
              buf &&
              ctx.state !== "closed" &&
              ambientGainRef.current &&
              !ambientSourceRef.current
            ) {
              try {
                const source = ctx.createBufferSource();
                source.buffer = buf;
                source.loop = true;
                source.connect(ambientGainRef.current);
                const target = volume * SOUND_CONFIG["ambient"].volumeWeight;
                ambientGainRef.current.gain.setValueAtTime(
                  0.0001,
                  ctx.currentTime
                );
                ambientGainRef.current.gain.linearRampToValueAtTime(
                  target,
                  ctx.currentTime + 2.0
                );
                source.start(0);
                ambientSourceRef.current = source;
              } catch {
                // Ignore
              }
            }
          });
        }
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true, once: true });
    window.addEventListener("keydown", unlock, { passive: true, once: true });
    window.addEventListener("touchstart", unlock, { passive: true, once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, [getAudioContext, loadSoundBuffer, ambientEnabled, enabled, volume]);

  const playSound = useCallback(
    (type: SoundType, customVolume?: number) => {
      // 1. Check if sound is muted or disabled
      if (!enabled || volume <= 0) return;

      const config = SOUND_CONFIG[type];
      if (!config) return;

      // 2. Intelligent Debouncing: prevent rapid stacking / phasing
      const now = performance.now();
      const lastPlay = lastPlayTimestampRef.current.get(type) || 0;
      const debounceLimit = config.debounceMs ?? 250;
      if (now - lastPlay < debounceLimit) return;
      lastPlayTimestampRef.current.set(type, now);

      // 3. Calculate calibrated effective volume
      const effectiveVolume = Math.max(
        0,
        Math.min(
          1,
          volume *
            config.volumeWeight *
            (customVolume !== undefined ? customVolume : 1)
        )
      );

      if (effectiveVolume <= 0) return;

      try {
        const ctx = getAudioContext();
        if (ctx && sfxGainRef.current) {
          const cached = audioBufferCacheRef.current.get(config.src);
          if (cached) {
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
            source.buffer = cached;
            source.connect(gainNode);
            gainNode.connect(sfxGainRef.current);
            source.start(0);
            return;
          }

          // Buffer not cached yet: load and play
          loadSoundBuffer(type, ctx)
            .then((buf) => {
              if (buf && ctx.state !== "closed" && sfxGainRef.current) {
                const source = ctx.createBufferSource();
                const gainNode = ctx.createGain();
                gainNode.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
                source.buffer = buf;
                source.connect(gainNode);
                gainNode.connect(sfxGainRef.current);
                source.start(0);
              }
            })
            .catch(() => {
              // Silent HTML5 fallback
              try {
                const audio = new Audio(config.src);
                audio.volume = effectiveVolume;
                audio.play().catch(() => {});
              } catch {
                // Silent fail
              }
            });
          return;
        }

        // Web Audio not initialized or not supported: use standard HTML5 Audio
        const audio = new Audio(config.src);
        audio.volume = effectiveVolume;
        audio.play().catch(() => {});
      } catch {
        // Complete silent failure: audio should NEVER interrupt UX or throw errors
      }
    },
    [enabled, volume, getAudioContext, loadSoundBuffer]
  );

  return (
    <SoundContext.Provider
      value={{
        enabled,
        setEnabled,
        volume,
        setVolume,
        ambientEnabled,
        setAmbientEnabled,
        playSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}


