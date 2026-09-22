import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Job, Customer, Driver } from '../types';
import { buildPrintableData } from '../utils/printUtils';

interface PrintableDispatchSheetProps {
  driverId: string | null;
  drivers: Driver[];
  jobs: Job[];
  customers: Customer[];
  onCancel?: () => void;
}

export const PrintableDispatchSheet: React.FC<PrintableDispatchSheetProps> = ({
  driverId,
  drivers,
  jobs,
  customers,
  onCancel,
}) => {
  const printableData = useMemo(() => {
    if (!driverId) return null;
    return buildPrintableData(driverId, drivers, jobs, customers);
  }, [driverId, drivers, jobs, customers]);

  if (!driverId || !printableData) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] bg-gray-500 overflow-auto print:bg-transparent print:static print:block flex flex-col items-center py-8 print:p-0">
      
      {/* アクションバー (印刷時は非表示) */}
      <div className="print:hidden fixed top-4 right-8 flex gap-4 z-[10000]">
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow-lg font-bold flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          印刷する
        </button>
        <button 
          onClick={onCancel}
          className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded shadow-lg font-bold transition-colors"
        >
          閉じる
        </button>
      </div>

      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { width: 100% !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* A4キャンバス */}
      <div className="print-container w-[210mm] min-h-[297mm] bg-white relative flex flex-col p-[6mm] shadow-2xl mt-0 text-black font-sans box-border overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-1 mb-2 shrink-0">
          <h1 className="text-2xl font-bold tracking-widest m-0">回収運行指示書</h1>
          <div className="flex gap-4 text-sm font-bold">
            <div className="flex items-center gap-1">
              <span>運行日:</span>
              <span className="inline-block w-24 border-b border-black">{printableData.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>車両番号:</span>
              <span className="inline-block w-24 border-b border-black">{printableData.vehicleName}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>乗務員:</span>
              <span className="inline-block w-24 border-b border-black"></span>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full table-fixed border-collapse border border-black text-sm mb-4 shrink-1 flex-grow">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border-r border-black w-10 py-1 font-bold">順番</th>
              <th className="border-r border-black w-[15%] py-1 font-bold">管理</th>
              <th className="border-r border-black w-[25%] py-1 font-bold">回収先</th>
              <th className="border-r border-black w-[35%] py-1 font-bold">住所・その他</th>
              <th className="border-r border-black w-[12%] py-1 font-bold">時間</th>
              <th className="w-16 py-1 font-bold">入力重量</th>
            </tr>
          </thead>
          <tbody>
            {printableData.groups.map((group) => (
              group.blocks.map((block) => {
                const isStartAtsugi = block.isAtsugi && block.id.includes('start');
                const isEndAtsugi = block.isAtsugi && block.id.includes('end');
                const isAtsugi = isStartAtsugi || isEndAtsugi;
                
                // 管理列が回収先名と同じ場合は空欄にする
                let managerStr = block.manager || '';
                if (managerStr.trim() === block.customerName.trim()) {
                  managerStr = '';
                }

                if (isAtsugi) {
                  return (
                    <tr key={block.id} className="bg-gray-50 border-b border-black">
                      <td className="border-r border-black text-center"></td>
                      <td colSpan={3} className="border-r border-black text-center font-bold tracking-[0.2em] text-base">厚木事業所</td>
                      <td className="border-r border-black px-1">
                        <div className="flex flex-col justify-center h-full min-h-[40px]">
                          <div className="flex justify-between font-normal text-xs">
                            <span>{isStartAtsugi ? '出発 :' : '到着 :'}</span>
                            <span></span>
                          </div>
                        </div>
                      </td>
                      <td className="text-right align-bottom pr-1 font-bold text-xs"></td>
                    </tr>
                  );
                } else {
                  return (
                    <tr key={block.id} className="border-b border-black">
                      <td className="border-r border-black text-center"></td>
                      <td className="border-r border-black px-1 align-top text-xs leading-tight">
                        {managerStr}
                      </td>
                      <td className="border-r border-black px-1 align-top font-bold text-sm">
                        {block.customerName}
                      </td>
                      <td className="border-r border-black px-1 align-top text-xs">
                        {block.address}
                        {block.items && block.items.length > 0 && (
                          <div className="mt-1 font-bold">
                            {block.items.map(item => item.name).join('、')}
                          </div>
                        )}
                        {block.notes && block.notes.filter(n => n).map((note, i) => (
                          <div key={i} className="inline-block border-[1.5px] border-red-600 text-red-600 font-bold px-1 rounded text-[10px] mt-1 mr-1">
                            {note}
                          </div>
                        ))}
                      </td>
                      <td className="border-r border-black px-1">
                        <div className="flex flex-col justify-around h-full min-h-[50px] font-normal text-xs">
                          <div className="flex justify-between"><span>到着 :</span><span></span></div>
                          <div className="flex justify-between"><span>出発 :</span><span></span></div>
                        </div>
                      </td>
                      <td className="text-right align-bottom pr-1 font-normal text-xs pb-1">
                        kg
                      </td>
                    </tr>
                  );
                }
              })
            ))}
            {/* 余白を埋めるための空行 (必要な場合) */}
            <tr className="border-b border-black flex-grow h-full">
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td className="border-r border-black"></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Footer Area */}
        <div className="flex flex-col gap-2 shrink-0 h-[220px]">
          <div className="flex gap-4 flex-1">
            <div className="border border-black p-2 flex-1 flex flex-col">
              <div className="font-bold border-b border-dashed border-gray-400 pb-1 text-sm">休憩・給油など</div>
              <div className="flex-1 flex flex-col justify-evenly mt-2">
                <div className="border-b border-dashed border-gray-500 w-full"></div>
                <div className="border-b border-dashed border-gray-500 w-full"></div>
                <div className="border-b border-dashed border-gray-500 w-full"></div>
              </div>
            </div>
            <div className="border border-black p-2 flex-[2] flex flex-col">
              <div className="font-bold border-b border-dashed border-gray-400 pb-1 text-sm">連絡・報告・特記事項</div>
              <div className="flex-1 flex flex-col justify-evenly mt-2">
                <div className="border-b border-dashed border-gray-500 w-full"></div>
                <div className="border-b border-dashed border-gray-500 w-full"></div>
                <div className="border-b border-dashed border-gray-500 w-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex h-20 items-stretch gap-4">
            <div className="border border-black p-2 flex-[3] flex flex-col">
              <div className="font-bold border-b border-dashed border-gray-400 pb-1 text-sm mb-2">出発前・帰庫後チェック</div>
              <div className="flex justify-around items-center flex-1">
                <div className="flex items-center gap-1 text-sm"><div className="w-4 h-4 border border-black"></div> 車両点検</div>
                <div className="flex items-center gap-1 text-sm"><div className="w-4 h-4 border border-black"></div> 携行品確認</div>
                <div className="flex items-center gap-1 text-sm"><div className="w-4 h-4 border border-black"></div> アルコール検査</div>
                <div className="flex items-center gap-1 text-sm"><div className="w-4 h-4 border border-black"></div> 鍵返却</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="border border-black w-20 flex flex-col">
                <div className="text-center text-xs bg-gray-100 border-b border-black py-0.5 font-bold">管理者</div>
              </div>
              <div className="border border-black w-20 flex flex-col">
                <div className="text-center text-xs bg-gray-100 border-b border-black py-0.5 font-bold">配車担当</div>
              </div>
              <div className="border border-black w-20 flex flex-col">
                <div className="text-center text-xs bg-gray-100 border-b border-black py-0.5 font-bold">乗務員</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
