
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
      className={`tw-flex tw-items-center tw-space-x-4 tw-transition-all active:tw-scale-[0.98] ${item.checked ? 'tw-border-success tw-bg-green-50' : ''}`}
      agentId={`item-card:${item.id}`}
    >
      <div className={`tw-w-8 tw-h-8 tw-shrink-0 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-border-2 ${item.checked ? 'tw-bg-success tw-border-success tw-text-white' : 'tw-border-slate-300 tw-text-transparent'}`}>
        <i className="fa-solid fa-check tw-text-sm"></i>
      </div>
      <span className={`tw-text-lg tw-font-bold tw-flex-1 ${item.checked ? 'tw-text-green-800' : 'tw-text-slate-700'}`}>
        {item.label}
      </span>
    </Card>
  );

  return (
    <div className="tw-p-4 tw-space-y-6 tw-pb-24">
      <div className="tw-text-center tw-space-y-2">
        <h2 className="tw-text-xl tw-font-bold tw-text-slate-800">始業前点検</h2>
        <p className="tw-text-sm tw-text-slate-500">今日も一日安全運転でお願いします。<br/>乗務前点検および車両点検を行ってください。</p>
      </div>

      {!isAllChecked && (
        <button 
          onClick={openBulkCheckConfirm}
          className="tw-w-full tw-bg-blue-50 tw-text-blue-700 tw-font-bold tw-py-3 tw-rounded-xl tw-border tw-border-blue-200 active:tw-bg-blue-100 tw-transition-colors tw-flex tw-items-center tw-justify-center tw-space-x-2 tw-touch-manipulation"
          data-agent-id={useAgentId("bulk-check-button")}
        >
          <i className="fa-solid fa-check-double"></i>
          <span>全ての項目を「異常なし」とする</span>
        </button>
      )}

      <div className="tw-space-y-3">
        <h3 className="tw-text-sm tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-flex tw-items-center">
          <i className="fa-solid fa-user-shield tw-mr-2"></i>乗務員点検（必須）
        </h3>
        <div className="tw-space-y-3">
          {driverItems.map(renderItem)}
        </div>
      </div>

      <div className="tw-space-y-3 tw-pt-2">
        <h3 className="tw-text-sm tw-font-bold tw-text-slate-500 tw-uppercase tw-tracking-wider tw-flex tw-items-center">
          <i className="fa-solid fa-truck tw-mr-2"></i>車両日常点検
        </h3>
        <div className="tw-space-y-3">
          {vehicleItems.map(renderItem)}
        </div>
      </div>

      <div className="tw-fixed tw-bottom-0 tw-left-0 tw-w-full tw-p-4 tw-bg-white tw-border-t tw-border-slate-200 tw-shadow-lg tw-pb-safe tw-z-10">
        <Button 
          disabled={!isAllChecked} 
          onClick={onComplete}
          className={!isAllChecked ? 'tw-opacity-50 tw-cursor-not-allowed tw-bg-slate-400' : ''}
          agentId="complete-button"
        >
          {isAllChecked ? '点検完了・業務開始' : '全ての項目を確認してください'}
        </Button>
      </div>

      <Modal isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)} title="一括チェックの確認" agentId="bulk-confirm-modal">
        <div className="tw-space-y-6">
          <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-xl tw-border tw-border-yellow-200 tw-text-yellow-900 tw-flex tw-items-start">
             <i className="fa-solid fa-triangle-exclamation tw-mt-1 tw-mr-3 tw-text-xl tw-shrink-0"></i>
             <div>
               <h4 className="tw-font-bold tw-text-lg tw-mb-1">法令に基づく確認</h4>
               <p className="tw-text-sm tw-leading-relaxed">
                 アルコールチェックを含む全ての項目を確認し、異常がないことを誓約しますか？<br/>
                 <span className="tw-font-bold tw-text-red-600 tw-mt-2 tw-block tw-border-t tw-border-yellow-200 tw-pt-1">※酒気帯び運転および虚偽報告は厳正に処罰されます。</span>
               </p>
             </div>
          </div>
          <div className="tw-flex tw-space-x-3">
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} agentId="bulk-confirm-modal:cancel-button">キャンセル</Button>
            <Button onClick={executeBulkCheck} agentId="bulk-confirm-modal:execute-button">誓約してチェック</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
