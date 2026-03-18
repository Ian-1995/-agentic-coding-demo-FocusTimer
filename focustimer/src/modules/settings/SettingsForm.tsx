import { useSettingsStore } from '../../stores/settingsStore';

export default function SettingsForm() {
  const settings = useSettingsStore();

  const handleChange = (key: string, value: number | boolean) => {
    settings.updateSettings({ [key]: value });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Timer durations */}
      <div className="space-y-4 bg-[var(--color-surface)] p-6 rounded-xl">
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
          Timer Duration (minutes)
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Work</span>
            <input
              type="number"
              min={1}
              max={120}
              value={settings.work_duration}
              onChange={(e) => handleChange('work_duration', Math.max(1, Math.min(120, Number(e.target.value))))}
              className="w-20 px-3 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-center"
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Short Break</span>
            <input
              type="number"
              min={1}
              max={30}
              value={settings.short_break_duration}
              onChange={(e) => handleChange('short_break_duration', Math.max(1, Math.min(30, Number(e.target.value))))}
              className="w-20 px-3 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-center"
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Long Break</span>
            <input
              type="number"
              min={1}
              max={60}
              value={settings.long_break_duration}
              onChange={(e) => handleChange('long_break_duration', Math.max(1, Math.min(60, Number(e.target.value))))}
              className="w-20 px-3 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-center"
            />
          </label>

          <label className="flex items-center justify-between">
            <span>Long Break After</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={2}
                max={10}
                value={settings.long_break_interval}
                onChange={(e) => handleChange('long_break_interval', Math.max(2, Math.min(10, Number(e.target.value))))}
                className="w-20 px-3 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-center"
              />
              <span className="text-sm text-[var(--color-text-muted)]">pomodoros</span>
            </div>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4 bg-[var(--color-surface)] p-6 rounded-xl">
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
          Notifications
        </h3>

        <label className="flex items-center justify-between cursor-pointer">
          <span>Sound</span>
          <input
            type="checkbox"
            checked={settings.sound_enabled}
            onChange={(e) => handleChange('sound_enabled', e.target.checked)}
            className="w-5 h-5 accent-[var(--color-primary)]"
          />
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span>Browser Notifications</span>
          <input
            type="checkbox"
            checked={settings.notification_enabled}
            onChange={(e) => handleChange('notification_enabled', e.target.checked)}
            className="w-5 h-5 accent-[var(--color-primary)]"
          />
        </label>
      </div>

      {/* Reset */}
      <button
        onClick={settings.resetSettings}
        className="w-full py-2 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors cursor-pointer"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
