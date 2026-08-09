import { useState } from 'react';
import { Edit3, X, Trash2 } from 'lucide-react';
import { MASTER_DRIVERS_LIST, MASTER_VEHICLES_LIST } from '../data/constants';

export default function EditModal({ editModal, onSave, onDelete, onClose }) {
  const [driverName, setDriverName] = useState(editModal.initialDriverName);
  const [vehicleName, setVehicleName] = useState(editModal.initialVehicle);

  if (!editModal) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onClose}></div>
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Edit3 size={18} />
            {editModal.type === 'header' ? '担当者・車両の変更' : '区切り線(交代)の編集'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          {editModal.type === 'split' && (
            <div className="text-xs text-gray-500 mb-2">
              時間: <span className="font-bold text-gray-800">{editModal.time}</span> 以降
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">ドライバー名</label>
            <select 
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white" 
              value={driverName} 
              onChange={(e) => setDriverName(e.target.value)}
            >
              <option value="">選択してください</option>
              {MASTER_DRIVERS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">車両名</label>
            <select 
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white" 
              value={vehicleName} 
              onChange={(e) => setVehicleName(e.target.value)}
            >
              <option value="">選択してください</option>
              {MASTER_VEHICLES_LIST.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="pt-2 flex gap-2">
            {editModal.type === 'split' && (
              <button onClick={onDelete} className="px-3 py-2 border border-red-200 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 flex items-center justify-center" title="削除">
                <Trash2 size={16} />
              </button>
            )}
            <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
              キャンセル
            </button>
            <button 
              onClick={() => onSave(driverName, vehicleName)} 
              className="flex-1 py-2 bg-emerald-600 text-white rounded text-sm font-bold hover:bg-emerald-700 shadow-sm"
            >
              保存する
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
