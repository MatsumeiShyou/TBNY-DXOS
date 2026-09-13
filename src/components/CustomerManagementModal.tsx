import React, { useState, useEffect, useRef, useMemo, useOptimistic, useActionState, startTransition } from 'react';
import { Customer, MasterVehicle } from '../types';
import { Item } from './ItemManagementModal';
import { X, Plus, Search, Trash2, Building, Calendar, Settings, AlertCircle, Grid, Check, Copy } from 'lucide-react';
import { MASTER_VEHICLES_LIST } from '../data/constants';
import { parsePreferredTime } from '../utils/timeUtils';
import { toHalfWidthKatakana } from '../utils/textUtils';
import SearchableMultiSelect from './SearchableMultiSelect';
import procurementCandidates from '../data/procurementCandidates.json';

const TIME_OPTIONS = (() => {
  const options = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
  }
  return options;
})();

const TimeSelect = ({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-500 ${className}`}
    >
      <option value="" disabled>--:--</option>
      {TIME_OPTIONS.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
};

const DAYS = [
  { key: 'mon', label: '月' },
  { key: 'tue', label: '火' },
  { key: 'wed', label: '水' },
  { key: 'thu', label: '木' },
  { key: 'fri', label: '金' },
  { key: 'sat', label: '土' },
  { key: 'sun', label: '日' }
];

const FREQUENCIES = [
  { value: 'every', label: '毎週' },
  { value: '1st', label: '第1' },
  { value: '2nd', label: '第2' },
  { value: '3rd', label: '第3' },
  { value: '4th', label: '第4' },
  { value: '5th', label: '第5' }
];

const ROW_FILTERS = [
  { id: 'all', label: '全', pattern: null },
  { id: 'a', label: 'あ', pattern: /^[あ-おア-オぁ-ぉァ-ォｱ-ｵｧ-ｫ]/ },
  { id: 'ka', label: 'か', pattern: /^[か-こカ-コが-ごガ-ゴｶ-ｺ]/ },
  { id: 'sa', label: 'さ', pattern: /^[さ-そサ-ソざ-ぞザ-ゾｻ-ｿ]/ },
  { id: 'ta', label: 'た', pattern: /^[た-とタ-トだ-どダ-ドっッﾀ-ﾄｯ]/ },
  { id: 'na', label: 'な', pattern: /^[な-のナ-ノﾅ-ﾉ]/ },
  { id: 'ha', label: 'は', pattern: /^[は-ほハ-ホば-ぼバ-ボぱ-ぽパ-ポﾊ-ﾎ]/ },
  { id: 'ma', label: 'ま', pattern: /^[ま-もマ-モﾏ-ﾓ]/ },
  { id: 'ya', label: 'や', pattern: /^[や-よヤ-ヨゃ-ょャ-ョﾔ-ﾖｬ-ｮ]/ },
  { id: 'ra', label: 'ら', pattern: /^[ら-ろラ-ロﾗ-ﾛ]/ },
  { id: 'wa', label: 'わ', pattern: /^[わ-んワ-ンゎヮﾜ-ﾝ]/ }
];

const initialFormState = {
  id: '',
  payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
  name: '', kana: '', area: '', address: '',
  jobType: 'regular',
  scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  holidayCollection: false,
  defaultDuration: 30, requiredVehicle: '',
  items: [], note: '', isInvalid: false, preferredTime: '', customSchedule: ''
};

const getCustomerWarning = (customer: Customer) => {
  if (!customer.name?.trim() || !customer.kana?.trim()) {
    return { color: 'text-red-500', title: '必須項目が未入力です' };
  }
  const hasAccounting = !!(customer.payeeCode && String(customer.payeeCode).trim() && 
                           customer.payeeName && String(customer.payeeName).trim() && 
                           customer.supplierCode && String(customer.supplierCode).trim() && 
                           customer.supplierName && String(customer.supplierName).trim());
  if (!hasAccounting) {
    return { color: 'text-orange-500', title: '経理・管理情報が未入力です' };
  }
  const hasSiteInfo = !!(customer.area && String(customer.area).trim() && 
                         customer.address && String(customer.address).trim());
  if (!hasSiteInfo) {
    return { color: 'text-emerald-500', title: '現場情報が未入力です' };
  }
  return null;
};

interface CustomerManagementModalProps {
  customers: Customer[];
  masterVehicles: MasterVehicle[];
  masterItems?: Item[];
  onSave: (customer: any) => Promise<void> | void;
  onDelete?: (id: string) => Promise<'hard' | 'soft' | 'error'>;
  onClose: () => void;
  onOpenGridMode?: () => void;
  initialData?: any;
}

function generateId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'temp-' + Date.now();
}

export default function CustomerManagementModal({ customers, masterVehicles, masterItems = [], onSave, onDelete, onClose, onOpenGridMode, initialData }: CustomerManagementModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialData || { ...initialFormState });
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(!!initialData);
  const [validationErrors, setValidationErrors] = useState<{name?: string, kana?: string}>({});

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`選択した ${selectedIds.size} 件の顧客を削除しますか？\n(配車実績がある場合は論理削除になります)`)) {
      if (onDelete) {
        for (const id of Array.from(selectedIds)) {
          await onDelete(id);
        }
      }
      setSelectedIds(new Set());
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const [optimisticCustomers, setOptimisticCustomer] = useOptimistic<Customer[], any>(
    customers,
    (state, updatedCustomer) => {
      const exists = state.find(c => c.id === updatedCustomer.id);
      if (exists) {
        return state.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
      }
      return [...state, updatedCustomer];
    }
  );

  const [saveStatus, formAction, isPending] = useActionState(
    async (prevState: string, _payload: any) => {
      const errors: { name?: string; kana?: string } = {};
      if (!formData.name || !formData.name.trim()) errors.name = '回収先名は必須です';
      if (!formData.kana || !formData.kana.trim()) errors.kana = 'フリガナは必須です';
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return 'idle';
      }
      setValidationErrors({});

      const customerToSave = {
        ...formData,
        name: formData.name.trim(),
        defaultDuration: Number(formData.defaultDuration) || 30,
        scheduleRules: formData.scheduleRules || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
      };

      try {
        startTransition(() => {
          setOptimisticCustomer({ ...customerToSave, syncStatus: 'saving' });
        });
        
        await onSave({ ...customerToSave, syncStatus: 'active' });
        
        if (selectedCustomerId === 'new') setSelectedCustomerId(customerToSave.id);
        
        return 'saved';
      } catch (err) {
        startTransition(() => {
          setOptimisticCustomer({ ...customerToSave, syncStatus: 'error', syncError: '保存に失敗しました' });
        });
        return 'error';
      }
    },
    'idle'
  );

  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => {
         // reset logic here if needed
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      setIsEditing(true);
    }
  }, [initialData]);

  const [activeRowFilter, setActiveRowFilter] = useState('all');
  

  
  // フィルターとソート
  const filteredCustomers = optimisticCustomers
    .filter(c => (showDeleted ? c.isDeleted : !c.isDeleted))
    .filter(c => {
      // 1. フリーワード検索
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.kana && c.kana.includes(searchTerm));
      
      // 2. 行フィルター検索
      const activePattern = ROW_FILTERS.find(f => f.id === activeRowFilter)?.pattern;
      let matchRow = true;
      if (activePattern) {
        matchRow = c.kana ? activePattern.test(c.kana) : false;
      }
      
      return matchSearch && matchRow;
    })
    .sort((a, b) => {
      // 3. カナによる五十音ソート（カナがない場合は名前で代替）
      const strA = a.kana || a.name;
      const strB = b.kana || b.name;
      return strA.localeCompare(strB, 'ja');
    });

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    const safeScheduleRules = {
      mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [],
      ...(customer.scheduleRules || {})
    };
    setFormData({
      ...initialFormState,
      ...customer,
      scheduleRules: safeScheduleRules,
      defaultDuration: Number(customer.defaultDuration) || 30
    });
    setActiveTab('basic');
    setValidationErrors({});
  };

  const handleCreateNew = () => {
    setSelectedCustomerId('new');
    setIsEditing(true);
    setValidationErrors({});
    setFormData({
      ...initialFormState,
      id: generateId(),
      scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
    });
    setActiveTab('basic');
  };

  const handleDuplicate = () => {
    setSelectedCustomerId('new');
    setIsEditing(true);
    setValidationErrors({});
    setFormData(prev => ({
      ...prev,
      id: generateId(),
      name: prev.name ? `${prev.name} (コピー)` : ''
    }));
    setActiveTab('basic');
  };

  const handleKanaBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      kana: toHalfWidthKatakana(e.target.value)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'defaultDuration' ? (parseInt(value, 10) || 0) : value)
    }));
    
    if (name === 'name') {
      setValidationErrors(prev => ({ ...prev, name: !value.trim() ? '回収先名は必須です' : undefined }));
    }
    if (name === 'kana') {
      setValidationErrors(prev => ({ ...prev, kana: !value.trim() ? 'フリガナは必須です' : undefined }));
    }
  };

  const candidateRows = useMemo(() => {
    const name = String(formData.name || '').normalize('NFKC').toLowerCase().replace(/[\s・（）()-]/g, '');
    return procurementCandidates
      .map(candidate => {
        const candidateName = String(candidate.supplierName || candidate.payeeName || '').normalize('NFKC').toLowerCase().replace(/[\s・（）()-]/g, '');
        const similarity = name && candidateName && (name.includes(candidateName) || candidateName.includes(name))
          ? Math.min(name.length, candidateName.length) / Math.max(name.length, candidateName.length)
          : 0;
        return { ...candidate, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity || b.records - a.records)
      .slice(0, 10);
  }, [formData.name]);

  const handleCandidateSelect = (candidate: typeof procurementCandidates[number]) => {
    setFormData(prev => ({
      ...prev,
      supplierCode: candidate.supplierCode,
      supplierName: candidate.supplierName,
      payeeCode: candidate.payeeCode,
      payeeName: candidate.payeeName
    }));
  };

  const handlePrefTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    let newStr = '';
    if (newType === 'between') newStr = '09:00-11:00';
    else if (newType === 'before') newStr = '~12:00';
    else if (newType === 'after') newStr = '13:00~';
    else if (newType === 'exact') newStr = '09:00';
    
    setFormData(prev => ({ ...prev, preferredTime: newStr }));
  };

  const handlePrefTimeChange = (field: string, val: string) => {
    const parsed = parsePreferredTime(formData.preferredTime);
    let newStr = formData.preferredTime;
    if (parsed.type === 'between') {
      newStr = field === 'start' ? `${val}-${parsed.end || '11:00'}` : `${parsed.start || '09:00'}-${val}`;
    } else if (parsed.type === 'before') {
      newStr = `~${val}`;
    } else if (parsed.type === 'after') {
      newStr = `${val}~`;
    } else if (parsed.type === 'exact') {
      newStr = val;
    }
    setFormData(prev => ({ ...prev, preferredTime: newStr }));
  };

  const handleScheduleChange = (day: string, freq: string) => {
    setFormData(prev => {
      const rules = prev.scheduleRules || {};
      const currentDayRules = rules[day] || [];
      let newRules;
      if (freq === 'every') {
        newRules = currentDayRules.includes('every') ? [] : ['every'];
      } else {
        const withoutEvery = currentDayRules.filter(r => r !== 'every');
        if (withoutEvery.includes(freq)) {
          newRules = withoutEvery.filter(r => r !== freq);
        } else {
          newRules = [...withoutEvery, freq];
        }
      }
      return {
        ...prev,
        scheduleRules: { ...rules, [day]: newRules }
      };
    });
  };

  return (
    <div className="flex flex-row w-full h-screen bg-white overflow-hidden">
      
      {/* 左カラム: リスト */}
      <div className="w-[320px] shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full shadow-[2px_0_8px_-3px_rgba(0,0,0,0.1)] z-10">
        <div className="px-4 py-3.5 border-b border-gray-200 bg-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2"><Building size={16} className="text-emerald-600" /> 顧客マスタ</h2>
          <button type="button" onClick={onClose} className="text-gray-600 hover:text-gray-900 text-[11px] font-bold flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-gray-300 shadow-sm transition-colors">
            ← 戻る
          </button>
        </div>
        <div className="px-3 pt-3 pb-2 border-b border-gray-200 bg-white">
            <div className="relative">
              <input 
                type="text" 
                placeholder="名称やカナで検索..." 
                className="w-full pl-8 pr-3 py-1.5 border rounded-md text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>

            {/* 五十音フィルター */}
            <div className="mt-2 flex gap-0.5">
              {ROW_FILTERS.map(row => (
                <button
                  key={row.id}
                  onClick={() => setActiveRowFilter(row.id)}
                  className={`px-1 py-0.5 text-[10px] font-bold rounded transition-colors ${
                    activeRowFilter === row.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {row.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold py-1.5 px-2 rounded-md text-xs flex items-center justify-center gap-1 transition-colors"
                >
                  <Trash2 size={13} /> {selectedIds.size}件削除
                </button>
              )}
              {selectedIds.size === 0 && (
                <button
                  onClick={handleCreateNew}
                  className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-1.5 px-2 rounded-md text-sm flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus size={15} /> 新規顧客
                </button>
              )}
              {onOpenGridMode && (
                <button
                  onClick={onOpenGridMode}
                  className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold py-1.5 px-1 rounded-md text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Grid size={13} /> 一括設定
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={filteredCustomers.length > 0 && selectedIds.size === filteredCustomers.length}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 cursor-pointer"
                />
                全選択
              </label>
            </div>
            <button
              onClick={() => {
                setShowDeleted(!showDeleted);
                setSelectedCustomerId(null);
              }}
              className={`mt-2 w-full flex items-center justify-center gap-1 py-1 text-xs font-bold rounded transition-colors ${
                showDeleted ? 'bg-gray-700 text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Trash2 size={13} /> {showDeleted ? 'ゴミ箱を閉じる' : 'ゴミ箱を表示'}
            </button>
          </div>
          <div className={`flex-1 overflow-y-auto ${showDeleted ? 'bg-gray-100' : ''}`}>
            {showDeleted && (
              <div className="bg-gray-800 text-white text-xs font-bold text-center py-1 flex items-center justify-center gap-1">
                <Trash2 size={12} /> アーカイブ済み
              </div>
            )}
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className={`px-3 py-2.5 cursor-pointer transition-colors border-l-2 border-b border-b-gray-100 flex gap-2 ${
                  (selectedCustomerId === customer.id || (selectedCustomerId === 'new' && formData.id === customer.id))
                    ? 'bg-emerald-50 border-l-emerald-500'
                    : 'border-l-transparent hover:bg-emerald-50/50'
                }`}
              >
                <div className="pt-0.5" onClick={e => e.stopPropagation()}>
                  <input 
                    type="checkbox"
                    checked={selectedIds.has(customer.id)}
                    onChange={(e) => toggleSelect(customer.id, e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                  <div className="font-bold text-sm truncate flex items-center gap-1">
                    {(() => {
                      const warning = getCustomerWarning(customer);
                      return (
                        <span className={`truncate flex items-center gap-1 ${warning ? warning.color : 'text-gray-800'}`} title={warning?.title}>
                          {warning && <AlertCircle size={14} className="shrink-0" />}
                          {customer.name || '(未入力)'}
                        </span>
                      );
                    })()}
                    {customer.syncStatus === 'saving' && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse ml-1" title="保存中..."></span>}
                    {customer.syncStatus === 'error' && <span className="w-2 h-2 rounded-full bg-red-500 ml-1" title="保存エラー"></span>}
                    {customer.syncStatus === 'draft' && <span className="w-2 h-2 rounded-full bg-amber-500 ml-1" title="未同期"></span>}
                  </div>
                  {customer.isInvalid && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded whitespace-nowrap">停止中</span>}
                </div>
                <div className="text-xs text-gray-500 truncate">{customer.area || 'エリア未定'} · {customer.jobType === 'regular' ? '定期' : 'スポット'}</div>
                </div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">見つかりません</div>
            )}
          </div>
        </div>

        {/* 右カラム: フォーム */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          {!selectedCustomerId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4 bg-gray-50/50">
              <Building size={44} className="opacity-20" />
              <p className="text-sm font-bold">左のリストから顧客を選択するか、新規追加してください</p>
            </div>
          ) : (
            <form action={formAction} className="flex flex-col h-full overflow-hidden">
              {/* Header & Tabs */}
              <div className="px-6 pt-5 pb-0 border-b border-gray-200">
                <div className="max-w-4xl mx-auto w-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedCustomerId === 'new' ? '新規顧客の登録' : '顧客情報の編集'}
                    </h3>
                  </div>
                  <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'basic' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    基本情報
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveTab('condition')}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'condition' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    回収条件・スケジュール
                  </button>
                </div>
              </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto bg-gray-50/30">
                <div className="max-w-4xl mx-auto w-full p-6">
                
                {activeTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    {/* 現場情報セクション */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                      <div className="col-span-2">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">現場情報</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 whitespace-nowrap w-20 shrink-0">回収先名 <span className="text-red-500">*</span></label>
                        <div className="flex-1">
                          <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 

                            className={`w-full border rounded px-2 py-1.5 text-sm ${validationErrors.name ? 'border-red-500 bg-red-50' : ''}`} 
                            placeholder="例: 富士ロジ長沼 AM" 
                          />
                          {validationErrors.name && <div className="text-red-500 text-[10px] font-bold mt-1">{validationErrors.name}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 whitespace-nowrap w-20 shrink-0">フリガナ <span className="text-red-500">*</span></label>
                        <div className="flex-1">
                          <input type="text" name="kana" value={formData.kana} onChange={handleChange} onBlur={handleKanaBlur} className={`w-full border rounded px-2 py-1.5 text-sm ${validationErrors.kana ? 'border-red-500 bg-red-50' : ''}`} placeholder="カタカナで入力" />
                          {validationErrors.kana && <div className="text-red-500 text-[10px] font-bold mt-1">{validationErrors.kana}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 whitespace-nowrap w-20 shrink-0">回収先ID <span className="text-red-500">*</span></label>
                        <input type="text" name="id" value={formData.id} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm bg-gray-50" readOnly={selectedCustomerId !== 'new'} />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 whitespace-nowrap w-20 shrink-0">エリア</label>
                        <input type="text" name="area" value={formData.area} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm" placeholder="例: 厚木" />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 whitespace-nowrap w-20 shrink-0">現場住所</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm" />
                      </div>
                    </div>

                    {/* 経理情報セクション */}
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">経理・管理情報</h4>
                      <div className="grid grid-cols-2 gap-x-5 gap-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-500 whitespace-nowrap w-20 shrink-0">支払先コード</label>
                          <input type="text" name="payeeCode" value={formData.payeeCode || ''} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm bg-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-500 whitespace-nowrap w-20 shrink-0">支払先名</label>
                          <input type="text" name="payeeName" value={formData.payeeName || ''} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm bg-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-500 whitespace-nowrap w-20 shrink-0">仕入先コード</label>
                          <input type="text" name="supplierCode" value={formData.supplierCode || ''} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm bg-white" />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-gray-500 whitespace-nowrap w-20 shrink-0">仕入先名</label>
                          <input type="text" name="supplierName" value={formData.supplierName || ''} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm bg-white" />
                        </div>
                        {(!formData.supplierCode || !formData.payeeCode) && (
                          <div className="col-span-2 mt-2 rounded border border-emerald-100 bg-emerald-50/40 p-3">
                            <div className="mb-2">
                              <div className="text-xs font-bold text-emerald-800">仕入日報から候補を選択</div>
                              <div className="text-[10px] text-emerald-700/80">
                                Pythonで集計した226組を、回収先名との一致度・取引件数順で表示しています。選択すると4項目に反映されます。
                              </div>
                            </div>
                            <div className="max-h-48 space-y-1 overflow-y-auto">
                              {candidateRows.map((candidate, index) => (
                                <button
                                  key={`${candidate.supplierCode}-${candidate.payeeCode}`}
                                  type="button"
                                  onClick={() => handleCandidateSelect(candidate)}
                                  className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-left hover:border-emerald-400 hover:bg-emerald-50"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-4 shrink-0 text-[10px] font-bold text-emerald-700">{index + 1}.</span>
                                    <span className="min-w-0 flex-1">
                                      <span className="block truncate text-xs font-bold text-gray-800">{candidate.supplierName || candidate.payeeName}</span>
                                      <span className="block truncate text-[10px] text-gray-500">
                                        仕入先 {candidate.supplierCode || '—'} ・ 支払先 {candidate.payeeName || '—'} ({candidate.payeeCode || '—'})
                                      </span>
                                    </span>
                                    <span className="shrink-0 text-[10px] text-gray-500">{candidate.records.toLocaleString()}件</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'condition' && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">

                    {/* ブロック①: 案件タイプ */}
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">案件タイプ</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, jobType: 'regular' }))}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.jobType === 'regular'
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`font-bold text-sm mb-1 flex items-center gap-2 ${
                            formData.jobType === 'regular' ? 'text-emerald-700' : 'text-gray-700'
                          }`}>
                            <Calendar size={15} />
                            定期回収
                            {formData.jobType === 'regular' && <Check size={14} className="ml-auto" />}
                          </div>
                          <div className="text-xs text-gray-500">曜日・週次スケジュールを自動展開</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, jobType: 'spot' }))}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            formData.jobType === 'spot'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`font-bold text-sm mb-1 flex items-center gap-2 ${
                            formData.jobType === 'spot' ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            <AlertCircle size={15} />
                            スポット（突発）
                            {formData.jobType === 'spot' && <Check size={14} className="ml-auto" />}
                          </div>
                          <div className="text-xs text-gray-500">カレンダー自動展開なし・個別追加で運用</div>
                        </button>
                      </div>
                    </div>

                    {/* ブロック②: スケジュールグリッド（定期時のみ） */}
                    {formData.jobType === 'regular' && (
                      <div>
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">回収スケジュール</h4>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* ヘッダー行（曜日） */}
                          <div className="grid bg-gray-50 border-b border-gray-200" style={{gridTemplateColumns: '72px repeat(7, 1fr)'}}>
                            <div className="px-3 py-2 text-[11px] font-bold text-gray-400">頻度</div>
                            {DAYS.map(day => (
                              <div key={day.key} className="py-2 text-center text-[11px] font-bold text-gray-600">{day.label}</div>
                            ))}
                          </div>
                          {/* データ行（頻度ごと） */}
                          {FREQUENCIES.map((freq, fi) => (
                            <div
                              key={freq.value}
                              className={`grid items-center ${
                                fi < FREQUENCIES.length - 1 ? 'border-b border-gray-100' : ''
                              }`}
                              style={{gridTemplateColumns: '72px repeat(7, 1fr)'}}
                            >
                              <div className="px-3 py-2.5 text-xs font-bold text-gray-500">{freq.label}</div>
                              {DAYS.map(day => {
                                const isActive = (formData.scheduleRules?.[day.key] || []).includes(freq.value);
                                return (
                                  <div key={day.key} className="flex justify-center py-2">
                                    <button
                                      type="button"
                                      onClick={(e) => { e.preventDefault(); handleScheduleChange(day.key, freq.value); }}
                                      className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${
                                        isActive
                                          ? 'bg-emerald-500 text-white shadow-sm'
                                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                      }`}
                                    >
                                      {isActive ? '✓' : ''}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            <input type="checkbox" name="holidayCollection" checked={formData.holidayCollection} onChange={handleChange} className="rounded text-emerald-600 focus:ring-emerald-500" />
                            祝日も通常通り回収する
                          </label>
                        </div>
                      </div>
                    )}

                    {/* ブロック③: 回収条件 */}
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">回収条件</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-gray-600 w-24 shrink-0">希望時間</label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={parsePreferredTime(formData.preferredTime).type}
                              onChange={handlePrefTypeChange}
                              className="border rounded px-2 py-1.5 text-sm bg-white"
                            >
                              <option value="none">指定なし</option>
                              <option value="between">時間帯指定 (〜の間)</option>
                              <option value="before">期限指定 (〜までに)</option>
                              <option value="after">以降指定 (〜以降)</option>
                              <option value="exact">時間指定 (〜頃)</option>
                            </select>
                            {(() => {
                              const parsed = parsePreferredTime(formData.preferredTime);
                              if (parsed.type === 'between') return (
                                <div className="flex items-center gap-1">
                                  <TimeSelect value={parsed.start || ''} onChange={val => handlePrefTimeChange('start', val)} className="w-[110px]" />
                                  <span className="text-gray-400 text-sm">〜</span>
                                  <TimeSelect value={parsed.end || ''} onChange={val => handlePrefTimeChange('end', val)} className="w-[110px]" />
                                </div>
                              );
                              if (parsed.type === 'before' || parsed.type === 'after' || parsed.type === 'exact') return (
                                <div className="flex items-center gap-1">
                                  {parsed.type === 'before' && <span className="text-sm text-gray-500">遅くとも</span>}
                                  <TimeSelect value={parsed.time || ''} onChange={val => handlePrefTimeChange('time', val)} className="w-[110px]" />
                                  {parsed.type === 'before' && <span className="text-sm text-gray-500">までに</span>}
                                  {parsed.type === 'after' && <span className="text-sm text-gray-500">以降</span>}
                                  {parsed.type === 'exact' && <span className="text-sm text-gray-500">頃</span>}
                                </div>
                              );
                              return null;
                            })()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-gray-600 w-24 shrink-0">所要時間</label>
                          <div className="flex items-center gap-2">
                            <input type="number" name="defaultDuration" value={formData.defaultDuration} onChange={handleChange} min="5" step="5" className="border rounded px-2 py-1.5 text-sm w-24" />
                            <span className="text-sm text-gray-500">分</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-gray-600 w-24 shrink-0">必須車両</label>
                          <select name="requiredVehicle" value={formData.requiredVehicle} onChange={handleChange} className="border rounded px-2 py-1.5 text-sm bg-white">
                            <option value="">指定なし</option>
                            {(masterVehicles || []).map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                          </select>
                        </div>
                        <div className="flex items-start gap-3">
                          <label className="text-xs font-bold text-gray-600 w-24 shrink-0 pt-1">回収品目</label>
                          <div className="flex-1">
                            <SearchableMultiSelect
                              options={masterItems}
                              value={formData.items || []}
                              onChange={(newItems) => setFormData(prev => ({ ...prev, items: newItems }))}
                              placeholder="品目を検索・選択..."
                            />
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <label className="text-xs font-bold text-gray-600 w-24 shrink-0 pt-1">備考</label>
                          <textarea name="note" value={formData.note} onChange={handleChange} rows={3} className="flex-1 border rounded px-2 py-1.5 text-sm resize-none" placeholder="ドライバーや事務処理への特記事項..."></textarea>
                        </div>
                        <div className="flex items-center gap-3 pt-1">
                          <label className="text-xs font-bold text-gray-600 w-24 shrink-0">稼働状態</label>
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            <input type="checkbox" name="isInvalid" checked={formData.isInvalid} onChange={handleChange} className="rounded text-gray-500 focus:ring-gray-400" />
                            このマスタを一時停止する（カレンダーに展開しない）
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    {selectedCustomerId !== 'new' && (
                      <>
                      <button 
                        type="button"
                        onClick={async () => {
                          const confirmMsg = formData.isDeleted 
                            ? 'この顧客を完全に削除しますか？\n※過去に配車実績がある場合は削除できません。'
                            : 'この顧客を削除しますか？\n※過去の配車実績がある場合は、安全のため自動的にアーカイブ（論理削除）されます。';
                          
                          if(window.confirm(confirmMsg)) {
                            const deletedCustomer = { ...formData, isDeleted: true, syncStatus: 'saving' };
                            startTransition(() => {
                              setOptimisticCustomer(deletedCustomer as any);
                            });
                            try {
                              if (onDelete) {
                                const result = await onDelete(formData.id);
                                if (result === 'hard') {
                                  window.alert('完全に削除しました。');
                                } else if (result === 'soft') {
                                  window.alert(formData.isDeleted ? '過去に配車実績があるため完全削除はできません。' : '過去に配車実績があるため完全削除はできません。代わりにアーカイブしました。');
                                } else {
                                  window.alert('通信エラーのため削除できませんでした。');
                                }
                              } else {
                                await Promise.resolve(onSave({ ...formData, isDeleted: true }));
                              }
                              setSelectedCustomerId(null);
                            } catch (e) {
                              startTransition(() => {
                                setOptimisticCustomer({ ...formData, syncStatus: 'error', syncError: '削除に失敗しました' } as any);
                              });
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-bold flex items-center gap-1"
                      >
                        <Trash2 size={16} /> {formData.isDeleted ? '完全に削除' : '削除'}
                      </button>

                      {!formData.isDeleted && (
                        <button 
                          type="button"
                          onClick={handleDuplicate}
                          className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                        >
                          <Copy size={16} /> コピーを作成
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {saveStatus === 'saved' && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check size={16} /> 保存しました
                    </span>
                  )}
                  <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 font-bold bg-white shadow-sm">
                    閉じる
                  </button>
                  
                  {formData.isDeleted ? (
                    <button 
                      type="button"
                      disabled={isPending}
                      onClick={async () => {
                        const restoredCustomer = { ...formData, isDeleted: false, syncStatus: 'saving' };
                        startTransition(() => {
                          setOptimisticCustomer(restoredCustomer as any);
                        });
                        try {
                          await Promise.resolve(onSave(restoredCustomer));
                          window.alert('復元しました。');
                          setSelectedCustomerId(null);
                        } catch (e) {
                          startTransition(() => {
                            setOptimisticCustomer({ ...formData, syncStatus: 'error', syncError: '復元に失敗しました' } as any);
                          });
                        }
                      }}
                      className="px-5 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-all bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {isPending ? '復元中...' : '復元する'}
                    </button>
                  ) : (
                    <button 
                      type="submit"
                      disabled={isPending}
                      className={`px-5 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-all ${(saveStatus === 'saved' && !isPending) ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'} ${isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isPending ? '保存中...' : (saveStatus === 'saved' ? <><Check size={16} /> 保存完了</> : '保存する')}
                    </button>
                  )}
                </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
  );
}
