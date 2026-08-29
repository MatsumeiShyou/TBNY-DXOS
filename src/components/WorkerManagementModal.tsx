import React, { useState } from 'react';
import { X, Plus, Edit3, Trash2, UserCheck, UserX, Shield } from 'lucide-react';
import { MasterWorker } from '../types';

const LICENSE_OPTIONS = ['普通', '中型', '大型'];

interface WorkerManagementModalProps {
  workers: MasterWorker[];
  onSave: (worker: MasterWorker, isEdit: boolean) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function WorkerManagementModal({ workers, onSave, onDelete, onClose }: WorkerManagementModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // フォーム用State
  const [formName, setFormName] = useState('');
  const [formKana, setFormKana] = useState('');
  const [formLicenses, setFormLicenses] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);

  const resetForm = () => {
    setFormName('');
    setFormKana('');
    setFormLicenses([]);
    setFormIsActive(true);
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (worker: MasterWorker) => {
    setEditingId(worker.id);
    setFormName(worker.name);
    setFormKana(worker.kana || '');
    setFormLicenses(worker.license_types || []);
    setFormIsActive(worker.is_active !== false);
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const toggleLicense = (license: string) => {
    setFormLicenses(prev => 
      prev.includes(license) 
        ? prev.filter(l => l !== license)
        : [...prev, license]
    );
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    
    const workerData: MasterWorker = {
      id: editingId || `w_${Date.now()}`,
      name: formName.trim(),
      kana: formKana.trim(),
      license_types: formLicenses,
      is_active: formIsActive,
    };
    
    onSave(workerData, !!editingId);
    resetForm();
  };

  const isFormOpen = isAdding || editingId !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-auto max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ヘッダー */}
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center flex-shrink-0">
          <div className="font-bold flex items-center gap-2">
            <Shield size={18} /> ドライバー（作業員）マスタ管理
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>

        {/* 一覧 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-700">登録済み作業員 ({workers.length}名)</h3>
            {!isFormOpen && (
              <button 
                onClick={startAdd}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
              >
                <Plus size={14} /> 新規追加
              </button>
            )}
          </div>

          {workers.map(w => (
            <div 
              key={w.id} 
              className={`flex justify-between items-center p-3 mb-2 rounded border transition-colors ${
                editingId === w.id ? 'border-blue-400 bg-blue-50' : 
                w.is_active === false ? 'border-gray-200 bg-gray-50 opacity-60' : 
                'border-gray-100 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  w.is_active === false ? 'bg-gray-300 text-gray-500' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {w.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    {w.name}
                    {w.is_active === false && <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">休止中</span>}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    {w.kana && <span>{w.kana}</span>}
                    {w.license_types && w.license_types.length > 0 && (
                      <span className="flex gap-1">
                        {w.license_types.map(l => (
                          <span key={l} className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-[10px] font-bold">{l}</span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => startEdit(w)}
                  className="text-gray-400 hover:text-blue-600 p-1" title="編集"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm(`「${w.name}」を削除しますか？`)) onDelete(w.id);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1" title="削除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {workers.length === 0 && (
            <div className="text-xs text-gray-400 py-8 text-center">作業員が登録されていません</div>
          )}
        </div>

        {/* 追加・編集フォーム */}
        {isFormOpen && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              {editingId ? '作業員情報を編集' : '新しい作業員を追加'}
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 mb-1">氏名 *</label>
                  <input 
                    type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                    placeholder="例: 田中 太郎"
                    className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-500 mb-1">かな（ソート用）</label>
                  <input 
                    type="text" value={formKana} onChange={(e) => setFormKana(e.target.value)}
                    placeholder="例: たなか たろう"
                    className="w-full border rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1">保有免許（L1制約判定用）</label>
                <div className="flex gap-2">
                  {LICENSE_OPTIONS.map(license => (
                    <label key={license} className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formLicenses.includes(license)}
                        onChange={() => toggleLicense(license)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{license}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-1">ステータス</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="status" checked={formIsActive} onChange={() => setFormIsActive(true)} className="text-emerald-600 focus:ring-emerald-500" />
                    <UserCheck size={14} className="text-emerald-600" />
                    <span className="text-sm text-gray-700">稼働中</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="status" checked={!formIsActive} onChange={() => setFormIsActive(false)} className="text-gray-400 focus:ring-gray-500" />
                    <UserX size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-700">休止中</span>
                  </label>
                </div>
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
    </div>
  );
}
