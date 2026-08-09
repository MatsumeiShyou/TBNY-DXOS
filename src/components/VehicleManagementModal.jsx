import React, { useState } from 'react';
import { X, Plus, Edit3, Trash2, Truck } from 'lucide-react';

const VEHICLE_TYPE_OPTIONS = [
  { value: 'packer_2t', label: '2tパッカー' },
  { value: 'packer_4t', label: '4tパッカー' },
  { value: 'flat_1t', label: '1t平ボディ' },
  { value: 'flat_2t', label: '2t平ボディ' },
  { value: 'flat_4t', label: '4t平ボディ' },
  { value: 'arm_roll', label: 'アームロール' },
  { value: 'rental', label: 'レンタカー' },
  { value: 'other', label: 'その他' },
];

export default function VehicleManagementModal({ vehicles, onSave, onDelete, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // フォーム用State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState(VEHICLE_TYPE_OPTIONS[0].value);
  const [formCapacity, setFormCapacity] = useState('');

  const resetForm = () => {
    setFormName('');
    setFormType(VEHICLE_TYPE_OPTIONS[0].value);
    setFormCapacity('');
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setFormName(vehicle.name);
    setFormType(vehicle.vehicle_type || VEHICLE_TYPE_OPTIONS[0].value);
    setFormCapacity(vehicle.max_capacity_kg != null ? String(vehicle.max_capacity_kg) : '');
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;

    const vehicleData = {
      id: editingId || `v_${Date.now()}`,
      name: formName.trim(),
      vehicle_type: formType,
      max_capacity_kg: formCapacity ? parseInt(formCapacity, 10) : null,
    };

    onSave(vehicleData, !!editingId);
    resetForm();
  };

  const getTypeLabel = (typeValue) => {
    const found = VEHICLE_TYPE_OPTIONS.find(o => o.value === typeValue);
    return found ? found.label : typeValue;
  };

  const isFormOpen = isAdding || editingId;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose}></div>
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[480px] max-h-[80vh] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col">
        
        {/* ヘッダー */}
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center flex-shrink-0">
          <div className="font-bold flex items-center gap-2">
            <Truck size={18} /> 車両マスタ管理
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        {/* 一覧 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-700">登録済み車両 ({vehicles.length}台)</h3>
            {!isFormOpen && (
              <button 
                onClick={startAdd}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
              >
                <Plus size={14} /> 新規追加
              </button>
            )}
          </div>

          {vehicles.map(v => (
            <div 
              key={v.id} 
              className={`flex justify-between items-center p-3 mb-2 rounded border transition-colors ${
                editingId === v.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded flex items-center justify-center text-sm bg-orange-100 text-orange-700">
                  <Truck size={16} />
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-800">{v.name}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{getTypeLabel(v.vehicle_type)}</span>
                    {v.max_capacity_kg != null && (
                      <span>積載: {v.max_capacity_kg}kg</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => startEdit(v)}
                  className="text-gray-400 hover:text-blue-600 p-1" title="編集"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm(`「${v.name}」を削除しますか？`)) onDelete(v.id);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1" title="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {vehicles.length === 0 && (
            <div className="text-xs text-gray-400 py-8 text-center">車両が登録されていません</div>
          )}
        </div>

        {/* 追加・編集フォーム */}
        {isFormOpen && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              {editingId ? '車両情報を編集' : '新しい車両を追加'}
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 mb-1">車両名/略称 *</label>
                  <input 
                    type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="例: 2tパッカー (品川400...)"
                    className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="w-36">
                  <label className="block text-[10px] text-gray-500 mb-1">車種タイプ</label>
                  <select 
                    value={formType} onChange={(e) => setFormType(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {VEHICLE_TYPE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1">最大積載量 (kg)（L1制約用）</label>
                <input 
                  type="number" value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)}
                  placeholder="例: 2000"
                  className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={resetForm} className="flex-1 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100">キャンセル</button>
                <button 
                  onClick={handleSave}
                  disabled={!formName.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {editingId ? '更新する' : '追加する'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
