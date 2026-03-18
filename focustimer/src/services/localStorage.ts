import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../utils/constants';

export interface LocalSession {
  id: string;
  task_id: string | null;
  duration_minutes: number;
  completed_at: string;
  synced: boolean;
}

export interface LocalSettings {
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  long_break_interval: number;
  sound_enabled: boolean;
  notification_enabled: boolean;
}

export function getSessions(): LocalSession[] {
  const raw = localStorage.getItem(STORAGE_KEYS.sessions);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addSession(durationMinutes: number, taskId: string | null = null): LocalSession {
  const session: LocalSession = {
    id: uuidv4(),
    task_id: taskId,
    duration_minutes: durationMinutes,
    completed_at: new Date().toISOString(),
    synced: false,
  };
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  return session;
}

export function getSettings(): LocalSettings | null {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSettings(settings: LocalSettings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}
