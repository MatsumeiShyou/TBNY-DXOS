import { describe, it, expect } from 'vitest';
import { timeToMinutes, minutesToTime, isTimeWarning } from './timeUtils';

describe('timeUtils', () => {
  it('timeToMinutes converts string to minutes', () => {
    expect(timeToMinutes('06:30')).toBe(390);
  });

  it('minutesToTime converts minutes to string', () => {
    expect(minutesToTime(390)).toBe('6:30');
  });

  it('isTimeWarning works correctly', () => {
    expect(isTimeWarning('09:00', 30, '09:00')).toBe(false);
    expect(isTimeWarning('09:30', 30, '09:00')).toBe(true);
  });
});
