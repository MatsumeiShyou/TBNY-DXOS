import React, { useEffect, useState } from 'react';
import { X, Settings, Truck, Users, Database, FileOutput, Map, Building } from 'lucide-react';

export default function Sidebar({ isOpen, onClose, onOpenCourseManagement, onOpenWorkerManagement, onOpenVehicleManagement, onOpenCustomerManagement }) {
  // マウント時のアニメーション状態管理
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // スクロールロック
      document.body.style.overflow = 'hidden';
    } else {
      // 閉じるアニメーション完了後に要素を非表示にする
      const timer = setTimeout(() => setIsRendered(false), 300); // duration-300に合わせる
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isRendered) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isOpen ? 'opacity-50' : 'opacity-0'}`} 
        onClick={onClose}
      />
      
      {/* サイドバー本体 */}
      <div 
        className={`fixed top-0 left-0 h-full w-72 bg-gray-900 text-gray-300 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* サイドバーヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Settings size={20} className="text-gray-400" /> 
            システムメニュー
          </h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* メニュー内容 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* マスタ管理セクション */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">マスタ管理</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  onClick={() => {
                    onOpenCourseManagement();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 hover:text-white transition-colors text-sm text-left group"
                >
                  <Map size={18} className="text-blue-400 group-hover:text-blue-300" />
                  <span className="flex-1">コース管理</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onOpenWorkerManagement();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 hover:text-white transition-colors text-sm text-left group"
                >
                  <Users size={18} className="text-emerald-400 group-hover:text-emerald-300" />
                  <span className="flex-1">ドライバー管理</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onOpenVehicleManagement();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 hover:text-white transition-colors text-sm text-left group"
                >
                  <Truck size={18} className="text-orange-400 group-hover:text-orange-300" />
                  <span className="flex-1">車両管理</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    onOpenCustomerManagement();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-gray-800 hover:text-white transition-colors text-sm text-left group"
                >
                  <Building size={18} className="text-yellow-400 group-hover:text-yellow-300" />
                  <span className="flex-1">顧客マスタ管理</span>
                </button>
              </li>
            </ul>
          </section>

          {/* システムセクション */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">システム・データ</h3>
            <ul className="space-y-1">
              <li>
                <button 
                  disabled
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left opacity-50 cursor-not-allowed group relative overflow-hidden"
                  title="現在準備中です"
                >
                  <FileOutput size={18} className="text-gray-500" />
                  <span className="flex-1">データエクスポート</span>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">準備中</span>
                </button>
              </li>
              <li>
                <button 
                  disabled
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-left opacity-50 cursor-not-allowed group relative overflow-hidden"
                  title="現在準備中です"
                >
                  <Database size={18} className="text-gray-500" />
                  <span className="flex-1">システム設定</span>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">準備中</span>
                </button>
              </li>
            </ul>
          </section>

        </div>
        
        {/* フッター */}
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600 text-center">
          Collection Shift Manager v1.0.0
        </div>
      </div>
    </>
  );
}
