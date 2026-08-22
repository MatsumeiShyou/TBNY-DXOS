import React, { useState, useEffect } from 'react';
import { X, Save, FileDown, Trash2 } from 'lucide-react';
import { storageService } from '../services/storageService';

export default function TemplateModal({ isOpen, onClose, currentData, masterCustomers = [], onPreviewTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');

  useEffect(() => {
    if (isOpen) {
      storageService.loadTemplates().then(setTemplates);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveCurrent = async () => {
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
    await storageService.saveTemplate(newTemplate);
    const updatedTemplates = await storageService.loadTemplates();
    setTemplates(updatedTemplates);
    setNewTemplateName('');
    alert('現在の状態をテンプレートとして保存しました。');
  };

  const handleDelete = async (id) => {
    if (window.confirm('このテンプレートを削除しますか？')) {
      await storageService.deleteTemplate(id);
      const updatedTemplates = await storageService.loadTemplates();
      setTemplates(updatedTemplates);
    }
  };

  const [unregisteredWarning, setUnregisteredWarning] = useState(null);

  const handlePreview = (template) => {
    // 1. 真の孤児データと未登録データの分離
    const validCustomerIds = new Set(masterCustomers.map(c => c.id));
    const allTemplateJobs = [...(template.data.jobs || []), ...(template.data.pendingJobs || [])];
    
    const unregisteredJobs = allTemplateJobs.filter(j => !validCustomerIds.has(j.originalCustomerId));
    
    // 真の孤児（タイトルすら無い完全なバグデータ）
    const trueOrphans = unregisteredJobs.filter(j => !j.title || j.title.trim() === '');
    // 未登録データ（名前等の情報を持つ飛び込み案件等）
    const validUnregistered = unregisteredJobs.filter(j => j.title && j.title.trim() !== '');

    if (validUnregistered.length > 0) {
      // 警告ダイアログを表示
      setUnregisteredWarning({
        template,
        count: validUnregistered.length,
        trueOrphanCount: trueOrphans.length
      });
      return;
    }

    // 未登録データがない場合は、真の孤児だけを静かに排除して展開
    executePreview(template, false);
  };

  const executePreview = (template, includeUnregistered) => {
    const validCustomerIds = new Set(masterCustomers.map(c => c.id));
    
    const processJob = (job) => {
      const isRegistered = validCustomerIds.has(job.originalCustomerId);
      if (isRegistered) return job;
      
      // 未登録データを展開する場合、プレースホルダー化
      if (includeUnregistered && job.title && job.title.trim() !== '') {
        return {
          ...job,
          title: `⚠️未登録 ${job.title}`,
          isUnregistered: true // ポストアクション判定用フラグ
        };
      }
      return null; // 真の孤児、または除外選択時はnull
    };

    const processedJobs = (template.data.jobs || []).map(processJob).filter(Boolean);
    const processedPending = (template.data.pendingJobs || []).map(processJob).filter(Boolean);

    onPreviewTemplate({
      ...template, // id, nameなどを含める
      state: {
        ...template.data,
        jobs: processedJobs,
        pendingJobs: processedPending
      }
    });
    setUnregisteredWarning(null);
    // onClose は App 側で実行される（startPreview内）のでここでは呼ばなくて良いが、状態リセットとして残すかAppに任せるか。Appが閉じるのでOK。
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-300" onMouseDown={(e) => { if(e.target === e.currentTarget) onClose(); }}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        
        {/* === 未登録データ警告ダイアログ === */}
        {unregisteredWarning && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto animate-in fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-orange-600 mb-4">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-lg font-bold">未登録の顧客データが含まれています</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                このテンプレートには、現在の顧客マスタに存在しない「未登録の案件」が <strong>{unregisteredWarning.count}件</strong> 含まれています。<br/>
                {unregisteredWarning.trueOrphanCount > 0 && <span className="text-xs text-red-500">※名前すら無い破損データが {unregisteredWarning.trueOrphanCount}件 含まれており、これらは安全のため自動破棄されます。<br/></span>}
                どのように展開しますか？
              </p>
              
              <div className="space-y-2 mb-6">
                <button 
                  onClick={() => executePreview(unregisteredWarning.template, true)}
                  className="w-full text-left p-3 border border-orange-200 bg-orange-50 hover:bg-orange-100 rounded transition-colors group"
                >
                  <div className="font-bold text-orange-800 group-hover:text-orange-900">そのまま展開する（推奨）</div>
                  <div className="text-xs text-orange-600 mt-1">案件名に「⚠️未登録」を付けてプレビューへ進みます。</div>
                </button>
                <button 
                  onClick={() => executePreview(unregisteredWarning.template, false)}
                  className="w-full text-left p-3 border border-gray-200 hover:bg-gray-50 rounded transition-colors group"
                >
                  <div className="font-bold text-gray-700 group-hover:text-gray-900">未登録データを除外する</div>
                  <div className="text-xs text-gray-500 mt-1">マスタに存在する顧客の案件のみを安全に展開します。</div>
                </button>
                {/* 
                  ※再同期アクションは、Supabase接続前提の機能であるため、ここでは「キャンセルして再同期してください」という案内に留めるか、
                  またはリロードを促す設計とする。
                */}
                <button 
                  onClick={() => setUnregisteredWarning(null)}
                  className="w-full text-center p-3 border border-gray-200 hover:bg-gray-100 rounded transition-colors text-sm font-bold text-gray-600 mt-2"
                >
                  キャンセルして戻る
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-auto max-h-[90vh] pointer-events-auto transition-opacity ${unregisteredWarning ? 'opacity-30' : 'opacity-100'}`}>
        
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
    </>
  );
}
