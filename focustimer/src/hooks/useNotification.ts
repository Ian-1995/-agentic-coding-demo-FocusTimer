import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { useTimerStore } from '../stores/timerStore';
import {
  playNotificationSound,
  showBrowserNotification,
  requestNotificationPermission,
} from '../modules/timer/NotificationManager';
import { type TimerPhase } from '../utils/constants';

export function useNotification(): void {
  const soundEnabled = useSettingsStore((s) => s.sound_enabled);
  const notificationEnabled = useSettingsStore((s) => s.notification_enabled);

  useEffect(() => {
    if (notificationEnabled) {
      requestNotificationPermission();
    }
  }, [notificationEnabled]);

  useEffect(() => {
    function handlePhaseComplete(e: Event) {
      const detail = (e as CustomEvent).detail as {
        completedPhase: TimerPhase;
        nextPhase: TimerPhase;
        pomodoroCount: number;
      };

      if (soundEnabled) {
        playNotificationSound();
      }

      if (notificationEnabled) {
        showBrowserNotification(
          detail.completedPhase,
          detail.nextPhase,
          detail.pomodoroCount
        );
      }
    }

    window.addEventListener('timer-phase-complete', handlePhaseComplete);
    return () => window.removeEventListener('timer-phase-complete', handlePhaseComplete);
  }, [soundEnabled, notificationEnabled]);

  // When user returns to the tab, force a tick so any missed phase-complete fires immediately
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        const state = useTimerStore.getState();
        if (state.isRunning) {
          state.tick();
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
}
