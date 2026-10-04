// src/utils/calendarUtils.ts

import { Customer } from '../types';

const DAYS_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const FREQ_MAP = ['1st', '2nd', '3rd', '4th', '5th'];

export interface DayInfo {
  date: Date;
  dateString: string;
  dayOfWeek: string;
  weekOfMonth: number;
  dateNum: number;
}

export interface ExtendedCustomer extends Customer {
  jobType?: 'spot' | 'regular';
  isInvalid?: boolean;
  scheduleRules?: Record<string, string[]>;
  kana?: string;
  note?: string;
  items?: any[];
  holidayCollection?: boolean;
  preferredTime?: string;
}

export interface GeneratedJob {
  id: string;
  originalCustomerId: string;
  title: string;
  kana: string;
  area: string;
  duration: number;
  preferredTime: string;
  requiredVehicle: string;
  note: string;
  items: any[];
  holidayCollection: boolean;
  jobType: 'regular';
}

/**
 * 謖�ｮ壹＆繧後◆蟷ｴ繝ｻ譛医�縺吶∋縺ｦ縺ｮ譌･莉倥�諠��ｱ繧貞叙蠕励☆繧�
 */
export const getDaysInMonth = (year: number, month: number): DayInfo[] => {
  const date = new Date(year, month - 1, 1);
  const days: DayInfo[] = [];
  while (date.getMonth() === month - 1) {
    const d = new Date(date);
    const dayOfWeek = DAYS_MAP[d.getDay()]; // 'mon', 'tue' etc
    const dateNum = d.getDate();
    const weekOfMonth = Math.ceil(dateNum / 7); // 1-5
    
    // YYYY-MM-DD 蠖｢蠑�
    const dateString = `${year}-${String(month).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
    
    days.push({
      date: d,
      dateString,
      dayOfWeek,
      weekOfMonth,
      dateNum
    });
    date.setDate(date.getDate() + 1);
  }
  return days;
};

/**
 * 繝槭せ繧ｿ繝��繧ｿ縺ｫ蝓ｺ縺･縺�※縲∵欠螳壹＆繧後◆蜊倅ｸ譌･縺ｮ繧ｹ繧ｱ繧ｸ繝･繝ｼ繝ｫ繧定�蜍慕函謌舌☆繧�
 * 
 * @param dateString - 'YYYY-MM-DD' 蠖｢蠑上�譌･莉俶枚蟄怜�
 * @param customers - 鬘ｧ螳｢繝槭せ繧ｿ驟榊�
 * @param cancellations - 莨第ｭ｢縺吶ｋ鬘ｧ螳｢ID縺ｮ驟榊� (繧ｪ繝励す繝ｧ繝ｳ)
 * @returns 逕滓�縺輔ｌ縺溘ず繝ｧ繝悶�驟榊�
 */
export const generateDailySchedule = (
  dateString: string,
  customers: ExtendedCustomer[],
  cancellations: string[] = [],
  spotJobsForDay: any[] = []
): GeneratedJob[] => {
  const d = new Date(dateString);
  const dayOfWeek = DAYS_MAP[d.getDay()];
  const dateNum = d.getDate();
  const weekOfMonth = Math.ceil(dateNum / 7);
  const freqStr = FREQ_MAP[weekOfMonth - 1];

  const dailyJobs: GeneratedJob[] = [];

  customers.forEach(customer => {
    // 繧ｹ繝昴ャ繝医∫┌蜉ｹ蛹匁ｸ医∩縲√∪縺溘�繧ｭ繝｣繝ｳ繧ｻ繝ｫ(莨第ｭ｢)縺ｫ謖�ｮ壹＆繧後※縺�ｋ鬘ｧ螳｢縺ｯ髯､螟�
    if (customer.jobType === 'spot' || customer.isInvalid || cancellations.includes(customer.id)) return;
    
    // 繧ｹ繝昴ャ繝域｡井ｻｶ縺梧里縺ｫ蟄伜惠縺吶ｋ蝣ｴ蜷医�螳壽悄繧ｸ繝ｧ繝悶�逕滓�繧偵せ繧ｭ繝��
    if (spotJobsForDay.some(j => j.originalCustomerId === customer.id)) return;

    const rulesForDay = customer.scheduleRules?.[dayOfWeek] || [];
    if (rulesForDay.length === 0) return;

    if (rulesForDay.includes('every') || rulesForDay.includes(freqStr)) {
      dailyJobs.push({
        id: `gen_${customer.id}_${dateString}_${Math.floor(Math.random()*1000)}`,
        originalCustomerId: customer.id,
        title: customer.name,
        kana: customer.kana || '',
        area: customer.area || '',
        duration: customer.defaultDuration || 30,
        preferredTime: customer.preferredTime || '',
        requiredVehicle: customer.requiredVehicle || '',
        note: customer.note || '',
        items: customer.items || [],
        holidayCollection: customer.holidayCollection || false,
        jobType: 'regular'
      });
    }
  });

  return dailyJobs;
};

/**
 * テンプレート生成用に、指定された第n曜日に合致するダミー日付（YYYY-MM-DD）を取得する。
 * 例: targetWeek=1, targetDayOfWeek='mon' の場合、「2026年内の最初の第1月曜日」を返す。
 */
export const getDummyDate = (targetWeek: number, targetDayOfWeek: string): string => {
  const targetDayIndex = Object.keys(DAYS_MAP).find(k => DAYS_MAP[Number(k)] === targetDayOfWeek);
  if (!targetDayIndex) return '2026-01-01'; // fallback
  const targetDay = parseInt(targetDayIndex);

  // 2026年の1月?12月をスキャンして条件に合致する日を探す
  for (let month = 0; month < 12; month++) {
    for (let date = 1; date <= 31; date++) {
      const d = new Date(2026, month, date);
      if (d.getMonth() !== month) break; // End of month
      
      const currentWeek = Math.ceil(date / 7);
      if (d.getDay() === targetDay && currentWeek === targetWeek) {
        return `2026-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
      }
    }
  }
  return '2026-01-01'; // Should never happen for week 1-5
};
