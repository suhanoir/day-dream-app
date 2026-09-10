"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
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
  playSound: (type: SoundType, customVolume?: number) => void;
}

const SoundContext = createContext<SoundContextType>({
  enabled: DEFAULT_SOUND_SETTINGS.ENABLED,
  setEnabled: () => {},
  volume: DEFAULT_SOUND_SETTINGS.VOLUME,
  setVolume: () => {},
  playSound: () => {},
});

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState<boolean>(DEFAULT_SOUND_SETTINGS.ENABLED);
  const [volume, setVolumeState] = useState<number>(DEFAULT_SOUND_SETTINGS.VOLUME);

  // AudioContext & Buffer cache
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBufferCacheRef = useRef<Map<SoundType, AudioBuffer>>(new Map());
  const lastPlayTimestampRef = useRef<Map<SoundType, number>>(new Map());
  const isUnlockedRef = useRef<boolean>(false);

  // Read initial preferences from localStorage
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
    } catch {
      // Ignore localStorage read errors
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

  // Preload sound into AudioContext cache
  const loadSoundBuffer = useCallback(async (type: SoundType, ctx: AudioContext): Promise<AudioBuffer | null> => {
    if (audioBufferCacheRef.current.has(type)) {
      return audioBufferCacheRef.current.get(type)!;
    }
    try {
      const config = SOUND_CONFIG[type];
      if (!config) return null;
      const res = await fetch(config.src);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      audioBufferCacheRef.current.set(type, audioBuffer);
      return audioBuffer;
    } catch {
      return null;
    }
  }, []);

  // Unlock AudioContext on first user gesture
  useEffect(() => {
    const unlock = () => {
      if (isUnlockedRef.current) return;
      try {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          if (!audioCtxRef.current) {
            audioCtxRef.current = new AudioContextClass();
          }
          if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume().catch(() => {});
          }
          isUnlockedRef.current = true;

          // Preload priority sounds in background
          const ctx = audioCtxRef.current;
          const prioritySounds: SoundType[] = ["ui-click", "navigation", "success", "dream-complete"];
          prioritySounds.forEach((sound) => {
            loadSoundBuffer(sound, ctx).catch(() => {});
          });
        }
      } catch {
        // Fallback to HTML5 audio if Web Audio API fails
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
  }, [loadSoundBuffer]);

  const playSound = useCallback(
    (type: SoundType, customVolume?: number) => {
      // 1. Check if disabled or volume zero
      if (!enabled || volume <= 0) return;

      // 2. Debounce: prevent same sound triggering within 50ms (avoid echo/phasing)
      const now = performance.now();
      const lastPlay = lastPlayTimestampRef.current.get(type) || 0;
      if (now - lastPlay < 50) return;
      lastPlayTimestampRef.current.set(type, now);

      const config = SOUND_CONFIG[type];
      if (!config) return;

      const effectiveVolume = Math.max(
        0,
        Math.min(1, volume * config.volumeWeight * (customVolume !== undefined ? customVolume : 1))
      );

      if (effectiveVolume <= 0) return;

      try {
        const ctx = audioCtxRef.current;
        if (ctx) {
          if (ctx.state === "suspended") {
            ctx.resume().catch(() => {});
          }

          const cached = audioBufferCacheRef.current.get(type);
          if (cached) {
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
            source.buffer = cached;
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(0);
            return;
          }

          // Buffer not cached yet: fetch and play, or fallback to HTML5 Audio
          loadSoundBuffer(type, ctx).then((buf) => {
            if (buf && ctx.state !== "closed") {
              const source = ctx.createBufferSource();
              const gainNode = ctx.createGain();
              gainNode.gain.setValueAtTime(effectiveVolume, ctx.currentTime);
              source.buffer = buf;
              source.connect(gainNode);
              gainNode.connect(ctx.destination);
              source.start(0);
            }
          }).catch(() => {
            // HTML5 fallback
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

        // Web Audio not initialized or not supported, use standard HTML5 Audio
        const audio = new Audio(config.src);
        audio.volume = effectiveVolume;
        audio.play().catch(() => {});
      } catch {
        // Complete silent failure: audio should never interrupt UX
      }
    },
    [enabled, volume, loadSoundBuffer]
  );

  return (
    <SoundContext.Provider
      value={{
        enabled,
        setEnabled,
        volume,
        setVolume,
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

