import api from './api';
import { getSessions } from './localStorage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Sync unsynced local sessions to the server on login.
 * Marks sessions as synced after successful upload.
 */
export async function syncLocalSessions(): Promise<number> {
  const sessions = getSessions();
  const unsynced = sessions.filter((s) => !s.synced);

  if (unsynced.length === 0) return 0;

  try {
    await api.post('/sessions/bulk-sync', {
      sessions: unsynced.map((s) => ({
        task_id: s.task_id,
        duration_minutes: s.duration_minutes,
        completed_at: s.completed_at,
      })),
    });

    // Mark all as synced
    const updated = sessions.map((s) => ({ ...s, synced: true }));
    localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(updated));

    return unsynced.length;
  } catch {
    // Silently fail — will retry on next login
    return 0;
  }
}

/**
 * Sync local settings to server (upload local → server on first login).
 */
export async function syncSettingsToServer(): Promise<void> {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return;

  try {
    const local = JSON.parse(raw);
    // Only sync the zustand persisted state
    const state = local?.state;
    if (!state) return;

    await api.put('/settings', {
      work_duration: state.work_duration,
      short_break_duration: state.short_break_duration,
      long_break_duration: state.long_break_duration,
      long_break_interval: state.long_break_interval,
      sound_enabled: state.sound_enabled,
      notification_enabled: state.notification_enabled,
    });
  } catch {
    // Silently fail
  }
}

/**
 * Fetch settings from server and apply to local store.
 */
export async function fetchSettingsFromServer(): Promise<{
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  long_break_interval: number;
  sound_enabled: boolean;
  notification_enabled: boolean;
} | null> {
  try {
    const { data } = await api.get('/settings');
    return data.data.settings;
  } catch {
    return null;
  }
}
