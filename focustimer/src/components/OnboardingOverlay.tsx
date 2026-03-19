import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const STEPS = [
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

export default function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEYS.onboarding);
    if (done !== 'true') {
      setVisible(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEYS.onboarding, 'true');
    setVisible(false);
  };

  const goTo = (nextStep: number) => {
    if (animating) return;
    setDirection(nextStep > step ? 'next' : 'prev');
    setAnimating(true);
    setTimeout(() => {
      setStep(nextStep);
      setAnimating(false);
    }, 200);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 w-[320px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-2xl"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating
            ? `translateX(${direction === 'next' ? '20px' : '-20px'})`
            : 'translateX(0)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <span className="text-5xl">{current.icon}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-[var(--color-text)] mb-2">
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-center text-[var(--color-text-muted)] mb-8">
          {current.description}
        </p>

        {/* Action button */}
        <button
          onClick={isLast ? close : () => goTo(step + 1)}
          className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
        >
          {isLast ? 'Get Started' : 'Next'}
        </button>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === step
                  ? 'bg-[var(--color-primary)] w-4'
                  : 'bg-[var(--color-text-muted)]/40 hover:bg-[var(--color-text-muted)]/70'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Skip link */}
        {!isLast && (
          <button
            onClick={close}
            className="block mx-auto mt-3 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
