import React, { useState } from 'react';
import { X, Trash2, Plus, Edit2, Check, AlertCircle } from 'lucide-react';

export interface Item {
  id: string;
  name: string;
  kana?: string;
  requiredVehicle?: string;
  estimatedDuration?: number;
}

interface ItemManagementModalProps {
  items?: Item[];
  onSave: (items: Item[]) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ItemManagementModal({ items = [], onSave, onDelete, onClose }: ItemManagementModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', kana: '', requiredVehicle: '', estimatedDuration: 0 });
  
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', kana: '', requiredVehicle: '', estimatedDuration: 0 });
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartEdit = (item: Item) => {
    setEditingId(item.id);
    setEditForm({ 
      name: item.name,
      kana: item.kana || '', 
      requiredVehicle: item.requiredVehicle || '', 
      estimatedDuration: item.estimatedDuration || 0 
    });
    setErrorMsg('');
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      setErrorMsg('品目名を入力してください。');
      return;
    }
    const updatedItems = items.map(item => 
      item.id === editingId ? { ...item, ...editForm } : item
    );
    onSave(updatedItems);
    setEditingId(null);
    setErrorMsg('');
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setAddForm({ name: '', kana: '', requiredVehicle: '', estimatedDuration: 0 });
    setErrorMsg('');
  };

  const handleSaveAdd = () => {
    if (!addForm.name.trim()) {
      setErrorMsg('品目名を入力してください。');
      return;
    }
    const newItem: Item = {
      id: `item_${Date.now()}`,
      ...addForm
    };
    onSave([...items, newItem]);
    setIsAdding(false);
    setErrorMsg('');
  };

  const handleDelete = (id: string) => {
    if (confirm('この品目を削除してもよろしいですか？（顧客に設定されている場合は注意してください）')) {
      onDelete(id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-screen w-full max-w-3xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            📦 品目マスタ管理
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          
          {errorMsg && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded flex items-center gap-2">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          {/* Add New Section */}
          <div className="mb-6 bg-white p-4 rounded shadow-sm border border-gray-200">
            {isAdding ? (
              <div className="flex gap-2 items-start flex-col lg:flex-row">
                <div className="flex-1 w-full space-y-2">
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <input 
                      type="text" 
                      placeholder="品目名 (例: 段ﾎﾞｰﾙ)"
                      className="w-full sm:w-1/2 border rounded p-2"
                      value={addForm.name}
                      onChange={e => setAddForm({...addForm, name: e.target.value})}
                      autoFocus
                    />
                    <input 
                      type="text" 
                      placeholder="フリガナ (例: だんぼーる)"
                      className="w-full sm:w-1/2 border rounded p-2"
                      value={addForm.kana}
                      onChange={e => setAddForm({...addForm, kana: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="必須車種 (例: 平ボディ) ※任意"
                      className="w-1/2 border rounded p-2 text-sm"
                      value={addForm.requiredVehicle}
                      onChange={e => setAddForm({...addForm, requiredVehicle: e.target.value})}
                    />
                    <div className="flex items-center gap-2 w-1/2">
                      <input 
                        type="number" 
                        min="0" step="5"
                        className="w-20 border rounded p-2 text-sm"
                        value={addForm.estimatedDuration}
                        onChange={e => setAddForm({...addForm, estimatedDuration: Number(e.target.value)})}
                      />
                      <span className="text-sm text-gray-600">分/目安</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 w-full lg:w-auto h-full items-stretch">
                  <button onClick={handleSaveAdd} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold flex items-center justify-center gap-1 flex-1 lg:flex-none"><Check size={18}/> 保存</button>
                  <button onClick={() => setIsAdding(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 font-bold flex items-center justify-center gap-1 flex-1 lg:flex-none"><X size={18}/> キャンセル</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleStartAdd}
                className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded hover:bg-gray-50 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 font-bold"
              >
                <Plus size={20} /> 新規品目を追加
              </button>
            )}
          </div>

          {/* List */}
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b text-gray-600 text-sm">
                  <th className="p-3 w-1/4">品目名</th>
                  <th className="p-3 w-1/4">フリガナ</th>
                  <th className="p-3 w-1/4">必須車種制限</th>
                  <th className="p-3 w-1/4">目安時間(分)</th>
                  <th className="p-3 w-24 text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      品目が登録されていません
                    </td>
                  </tr>
                ) : items.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors group">
                    {editingId === item.id ? (
                      <td colSpan={5} className="p-3">
                        <div className="flex gap-2 items-start flex-col lg:flex-row">
                          <div className="flex-1 w-full space-y-2">
                            <div className="flex gap-2 flex-col sm:flex-row">
                              <input 
                                type="text" 
                                placeholder="品目名"
                                className="w-full sm:w-1/2 border rounded p-2 bg-blue-50"
                                value={editForm.name}
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                autoFocus
                              />
                              <input 
                                type="text" 
                                placeholder="フリガナ"
                                className="w-full sm:w-1/2 border rounded p-2 bg-blue-50"
                                value={editForm.kana}
                                onChange={e => setEditForm({...editForm, kana: e.target.value})}
                              />
                            </div>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="必須車種"
                                className="w-1/2 border rounded p-2 text-sm bg-blue-50"
                                value={editForm.requiredVehicle}
                                onChange={e => setEditForm({...editForm, requiredVehicle: e.target.value})}
                              />
                              <div className="flex items-center gap-2 w-1/2">
                                <input 
                                  type="number" 
                                  min="0" step="5"
                                  className="w-20 border rounded p-2 text-sm bg-blue-50"
                                  value={editForm.estimatedDuration}
                                  onChange={e => setEditForm({...editForm, estimatedDuration: Number(e.target.value)})}
                                />
                                <span className="text-sm text-gray-600">分</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full lg:w-auto items-stretch">
                            <button onClick={handleSaveEdit} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex-1 lg:flex-none flex items-center justify-center" title="保存"><Check size={20}/></button>
                            <button onClick={() => setEditingId(null)} className="bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400 flex-1 lg:flex-none flex items-center justify-center" title="キャンセル"><X size={20}/></button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="p-3 font-bold">{item.name}</td>
                        <td className="p-3 text-sm text-gray-600">{item.kana || <span className="text-gray-400 text-xs">(未登録)</span>}</td>
                        <td className="p-3 text-gray-600 text-sm">{item.requiredVehicle || <span className="text-gray-400">-</span>}</td>
                        <td className="p-3 text-gray-600">{item.estimatedDuration && item.estimatedDuration > 0 ? `${item.estimatedDuration}分` : <span className="text-gray-400">-</span>}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                              title="編集"
                            ><Edit2 size={16} /></button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="削除"
                            ><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </>
  );
}
