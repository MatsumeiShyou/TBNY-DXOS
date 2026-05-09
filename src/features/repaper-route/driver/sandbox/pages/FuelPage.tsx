import React, { useState } from 'react';
import { Card, Button } from '../components/Widgets';

/**
 * FuelPage
 * 
 * 給油報告画面。レシートの撮影とデータの送信を行う。
 */
export const FuelPage: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fuelAmount, setFuelAmount] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate camera capture
    setTimeout(() => {
      setPreviewImage('https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=400');
      setIsCapturing(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!fuelAmount || !mileage || !previewImage) {
      alert('全ての項目を入力し、レシートを撮影してください。');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-space-y-6 tw-animate-fade-in">
        <div className="tw-w-20 tw-h-20 tw-bg-green-100 tw-text-green-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-animate-bounce">
          <i className="fa-solid fa-check tw-text-4xl"></i>
        </div>
        <div className="tw-text-center">
          <h2 className="tw-text-2xl tw-font-bold tw-text-slate-800">送信完了</h2>
          <p className="tw-text-slate-500 tw-mt-2">給油データが正常に送信されました。</p>
        </div>
        <Button 
          agentId="fuel:back-button"
          className="tw-w-full tw-max-w-xs"
          onClick={() => window.location.reload()}
        >
          ホームへ戻る
        </Button>
      </div>
    );
  }

  return (
    <div className="tw-p-4 tw-space-y-6 tw-animate-fade-in tw-pb-32">
      <div className="tw-flex tw-flex-col tw-space-y-2">
        <h2 className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-flex tw-items-center">
          <i className="fa-solid fa-gas-pump tw-mr-3 tw-text-blue-500"></i>
          給油報告
        </h2>
        <p className="tw-text-sm tw-text-slate-500">
          レシートを撮影し、給油量と走行距離を入力してください。
        </p>
      </div>

      {!previewImage ? (
        <Card 
          agentId="fuel:receipt-card" 
          className={`tw-p-10 tw-bg-white tw-border-2 tw-border-dashed ${isCapturing ? 'tw-border-blue-400 tw-bg-blue-50' : 'tw-border-slate-200'} tw-rounded-2xl tw-flex tw-flex-col tw-items-center tw-justify-center tw-space-y-6 tw-transition-all active:tw-scale-95`}
          onClick={handleCapture}
        >
          <div className={`tw-w-24 tw-h-24 ${isCapturing ? 'tw-bg-blue-100 tw-text-blue-500' : 'tw-bg-slate-50 tw-text-slate-300'} tw-rounded-full tw-flex tw-items-center tw-justify-center tw-transition-colors`}>
            {isCapturing ? (
              <i className="fa-solid fa-circle-notch fa-spin tw-text-4xl"></i>
            ) : (
              <i className="fa-solid fa-camera tw-text-4xl"></i>
            )}
          </div>
          
          <div className="tw-text-center tw-space-y-1">
            <p className="tw-text-lg tw-font-bold tw-text-slate-700">
              {isCapturing ? 'カメラを起動中...' : 'レシートを撮影'}
            </p>
            <p className="tw-text-xs tw-text-slate-400">文字がはっきり写るように撮影してください</p>
          </div>
        </Card>
      ) : (
        <div className="tw-relative tw-animate-scale-in">
          <img 
            src={previewImage} 
            alt="Receipt Preview" 
            className="tw-w-full tw-h-64 tw-object-cover tw-rounded-2xl tw-shadow-lg tw-border-4 tw-border-white" 
          />
          <button 
            onClick={() => setPreviewImage(null)}
            className="tw-absolute tw-top-4 tw-right-4 tw-bg-red-500 tw-text-white tw-w-10 tw-h-10 tw-rounded-full tw-shadow-lg tw-flex tw-items-center tw-justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <div className="tw-absolute tw-bottom-4 tw-left-4 tw-bg-black/50 tw-backdrop-blur-sm tw-text-white tw-px-3 tw-py-1 tw-rounded-full tw-text-xs">
            <i className="fa-solid fa-check tw-mr-1"></i>撮影済み
          </div>
        </div>
      )}

      <div className="tw-grid tw-grid-cols-2 tw-gap-4">
        <div className="tw-space-y-1.5">
          <label className="tw-text-xs tw-font-bold tw-text-slate-500 tw-ml-1">給油量 (L)</label>
          <div className="tw-relative">
            <input 
              type="number" 
              inputMode="decimal"
              className="tw-w-full tw-bg-white tw-border tw-border-slate-200 tw-rounded-xl tw-p-4 tw-text-lg tw-font-bold tw-shadow-sm focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-outline-none"
              placeholder="0.0"
              value={fuelAmount}
              onChange={(e) => setFuelAmount(e.target.value)}
            />
            <span className="tw-absolute tw-right-4 tw-top-1/2 tw-translate-y-1/2 tw-text-slate-400 tw-font-bold">L</span>
          </div>
        </div>
        <div className="tw-space-y-1.5">
          <label className="tw-text-xs tw-font-bold tw-text-slate-500 tw-ml-1">走行距離 (km)</label>
          <div className="tw-relative">
            <input 
              type="number" 
              inputMode="numeric"
              className="tw-w-full tw-bg-white tw-border tw-border-slate-200 tw-rounded-xl tw-p-4 tw-text-lg tw-font-bold tw-shadow-sm focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-outline-none"
              placeholder="00000"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
            />
            <span className="tw-absolute tw-right-4 tw-top-1/2 tw-translate-y-1/2 tw-text-slate-400 tw-font-bold">km</span>
          </div>
        </div>
      </div>

      <div className="tw-bg-blue-50 tw-p-4 tw-rounded-2xl tw-border tw-border-blue-100 tw-flex tw-items-start tw-space-x-3">
        <i className="fa-solid fa-circle-info tw-text-blue-500 tw-mt-0.5"></i>
        <div className="tw-text-xs tw-text-blue-800 tw-leading-relaxed">
          <p className="tw-font-bold tw-mb-1">走行距離の入力について</p>
          <p>給油時のメーター数値を入力してください。前回との差分から燃費が自動計算されます。</p>
        </div>
      </div>

      <div className="tw-fixed tw-bottom-0 tw-left-0 tw-w-full tw-bg-white tw-border-t tw-border-slate-100 tw-p-4 tw-pb-safe tw-shadow-[0_-4px_20px_rgba(0,0,0,0.1)] tw-z-30 tw-rounded-t-3xl">
        <Button 
          agentId="fuel:submit-button"
          className={`tw-w-full tw-py-4 tw-text-lg tw-shadow-lg ${isSubmitting ? 'tw-opacity-70' : ''}`}
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <><i className="fa-solid fa-circle-notch fa-spin tw-mr-2"></i>送信中...</>
          ) : (
            <><i className="fa-solid fa-paper-plane tw-mr-2"></i>報告データを送信</>
          )}
        </Button>
      </div>
    </div>
  );
};

