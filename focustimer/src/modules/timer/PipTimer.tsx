import { useState, useEffect, useCallback, useRef } from 'react';
import { useTimerStore } from '../../stores/timerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { formatTime } from '../../utils/time';
import { PHASE_LABELS, PHASE_COLORS } from '../../utils/constants';
import { getThemeById } from '../../utils/themes';

function isPipSupported(): boolean {
  return 'documentPictureInPicture' in window;
}

export default function PipTimer() {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const intervalRef = useRef<number | null>(null);

  const closePip = useCallback(() => {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
    }
    setPipWindow(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [pipWindow]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!pipWindow) return;
    const handleClose = () => {
      setPipWindow(null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    pipWindow.addEventListener('pagehide', handleClose);
    return () => pipWindow.removeEventListener('pagehide', handleClose);
  }, [pipWindow]);

  const openPip = useCallback(async () => {
    if (pipWindow && !pipWindow.closed) {
      closePip();
      return;
    }

    try {
      // @ts-expect-error Document PiP API types not yet in TS lib
      const pip: Window = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 100,
      });

      const doc = pip.document;
      doc.title = 'FocusTimer';

      // Read current theme colors
      const themeId = useSettingsStore.getState().theme;
      const theme = getThemeById(themeId);
      const c = theme.colors;

      const style = doc.createElement('style');
      style.id = 'pip-theme';
      style.textContent = buildPipStyles(c);
      doc.head.appendChild(style);

      doc.body.innerHTML = `
        <div class="container">
          <div class="time" id="t">--:--</div>
          <div class="right">
            <div class="phase" id="p">Ready</div>
            <div class="track"><div class="bar" id="b"></div></div>
          </div>
          <div class="btns">
            <button class="btn toggle" id="tog">▶</button>
            <button class="btn rst" id="res">↺</button>
          </div>
        </div>
      `;

      doc.getElementById('tog')!.addEventListener('click', () => {
        const s = useTimerStore.getState();
        s.isRunning ? s.pause() : s.start();
      });

      doc.getElementById('res')!.addEventListener('click', () => {
        useTimerStore.getState().reset();
      });

      let prevThemeId = themeId;

      const update = () => {
        if (pip.closed) return;

        const state = useTimerStore.getState();
        const settings = useSettingsStore.getState();

        // Sync theme if changed
        if (settings.theme !== prevThemeId) {
          prevThemeId = settings.theme;
          const newTheme = getThemeById(settings.theme);
          const styleEl = doc.getElementById('pip-theme');
          if (styleEl) {
            styleEl.textContent = buildPipStyles(newTheme.colors);
          }
        }

        const tEl = doc.getElementById('t');
        const pEl = doc.getElementById('p');
        const bEl = doc.getElementById('b');
        const togEl = doc.getElementById('tog') as HTMLButtonElement | null;

        if (!tEl || !pEl || !bEl || !togEl) return;

        // Calculate real remaining time from endTime (immune to background throttling)
        let remaining = state.timeRemaining;
        if (state.isRunning && state.endTime) {
          remaining = Math.max(0, Math.ceil((state.endTime - Date.now()) / 1000));
        }

        tEl.textContent = formatTime(remaining);
        pEl.textContent = PHASE_LABELS[state.currentPhase];
        pEl.style.color = PHASE_COLORS[state.currentPhase];
        bEl.style.backgroundColor = PHASE_COLORS[state.currentPhase];

        let total = settings.work_duration * 60;
        if (state.currentPhase === 'shortBreak') total = settings.short_break_duration * 60;
        if (state.currentPhase === 'longBreak') total = settings.long_break_duration * 60;
        const pct = state.currentPhase === 'idle' ? 0 : ((total - remaining) / total) * 100;
        bEl.style.width = `${pct}%`;

        if (state.isRunning) {
          togEl.textContent = '❚❚';
          togEl.className = 'btn toggle paused';
        } else {
          togEl.textContent = '▶';
          togEl.className = 'btn toggle';
        }
      };

      update();
      // Use PiP window's own setInterval — it has its own event loop,
      // not throttled by the parent tab being in background
      intervalRef.current = pip.setInterval(update, 500);
      setPipWindow(pip);
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  }, [pipWindow, closePip]);

  if (!isPipSupported()) return null;

  const isActive = pipWindow && !pipWindow.closed;

  return (
    <button
      onClick={isActive ? closePip : openPip}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer text-sm ${
        isActive
          ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
          : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
      }`}
      title={isActive ? 'Close floating timer' : 'Float timer on screen'}
    >
      {isActive ? '📌' : '🪟'}
    </button>
  );
}

/** Build CSS for PiP window using current theme colors */
function buildPipStyles(c: { bg: string; surface: string; surfaceHover: string; text: string; textMuted: string; border: string; primary: string; warning: string }) {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      background: ${c.bg};
      color: ${c.text};
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 10px 16px;
      user-select: none;
      overflow: hidden;
    }
    .container {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 100%;
    }
    .time {
      font-size: 32px;
      font-weight: 700;
      font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
      font-variant-numeric: tabular-nums;
      letter-spacing: -0.5px;
      line-height: 1;
      white-space: nowrap;
    }
    .right {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }
    .phase {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
    .track {
      width: 100%;
      height: 3px;
      background: ${c.border};
      border-radius: 2px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      border-radius: 2px;
      transition: width 1s linear;
    }
    .btns {
      display: flex;
      gap: 5px;
    }
    .btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: opacity 0.15s, transform 0.1s;
      color: white;
    }
    .btn:hover { opacity: 0.85; }
    .btn:active { transform: scale(0.9); }
    .toggle { background: ${c.primary}; }
    .toggle.paused { background: ${c.warning}; }
    .rst { background: ${c.surface}; color: ${c.textMuted}; font-size: 11px; }
    .rst:hover { background: ${c.surfaceHover}; }
  `;
}
