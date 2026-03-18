import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';
import { applyTheme } from '../utils/themes';

interface SettingsState {
  work_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  long_break_interval: number;
  sound_enabled: boolean;
  notification_enabled: boolean;
  theme: string;
  updateSettings: (settings: Partial<SettingsState>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings) => {
        if (settings.theme) {
          applyTheme(settings.theme);
        }
        set(settings);
      },
      resetSettings: () => {
        applyTheme(DEFAULT_SETTINGS.theme);
        set(DEFAULT_SETTINGS);
      },
    }),
    {
      name: STORAGE_KEYS.settings,
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyTheme(state.theme);
        }
      },
    }
  )
);
