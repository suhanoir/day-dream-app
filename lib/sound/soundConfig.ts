/**
 * DayDream Sound Configuration
 * v2.8.0 Audio System
 */

export type SoundType =
  | 'ui-click'
  | 'navigation'
  | 'success'
  | 'dream-complete'
  | 'delete'
  | 'error'
  | 'notification';

export interface SoundDefinition {
  src: string;
  volumeWeight: number; // Multiplier to balance perceived loudness
}

export const SOUND_CONFIG: Record<SoundType, SoundDefinition> = {
  'ui-click': {
    src: '/sounds/ui/click.wav',
    volumeWeight: 0.55,
  },
  navigation: {
    src: '/sounds/navigation/nav.wav',
    volumeWeight: 0.5,
  },
  success: {
    src: '/sounds/success/success.wav',
    volumeWeight: 0.7,
  },
  'dream-complete': {
    src: '/sounds/success/dream-complete.wav',
    volumeWeight: 0.9,
  },
  delete: {
    src: '/sounds/feedback/delete.wav',
    volumeWeight: 0.55,
  },
  error: {
    src: '/sounds/feedback/error.wav',
    volumeWeight: 0.6,
  },
  notification: {
    src: '/sounds/notification/notification.wav',
    volumeWeight: 0.65,
  },
};

export const SOUND_STORAGE_KEYS = {
  ENABLED: 'daydream_sound_enabled',
  VOLUME: 'daydream_sound_volume',
} as const;

export const DEFAULT_SOUND_SETTINGS = {
  ENABLED: true,
  VOLUME: 0.45, // 45% default volume
} as const;

