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

    const now = ctx.currentTime;

    // First beep: 800Hz
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.value = 800;
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second beep: 1000Hz
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 1000;
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.3, now + 0.3);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.start(now + 0.3);
    osc2.stop(now + 0.65);

    // Third beep: 1200Hz (higher, signals completion)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.value = 1200;
    osc3.type = 'sine';
    gain3.gain.setValueAtTime(0.3, now + 0.6);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc3.start(now + 0.6);
    osc3.stop(now + 1.05);
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
