import { v4 as uuidv4 } from 'uuid';
import { STORAGE_KEYS } from '../utils/constants';

export interface LocalSession {
  id: string;
  duration_minutes: number;
  completed_at: string;
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

export function addSession(durationMinutes: number): LocalSession {
  const session: LocalSession = {
    id: uuidv4(),
    duration_minutes: durationMinutes,
    completed_at: new Date().toISOString(),
  };
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
  return session;
}
