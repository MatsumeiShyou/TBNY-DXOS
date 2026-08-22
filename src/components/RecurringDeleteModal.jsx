import React, { useState } from 'react';

export default function RecurringDeleteModal({ isOpen, onClose, onConfirm }) {
  const [scope, setScope] = useState('this'); // 'this', 'future', 'all'

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60] animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#ebf1f8] rounded-3xl shadow-xl w-full max-w-[340px] flex flex-col pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-6 pb-2">
            <h2 className="text-[22px] text-gray-800 font-normal mb-5 tracking-tight">定期的な予定の削除</h2>
            
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-4 cursor-pointer group p-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${scope === 'this' ? 'border-[#0b57d0]' : 'border-gray-500'}`}>
                  {scope === 'this' && <div className="w-2.5 h-2.5 rounded-full bg-[#0b57d0]"></div>}
                </div>
                <span className="text-[16px] text-gray-800">この予定</span>
                <input 
                  type="radio" 
                  name="deleteScope" 
                  value="this"
                  checked={scope === 'this'}
                  onChange={() => setScope('this')}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-4 cursor-pointer group p-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${scope === 'future' ? 'border-[#0b57d0]' : 'border-gray-500'}`}>
                  {scope === 'future' && <div className="w-2.5 h-2.5 rounded-full bg-[#0b57d0]"></div>}
                </div>
                <span className="text-[16px] text-gray-800">これ以降のすべての予定</span>
                <input 
                  type="radio" 
                  name="deleteScope" 
                  value="future"
                  checked={scope === 'future'}
                  onChange={() => setScope('future')}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-4 cursor-pointer group p-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${scope === 'all' ? 'border-[#0b57d0]' : 'border-gray-500'}`}>
                  {scope === 'all' && <div className="w-2.5 h-2.5 rounded-full bg-[#0b57d0]"></div>}
                </div>
                <span className="text-[16px] text-gray-800">すべての予定</span>
                <input 
                  type="radio" 
                  name="deleteScope" 
                  value="all"
                  checked={scope === 'all'}
                  onChange={() => setScope('all')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="p-6 pt-4 flex justify-end gap-2">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-[15px] font-bold text-[#0b57d0] hover:bg-[#0b57d0]/10 rounded-full transition-colors"
            >
              キャンセル
            </button>
            <button 
              onClick={() => onConfirm(scope)}
              className="px-6 py-2.5 text-[15px] font-bold text-white bg-[#0b57d0] hover:bg-[#0b57d0]/90 rounded-full transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
