import React, { useState, useMemo } from 'react';
import { X, Search, CheckCircle, Minus, Settings, Filter, Save } from 'lucide-react';

const DAYS = [
  { key: 'mon', label: '月' },
  { key: 'tue', label: '火' },
  { key: 'wed', label: '水' },
  { key: 'thu', label: '木' },
  { key: 'fri', label: '金' },
  { key: 'sat', label: '土' },
  { key: 'sun', label: '日' }
];

export default function CustomerScheduleGridModal({ customers, onSave, onClose }) {
  // ローカルステートで編集状態を管理
  const [localCustomers, setLocalCustomers] = useState(
    customers.map(c => ({
      ...c,
      customSchedule: c.customSchedule || '' // 互換性のため初期化
    }))
  );
  
  // フィルター用ステート
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('');
  const [filterDay, setFilterDay] = useState('');

  // 曜日詳細ダイアログ用ステート
  const [activeDayDialog, setActiveDayDialog] = useState(null); // { customerId, dayKey }
  const [dayDialogRules, setDayDialogRules] = useState([]);

  // フィルタリング処理
  const filteredCustomers = useMemo(() => {
    return localCustomers.filter(c => {
      // 名前検索
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(c.kana && c.kana.includes(searchTerm))) {
        return false;
      }
      // 車番検索 (ここではテキスト部分一致とする)
      if (filterVehicle && !(c.requiredVehicle || '').includes(filterVehicle)) {
        return false;
      }
      // 曜日検索
      if (filterDay && filterDay !== 'spot') {
        const rules = c.scheduleRules?.[filterDay] || [];
        if (rules.length === 0) return false;
      } else if (filterDay === 'spot') {
        if (c.jobType !== 'spot') return false;
      }
      return true;
    });
  }, [localCustomers, searchTerm, filterVehicle, filterDay]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(customers) !== JSON.stringify(localCustomers);
  }, [customers, localCustomers]);

  const openDayRuleDialog = (customerId, dayKey) => {
    const customer = localCustomers.find(c => c.id === customerId);
    if (!customer || customer.jobType === 'spot') return;
    const rules = customer.scheduleRules?.[dayKey] || [];
    setDayDialogRules([...rules]);
    setActiveDayDialog({ customerId, dayKey });
  };

  const applyDayRuleDialog = () => {
    if (!activeDayDialog) return;
    setLocalCustomers(prev => prev.map(c => {
      if (c.id !== activeDayDialog.customerId) return c;
      return {
        ...c,
        scheduleRules: {
          ...c.scheduleRules,
          [activeDayDialog.dayKey]: dayDialogRules
        }
      };
    }));
    setActiveDayDialog(null);
  };

  const handleToggleSpot = (customerId) => {
    setLocalCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const isSpot = c.jobType === 'spot';
      return {
        ...c,
        jobType: isSpot ? 'regular' : 'spot'
      };
    }));
  };

  const handleCustomScheduleChange = (customerId, value) => {
    setLocalCustomers(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      return { ...c, customSchedule: value };
    }));
  };

  const handleSave = () => {
    onSave(localCustomers);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/60 z-[100] backdrop-blur-sm" onClick={onClose}></div>
      <div className="fixed inset-4 bg-white rounded-xl shadow-2xl z-[110] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800">回収スケジュール一括設定 (一覧ビュー)</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">
              {filteredCustomers.length} 件表示
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-5 py-2 rounded font-bold transition-all ${hasChanges ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Save size={18} /> 一括保存
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Toolbar / Filters */}
        <div className="px-6 py-3 border-b border-gray-200 bg-white flex flex-wrap gap-4 items-center">
          <div className="relative">
            <input 
              type="text" 
              placeholder="顧客名やフリガナで検索..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md text-sm w-64 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <Search size={16} className="absolute left-3 top-2 text-gray-400" />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={filterDay} 
              onChange={e => setFilterDay(e.target.value)}
              className="border border-gray-300 rounded-md text-sm py-1.5 pl-3 pr-8 focus:ring-emerald-500"
            >
              <option value="">すべての曜日</option>
              <option value="spot">スポットのみ</option>
              {DAYS.map(d => <option key={d.key} value={d.key}>{d.label}曜の回収あり</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="車番で絞り込み (例: 2267)" 
              value={filterVehicle}
              onChange={e => setFilterVehicle(e.target.value)}
              className="border border-gray-300 rounded-md text-sm py-1.5 px-3 w-48 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-auto bg-gray-100 relative custom-scrollbar p-4">
          <div className="inline-block min-w-full align-middle border border-gray-300 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-300 table-fixed">
              <thead className="bg-gray-200 sticky top-0 z-30 shadow-sm">
                <tr>
                  <th scope="col" className="sticky left-0 z-40 bg-gray-200 py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-700 w-64 border-r border-gray-300 shadow-[1px_0_0_0_#d1d5db]">
                    回収先 (顧客名)
                  </th>
                  <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-300 w-24">
                    スポット
                  </th>
                  {DAYS.map(day => (
                    <th key={day.key} scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-300 w-16">
                      {day.label}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-300 w-16">
                    祝
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-700 w-56">
                    特記事項 / メモ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCustomers.map(customer => {
                  const isSpot = customer.jobType === 'spot';
                  return (
                    <tr key={customer.id} className="hover:bg-emerald-50/50 transition-colors group">
                      <td className="sticky left-0 z-20 bg-white group-hover:bg-emerald-50/50 py-2 pl-4 pr-3 text-sm font-bold text-gray-900 border-r border-gray-300 shadow-[1px_0_0_0_#e5e7eb] truncate">
                        {customer.name}
                        <div className="text-[10px] font-normal text-gray-400 mt-0.5 truncate">{customer.requiredVehicle || '車番未定'}</div>
                      </td>
                      <td className="px-3 py-2 text-center border-r border-gray-200 cursor-pointer" onClick={() => handleToggleSpot(customer.id)}>
                        <div className="flex justify-center">
                          {isSpot ? (
                            <div className="bg-orange-100 text-orange-600 rounded-full w-6 h-6 flex items-center justify-center">○</div>
                          ) : (
                            <div className="text-gray-300 w-6 h-6 flex items-center justify-center">－</div>
                          )}
                        </div>
                      </td>
                      {DAYS.map(day => {
                        const rules = customer.scheduleRules?.[day.key] || [];
                        const hasEvery = rules.includes('every');
                        const hasRules = rules.length > 0;
                        const isDayDialogActive = activeDayDialog?.customerId === customer.id && activeDayDialog?.dayKey === day.key;
                        
                        return (
                          <td 
                            key={day.key} 
                            className={`px-3 py-2 text-center border-r border-gray-200 relative ${isSpot ? 'bg-gray-100/50 opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-emerald-100/50'}`}
                            onClick={() => !isSpot && openDayRuleDialog(customer.id, day.key)}
                          >
                            <div className="flex justify-center items-center h-full min-h-[24px]">
                              {!isSpot && hasEvery ? (
                                <CheckCircle size={20} className="text-emerald-500" />
                              ) : !isSpot && hasRules ? (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded leading-none">
                                  {rules.map(r => `①②③④⑤`[parseInt(r)-1] || r).join('')}
                                </span>
                              ) : (
                                <Minus size={20} className="text-gray-300" />
                              )}
                            </div>
                            
                            {/* ポップアップダイアログ */}
                            {isDayDialogActive && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 p-3 cursor-default" onClick={e => e.stopPropagation()}>
                                <div className="font-bold text-xs text-gray-700 mb-2 border-b pb-1">{day.label}曜の回収設定</div>
                                <div className="flex flex-col gap-1 text-sm text-left mb-3">
                                  <label className="flex items-center gap-2 py-0.5 hover:bg-gray-50 rounded px-1 cursor-pointer">
                                    <input type="checkbox" checked={dayDialogRules.includes('every')} onChange={(e) => {
                                      if (e.target.checked) setDayDialogRules(['every']);
                                      else setDayDialogRules([]);
                                    }} className="rounded text-emerald-500 focus:ring-emerald-500" /> 毎週
                                  </label>
                                  {['1', '2', '3', '4', '5'].map(num => (
                                    <label key={num} className={`flex items-center gap-2 py-0.5 rounded px-1 cursor-pointer ${dayDialogRules.includes('every') ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                                      <input type="checkbox" disabled={dayDialogRules.includes('every')} checked={dayDialogRules.includes(num)} onChange={(e) => {
                                        if (e.target.checked) setDayDialogRules(p => [...p.filter(x => x !== 'every'), num].sort());
                                        else setDayDialogRules(p => p.filter(x => x !== num));
                                      }} className="rounded text-emerald-500 focus:ring-emerald-500" /> 第{num}週
                                    </label>
                                  ))}
                                </div>
                                <div className="flex justify-between gap-2">
                                  <button onClick={(e) => { e.stopPropagation(); setDayDialogRules([]); }} className="px-2 py-1 text-[10px] text-red-500 hover:bg-red-50 rounded">クリア</button>
                                  <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); setActiveDayDialog(null); }} className="px-2 py-1 text-[11px] text-gray-500 hover:bg-gray-100 rounded">取消</button>
                                    <button onClick={(e) => { e.stopPropagation(); applyDayRuleDialog(); }} className="px-3 py-1 text-[11px] font-bold bg-emerald-500 text-white rounded hover:bg-emerald-600 shadow-sm">決定</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      {/* 祝日フラグ */}
                      <td 
                        className={`px-3 py-2 text-center border-r border-gray-200 ${isSpot ? 'bg-gray-100/50 opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-emerald-100/50'}`}
                        onClick={() => !isSpot && setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, holidayCollection: !c.holidayCollection} : c))}
                      >
                         <div className="flex justify-center text-xs font-bold">
                           {!isSpot && customer.holidayCollection ? <span className="text-emerald-600">〇</span> : <span className="text-gray-300">－</span>}
                         </div>
                      </td>
                      {/* 特記事項 / メモ */}
                      <td className="px-3 py-2 text-sm text-gray-500 relative">
                        <div className="flex items-center gap-1">
                          <input 
                            type="text" 
                            className={`flex-1 border rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none ${isSpot ? 'bg-gray-100 text-gray-400' : 'bg-white border-gray-300'}`}
                            placeholder="例: 自衛隊のない日"
                            value={customer.customSchedule || ''}
                            onChange={(e) => handleCustomScheduleChange(customer.id, e.target.value)}
                            disabled={isSpot}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center text-gray-500">条件に一致する顧客が見つかりません。</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
