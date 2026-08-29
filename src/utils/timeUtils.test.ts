import { timeToMinutes, minutesToTime, isTimeWarning } from './timeUtils';

// T2ルートの要件（回帰テストの追加）を満たすためのテストファイル
// 現在の環境には test ランナーがないため、関数での簡易チェックとして実装します。

export function runTests() {
  const result1 = timeToMinutes('06:30');
  if (result1 !== 390) throw new Error('timeToMinutes failed');

  const result2 = minutesToTime(390);
  if (result2 !== '6:30') throw new Error('minutesToTime failed');

  // Exact match
  if (isTimeWarning('09:00', 30, '09:00')) throw new Error('isTimeWarning failed');
  
  // > 15 mins off
  if (!isTimeWarning('09:30', 30, '09:00')) throw new Error('isTimeWarning failed');
}
// Checked Step 3 Integration
