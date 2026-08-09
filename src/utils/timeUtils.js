export const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (totalMinutes) => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

export const getHashIndex = (str, max) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
};

// ==========================================
// 希望時間 (preferredTime) 拡張ロジック
// ==========================================

export const parsePreferredTime = (prefStr) => {
  if (!prefStr) return { type: 'none' };
  
  if (prefStr.includes('-')) {
    const [start, end] = prefStr.split('-');
    return { type: 'between', start, end };
  } else if (prefStr.startsWith('~')) {
    return { type: 'before', time: prefStr.slice(1) };
  } else if (prefStr.endsWith('~')) {
    return { type: 'after', time: prefStr.slice(0, -1) };
  } else {
    // 下位互換性（既存の古い形式 '9:00' 等）
    return { type: 'exact', time: prefStr };
  }
};

export const formatPreferredTime = (prefStr) => {
  const parsed = parsePreferredTime(prefStr);
  switch (parsed.type) {
    case 'between': return `${parsed.start}〜${parsed.end}`;
    case 'before': return `${parsed.time}までに完了`;
    case 'after': return `${parsed.time}以降に開始`;
    case 'exact': return `${parsed.time}頃`;
    default: return '';
  }
};

export const isTimeWarning = (startTimeStr, durationMinutes, prefStr) => {
  const parsed = parsePreferredTime(prefStr);
  if (parsed.type === 'none') return false;

  const startMins = timeToMinutes(startTimeStr);
  const endMins = startMins + (Number(durationMinutes) || 0);

  switch (parsed.type) {
    case 'between': {
      const prefStart = timeToMinutes(parsed.start);
      const prefEnd = timeToMinutes(parsed.end);
      // 開始時間が範囲外なら警告
      if (startMins < prefStart || startMins > prefEnd) return true;
      return false;
    }
    case 'before': {
      const prefTime = timeToMinutes(parsed.time);
      // 回収開始が指定時間を超えていれば警告
      if (startMins > prefTime) return true;
      return false;
    }
    case 'after': {
      const prefTime = timeToMinutes(parsed.time);
      // 開始時間が指定時間より早ければ警告
      if (startMins < prefTime) return true;
      return false;
    }
    case 'exact': {
      const prefTime = timeToMinutes(parsed.time);
      // 従来通り、開始時間が15分以上ズレていれば警告
      if (Math.abs(startMins - prefTime) > 15) return true;
      return false;
    }
    default:
      return false;
  }
};
