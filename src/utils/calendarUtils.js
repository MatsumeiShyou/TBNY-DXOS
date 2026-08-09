// src/utils/calendarUtils.js

const DAYS_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const FREQ_MAP = ['1st', '2nd', '3rd', '4th', '5th'];

/**
 * 指定された年・月のすべての日付の情報を取得する
 */
export const getDaysInMonth = (year, month) => {
  const date = new Date(year, month - 1, 1);
  const days = [];
  while (date.getMonth() === month - 1) {
    const d = new Date(date);
    const dayOfWeek = DAYS_MAP[d.getDay()]; // 'mon', 'tue' etc
    const dateNum = d.getDate();
    const weekOfMonth = Math.ceil(dateNum / 7); // 1-5
    
    // YYYY-MM-DD 形式
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
 * マスタデータに基づいて、指定月のスケジュールを自動生成する
 * 
 * @param {number} year - 年
 * @param {number} month - 月 (1-12)
 * @param {Array} customers - 顧客マスタ配列
 * @returns {Object} { '2026-05-01': [job1, job2], ... }
 */
export const generateMonthlySchedule = (year, month, customers) => {
  const days = getDaysInMonth(year, month);
  const scheduleMap = {}; // { 'YYYY-MM-DD': [] }

  days.forEach(dayInfo => {
    scheduleMap[dayInfo.dateString] = [];
    
    customers.forEach(customer => {
      // スポットは自動展開の対象外
      if (customer.jobType === 'spot' || customer.isInvalid) return;

      const rulesForDay = customer.scheduleRules?.[dayInfo.dayOfWeek] || [];
      if (rulesForDay.length === 0) return;

      const freqStr = FREQ_MAP[dayInfo.weekOfMonth - 1]; // '1st', '2nd' ...

      // 'every' (毎週) か、指定された週 (例: '1st') が含まれていれば対象
      if (rulesForDay.includes('every') || rulesForDay.includes(freqStr)) {
        // ジョブを生成
        const job = {
          id: `gen_${customer.id}_${dayInfo.dateString}_${Math.floor(Math.random()*1000)}`,
          originalCustomerId: customer.id,
          title: customer.name,
          kana: customer.kana || '',
          area: customer.area || '',
          duration: customer.defaultDuration || 30,
          preferredTime: customer.preferredTime || '',
          requiredVehicle: customer.requiredVehicle || '',
          note: customer.note || '',
          items: customer.items || [],
          // 祝日休業設定などを引き継ぐ
          holidayCollection: customer.holidayCollection || false
        };
        scheduleMap[dayInfo.dateString].push(job);
      }
    });
  });

  return scheduleMap;
};
