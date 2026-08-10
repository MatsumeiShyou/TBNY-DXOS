import React, { useState, useEffect } from 'react';
import { X, Plus, Search, Trash2, Building, Calendar, Settings, AlertCircle } from 'lucide-react';
import { MASTER_VEHICLES_LIST } from '../data/constants';
import { parsePreferredTime } from '../utils/timeUtils';
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

const initialFormState = {
  id: '',
  payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
  name: '', kana: '', area: '', address: '',
  jobType: 'regular',
  scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
  holidayCollection: false,
  defaultDuration: 30, requiredVehicle: '',
  items: [], note: '', isInvalid: false, preferredTime: ''
};

export default function CustomerManagementModal({ customers, masterVehicles, masterItems = [], onSave, onDelete, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [formData, setFormData] = useState({ ...initialFormState });
  const [activeTab, setActiveTab] = useState('basic');
  const [newItemTag, setNewItemTag] = useState('');
  
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.kana && c.kana.includes(searchTerm))
  );

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer.id);
    setFormData({ ...initialFormState, ...customer });
    setActiveTab('basic');
  };

  const handleCreateNew = () => {
    setSelectedCustomerId('new');
    setFormData({ ...initialFormState, id: `C_${Date.now()}` });
    setActiveTab('basic');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      const currentDayRules = prev.scheduleRules[day] || [];
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
        scheduleRules: { ...prev.scheduleRules, [day]: newRules }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return alert('回収先名は必須です');
    onSave(formData);
    // If it was new, we stay on it but it becomes an existing one in the list
    if (selectedCustomerId === 'new') setSelectedCustomerId(formData.id);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose}></div>
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[900px] h-[650px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* 左カラム: リスト */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-gray-800 flex items-center gap-2"><Building size={18} /> 顧客マスタ</h2>
          </div>
          <div className="p-3 border-b border-gray-200 bg-white">
            <div className="relative">
              <input 
                type="text" 
                placeholder="名称やカナで検索..." 
                className="w-full pl-8 pr-3 py-1.5 border rounded-md text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            </div>
            <button 
              onClick={handleCreateNew}
              className="w-full mt-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-bold py-1.5 px-3 rounded-md text-sm flex items-center justify-center gap-1 transition-colors"
            >
              <Plus size={16} /> 新規顧客を追加
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                onClick={() => handleSelectCustomer(customer)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-emerald-50 transition-colors ${selectedCustomerId === customer.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="font-bold text-sm text-gray-800 truncate">{customer.name}</div>
                  {customer.isInvalid && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded whitespace-nowrap">無効</span>}
                </div>
                <div className="text-xs text-gray-500 truncate">{customer.area || 'エリア未定'} | {customer.jobType === 'regular' ? '定期' : 'スポット'}</div>
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
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Building size={48} className="mb-4 opacity-20" />
              <p>左のリストから顧客を選択するか、新規追加してください</p>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">回収先ID <span className="text-red-500">*</span></label>
                        <input type="text" name="id" value={formData.id} onChange={handleChange} className="w-full border rounded p-2 text-sm bg-gray-50" readOnly={selectedCustomerId !== 'new'} />
                        {selectedCustomerId === 'new' && <p className="text-[10px] text-gray-400 mt-1">自動採番されますが変更可能です</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">エリア</label>
                        <input type="text" name="area" value={formData.area} onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="例: 厚木" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">支払先コード</label>
                        <input type="text" name="payeeCode" value={formData.payeeCode} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">支払先名 (管理会社等)</label>
                        <input type="text" name="payeeName" value={formData.payeeName} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">仕入先コード</label>
                        <input type="text" name="supplierCode" value={formData.supplierCode} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">仕入先名</label>
                        <input type="text" name="supplierName" value={formData.supplierName} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
                      </div>
                    </div>

                    <div className="pt-2 border-t space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">回収先名 (表示名) <span className="text-red-500">*</span></label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded p-2 text-sm" placeholder="例: 富士ロジ長沼 AM" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">フリガナ</label>
                        <input type="text" name="kana" value={formData.kana} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">現場住所</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border rounded p-2 text-sm" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'condition' && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="jobType" value="regular" checked={formData.jobType === 'regular'} onChange={handleChange} className="text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm font-bold text-gray-700">定期回収</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="jobType" value="spot" checked={formData.jobType === 'spot'} onChange={handleChange} className="text-emerald-600 focus:ring-emerald-500" />
                          <span className="text-sm font-bold text-gray-700">スポット（突発）</span>
                        </label>
                      </div>

                      {formData.jobType === 'regular' ? (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-2"><Calendar size={12}/> 詳細スケジュール設定</h4>
                          {DAYS.map(day => (
                            <div key={day.key} className="flex items-center gap-3">
                              <div className="w-8 text-sm font-bold text-gray-700">{day.label}</div>
                              <div className="flex flex-wrap gap-2">
                                {FREQUENCIES.map(freq => {
                                  const isActive = (formData.scheduleRules?.[day.key] || []).includes(freq.value);
                                  return (
                                    <button
                                      key={freq.value}
                                      onClick={(e) => { e.preventDefault(); handleScheduleChange(day.key, freq.value); }}
                                      className={`px-2 py-1 text-xs rounded border transition-colors ${isActive ? 'bg-emerald-100 border-emerald-400 text-emerald-800 font-bold' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                      {freq.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                          <div className="mt-3 pt-3 border-t">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" name="holidayCollection" checked={formData.holidayCollection} onChange={handleChange} className="rounded text-emerald-600 focus:ring-emerald-500" />
                              <span className="text-sm text-gray-700">祝日も通常通り回収する</span>
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded text-sm text-gray-500 border border-gray-100 flex items-start gap-2">
                          <AlertCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          スポット案件は特定スケジュールの自動カレンダー展開対象外となります。未配車リストから直接追加して運用してください。
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="col-span-1 md:col-span-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">希望時間</label>
                        <div className="flex gap-2">
                          <select 
                            value={parsePreferredTime(formData.preferredTime).type} 
                            onChange={handlePrefTypeChange}
                            className="border rounded p-2 text-sm bg-white"
                          >
                            <option value="none">指定なし</option>
                            <option value="between">時間帯指定 (〜の間)</option>
                            <option value="before">期限指定 (〜までに)</option>
                            <option value="after">以降指定 (〜以降)</option>
                            <option value="exact">時間指定 (〜頃)</option>
                          </select>
                          
                          {(() => {
                            const parsed = parsePreferredTime(formData.preferredTime);
                            if (parsed.type === 'between') {
                              return (
                                <div className="flex items-center gap-1">
                                  <input type="time" value={parsed.start || ''} onChange={e => handlePrefTimeChange('start', e.target.value)} className="border rounded p-2 text-sm w-[110px]" />
                                  <span className="text-gray-500">〜</span>
                                  <input type="time" value={parsed.end || ''} onChange={e => handlePrefTimeChange('end', e.target.value)} className="border rounded p-2 text-sm w-[110px]" />
                                </div>
                              );
                            } else if (parsed.type === 'before' || parsed.type === 'after' || parsed.type === 'exact') {
                              return (
                                <div className="flex items-center gap-1">
                                  {parsed.type === 'before' && <span className="text-sm text-gray-500">遅くとも</span>}
                                  <input type="time" value={parsed.time || ''} onChange={e => handlePrefTimeChange('time', e.target.value)} className="border rounded p-2 text-sm w-[110px]" />
                                  {parsed.type === 'before' && <span className="text-sm text-gray-500">までに</span>}
                                  {parsed.type === 'after' && <span className="text-sm text-gray-500">以降</span>}
                                  {parsed.type === 'exact' && <span className="text-sm text-gray-500">頃</span>}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">デフォルト所要時間(分)</label>
                        <input type="number" name="defaultDuration" value={formData.defaultDuration} onChange={handleChange} min="5" step="5" className="w-full border rounded p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">必須車両</label>
                        <select name="requiredVehicle" value={formData.requiredVehicle} onChange={handleChange} className="w-full border rounded p-2 text-sm bg-white">
                          <option value="">指定なし</option>
                          {(masterVehicles || []).map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-2">回収品目設定</label>
                      <SearchableMultiSelect
                        options={masterItems}
                        value={formData.items || []}
                        onChange={(newItems) => setFormData(prev => ({ ...prev, items: newItems }))}
                        placeholder="品目を検索・選択..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">備考</label>
                      <textarea name="note" value={formData.note} onChange={handleChange} rows="2" className="w-full border rounded p-2 text-sm" placeholder="ドライバーや事務処理への特記事項..."></textarea>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer p-2 bg-red-50 border border-red-100 rounded">
                        <input type="checkbox" name="isInvalid" checked={formData.isInvalid} onChange={handleChange} className="rounded text-red-600 focus:ring-red-500" />
                        <span className="text-sm font-bold text-red-700">このマスタを無効にする（一覧で非表示・使用不可）</span>
                      </label>
                    </div>

                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  {selectedCustomerId !== 'new' && (
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
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 font-bold bg-white shadow-sm">
                    キャンセル
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    className="px-6 py-2 bg-emerald-600 text-white rounded text-sm font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-2"
                  >
                    保存する
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
