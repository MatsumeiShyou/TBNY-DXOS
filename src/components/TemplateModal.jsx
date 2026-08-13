import React, { useState, useEffect } from 'react';
import { X, Save, FileDown, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function TemplateModal({ isOpen, onClose, currentData, onPreviewTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTemplates(storageService.loadTemplates());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!newTemplateName.trim()) {
      alert('テンプレート名を入力してください。');
      return;
    }
    const newTemplate = {
      id: `tmpl_${Date.now()}`,
      name: newTemplateName.trim(),
      createdAt: new Date().toISOString(),
      data: {
        drivers: currentData.drivers,
        jobs: currentData.jobs,
        pendingJobs: currentData.pendingJobs,
        splits: currentData.splits,
      }
    };
    storageService.saveTemplate(newTemplate);
    setTemplates(storageService.loadTemplates());
    setNewTemplateName('');
    alert('現在の状態をテンプレートとして保存しました。');
  };

  const handleDelete = (id) => {
    if (window.confirm('このテンプレートを削除しますか？')) {
      storageService.deleteTemplate(id);
      setTemplates(storageService.loadTemplates());
    }
  };

  const handlePreview = (template) => {
    onPreviewTemplate(template.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="font-bold flex items-center gap-2">
            <FileDown size={18} />
            テンプレート管理
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto bg-gray-50">
          
          <div className="bg-white p-4 rounded border border-gray-200 mb-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3">現在の状態を新規保存</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" 
                placeholder="例: 月曜通常パターン"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
              />
              <button 
                onClick={handleSaveCurrent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-bold flex items-center gap-1 shadow-sm transition-colors"
              >
                <Save size={16} /> 保存
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">※未配車リストの内容も一緒に保存されます。</p>
          </div>

          <h3 className="text-sm font-bold text-gray-700 mb-3">保存済みテンプレート</h3>
          
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              保存されたテンプレートはありません。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm flex flex-col hover:border-orange-300 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-sm text-gray-800">{tmpl.name}</div>
                    <button onClick={() => handleDelete(tmpl.id)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-3">
                    保存日時: {new Date(tmpl.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-[10px] text-gray-500">
                      コース数: {tmpl.data.drivers.length} / ジョブ数: {tmpl.data.jobs.length}
                    </div>
                    <button 
                      onClick={() => handlePreview(tmpl)}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                      プレビュー読込
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
