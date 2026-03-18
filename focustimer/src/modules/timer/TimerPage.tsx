import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TaskSelector from './TaskSelector';

export default function TimerPage() {
  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <TimerDisplay />
      <TimerControls />
      <TaskSelector />
    </div>
  );
}
