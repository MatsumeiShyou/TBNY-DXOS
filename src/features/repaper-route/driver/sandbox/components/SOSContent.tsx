import React from 'react';

interface SOSContentProps {
  step: 'MENU' | 'SEARCHING' | 'RESULT_CALL' | 'ACCIDENT_ACTIONS';
  onSelectType: (type: string) => void;
  onClose: () => void;
}

export const SOSContent: React.FC<SOSContentProps> = ({ step, onSelectType, onClose }) => {
  if (step === 'ACCIDENT_ACTIONS') {
    return (
      <div className="tw-space-y-4 tw-animate-fade-in tw-pb-4">
          <div className="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-p-4 tw-rounded-r-xl">
              <h3 className="tw-font-bold tw-text-red-700 tw-text-lg tw-flex tw-items-center">
                <i className="fa-solid fa-truck-medical tw-mr-2"></i>人命救助最優先
              </h3>
              <p className="tw-text-sm tw-text-red-600 tw-mt-1">けが人がいる場合は、迷わず救急車を呼んでください。</p>
          </div>
          <div className="tw-grid tw-gap-4">
              <a href="tel:119" className="tw-block tw-w-full tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-rounded-xl tw-shadow-lg tw-shadow-red-900/20 tw-p-6 tw-text-center active:tw-scale-[0.98] tw-transition-transform tw-flex tw-items-center tw-justify-between tw-group">
                  <div className="tw-text-left">
                      <div className="tw-text-2xl tw-font-bold">119番</div>
                      <div className="tw-text-sm tw-opacity-90 tw-font-bold">救急車・消防</div>
                  </div>
                  <div className="tw-w-12 tw-h-12 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center group-hover:tw-bg-white/30 tw-animate-pulse">
                      <i className="fa-solid fa-kit-medical tw-text-2xl"></i>
                  </div>
              </a>
              <a href="tel:110" className="tw-block tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-rounded-xl tw-shadow-lg tw-shadow-blue-900/20 tw-p-5 tw-text-center active:tw-scale-[0.98] tw-transition-transform tw-flex tw-items-center tw-justify-between tw-group">
                  <div className="tw-text-left">
                      <div className="tw-text-xl tw-font-bold">110番</div>
                      <div className="tw-text-sm tw-opacity-90 tw-font-bold">警察への通報</div>
                  </div>
                  <div className="tw-w-10 tw-h-10 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center group-hover:tw-bg-white/30">
                      <i className="fa-solid fa-shield-halved tw-text-xl"></i>
                  </div>
              </a>
              <button 
                onClick={() => onSelectType('BACK')}
                className="tw-text-slate-500 tw-font-bold tw-py-4"
              >
                報告メニューに戻る
              </button>
          </div>
      </div>
    );
  }

  if (step === 'SEARCHING') {
    return (
      <div className="tw-py-12 tw-text-center tw-space-y-6">
        <div className="tw-relative tw-inline-block">
          <div className="tw-w-24 tw-h-24 tw-border-4 tw-border-blue-100 tw-rounded-full tw-border-t-blue-600 tw-animate-spin"></div>
          <i className="fa-solid fa-satellite-dish tw-text-3xl tw-text-blue-600 tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-animate-pulse"></i>
        </div>
        <div>
          <h3 className="tw-text-xl tw-font-bold tw-text-slate-800">状況を確認中...</h3>
          <p className="tw-text-slate-500 tw-mt-2">最寄りの提携ロードサービスと<br/>運行管理者に通知を送信しています。</p>
        </div>
      </div>
    );
  }

  if (step === 'RESULT_CALL') {
    return (
      <div className="tw-space-y-6 tw-pb-4 tw-animate-fade-in">
        <div className="tw-bg-green-50 tw-p-6 tw-rounded-2xl tw-text-center tw-border tw-border-green-100">
           <div className="tw-w-16 tw-h-16 tw-bg-green-100 tw-text-green-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <i className="fa-solid fa-check tw-text-2xl"></i>
           </div>
           <h3 className="tw-text-xl tw-font-bold tw-text-green-800">通知完了</h3>
           <p className="tw-text-green-700 tw-mt-2">運行管理者の端末へ<br/>現在地とトラブル内容を送信しました。</p>
        </div>
        <div className="tw-grid tw-gap-4">
           <a href="tel:03-1234-5678" className="tw-block tw-w-full tw-bg-slate-800 tw-text-white tw-p-5 tw-rounded-xl tw-font-bold tw-text-center tw-flex tw-items-center tw-justify-center">
              <i className="fa-solid fa-phone-volume tw-mr-3"></i>運行管理者に電話する
           </a>
           <button onClick={onClose} className="tw-w-full tw-py-4 tw-text-slate-500 tw-font-bold tw-underline">
              閉じる
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-pb-6">
      <button 
        onClick={() => onSelectType('ACCIDENT')}
        className="tw-bg-red-50 hover:tw-bg-red-100 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-red-100 tw-flex tw-flex-col tw-items-center tw-group tw-transition-colors"
      >
        <div className="tw-w-16 tw-h-16 tw-bg-red-100 tw-text-red-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-3 group-hover:tw-scale-110 tw-transition-transform">
           <i className="fa-solid fa-car-burst tw-text-2xl"></i>
        </div>
        <span className="tw-font-bold tw-text-red-800">事故報告</span>
      </button>

      <button 
        onClick={() => onSelectType('BREAKDOWN')}
        className="tw-bg-orange-50 hover:tw-bg-orange-100 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-orange-100 tw-flex tw-flex-col tw-items-center tw-group tw-transition-colors"
      >
        <div className="tw-w-16 tw-h-16 tw-bg-orange-100 tw-text-orange-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-3 group-hover:tw-scale-110 tw-transition-transform">
           <i className="fa-solid fa-screwdriver-wrench tw-text-2xl"></i>
        </div>
        <span className="tw-font-bold tw-text-orange-800">車両故障</span>
      </button>

      <button 
        onClick={() => onSelectType('DELAY')}
        className="tw-bg-blue-50 hover:tw-bg-blue-100 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-blue-100 tw-flex tw-flex-col tw-items-center tw-group tw-transition-colors"
      >
        <div className="tw-w-16 tw-h-16 tw-bg-blue-100 tw-text-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-3 group-hover:tw-scale-110 tw-transition-transform">
           <i className="fa-solid fa-clock-rotate-left tw-text-2xl"></i>
        </div>
        <span className="tw-font-bold tw-text-blue-800">大幅な遅延</span>
      </button>

      <button 
        onClick={() => onSelectType('OTHER')}
        className="tw-bg-slate-50 hover:tw-bg-slate-100 tw-p-6 tw-rounded-2xl tw-border-2 tw-border-slate-100 tw-flex tw-flex-col tw-items-center tw-group tw-transition-colors"
      >
        <div className="tw-w-16 tw-h-16 tw-bg-slate-100 tw-text-slate-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mb-3 group-hover:tw-scale-110 tw-transition-transform">
           <i className="fa-solid fa-ellipsis tw-text-2xl"></i>
        </div>
        <span className="tw-font-bold tw-text-slate-800">その他</span>
      </button>
    </div>
  );
};
