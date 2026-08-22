import React, { useState, useEffect } from 'react';
import { X, Search, RefreshCw } from 'lucide-react';

// 日付フォーマット YYYY-MM-DD
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const DAY_MAP = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
};

const DAY_LABELS = [
  { id: 'mon', label: '月' },
  { id: 'tue', label: '火' },
  { id: 'wed', label: '水' },
  { id: 'thu', label: '木' },
  { id: 'fri', label: '金' },
  { id: 'sat', label: '土' },
  { id: 'sun', label: '日' },
];

export default function SpotRegistrationModal({ isOpen, onClose, onSave, targetDate, masterCustomers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // 繰り返し設定ステート
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringIntervalType, setRecurringIntervalType] = useState('weeks'); // 'weeks' or 'days'
  const [recurringDays, setRecurringDays] = useState([]);
  const [recurringEndDate, setRecurringEndDate] = useState('');

  // モーダルが開くたびに初期化
  useEffect(() => {
    if (isOpen && targetDate) {
      setSearchTerm('');
      setSelectedCustomerId('');
      setIsRecurring(false);
      setRecurringInterval(1);
      setRecurringIntervalType('weeks');
      
      const tDate = new Date(targetDate);
      setRecurringDays([DAY_MAP[tDate.getDay()]]);
      
      const eDate = new Date(tDate);
      eDate.setMonth(eDate.getMonth() + 1);
      setRecurringEndDate(formatDate(eDate));
    }
  }, [isOpen, targetDate]);

  if (!isOpen) return null;

  const filteredCustomers = masterCustomers.filter(c => 
    c.name.includes(searchTerm) || (c.kana && c.kana.includes(searchTerm))
  );

  const toggleDay = (dayId) => {
    setRecurringDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const calculateDates = () => {
    if (!isRecurring) return [targetDate];

    const dates = [];
    const start = new Date(targetDate);
    const end = new Date(recurringEndDate);
    
    // 最大12ヶ月の制限
    const maxDate = new Date(targetDate);
    maxDate.setMonth(maxDate.getMonth() + 12);
    const actualEnd = end > maxDate ? maxDate : end;

    const targetDayInts = recurringDays.map(d => Object.keys(DAY_MAP).find(k => DAY_MAP[k] === d)).map(Number);

    if (recurringIntervalType === 'days') {
      let current = new Date(start);
      while (current <= actualEnd) {
        dates.push(formatDate(current));
        current.setDate(current.getDate() + recurringInterval);
      }
    } else if (recurringIntervalType === 'weeks') {
      let current = new Date(start);
      let weekStart = new Date(current);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      while (current <= actualEnd) {
        if (targetDayInts.includes(current.getDay()) && current >= start) {
          dates.push(formatDate(current));
        }
        current.setDate(current.getDate() + 1);
        
        if (current.getDay() === 0) {
          if (recurringInterval > 1) {
            current.setDate(current.getDate() + (recurringInterval - 1) * 7);
          }
        }
      }
    }
    
    // 重複を弾く（念のため）
    return [...new Set(dates)].sort();
  };

  const handleSave = () => {
    if (!selectedCustomerId) {
      alert('顧客を選択してください');
      return;
    }
    if (isRecurring) {
      if (recurringDays.length === 0 && recurringIntervalType === 'weeks') {
        alert('曜日を選択してください');
        return;
      }
      if (!recurringEndDate) {
        alert('終了日を選択してください');
        return;
      }
    }

    const customer = masterCustomers.find(c => c.id === selectedCustomerId);
    const targetDates = calculateDates();

    if (targetDates.length === 0) {
      alert('指定された条件で生成される日付がありません。');
      return;
    }

    // seriesIdの生成 (繰り返しの場合は共通IDを付与)
    const seriesId = isRecurring && targetDates.length > 1 ? `series_${Date.now()}` : null;
    
    const baseSpotJob = {
      originalCustomerId: customer.id,
      title: customer.name,
      kana: customer.kana || '',
      area: customer.area || '',
      duration: customer.defaultDuration || 30,
      preferredTime: customer.preferredTime || '',
      requiredVehicle: customer.requiredVehicle || '',
      note: customer.note || '',
      items: customer.items || [],
      jobType: 'spot'
    };

    if (seriesId) {
      baseSpotJob.seriesId = seriesId;
    }

    // targetDatesの配列を渡す仕様に変更 (useDataStore側で対応)
    onSave(targetDates, baseSpotJob);
    onClose();
  };

  // 12ヶ月後の日付を計算 (inputのmax属性用)
  const maxDateStr = React.useMemo(() => {
    if(!targetDate) return '';
    const d = new Date(targetDate);
    d.setMonth(d.getMonth() + 12);
    return formatDate(d);
  }, [targetDate]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col h-auto max-h-[95vh] pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            スポット案件の追加 <span className="text-sm font-normal text-gray-500">({targetDate})</span>
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-6">
          {/* 顧客検索セクション */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700">顧客の検索</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="顧客名やカナで検索..."
                className="w-full border rounded p-2 pl-9 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="border rounded overflow-y-auto h-40">
              {filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">顧客が見つかりません</div>
              ) : (
                <div className="flex flex-col">
                  {filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className={`text-left p-3 border-b hover:bg-blue-50 transition-colors ${selectedCustomerId === c.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
                    >
                      <div className="font-bold text-gray-800 text-sm">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.kana} / {c.area}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 繰り返し設定セクション */}
          <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg border">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-bold text-gray-700 flex items-center gap-1">
                <RefreshCw size={14} className={isRecurring ? 'text-blue-600' : 'text-gray-400'}/>
                繰り返し設定を有効にする
              </span>
            </label>

            {isRecurring && (
              <div className="flex flex-col gap-4 mt-2 pt-4 border-t animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-24">繰り返す間隔:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="99"
                    value={recurringInterval}
                    onChange={(e) => setRecurringInterval(Math.max(1, parseInt(e.target.value) || 1))}
                    className="border rounded p-1.5 w-16 text-center text-sm"
                  />
                  <select 
                    value={recurringIntervalType}
                    onChange={(e) => setRecurringIntervalType(e.target.value)}
                    className="border rounded p-1.5 text-sm bg-white"
                  >
                    <option value="weeks">週間ごと</option>
                    <option value="days">日間ごと</option>
                  </select>
                </div>

                {recurringIntervalType === 'weeks' && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-600 w-24">曜日:</label>
                    <div className="flex gap-1.5">
                      {DAY_LABELS.map(day => (
                        <button
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                            recurringDays.includes(day.id) 
                              ? 'bg-[#0b57d0] text-white' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600 w-24">終了日:</label>
                  <input 
                    type="date"
                    min={targetDate}
                    max={maxDateStr}
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    className="border rounded p-1.5 text-sm"
                  />
                  <span className="text-xs text-gray-400">(最大12ヶ月先まで)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            キャンセル
          </button>
          <button 
            onClick={handleSave}
            disabled={!selectedCustomerId}
            className="px-4 py-2 text-sm font-bold text-white bg-[#0b57d0] hover:bg-blue-800 rounded transition-colors disabled:opacity-50 shadow-sm"
          >
            {isRecurring ? '繰り返しスポット追加' : 'スポット追加'}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
