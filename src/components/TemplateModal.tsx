import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, FileDown, Trash2, Search, ArrowUpDown } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useToast } from './Toast';

export default function TemplateModal({ isOpen, onClose, currentData, masterCustomers = [], onPreviewTemplate, currentDate }) {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [targetWeek, setTargetWeek] = useState(1);
  const [targetDay, setTargetDay] = useState('mon');
  
  // 検索・ソート用State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');

  useEffect(() => {
    if (isOpen) {
      storageService.loadTemplates().then(setTemplates);
      if (currentDate) {
        const d = new Date(currentDate);
        const dayMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        setTargetDay(dayMap[d.getDay()]);
        setTargetWeek(Math.ceil(d.getDate() / 7));
      }
    }
  }, [isOpen, currentDate]);

  const filteredAndSortedTemplates = useMemo(() => {
    let result = [...templates];
    
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(tmpl => tmpl.name.toLowerCase().includes(lowerQuery));
    }
    
    result.sort((a, b) => {
      if (sortOrder === 'date-desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === 'date-asc') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOrder === 'name-asc') {
        return a.name.localeCompare(b.name, 'ja');
      }
      return 0;
    });
    
    return result;
  }, [templates, searchQuery, sortOrder]);

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
      targetWeek,
      targetDay,
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

  const handlePreview = (template) => {
    const customerStatusMap = new Map();
    masterCustomers.forEach(c => {
      customerStatusMap.set(c.id, { isSuspended: !!c.isInvalid, isDeleted: !!c.isDeleted, name: c.name });
    });

    const processJobsList = (jobsList) => {
      let deletedCount = 0;
      let suspendedCount = 0;
      let orphanCount = 0;

      const processed = jobsList.reduce((acc, job) => {
        const customerStatus = customerStatusMap.get(job.originalCustomerId);
        
        if (customerStatus && !customerStatus.isDeleted) {
          if (customerStatus.isSuspended) {
            const cleanTitle = String(job.title || '').replace(/^⚠️(削除済|停止中)\s*/, '');
            const displayName = customerStatus.name || cleanTitle;
            acc.push({ ...job, title: displayName, isSuspended: true, isDeleted: false });
            suspendedCount++;
          } else {
            const cleanTitle = String(job.title || '').replace(/^⚠️(削除済|停止中)\s*/, '');
            acc.push({ ...job, title: cleanTitle, isSuspended: false, isDeleted: false });
          }
        } else if (customerStatus && customerStatus.isDeleted) {
          const cleanTitle = String(job.title || '').replace(/^⚠️(削除済|停止中)\s*/, '');
          acc.push({ ...job, title: customerStatus.name, isDeleted: true, isSuspended: false });
          deletedCount++;
        } else {
          // 物理削除された古いゴミデータは完全に破棄する
          orphanCount++;
        }
        return acc;
      }, []);
      return { processed, deletedCount, suspendedCount, orphanCount };
    };

    const jobsResult = processJobsList(template.data?.jobs || []);
    const pendingResult = processJobsList(template.data?.pendingJobs || []);
    const totalDeleted = jobsResult.deletedCount + pendingResult.deletedCount;
    const totalSuspended = jobsResult.suspendedCount + pendingResult.suspendedCount;

    if (totalDeleted > 0 || totalSuspended > 0) {
      const msgs = [];
      if (totalDeleted > 0) msgs.push(`${totalDeleted}件の削除済データ`);
      if (totalSuspended > 0) msgs.push(`${totalSuspended}件の停止中データ`);
      showToast(`${msgs.join('と')}をバッジで展開しました`, 'warning');
    }

    onPreviewTemplate({
      ...template,
      state: {
        ...template.data,
        jobs: jobsResult.processed,
        pendingJobs: pendingResult.processed
      }
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-300" onMouseDown={(e) => { if(e.target === e.currentTarget) onClose(); }}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        
        <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col h-auto max-h-[90vh] pointer-events-auto transition-opacity opacity-100`}>
        
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
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center text-sm">
                <span className="text-gray-600 font-medium">対象:</span>
                <select
                  value={targetWeek}
                  onChange={e => setTargetWeek(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value={1}>第1</option>
                  <option value={2}>第2</option>
                  <option value={3}>第3</option>
                  <option value={4}>第4</option>
                  <option value={5}>第5</option>
                </select>
                <select
                  value={targetDay}
                  onChange={e => setTargetDay(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  <option value="mon">月曜日</option>
                  <option value="tue">火曜日</option>
                  <option value="wed">水曜日</option>
                  <option value="thu">木曜日</option>
                  <option value="fri">金曜日</option>
                  <option value="sat">土曜日</option>
                  <option value="sun">日曜日</option>
                </select>
                <span className="text-gray-400 text-xs ml-2">※未配車リストの自動生成基準</span>
              </div>
              <div className="flex gap-2 mt-1">
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
            </div>
            <p className="text-[10px] text-gray-500 mt-2">※未配車リストの内容も一緒に保存されます。</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
            <h3 className="text-sm font-bold text-gray-700">保存済みテンプレート</h3>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-48">
                <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="テンプレート名で検索..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="relative">
                <select 
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs border border-gray-300 rounded bg-white focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  <option value="date-desc">保存日時 (新しい順)</option>
                  <option value="date-asc">保存日時 (古い順)</option>
                  <option value="name-asc">名前順 (昇順)</option>
                </select>
                <ArrowUpDown size={12} className="absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              保存されたテンプレートはありません。
            </div>
          ) : filteredAndSortedTemplates.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              検索条件に一致するテンプレートは見つかりませんでした。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAndSortedTemplates.map(tmpl => (
                <div key={tmpl.id} className="bg-white p-3 rounded border border-gray-200 shadow-sm flex flex-col hover:border-orange-300 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-sm text-gray-800">{tmpl.name}</div>
                      {tmpl.targetWeek && tmpl.targetDay && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                          第{tmpl.targetWeek}{
                            { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金', sat: '土', sun: '日' }[tmpl.targetDay]
                          }曜
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleDelete(tmpl.id)} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" title="削除">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-3">
                    保存日時: {new Date(tmpl.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-[10px] text-gray-500">
                      コース数: {tmpl.data?.drivers?.length || 0} / ジョブ数: {tmpl.data?.jobs?.length || 0}
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
