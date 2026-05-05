
import React, { useState } from 'react';
import type { InspectionItem } from '../types';
import { Button, Card, Modal } from '../components/Widgets';
import { useAgentId } from '../components/AgentContext';
import { INITIAL_INSPECTION_ITEMS } from '../constants';

interface Props {
  onComplete: () => void;
}

export const InspectionPage: React.FC<Props> = ({ onComplete }) => {
  const [items, setItems] = useState<InspectionItem[]>(INITIAL_INSPECTION_ITEMS);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const openBulkCheckConfirm = () => {
    setConfirmOpen(true);
  };

  const executeBulkCheck = () => {
    setItems(prev => prev.map(item => ({ ...item, checked: true })));
    setConfirmOpen(false);
  };

  const isAllChecked = items.every(i => i.checked);
  const driverItems = items.filter(i => i.id.startsWith('dr-'));
  const vehicleItems = items.filter(i => !i.id.startsWith('dr-'));

  const renderItem = (item: InspectionItem) => (
    <Card 
      key={item.id} 
      onClick={() => toggleItem(item.id)}
      className={`flex items-center space-x-4 transition-all active:scale-[0.98] ${item.checked ? 'border-success bg-green-50' : ''}`}
      agentId={`item-card:${item.id}`}
    >
      <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 ${item.checked ? 'bg-success border-success text-white' : 'border-slate-300 text-transparent'}`}>
        <i className="fa-solid fa-check text-sm"></i>
      </div>
      <span className={`text-lg font-bold flex-1 ${item.checked ? 'text-green-800' : 'text-slate-700'}`}>
        {item.label}
      </span>
    </Card>
  );

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-slate-800">始業前点検</h2>
        <p className="text-sm text-slate-500">今日も一日安全運転でお願いします。<br/>乗務前点検および車両点検を行ってください。</p>
      </div>

      {!isAllChecked && (
        <button 
          onClick={openBulkCheckConfirm}
          className="w-full bg-blue-50 text-blue-700 font-bold py-3 rounded-xl border border-blue-200 active:bg-blue-100 transition-colors flex items-center justify-center space-x-2 touch-manipulation"
          data-agent-id={useAgentId("bulk-check-button")}
        >
          <i className="fa-solid fa-check-double"></i>
          <span>全ての項目を「異常なし」とする</span>
        </button>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <i className="fa-solid fa-user-shield mr-2"></i>乗務員点検（必須）
        </h3>
        <div className="space-y-3">
          {driverItems.map(renderItem)}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
          <i className="fa-solid fa-truck mr-2"></i>車両日常点検
        </h3>
        <div className="space-y-3">
          {vehicleItems.map(renderItem)}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-slate-200 shadow-lg pb-safe z-10">
        <Button 
          disabled={!isAllChecked} 
          onClick={onComplete}
          className={!isAllChecked ? 'opacity-50 cursor-not-allowed bg-slate-400' : ''}
          agentId="complete-button"
        >
          {isAllChecked ? '点検完了・業務開始' : '全ての項目を確認してください'}
        </Button>
      </div>

      <Modal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} title="一括チェックの確認" agentId="bulk-confirm-modal">
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-yellow-900 flex items-start">
             <i className="fa-solid fa-triangle-exclamation mt-1 mr-3 text-xl shrink-0"></i>
             <div>
               <h4 className="font-bold text-lg mb-1">法令に基づく確認</h4>
               <p className="text-sm leading-relaxed">
                 アルコールチェックを含む全ての項目を確認し、異常がないことを誓約しますか？<br/>
                 <span className="font-bold text-red-600 mt-2 block border-t border-yellow-200 pt-1">※酒気帯び運転および虚偽報告は厳正に処罰されます。</span>
               </p>
             </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} agentId="bulk-confirm-modal:cancel-button">キャンセル</Button>
            <Button onClick={executeBulkCheck} agentId="bulk-confirm-modal:execute-button">誓約してチェック</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
