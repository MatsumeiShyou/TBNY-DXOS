import { describe, it, expect } from 'vitest';
import { generateDailySchedule, getDaysInMonth, getDummyDate, ExtendedCustomer } from './calendarUtils';

describe('calendarUtils', () => {
  describe('getDaysInMonth', () => {
    it('指定した年月のすべての日付情報を返すこと', () => {
      // 2026年10月 (10/1は木曜日)
      const days = getDaysInMonth(2026, 10);
      expect(days.length).toBe(31);
      
      expect(days[0]).toMatchObject({
        dateString: '2026-10-01',
        dayOfWeek: 'thu',
        weekOfMonth: 1,
        dateNum: 1
      });

      // 10月31日は土曜日、第5週
      expect(days[30]).toMatchObject({
        dateString: '2026-10-31',
        dayOfWeek: 'sat',
        weekOfMonth: 5,
        dateNum: 31
      });
    });
  });

  describe('getDummyDate', () => {
    it('指定した週と曜日に合致する2026年の日付を返すこと', () => {
      // 2026年1月1日は木曜日
      // 第1月曜日は 1/5
      expect(getDummyDate(1, 'mon')).toBe('2026-01-05');
      // 第3水曜日は 1/21
      expect(getDummyDate(3, 'wed')).toBe('2026-01-21');
    });
  });

  describe('generateDailySchedule', () => {
    const mockCustomers: ExtendedCustomer[] = [
      {
        id: 'c_1',
        name: 'Every Monday',
        scheduleRules: { mon: ['every'] },
        jobType: 'regular'
      },
      {
        id: 'c_2',
        name: 'First Monday',
        scheduleRules: { mon: ['1st'] },
        jobType: 'regular'
      },
      {
        id: 'c_3',
        name: 'Second Monday',
        scheduleRules: { mon: ['2nd'] },
        jobType: 'regular'
      },
      {
        id: 'c_4',
        name: 'Spot Customer',
        scheduleRules: { mon: ['every'] },
        jobType: 'spot' // spotなので無視されるべき
      },
      {
        id: 'c_5',
        name: 'Invalid Customer',
        scheduleRules: { mon: ['every'] },
        jobType: 'regular',
        isInvalid: true // 無効なので無視されるべき
      }
    ];

    it('指定した日付のスケジュールルールに合致する顧客のジョブを生成すること', () => {
      // 2026-10-05は第1月曜日
      const jobs = generateDailySchedule('2026-10-05', mockCustomers);
      
      const jobNames = jobs.map(j => j.title);
      expect(jobNames).toContain('Every Monday');
      expect(jobNames).toContain('First Monday');
      expect(jobNames).not.toContain('Second Monday'); // 第2月曜ではない
      expect(jobNames).not.toContain('Spot Customer'); // spotなので除外
      expect(jobNames).not.toContain('Invalid Customer'); // 無効なので除外
    });

    it('cancellationsに含まれる顧客は除外されること', () => {
      // 2026-10-05は第1月曜日
      const jobs = generateDailySchedule('2026-10-05', mockCustomers, ['c_1']);
      
      const jobNames = jobs.map(j => j.title);
      expect(jobNames).not.toContain('Every Monday'); // cancellationにより除外
      expect(jobNames).toContain('First Monday');
    });

    it('spotJobsForDayに含まれる顧客は除外されること', () => {
      // 2026-10-05は第1月曜日
      const spotJobs = [{ originalCustomerId: 'c_2' }];
      const jobs = generateDailySchedule('2026-10-05', mockCustomers, [], spotJobs);
      
      const jobNames = jobs.map(j => j.title);
      expect(jobNames).toContain('Every Monday');
      expect(jobNames).not.toContain('First Monday'); // spotJobが登録されているため除外
    });

    it('該当する曜日以外の日は空の配列を返すこと', () => {
      // 2026-10-06は火曜日
      const jobs = generateDailySchedule('2026-10-06', mockCustomers);
      expect(jobs.length).toBe(0);
    });
  });
});
