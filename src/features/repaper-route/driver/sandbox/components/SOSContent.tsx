import React from 'react';

interface SOSContentProps {
  step: 'MENU' | 'SEARCHING' | 'RESULT_CALL' | 'ACCIDENT_ACTIONS';
  onSelectType: (type: string) => void;
  onClose: () => void;
}

export const SOSContent: React.FC<SOSContentProps> = ({ step, onSelectType, onClose }) => {
  if (step === 'ACCIDENT_ACTIONS') {
    return (
      <div className="space-y-4 animate-fade-in pb-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
              <h3 className="font-bold text-red-700 text-lg flex items-center">
                <i className="fa-solid fa-truck-medical mr-2"></i>人命救助最優先
              </h3>
              <p className="text-sm text-red-600 mt-1">けが人がいる場合は、迷わず救急車を呼んでください。</p>
          </div>
          <div className="grid gap-4">
              <a href="tel:119" className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-900/20 p-6 text-center active:scale-[0.98] transition-transform flex items-center justify-between group">
                  <div className="text-left">
                      <div className="text-2xl font-bold">119番</div>
                      <div className="text-sm opacity-90 font-bold">救急車・消防</div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 animate-pulse">
                      <i className="fa-solid fa-kit-medical text-2xl"></i>
                  </div>
              </a>
              <a href="tel:110" className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-900/20 p-5 text-center active:scale-[0.98] transition-transform flex items-center justify-between group">
                  <div className="text-left">
                      <div className="text-xl font-bold">110番</div>
                      <div className="text-sm opacity-90 font-bold">警察への通報</div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30">
                      <i className="fa-solid fa-shield-halved text-xl"></i>
                  </div>
              </a>
              <button 
                onClick={() => onSelectType('BACK')}
                className="text-slate-500 font-bold py-4"
              >
                報告メニューに戻る
              </button>
          </div>
      </div>
    );
  }

  if (step === 'SEARCHING') {
    return (
      <div className="py-12 text-center space-y-6">
        <div className="relative inline-block">
          <div className="w-24 h-24 border-4 border-blue-100 rounded-full border-t-blue-600 animate-spin"></div>
          <i className="fa-solid fa-satellite-dish text-3xl text-blue-600 absolute inset-0 flex items-center justify-center animate-pulse"></i>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">状況を確認中...</h3>
          <p className="text-slate-500 mt-2">最寄りの提携ロードサービスと<br/>運行管理者に通知を送信しています。</p>
        </div>
      </div>
    );
  }

  if (step === 'RESULT_CALL') {
    return (
      <div className="space-y-6 pb-4 animate-fade-in">
        <div className="bg-green-50 p-6 rounded-2xl text-center border border-green-100">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fa-solid fa-check text-2xl"></i>
           </div>
           <h3 className="text-xl font-bold text-green-800">通知完了</h3>
           <p className="text-green-700 mt-2">運行管理者の端末へ<br/>現在地とトラブル内容を送信しました。</p>
        </div>
        <div className="grid gap-4">
           <a href="tel:03-1234-5678" className="block w-full bg-slate-800 text-white p-5 rounded-xl font-bold text-center flex items-center justify-center">
              <i className="fa-solid fa-phone-volume mr-3"></i>運行管理者に電話する
           </a>
           <button onClick={onClose} className="w-full py-4 text-slate-500 font-bold underline">
              閉じる
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 pb-6">
      <button 
        onClick={() => onSelectType('ACCIDENT')}
        className="bg-red-50 hover:bg-red-100 p-6 rounded-2xl border-2 border-red-100 flex flex-col items-center group transition-colors"
      >
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
           <i className="fa-solid fa-car-burst text-2xl"></i>
        </div>
        <span className="font-bold text-red-800">事故報告</span>
      </button>

      <button 
        onClick={() => onSelectType('BREAKDOWN')}
        className="bg-orange-50 hover:bg-orange-100 p-6 rounded-2xl border-2 border-orange-100 flex flex-col items-center group transition-colors"
      >
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
           <i className="fa-solid fa-screwdriver-wrench text-2xl"></i>
        </div>
        <span className="font-bold text-orange-800">車両故障</span>
      </button>

      <button 
        onClick={() => onSelectType('DELAY')}
        className="bg-blue-50 hover:bg-blue-100 p-6 rounded-2xl border-2 border-blue-100 flex flex-col items-center group transition-colors"
      >
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
           <i className="fa-solid fa-clock-rotate-left text-2xl"></i>
        </div>
        <span className="font-bold text-blue-800">大幅な遅延</span>
      </button>

      <button 
        onClick={() => onSelectType('OTHER')}
        className="bg-slate-50 hover:bg-slate-100 p-6 rounded-2xl border-2 border-slate-100 flex flex-col items-center group transition-colors"
      >
        <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
           <i className="fa-solid fa-ellipsis text-2xl"></i>
        </div>
        <span className="font-bold text-slate-800">その他</span>
      </button>
    </div>
  );
};
