import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Search, Trash2, Building, Calendar, Settings, AlertCircle, Grid, Check, Copy } from 'lucide-react';
import { MASTER_VEHICLES_LIST } from '../data/constants';
import { parsePreferredTime } from '../utils/timeUtils';
import { toHalfWidthKatakana } from '../utils/textUtils';
import SearchableMultiSelect from './SearchableMultiSelect';

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

export default function CustomerManagementModal({ customers, masterVehicles, masterItems = [], onSave, onDelete, onClose, onOpenGridMode, initialData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [formData, setFormData] = useState(initialData || { ...initialFormState });
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(!!initialData); // 初期データがあれば編集モード(新規フォーム状態)

  // initialDataがあれば初期フォームにセットする
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      setIsEditing(true);
    }
  }, [initialData]);

  // モーダルオープン時のスクロールロック
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saved'
  const [activeRowFilter, setActiveRowFilter] = useState('all');
  
  // フリガナ自動入力用のIMEバッファと制御
  const compositionBuffer = useRef('');
  const IGNORE_KANA_LIST = ['かぶ', 'かぶしきがいしゃ', 'かぶしきかいしゃ', 'ゆうげん', 'ゆうげんがいしゃ', 'ごうどうがいしゃ', 'いりょうほうじん'];

  const handleCompositionUpdate = (e) => {
    compositionBuffer.current = e.data;
  };

  const handleCompositionEnd = (e) => {
    const reading = compositionBuffer.current;
    if (reading) {
      if (!IGNORE_KANA_LIST.includes(reading)) {
        const halfKana = toHalfWidthKatakana(reading);
        setFormData(prev => ({
          ...prev,
          kana: (prev.kana + halfKana).trim()
        }));
      }
      compositionBuffer.current = '';
    }
  };
  
  // フィルターとソート
  const filteredCustomers = customers
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

  const handleSelectCustomer = (customer) => {
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
    setSaveStatus('idle');
  };

  const handleCreateNew = () => {
    setSelectedCustomerId('new');
    setFormData({ ...initialFormState, id: `C_${Date.now()}` });
    setActiveTab('basic');
    setSaveStatus('idle');
  };

  const handleDuplicate = () => {
    setSelectedCustomerId('new');
    setFormData(prev => ({
      ...prev,
      id: `C_${Date.now()}`,
      name: prev.name ? `${prev.name} (コピー)` : ''
    }));
    setActiveTab('basic');
    setSaveStatus('idle');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'defaultDuration' ? (parseInt(value, 10) || 0) : value)
    }));
  };

  const handlePrefTypeChange = (e) => {
    const newType = e.target.value;
    let newStr = '';
    if (newType === 'between') newStr = '09:00-11:00';
    else if (newType === 'before') newStr = '~12:00';
    else if (newType === 'after') newStr = '13:00~';
    else if (newType === 'exact') newStr = '09:00';
    
    setFormData(prev => ({ ...prev, preferredTime: newStr }));
  };

  const handlePrefTimeChange = (field, val) => {
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

  const handleScheduleChange = (day, freq) => {
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

  const handleSubmit = (e, shouldClose = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!formData.name || !formData.name.trim()) return alert('回収先名は必須です');
    if (!formData.kana || !formData.kana.trim()) return alert('フリガナは必須です（五十音フィルターに使用されます）');

    const customerToSave = {
      ...formData,
      name: formData.name.trim(),
      defaultDuration: Number(formData.defaultDuration) || 30,
      scheduleRules: formData.scheduleRules || { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] }
    };

    onSave(customerToSave);
    
    // If it was new, we stay on it but it becomes an existing one in the list
    if (selectedCustomerId === 'new') setSelectedCustomerId(customerToSave.id);

    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
      if (shouldClose && onClose) {
        onClose();
      }
    }, 800);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-screen w-[900px] bg-white shadow-2xl z-50 flex overflow-hidden animate-in slide-in-from-right duration-300 border-l border-gray-200">
        
        {/* 左カラム: リスト */}
        <div className="w-[280px] shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
          <div className="px-4 py-3.5 border-b border-gray-200 bg-gray-100">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><Building size={16} className="text-emerald-600" /> 顧客マスタ</h2>
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
              <button
                onClick={handleCreateNew}
                className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-1.5 px-2 rounded-md text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <Plus size={15} /> 新規顧客
              </button>
              {onOpenGridMode && (
                <button
                  onClick={onOpenGridMode}
                  className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 font-bold py-1.5 px-1 rounded-md text-[10px] flex items-center justify-center gap-1 transition-colors"
                >
                  <Grid size={13} /> 一括設定
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.map(customer => (
              <div
                key={customer.id}
                onClick={() => handleSelectCustomer(customer)}
                className={`px-3 py-2.5 cursor-pointer transition-colors border-l-2 border-b border-b-gray-100 ${
                  selectedCustomerId === customer.id
                    ? 'bg-emerald-50 border-l-emerald-500'
                    : 'border-l-transparent hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex justify-between items-start mb-0.5">
                  <div className="font-bold text-sm text-gray-800 truncate">{customer.name}</div>
                  {customer.isInvalid && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded whitespace-nowrap">停止中</span>}
                </div>
                <div className="text-xs text-gray-500 truncate">{customer.area || 'エリア未定'} · {customer.jobType === 'regular' ? '定期' : 'スポット'}</div>
              </div>
            ))}
            {filteredCustomers.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">見つかりません</div>
            )}
          </div>
        </div>

        {/* 右カラム: フォーム */}
        <div className="w-2/3 flex flex-col h-full bg-white relative">
          {!selectedCustomerId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-3">
              <Building size={44} className="opacity-20" />
              <p className="text-sm">左のリストから顧客を選択するか、新規追加してください</p>
            </div>
          ) : (
            <>
              {/* Header & Tabs */}
              <div className="px-6 pt-5 pb-0 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {selectedCustomerId === 'new' ? '新規顧客の登録' : '顧客情報の編集'}
                  </h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('basic')}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'basic' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    基本情報
                  </button>
                  <button 
                    onClick={() => setActiveTab('condition')}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'condition' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    回収条件・スケジュール
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                
                {activeTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                    {/* 現場情報セクション */}
                    <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                      <div className="col-span-2">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">現場情報</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 whitespace-nowrap w-20 shrink-0">回収先名 <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          onCompositionUpdate={handleCompositionUpdate}
                          onCompositionEnd={handleCompositionEnd}
                          className="flex-1 border rounded px-2 py-1.5 text-sm" 
                          placeholder="例: 富士ロジ長沼 AM" 
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-600 whitespace-nowrap w-20 shrink-0">フリガナ <span className="text-red-500">*</span></label>
                        <input type="text" name="kana" value={formData.kana} onChange={handleChange} className="flex-1 border rounded px-2 py-1.5 text-sm" placeholder="カタカナで入力" />
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
                                  <input type="time" value={parsed.start || ''} onChange={e => handlePrefTimeChange('start', e.target.value)} className="border rounded px-2 py-1.5 text-sm w-[110px]" />
                                  <span className="text-gray-400 text-sm">〜</span>
                                  <input type="time" value={parsed.end || ''} onChange={e => handlePrefTimeChange('end', e.target.value)} className="border rounded px-2 py-1.5 text-sm w-[110px]" />
                                </div>
                              );
                              if (parsed.type === 'before' || parsed.type === 'after' || parsed.type === 'exact') return (
                                <div className="flex items-center gap-1">
                                  {parsed.type === 'before' && <span className="text-sm text-gray-500">遅くとも</span>}
                                  <input type="time" value={parsed.time || ''} onChange={e => handlePrefTimeChange('time', e.target.value)} className="border rounded px-2 py-1.5 text-sm w-[110px]" />
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
                          <textarea name="note" value={formData.note} onChange={handleChange} rows="3" className="flex-1 border rounded px-2 py-1.5 text-sm resize-none" placeholder="ドライバーや事務処理への特記事項..."></textarea>
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

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-6">
                  {selectedCustomerId !== 'new' && (
                    <>
                      <button 
                        onClick={() => {
                          if(window.confirm('この顧客を削除しますか？')) {
                            onDelete(formData.id);
                            setSelectedCustomerId(null);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-bold flex items-center gap-1"
                      >
                        <Trash2 size={16} /> 削除
                      </button>

                      <button 
                        onClick={handleDuplicate}
                        className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1"
                      >
                        <Copy size={16} /> コピーを作成
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {saveStatus === 'saved' && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-in fade-in">
                      <Check size={16} /> 保存しました
                    </span>
                  )}
                  <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 font-bold bg-white shadow-sm">
                    閉じる
                  </button>
                  <button 
                    onClick={(e) => handleSubmit(e, false)} 
                    className={`px-5 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-all ${saveStatus === 'saved' ? 'bg-emerald-700 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  >
                    {saveStatus === 'saved' ? (
                      <>
                        <Check size={16} /> 保存完了
                      </>
                    ) : (
                      '保存する'
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
