export const DEFAULT_SETTINGS = {
  work_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  long_break_interval: 4,
  sound_enabled: true,
  notification_enabled: true,
} as const;

export type TimerPhase = 'idle' | 'work' | 'shortBreak' | 'longBreak';

export const PHASE_LABELS: Record<TimerPhase, string> = {
  idle: 'Ready',
  work: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

export const PHASE_COLORS: Record<TimerPhase, string> = {
  idle: '#94a3b8',
  work: '#ef4444',
  shortBreak: '#22c55e',
  longBreak: '#3b82f6',
};

export const STORAGE_KEYS = {
  sessions: 'focustimer_sessions',
  settings: 'focustimer_settings',
} as const;
