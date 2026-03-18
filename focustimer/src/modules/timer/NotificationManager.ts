import { type TimerPhase, PHASE_LABELS } from '../../utils/constants';

let audioContext: AudioContext | null = null;
let audioUnlocked = false;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function unlockAudio(): void {
  if (audioUnlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    // Play silent buffer to unlock
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    audioUnlocked = true;
  } catch {
    // Ignore errors
  }
}

export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start();

    // Two-tone notification
    setTimeout(() => {
      oscillator.frequency.value = 1000;
    }, 200);

    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      setTimeout(() => oscillator.stop(), 500);
    }, 400);
  } catch {
    // Fallback: do nothing if audio fails
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function showBrowserNotification(completedPhase: TimerPhase, nextPhase: TimerPhase, pomodoroCount: number): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const title = completedPhase === 'work'
    ? `Pomodoro #${pomodoroCount} Complete!`
    : `${PHASE_LABELS[completedPhase]} Over!`;

  const body = `Time for ${PHASE_LABELS[nextPhase]}`;

  new Notification(title, {
    body,
    icon: '/vite.svg',
    tag: 'focustimer',
  });
}
