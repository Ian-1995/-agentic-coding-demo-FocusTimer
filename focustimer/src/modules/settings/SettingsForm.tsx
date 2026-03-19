import { useState, useEffect, useCallback, useRef } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import { DEFAULT_SETTINGS } from '../../utils/constants';
import { themes, type Theme, applyTheme } from '../../utils/themes';
import { getNotificationPermission, requestNotificationPermission } from '../timer/NotificationManager';

function ThemeCard({ theme, isSelected, onSelect }: { theme: Theme; isSelected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
        isSelected
          ? 'border-[var(--color-primary)] shadow-md'
          : 'border-transparent hover:border-[var(--color-border)]'
      }`}
      style={{ backgroundColor: theme.colors.bg }}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
          style={{ backgroundColor: theme.colors.primary }}>
          ✓
        </div>
      )}

      {/* Color dots */}
      <div className="flex gap-1">
        {[theme.colors.primary, theme.colors.success, theme.colors.warning, theme.colors.textMuted].map((c, i) => (
          <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
        ))}
      </div>

      {/* Mini surface preview */}
      <div className="w-full h-5 rounded-md flex items-center px-2 gap-1" style={{ backgroundColor: theme.colors.surface }}>
        <div className="w-6 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
        <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: theme.colors.textMuted }} />
      </div>

      {/* Name */}
      <span className="text-[11px] font-medium leading-none" style={{ color: theme.colors.text }}>
        {theme.name}
      </span>
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-surface)] rounded-2xl overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.15em]">
          {title}
        </h3>
      </div>
      <div className="px-5 pb-5">
        {children}
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min, max, suffix }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-all cursor-pointer active:scale-90 text-lg leading-none"
        >
          −
        </button>
        <span className="w-10 text-center font-mono font-semibold tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-lg bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-all cursor-pointer active:scale-90 text-lg leading-none"
        >
          +
        </button>
        {suffix && <span className="text-xs text-[var(--color-text-muted)] w-8">{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-2.5 cursor-pointer group">
      <span className="text-sm">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer ${
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
        }`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`} />
      </div>
    </label>
  );
}

export default function SettingsForm() {
  const settings = useSettingsStore();

  const savedThemeRef = useRef(settings.theme);

  const [draft, setDraft] = useState({
    work_duration: settings.work_duration,
    short_break_duration: settings.short_break_duration,
    long_break_duration: settings.long_break_duration,
    long_break_interval: settings.long_break_interval,
    sound_enabled: settings.sound_enabled,
    notification_enabled: settings.notification_enabled,
    theme: settings.theme,
  });

  const [saved, setSaved] = useState(false);
  const [notifPerm, setNotifPerm] = useState(getNotificationPermission);

  // Refresh permission state when user returns to the tab (might have changed in browser settings)
  useEffect(() => {
    const refresh = () => setNotifPerm(getNotificationPermission());
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  }, []);

  // Revert theme preview if user navigates away without saving
  useEffect(() => {
    return () => {
      const store = useSettingsStore.getState();
      applyTheme(store.theme);
    };
  }, []);

  const handleRequestPermission = useCallback(async () => {
    await requestNotificationPermission();
    setNotifPerm(getNotificationPermission());
  }, []);

  const hasChanges =
    draft.work_duration !== settings.work_duration ||
    draft.short_break_duration !== settings.short_break_duration ||
    draft.long_break_duration !== settings.long_break_duration ||
    draft.long_break_interval !== settings.long_break_interval ||
    draft.sound_enabled !== settings.sound_enabled ||
    draft.notification_enabled !== settings.notification_enabled ||
    draft.theme !== savedThemeRef.current;

  const handleChange = (key: string, value: number | boolean) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleThemeSelect = (themeId: string) => {
    // Live preview — apply CSS immediately but don't persist to store yet
    applyTheme(themeId);
    setDraft((prev) => ({ ...prev, theme: themeId }));
    setSaved(false);
  };

  const handleSave = () => {
    settings.updateSettings(draft);
    savedThemeRef.current = draft.theme;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults = {
      work_duration: DEFAULT_SETTINGS.work_duration,
      short_break_duration: DEFAULT_SETTINGS.short_break_duration,
      long_break_duration: DEFAULT_SETTINGS.long_break_duration,
      long_break_interval: DEFAULT_SETTINGS.long_break_interval,
      sound_enabled: DEFAULT_SETTINGS.sound_enabled,
      notification_enabled: DEFAULT_SETTINGS.notification_enabled,
      theme: DEFAULT_SETTINGS.theme,
    };
    setDraft(defaults);
    settings.resetSettings();
    savedThemeRef.current = DEFAULT_SETTINGS.theme;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const darkThemes = themes.filter((t) => t.group === 'dark');
  const lightThemes = themes.filter((t) => t.group === 'light');

  return (
    <div className="w-full space-y-4">
      {/* Theme */}
      <SectionCard title="Theme">
        <div className="space-y-3">
          <div className="space-y-2">
            <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Dark</span>
            <div className="grid grid-cols-3 gap-2">
              {darkThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={draft.theme === theme.id}
                  onSelect={() => handleThemeSelect(theme.id)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[11px] text-[var(--color-text-muted)] font-medium">Light</span>
            <div className="grid grid-cols-2 gap-2">
              {lightThemes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isSelected={draft.theme === theme.id}
                  onSelect={() => handleThemeSelect(theme.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Timer */}
      <SectionCard title="Timer">
        <div className="divide-y divide-[var(--color-border)]">
          <NumberField label="Work" value={draft.work_duration} onChange={(v) => handleChange('work_duration', v)} min={1} max={120} suffix="min" />
          <NumberField label="Short Break" value={draft.short_break_duration} onChange={(v) => handleChange('short_break_duration', v)} min={1} max={30} suffix="min" />
          <NumberField label="Long Break" value={draft.long_break_duration} onChange={(v) => handleChange('long_break_duration', v)} min={1} max={60} suffix="min" />
          <NumberField label="Long Break After" value={draft.long_break_interval} onChange={(v) => handleChange('long_break_interval', v)} min={2} max={10} />
        </div>
      </SectionCard>

      {/* Notifications */}
      <SectionCard title="Notifications">
        <div className="divide-y divide-[var(--color-border)]">
          <ToggleField label="Sound" checked={draft.sound_enabled} onChange={(v) => handleChange('sound_enabled', v)} />
          <ToggleField label="Browser Notifications" checked={draft.notification_enabled} onChange={(v) => handleChange('notification_enabled', v)} />
        </div>
        {/* Permission status hint */}
        {draft.notification_enabled && notifPerm !== 'granted' && notifPerm !== 'unsupported' && (
          <button
            onClick={handleRequestPermission}
            className="mt-2 w-full py-2 rounded-lg text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/20 transition-colors cursor-pointer"
          >
            {notifPerm === 'denied'
              ? 'Notifications blocked — please allow in browser settings'
              : 'Click to allow notifications'}
          </button>
        )}
      </SectionCard>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] ${
            hasChanges
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md'
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] cursor-not-allowed'
          }`}
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-3 rounded-xl text-sm font-medium bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-all cursor-pointer active:scale-[0.98]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
