import React from 'react';
import { Card, Button } from '../components/Widgets';
import { useAgentId } from '../components/AgentContext';

/**
 * FuelPage
 * 
 * 給油報告画面。レシートの撮影とデータの送信を行う。
 */
export const FuelPage: React.FC = () => {
  return (
    <div className="tw-p-4 tw-space-y-6 tw-animate-fade-in">
      <div className="tw-flex tw-flex-col tw-space-y-2">
        <h2 className="tw-text-2xl tw-font-bold tw-text-slate-800">給油報告</h2>
        <p className="tw-text-sm tw-text-slate-500">
          給油時のレシートを撮影して送信してください。
        </p>
      </div>

      <Card agentId="fuel:receipt-card" className="tw-p-8 tw-bg-white tw-border-2 tw-border-dashed tw-border-slate-200 tw-rounded-2xl tw-flex tw-flex-col tw-items-center tw-justify-center tw-space-y-6 tw-transition-all active:tw-bg-slate-50">
        <div className="tw-w-24 tw-h-24 tw-bg-slate-50 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-slate-300">
          <i className="fa-solid fa-camera tw-text-4xl"></i>
        </div>
        
        <div className="tw-text-center tw-space-y-1">
          <p className="tw-text-lg tw-font-bold tw-text-slate-700">レシートを撮影</p>
          <p className="tw-text-xs tw-text-slate-400">文字がはっきり写るように撮影してください</p>
        </div>

        <Button 
          agentId="fuel:camera-button"
          className="tw-bg-slate-800 tw-text-white tw-px-10 tw-py-4 tw-rounded-xl tw-font-bold tw-shadow-lg tw-shadow-slate-900/20 tw-w-full"
          data-agent-id={useAgentId("action:launch-camera")}
          onClick={() => alert('カメラ機能を起動します')}
        >
          <i className="fa-solid fa-camera tw-mr-2"></i>カメラを起動
        </Button>
      </Card>

      <div className="tw-bg-blue-50 tw-p-4 tw-rounded-xl tw-border tw-border-blue-100 tw-flex tw-items-start tw-space-x-3">
        <i className="fa-solid fa-circle-info tw-text-blue-500 tw-mt-0.5"></i>
        <div className="tw-text-xs tw-text-blue-800 tw-leading-relaxed">
          <p className="tw-font-bold tw-mb-1">走行距離の入力について</p>
          <p>レシート送信後、自動解析（OCR）によって数量が抽出されます。不一致がある場合は手動で修正可能です。</p>
        </div>
      </div>
    </div>
  );
};
