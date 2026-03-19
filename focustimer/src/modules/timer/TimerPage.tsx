import { useState, useEffect, useRef } from 'react';
import { useTimerStore } from '../../stores/timerStore';
import { getQuoteForPhase } from '../../utils/quotes';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import PipTimer from './PipTimer';

export default function TimerPage() {
  const currentPhase = useTimerStore((s) => s.currentPhase);
  const [quote, setQuote] = useState(() => getQuoteForPhase(currentPhase));
  const [visible, setVisible] = useState(true);
  const prevPhaseRef = useRef(currentPhase);

  useEffect(() => {
    if (currentPhase !== prevPhaseRef.current) {
      prevPhaseRef.current = currentPhase;
      // Fade out, swap quote, fade in
      setVisible(false);
      const timer = setTimeout(() => {
        setQuote(getQuoteForPhase(currentPhase));
        setVisible(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentPhase]);

  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <TimerDisplay />
      {/* Motivational quote */}
      <p
        className="text-xs italic text-[var(--color-text-muted)] text-center px-6 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        「{quote}」
      </p>
      <TimerControls />
      {/* Float button — subtle, below main controls */}
      <PipTimer />
    </div>
  );
}
