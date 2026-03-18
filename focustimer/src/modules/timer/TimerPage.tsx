import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import PipTimer from './PipTimer';

export default function TimerPage() {
  return (
    <div className="flex flex-col items-center gap-6 pt-4">
      <TimerDisplay />
      <TimerControls />
      {/* Float button — subtle, below main controls */}
      <PipTimer />
    </div>
  );
}
