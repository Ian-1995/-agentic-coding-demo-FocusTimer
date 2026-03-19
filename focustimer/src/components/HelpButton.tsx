import { useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const TIPS = [
  {
    icon: '⏱',
    title: 'Start Timer',
    description: 'Press the play button to begin a Pomodoro session.',
  },
  {
    icon: '⚙',
    title: 'Customize',
    description: 'Adjust timer duration and themes in Settings.',
  },
  {
    icon: '🪟',
    title: 'Stay Focused',
    description: 'Use the floating mini window to keep the timer visible.',
  },
];

interface HelpButtonProps {
  onResetOnboarding?: () => void;
}

export default function HelpButton({ onResetOnboarding }: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  const resetGuide = () => {
    localStorage.removeItem(STORAGE_KEYS.onboarding);
    setOpen(false);
    onResetOnboarding?.();
  };

  return (
    <>
      {/* Help trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] text-sm font-semibold transition-all flex items-center justify-center cursor-pointer"
        aria-label="Help"
      >
        ?
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-[90] bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in panel */}
      <div
        className="absolute top-0 right-0 z-[95] h-full w-[300px] bg-[var(--color-surface)] border-l border-[var(--color-border)] shadow-2xl flex flex-col"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-[var(--color-border)] shrink-0">
          <span className="text-sm font-bold text-[var(--color-text)]">Help</span>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition-colors text-lg cursor-pointer"
            aria-label="Close help panel"
          >
            &times;
          </button>
        </div>

        {/* Tips list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">
            {TIPS.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]"
              >
                <span className="text-2xl leading-none mt-0.5">{tip.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text)]">
                    {tip.title}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {tip.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reset button */}
        <div className="px-4 py-4 border-t border-[var(--color-border)] shrink-0">
          <button
            onClick={resetGuide}
            className="w-full py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)] transition-all cursor-pointer"
          >
            Reset Guide
          </button>
        </div>
      </div>
    </>
  );
}
