import { type TimerPhase } from './constants';

// 溫和提醒型 — shown during work/focus
const WORK_QUOTES = [
  '下一個目標之前，先確認自己還舒服。',
  '今天也不用贏過誰，只要維持清醒與平衡。',
];

// 文藝型 + 價值型 — shown during breaks
const BREAK_QUOTES = [
  '世界可以晚一點完成，你要先好好存在。',
  '今天的進度，不必快過你的呼吸。',
  '把時間留給重要的事，也留給還在努力的自己。',
  '工作只是生活的一部分，不是全部的答案。',
  '先照顧好自己，效率才有意義。',
  '完成很重要，但平穩更值得被優先考慮。',
  '真正長久的前進，不建立在透支之上。',
  '過得穩，才能走得遠。',
];

const ALL_QUOTES = [...WORK_QUOTES, ...BREAK_QUOTES];

/** Pick a random quote from the appropriate pool based on phase */
export function getQuoteForPhase(phase: TimerPhase): string {
  switch (phase) {
    case 'work':
      return WORK_QUOTES[Math.floor(Math.random() * WORK_QUOTES.length)];
    case 'shortBreak':
    case 'longBreak':
      return BREAK_QUOTES[Math.floor(Math.random() * BREAK_QUOTES.length)];
    default:
      return ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
  }
}
