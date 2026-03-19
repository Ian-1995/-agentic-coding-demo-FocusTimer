import { useState, useEffect, useRef, useCallback } from 'react';
import { useTimerStore } from '../../stores/timerStore';
import { getQuoteForPhase } from '../../utils/quotes';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import PipTimer from './PipTimer';

const QUOTE_ROTATE_MS = 3 * 60 * 1000; // 3 minutes

export default function TimerPage() {
  const currentPhase = useTimerStore((s) => s.currentPhase);
  const [quote, setQuote] = useState(() => getQuoteForPhase(currentPhase));
  const [visible, setVisible] = useState(true);
  const prevPhaseRef = useRef(currentPhase);

  const rotateQuote = useCallback((phase: string) => {
    setVisible(false);
    setTimeout(() => {
      setQuote(getQuoteForPhase(phase as Parameters<typeof getQuoteForPhase>[0]));
      setVisible(true);
    }, 300);
  }, []);

  // Rotate on phase change
  useEffect(() => {
    if (currentPhase !== prevPhaseRef.current) {
      prevPhaseRef.current = currentPhase;
      rotateQuote(currentPhase);
    }
  }, [currentPhase, rotateQuote]);

  // Auto-rotate every 3 minutes
  useEffect(() => {
    const id = setInterval(() => {
      rotateQuote(prevPhaseRef.current);
    }, QUOTE_ROTATE_MS);
    return () => clearInterval(id);
  }, [rotateQuote]);

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
