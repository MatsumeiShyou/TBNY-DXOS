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
 * マスタデータに基づいて、指定された単一日のスケジュールを自動生成する
 * 
 * @param {string} dateString - 'YYYY-MM-DD' 形式の日付文字列
 * @param {Array} customers - 顧客マスタ配列
 * @param {Array} cancellations - 休止する顧客IDの配列 (オプション)
 * @returns {Array} 生成されたジョブの配列
 */
export const generateDailySchedule = (dateString, customers, cancellations = []) => {
  const d = new Date(dateString);
  const dayOfWeek = DAYS_MAP[d.getDay()];
  const dateNum = d.getDate();
  const weekOfMonth = Math.ceil(dateNum / 7);
  const freqStr = FREQ_MAP[weekOfMonth - 1];

  const dailyJobs = [];

  customers.forEach(customer => {
    // スポット、無効化済み、またはキャンセル(休止)に指定されている顧客は除外
    if (customer.jobType === 'spot' || customer.isInvalid || cancellations.includes(customer.id)) return;

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
