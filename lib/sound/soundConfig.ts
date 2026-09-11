/**
 * DayDream Professional Sound Configuration
 * v2.15.0 Audio System — Apple-Quality Restraint & Subtle Emotion
 */

export type SoundSemanticEvent =
  | 'dream.created'
  | 'dream.completed'
  | 'keepsake.created'
  | 'keepsake.saved'
  | 'memory.photoAdded'
  | 'memory.coverChanged'
  | 'memory.journalSaved'
  | 'theme.changed'
  | 'notification.received'
  | 'error.soft'
  | 'ambient';

export type SoundType =
  | SoundSemanticEvent
  | 'dream-created'
  | 'dream-complete'
  | 'keepsake-created'
  | 'keepsake-saved'
  | 'memory-photo-added'
  | 'memory-cover-changed'
  | 'journal-saved'
  | 'theme-changed'
  | 'notification'
  | 'error'
  | 'success'
  | 'delete'
  | 'ui-click'
  | 'navigation';

export interface SoundDefinition {
  src: string;
  volumeWeight: number; // Low & balanced (0.15 - 0.40)
  debounceMs: number;   // Throttling window to eliminate rapid audio stacking
  priority: number;     // Higher priority sounds finish naturally
}

export const SOUND_CONFIG: Record<SoundType, SoundDefinition> = {
  // --- Semantic Events ---
  'dream.created': {
    src: '/sounds/dream/created.wav',
    volumeWeight: 0.30,
    debounceMs: 400,
    priority: 6,
  },
  'dream.completed': {
    src: '/sounds/dream/complete.wav',
    volumeWeight: 0.38,
    debounceMs: 1200,
    priority: 10, // Supreme priority: finishes without clipping
  },
  'keepsake.created': {
    src: '/sounds/memory/keepsake-created.wav',
    volumeWeight: 0.28,
    debounceMs: 500,
    priority: 7,
  },
  'keepsake.saved': {
    src: '/sounds/memory/keepsake-saved.wav',
    volumeWeight: 0.30,
    debounceMs: 500,
    priority: 7,
  },
  'memory.photoAdded': {
    src: '/sounds/memory/photo-added.wav',
    volumeWeight: 0.24,
    debounceMs: 200,
    priority: 4,
  },
  'memory.coverChanged': {
    src: '/sounds/memory/cover-changed.wav',
    volumeWeight: 0.26,
    debounceMs: 250,
    priority: 4,
  },
  'memory.journalSaved': {
    src: '/sounds/memory/journal-saved.wav',
    volumeWeight: 0.28,
    debounceMs: 500,
    priority: 6,
  },
  'theme.changed': {
    src: '/sounds/theme/changed.wav',
    volumeWeight: 0.24,
    debounceMs: 350,
    priority: 5,
  },
  'notification.received': {
    src: '/sounds/feedback/notification.wav',
    volumeWeight: 0.26,
    debounceMs: 400,
    priority: 5,
  },
  'error.soft': {
    src: '/sounds/feedback/error.wav',
    volumeWeight: 0.22,
    debounceMs: 400,
    priority: 4,
  },
  ambient: {
    src: '/sounds/ambient/calm-space.wav',
    volumeWeight: 0.16,
    debounceMs: 0,
    priority: 1,
  },

  // --- Kebab & Legacy Aliases (Seamless Compatibility) ---
  'dream-created': {
    src: '/sounds/dream/created.wav',
    volumeWeight: 0.30,
    debounceMs: 400,
    priority: 6,
  },
  'dream-complete': {
    src: '/sounds/dream/complete.wav',
    volumeWeight: 0.38,
    debounceMs: 1200,
    priority: 10,
  },
  'keepsake-created': {
    src: '/sounds/memory/keepsake-created.wav',
    volumeWeight: 0.28,
    debounceMs: 500,
    priority: 7,
  },
  'keepsake-saved': {
    src: '/sounds/memory/keepsake-saved.wav',
    volumeWeight: 0.30,
    debounceMs: 500,
    priority: 7,
  },
  'memory-photo-added': {
    src: '/sounds/memory/photo-added.wav',
    volumeWeight: 0.24,
    debounceMs: 200,
    priority: 4,
  },
  'memory-cover-changed': {
    src: '/sounds/memory/cover-changed.wav',
    volumeWeight: 0.26,
    debounceMs: 250,
    priority: 4,
  },
  'journal-saved': {
    src: '/sounds/memory/journal-saved.wav',
    volumeWeight: 0.28,
    debounceMs: 500,
    priority: 6,
  },
  'theme-changed': {
    src: '/sounds/theme/changed.wav',
    volumeWeight: 0.24,
    debounceMs: 350,
    priority: 5,
  },
  notification: {
    src: '/sounds/feedback/notification.wav',
    volumeWeight: 0.26,
    debounceMs: 400,
    priority: 5,
  },
  error: {
    src: '/sounds/feedback/error.wav',
    volumeWeight: 0.22,
    debounceMs: 400,
    priority: 4,
  },
  success: {
    src: '/sounds/dream/created.wav',
    volumeWeight: 0.30,
    debounceMs: 400,
    priority: 6,
  },
  delete: {
    src: '/sounds/ui/click.wav',
    volumeWeight: 0.15,
    debounceMs: 300,
    priority: 2,
  },
  'ui-click': {
    src: '/sounds/ui/click.wav',
    volumeWeight: 0.16,
    debounceMs: 100,
    priority: 1,
  },
  navigation: {
    src: '/sounds/ui/click.wav',
    volumeWeight: 0.15,
    debounceMs: 200,
    priority: 1,
  },
};

export const SOUND_STORAGE_KEYS = {
  ENABLED: 'daydream_sound_enabled',
  VOLUME: 'daydream_sound_volume',
  AMBIENT_ENABLED: 'daydream_ambient_enabled',
} as const;

export const DEFAULT_SOUND_SETTINGS = {
  ENABLED: true,
  VOLUME: 0.35, // 35% default subtle volume
  AMBIENT_ENABLED: false, // OFF by default
} as const;


