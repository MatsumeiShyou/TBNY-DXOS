import React, { useState } from 'react';
import { X, Trash2, Plus, Settings } from 'lucide-react';
import { COLOR_PALETTE } from '../data/constants';
import { Driver, MasterWorker, MasterVehicle } from '../types';

interface CourseManagementModalProps {
  drivers: Driver[];
  masterWorkers: MasterWorker[];
  masterVehicles: MasterVehicle[];
  onAddCourse: (driver: Driver) => void;
  onDeleteCourse: (id: string) => void;
  onClose: () => void;
}

export default function CourseManagementModal({ drivers, masterWorkers, masterVehicles, onAddCourse, onDeleteCourse, onClose }: CourseManagementModalProps) {
  // 稼働中のドライバー・全車両をドロップダウン候補として使用
  const activeWorkers = masterWorkers.filter(w => w.status !== 'inactive');
  const allVehicles = masterVehicles;

  const [newCourse, setNewCourse] = useState('');
  const [newName, setNewName] = useState(activeWorkers.length > 0 ? activeWorkers[0].name : '');
  const [newVehicle, setNewVehicle] = useState(allVehicles.length > 0 ? allVehicles[0].name : '');
  
  // 次のアルファベットを自動提案するヘルパー
  const suggestNextCourse = () => {
    const existingCourses = drivers.map(d => d.course);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const next = alphabet.find(a => !existingCourses.includes(a));
    return next || '';
  };

  const handleAdd = () => {
    if (!newCourse && !suggestNextCourse()) return;
    
    // 使われていない色を選ぶ
    const usedColors = drivers.map(d => d.color);
    const availableColor = COLOR_PALETTE.find(c => !usedColors.includes(`${c.bg} ${c.border}`)) 
                           || COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    
    const colorStr = `${availableColor.bg} ${availableColor.border}`;

    onAddCourse({
      id: `driver_${Date.now()}`,
      course: newCourse || suggestNextCourse(),
      name: newName,
      currentVehicle: newVehicle,
      color: colorStr
    });

    setNewCourse('');
    setNewName(activeWorkers.length > 0 ? activeWorkers[0].name : '');
    setNewVehicle(allVehicles.length > 0 ? allVehicles[0].name : '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col h-auto max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <div className="font-bold flex items-center gap-2"><Settings size={18} /> コース管理</div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-1">現在のコース一覧</h3>
          
          {drivers.map(d => (
            <div key={d.id} className="flex justify-between items-center p-2 mb-2 rounded bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded flex items-center justify-center font-bold text-gray-800 ${d.color?.split(' ')[0] || ''}`}>
                  {d.course}
                </span>
                <div>
                  <div className="font-bold text-sm text-gray-800">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.currentVehicle}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (window.confirm(`コース${d.course}を削除しますか？\n（配置されている案件は未配車リストに戻ります）`)) {
                    onDeleteCourse(d.id);
                  }
                }}
                className="text-gray-400 hover:text-red-600 p-1"
                title="コースを削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          {drivers.length === 0 && <div className="text-xs text-gray-400 py-4 text-center">コースがありません</div>}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-3">新しいコースを追加</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-1/3">
                <label className="block text-[10px] text-gray-500 mb-1">コース名</label>
                <input 
                  type="text" 
                  value={newCourse}
                  onChange={(e) => setNewCourse(e.target.value.toUpperCase())}
                  placeholder={suggestNextCourse()}
                  className="w-full border rounded px-2 py-1.5 text-sm"
                  maxLength={2}
                />
              </div>
              <div className="w-2/3">
                <label className="block text-[10px] text-gray-500 mb-1">標準担当者</label>
                <select 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border rounded px-2 py-1.5 text-sm bg-white"
                >
                  {activeWorkers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">標準車両</label>
              <select 
                value={newVehicle} 
                onChange={(e) => setNewVehicle(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm bg-white"
              >
                {allVehicles.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
              </select>
            </div>
            
            <button 
              onClick={handleAdd}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center justify-center gap-2"
            >
              <Plus size={16} /> 追加する
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
