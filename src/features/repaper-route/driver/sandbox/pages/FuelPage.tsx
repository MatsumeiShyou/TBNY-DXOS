import React, { useState } from 'react';
import { Card, Button } from '../components/Widgets';
import { SmartNumericInput } from '../components/SmartNumericInput';
import { useDriverOSBridge } from '../../bridge/useDriverOSBridge';

/**
 * FuelPage
 * 
 * 給油報告画面。レシートの撮影とデータの送信を行う。
 */
export const FuelPage: React.FC = () => {
  const { user, uploadMedia, recordDecision } = useDriverOSBridge();
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [fuelAmount, setFuelAmount] = useState<number>(0);
  const [mileage, setMileage] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsCapturing(true);

    // プレビュー生成
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
    setPreviewBlob(file);
    setIsCapturing(false);
  };

  const handleSubmit = async () => {
    if (!fuelAmount || !mileage || !previewBlob) {
      alert('全ての項目を入力し、レシートを撮影してください。');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. R2 へアップロード
      const uploadResult = await uploadMedia(previewBlob, 'receipts');
      
      // 2. 意思決定ログ（実績）としてDBに記録
      await recordDecision('FUEL_REPORT', user?.id || '', {
        amount: fuelAmount,
        mileage: mileage,
        receiptPath: uploadResult.path,
        storageProvider: uploadResult.provider
      });

      setIsSuccess(true);
    } catch (err: any) {
      console.error('[FUEL] Submit failed:', err);
      if (err.message === 'STORAGE_CONFIG_ERROR') {
        setError('ストレージ設定（.env）が未完了です。開発者にお問い合わせください。');
      } else {
        setError('データの送信に失敗しました。電波の良い場所で再試行してください。');
      }
    } finally {
      setIsSubmitting(false);
    }
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

      {error && (
        <div className="tw-bg-red-50 tw-border-2 tw-border-red-200 tw-p-4 tw-rounded-2xl tw-flex tw-items-start tw-text-red-700 tw-animate-shake">
          <i className="fa-solid fa-circle-exclamation tw-mt-1 tw-mr-3 tw-text-lg"></i>
          <p className="tw-text-sm tw-font-bold">{error}</p>
        </div>
      )}

      <div className="tw-flex tw-flex-col tw-gap-6">
        {/* Fuel Amount Section */}
        <div className="tw-space-y-2">
          <div className="tw-flex tw-items-center tw-space-x-2 tw-ml-1">
            <i className="fa-solid fa-droplet tw-text-blue-500 tw-text-xs"></i>
            <label className="tw-text-sm tw-font-bold tw-text-slate-600">今回の給油量</label>
          </div>
          <SmartNumericInput 
            value={fuelAmount}
            onChange={setFuelAmount}
            label="給油量"
            unit="L"
            agentId="fuel:amount-input"
          />
        </div>

        {/* Mileage Section */}
        <div className="tw-space-y-2">
          <div className="tw-flex tw-items-center tw-space-x-2 tw-ml-1">
            <i className="fa-solid fa-gauge-high tw-text-blue-500 tw-text-xs"></i>
            <label className="tw-text-sm tw-font-bold tw-text-slate-600">現在の走行距離 (メーター値)</label>
          </div>
          <SmartNumericInput 
            value={mileage}
            onChange={setMileage}
            label="走行距離"
            unit="km"
            agentId="fuel:mileage-input"
          />
        </div>
      </div>

      <div className="tw-bg-blue-50 tw-p-4 tw-rounded-2xl tw-border tw-border-blue-100 tw-flex tw-items-start tw-space-x-3">
        <i className="fa-solid fa-circle-info tw-text-blue-500 tw-mt-0.5"></i>
        <div className="tw-text-xs tw-text-blue-800 tw-leading-relaxed">
          <p className="tw-font-bold tw-mb-1">走行距離の入力について</p>
          <p>給油時のメーター数値を入力してください。前回との差分から燃費が自動計算されます。</p>
        </div>
      </div>

      <div className="tw-fixed tw-bottom-0 tw-left-0 tw-w-full tw-bg-white tw-border-t tw-border-slate-200 tw-p-4 tw-pb-safe tw-shadow-[0_-4px_10px_rgba(0,0,0,0.05)] tw-z-30">
        <Button 
          agentId="fuel:submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting || !previewImage || !fuelAmount || !mileage}
          className="tw-w-full"
        >
          {isSubmitting ? (
            <span className="tw-flex tw-items-center tw-justify-center">
              <i className="fa-solid fa-circle-notch fa-spin tw-mr-2"></i>
              送信中...
            </span>
          ) : (
            <span className="tw-flex tw-items-center tw-justify-center">
              <i className="fa-solid fa-paper-plane tw-mr-2"></i>
              給油報告を送信
            </span>
          )}
        </Button>
      </div>
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="tw-hidden"
      />
    </div>
  );
};

