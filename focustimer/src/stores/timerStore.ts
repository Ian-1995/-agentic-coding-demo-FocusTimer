import { create } from 'zustand';
import { type TimerPhase } from '../utils/constants';
import { minutesToSeconds } from '../utils/time';
import { useSettingsStore } from './settingsStore';
import { addSession } from '../services/localStorage';

interface TimerState {
  timeRemaining: number;
  currentPhase: TimerPhase;
  pomodoroCount: number;
  isRunning: boolean;
  intervalId: number | null;
  /** Backup setTimeout that fires exactly at endTime (immune to setInterval throttling) */
  endTimeoutId: number | null;
  /** Unix ms when the current phase ends (set on start, used to survive background throttling) */
  endTime: number | null;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
}

function getPhaseDuration(phase: TimerPhase): number {
  const settings = useSettingsStore.getState();
  switch (phase) {
    case 'work':
      return minutesToSeconds(settings.work_duration);
    case 'shortBreak':
      return minutesToSeconds(settings.short_break_duration);
    case 'longBreak':
      return minutesToSeconds(settings.long_break_duration);
    default:
      return minutesToSeconds(settings.work_duration);
  }
}

function getNextPhase(currentPhase: TimerPhase, pomodoroCount: number): TimerPhase {
  const settings = useSettingsStore.getState();
  if (currentPhase === 'work') {
    const newCount = pomodoroCount + 1;
    if (newCount % settings.long_break_interval === 0) {
      return 'longBreak';
    }
    return 'shortBreak';
  }
  return 'work';
}

export const useTimerStore = create<TimerState>()((set, get) => ({
  timeRemaining: minutesToSeconds(useSettingsStore.getState().work_duration),
  currentPhase: 'idle' as TimerPhase,
  pomodoroCount: 0,
  isRunning: false,
  intervalId: null,
  endTimeoutId: null,
  endTime: null,

  start: () => {
    const state = get();
    if (state.isRunning) return;

    let phase = state.currentPhase;
    let time = state.timeRemaining;

    if (phase === 'idle') {
      phase = 'work';
      time = getPhaseDuration('work');
    }

    const endTime = Date.now() + time * 1000;

    const id = window.setInterval(() => {
      get().tick();
    }, 1000);

    // Backup: schedule a precise setTimeout at endTime so tick fires on time
    // even if setInterval is throttled in background tabs
    const endTid = window.setTimeout(() => {
      get().tick();
    }, time * 1000);

    set({
      isRunning: true,
      currentPhase: phase,
      timeRemaining: time,
      intervalId: id,
      endTimeoutId: endTid,
      endTime,
    });
  },

  pause: () => {
    const { intervalId, endTimeoutId, endTime } = get();
    if (intervalId !== null) clearInterval(intervalId);
    if (endTimeoutId !== null) clearTimeout(endTimeoutId);
    // Snapshot the true remaining time so resume is accurate
    const remaining = endTime ? Math.max(0, Math.ceil((endTime - Date.now()) / 1000)) : get().timeRemaining;
    set({ isRunning: false, intervalId: null, endTimeoutId: null, endTime: null, timeRemaining: remaining });
  },

  reset: () => {
    const { intervalId, endTimeoutId } = get();
    if (intervalId !== null) clearInterval(intervalId);
    if (endTimeoutId !== null) clearTimeout(endTimeoutId);
    set({
      timeRemaining: minutesToSeconds(useSettingsStore.getState().work_duration),
      currentPhase: 'idle',
      pomodoroCount: 0,
      isRunning: false,
      intervalId: null,
      endTimeoutId: null,
      endTime: null,
    });
  },

  tick: () => {
    const state = get();
    const { endTime } = state;

    // Calculate remaining from wall-clock, immune to setInterval throttling
    const newTime = endTime ? Math.max(0, Math.ceil((endTime - Date.now()) / 1000)) : state.timeRemaining - 1;

    if (newTime > 0) {
      set({ timeRemaining: newTime });
      return;
    }

    // Phase completed — show 0:00 first
    set({ timeRemaining: 0 });

    const { intervalId, endTimeoutId } = state;
    if (intervalId !== null) clearInterval(intervalId);
    if (endTimeoutId !== null) clearTimeout(endTimeoutId);

    let newPomodoroCount = state.pomodoroCount;

    if (state.currentPhase === 'work') {
      newPomodoroCount += 1;
      try {
        const settings = useSettingsStore.getState();
        addSession(settings.work_duration);
      } catch {
        // Don't let session saving break the timer
      }
    }

    const nextPhase = getNextPhase(state.currentPhase, newPomodoroCount);
    const nextDuration = getPhaseDuration(nextPhase);

    // Dispatch custom event for notification
    window.dispatchEvent(
      new CustomEvent('timer-phase-complete', {
        detail: {
          completedPhase: state.currentPhase,
          nextPhase,
          pomodoroCount: newPomodoroCount,
        },
      })
    );

    // Auto-start next phase after a short delay so user sees 0:00
    setTimeout(() => {
      const nextEndTime = Date.now() + nextDuration * 1000;

      const id = window.setInterval(() => {
        get().tick();
      }, 1000);

      const endTid = window.setTimeout(() => {
        get().tick();
      }, nextDuration * 1000);

      set({
        timeRemaining: nextDuration,
        currentPhase: nextPhase,
        pomodoroCount: newPomodoroCount,
        isRunning: true,
        intervalId: id,
        endTimeoutId: endTid,
        endTime: nextEndTime,
      });
    }, 1500);
  },
}));
