import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, Settings } from 'lucide-react';

export default function SettingsModal({ systemSettings, setSystemSettings, onClose }) {
  const [newDate, setNewDate] = useState('');
  
  const holidays = systemSettings.holidays || [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (newDate && !holidays.includes(newDate)) {
      setSystemSettings(prev => ({
        ...prev,
        holidays: [...(prev.holidays || []), newDate].sort()
      }));
      setNewDate('');
    }
  };

  const handleRemove = (dateToRemove) => {
    setSystemSettings(prev => ({
      ...prev,
      holidays: prev.holidays.filter(d => d !== dateToRemove)
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose}></div>
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <div className="font-bold flex items-center gap-2">
            <Settings size={18} /> システム設定
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600" /> 全社休業日（特例休日）設定
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            GWやお盆など、回収業務全体が休業となる日を登録します。ここで設定された日は、カレンダー展開時に休業アラートの対象となります。
          </p>

          <form onSubmit={handleAdd} className="flex gap-2 mb-4">
            <input 
              type="date" 
              value={newDate} 
              onChange={e => setNewDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded p-2 text-sm"
              required
            />
            <button 
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm font-bold flex items-center gap-1"
            >
              <Plus size={16} /> 追加
            </button>
          </form>

          <div className="border border-gray-200 rounded-md bg-gray-50 max-h-[300px] overflow-y-auto">
            {holidays.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">休業日の登録はありません</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {holidays.map(date => (
                  <li key={date} className="flex items-center justify-between p-3 bg-white hover:bg-gray-50">
                    <span className="font-bold text-gray-700">{date}</span>
                    <button 
                      onClick={() => handleRemove(date)}
                      className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                      title="削除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-3 flex justify-end">
          <button onClick={onClose} className="bg-gray-800 text-white px-6 py-2 rounded text-sm font-bold hover:bg-gray-700">
            閉じる
          </button>
        </div>

      </div>
    </>
  );
}
