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
        @page { size: A4 portrait; margin: 6mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-container { width: 100% !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* A4キャンバス */}
      <div className="print-container w-[210mm] min-h-[297mm] bg-white relative flex flex-col p-[6mm] shadow-2xl mt-0 text-black font-sans box-border overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-[2px] border-black pb-1 mb-2 shrink-0">
          <h1 className="text-xl font-bold tracking-widest m-0">回収運行指示書</h1>
          <div className="flex gap-4 text-xs font-bold">
            <div className="flex items-center gap-1">
              <span>運行日:</span>
              <span className="inline-block w-24 border-b border-black font-normal text-center">{printableData.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>車両番号 (空車重量):</span>
              <span className="inline-block w-[140px] border-b border-black font-normal text-center">{printableData.vehicleName} (約 ____kg)</span>
            </div>
            <div className="flex items-center gap-1">
              <span>乗務員:</span>
              <span className="inline-block w-24 border-b border-black"></span>
            </div>
          </div>
        </div>

        {/* 運行ブロックごとの独立テーブル群 */}
        <div className="flex-grow flex flex-col shrink-1 overflow-hidden">
          {printableData.groups.map((group, groupIndex) => {
            const groupRowSpan = group.blocks.reduce((acc, b) => acc + (b.isAtsugi ? 1 : b.rowCount), 0);
            
            return (
              <table key={group.period} className="w-full table-fixed border-collapse border-[2px] border-black text-[10px] mb-4 leading-tight">
                <colgroup>
                  <col className="w-6" />          {/* 期間 */}
                  <col className="w-[13%]" />      {/* 管理 */}
                  <col className="w-[20%]" />      {/* 回収先 */}
                  <col className="w-[25%]" />      {/* 住所・その他 */}
                  <col className="w-7" />          {/* 順番 */}
                  <col className="w-10" />         {/* 時間 */}
                  <col className="w-[15%]" />      {/* 品目 */}
                  <col className="w-12" />         {/* 概算重量 */}
                  <col className="w-12" />         {/* 入力重量 */}
                </colgroup>
                
                {groupIndex === 0 && (
                  <thead>
                    <tr className="bg-gray-100 border-b-[2px] border-black">
                      <th className="border-r-[2px] border-black py-1"></th>
                      <th className="border-r-[2px] border-black py-1">管理</th>
                      <th className="border-r-[2px] border-black py-1">回収先</th>
                      <th className="border-r-[2px] border-black py-1">住所・その他</th>
                      <th className="border-r-[2px] border-black py-1">順番</th>
                      <th className="border-r-[2px] border-black py-1">時間</th>
                      <th className="border-r border-black py-1">品目</th>
                      <th className="border-r-[2px] border-black py-1">概算重量</th>
                      <th className="py-1">入力重量</th>
                    </tr>
                  </thead>
                )}
                
                <tbody>
                  {group.blocks.map((block, blockIndex) => {
                    const isStartAtsugi = block.isAtsugi && block.id.includes('start');
                    
                    let managerStr = block.manager || '';
                    if (managerStr.trim() === block.customerName?.trim()) {
                      managerStr = '';
                    }

                    const isLastBlockInGroup = blockIndex === group.blocks.length - 1;
                    const blockBorderClass = isLastBlockInGroup ? '' : 'border-b-[1px] border-black';

                    // 厚木事業所は1行にまとめる
                    if (block.isAtsugi) {
                      return (
                        <tr key={block.id} className={`${blockBorderClass} bg-gray-50`}>
                          {blockIndex === 0 && (
                            <td rowSpan={groupRowSpan} className="border-r-[2px] border-black bg-gray-100 font-bold text-center align-middle" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                              {group.period}
                            </td>
                          )}
                          <td colSpan={4} className="border-r-[2px] border-black text-center font-bold tracking-[0.2em] text-sm">
                            厚木事業所
                          </td>
                          <td className="border-r-[2px] border-black px-1 text-center">
                            {isStartAtsugi ? '出発 :' : '到着 :'}
                          </td>
                          <td className="border-r border-black px-1 font-bold text-center">
                            {isStartAtsugi ? '総重量→' : ''}
                          </td>
                          <td className="border-r-[2px] border-black text-right pr-1 text-gray-500">
                            {isStartAtsugi ? 'kg' : ''}
                          </td>
                          <td className="text-right font-bold pr-1">
                            {isStartAtsugi ? 'kg' : ''}
                          </td>
                        </tr>
                      );
                    }

                    // 通常案件（原則3行）
                    const rows = [];
                    for (let r = 0; r < block.rowCount; r++) {
                      const isFirstRow = r === 0;
                      const isLastRowInBlock = r === block.rowCount - 1;
                      const item = block.items?.[r];

                      let timeLabel = '';
                      if (r === 0) timeLabel = '到着 :';
                      else if (r === 1) timeLabel = '出発 :';
                      else if (r === 2) timeLabel = '↓';

                      const rowBorderClass = isLastRowInBlock ? blockBorderClass : 'border-b border-gray-300';

                      rows.push(
                        <tr key={`${block.id}-${r}`} className={rowBorderClass}>
                          {isFirstRow && blockIndex === 0 && (
                            <td rowSpan={groupRowSpan} className="border-r-[2px] border-black bg-gray-100 font-bold text-center align-middle" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                              {group.period}
                            </td>
                          )}

                          {isFirstRow && (
                            <td rowSpan={block.rowCount} className="border-r-[2px] border-black px-1 align-top bg-gray-50/30 break-all">
                              {managerStr}
                            </td>
                          )}
                          
                          {isFirstRow && (
                            <td rowSpan={block.rowCount} className="border-r-[2px] border-black px-1 align-top font-bold text-xs">
                              {block.customerName}
                            </td>
                          )}

                          {isFirstRow && (
                            <td rowSpan={block.rowCount} className="border-r-[2px] border-black px-1 align-top">
                              {block.address}
                              <div className="mt-1 flex flex-wrap gap-1">
                                {block.notes && block.notes.filter(Boolean).map((note, i) => (
                                  <span key={i} className="inline-block border-[1.5px] border-red-600 text-red-600 font-bold px-1 rounded text-[8px] leading-tight">
                                    {note}
                                  </span>
                                ))}
                              </div>
                            </td>
                          )}

                          {isFirstRow && (
                            <td rowSpan={block.rowCount} className="border-r-[2px] border-black text-center align-top">
                              {/* 順番は手書き用空欄 */}
                            </td>
                          )}

                          {/* 時間 */}
                          <td className="border-r-[2px] border-black px-1 text-center">
                            {timeLabel}
                          </td>

                          {/* 品目 */}
                          <td className="border-r border-black px-1 font-bold">
                            {item?.name || ''}
                          </td>

                          {/* 概算重量 */}
                          <td className="border-r-[2px] border-black px-1 text-right text-gray-500">
                            {item ? `${item.estimatedWeight} kg` : ''}
                          </td>

                          {/* 入力重量 (手書き枠) */}
                          <td className="px-1 text-right font-bold">
                            kg
                          </td>
                        </tr>
                      );
                    }
                    return rows;
                  })}
                </tbody>
              </table>
            );
          })}
        </div>

        {/* Footer Area */}
        <div className="flex flex-col gap-2 shrink-0 h-[170px] text-[10px]">
          <div className="flex gap-3 flex-1">
            <div className="border border-black p-1 flex-1 flex flex-col">
              <div className="font-bold border-b border-dashed border-gray-400 pb-0.5 mb-1">休憩・給油など</div>
              <div className="flex-1 flex flex-col justify-evenly">
                <div className="border-b border-dashed border-gray-500 w-full"></div>
                <div className="border-b border-dashed border-gray-500 w-full"></div>
              </div>
            </div>
            <div className="border border-black p-1 flex-[2] flex flex-col">
              <div className="font-bold border-b border-dashed border-gray-400 pb-0.5 mb-1">連絡・報告・特記事項</div>
              <div className="flex-1 flex flex-col justify-evenly">
                <div className="border-b border-dashed border-gray-500 w-full"></div>
                <div className="border-b border-dashed border-gray-500 w-full"></div>
              </div>
            </div>
          </div>
          
          <div className="flex h-16 items-stretch gap-3">
            <div className="border border-black p-1 flex-[3] flex flex-col">
              <div className="font-bold border-b border-dashed border-gray-400 pb-0.5 mb-1">出発前・帰庫後チェック</div>
              <div className="flex justify-around items-center flex-1">
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> 車両点検</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> 携行品確認</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> アルコール検査</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> 鍵返却</div>
              </div>
            </div>
            
            <div className="flex gap-1">
              <div className="border border-black w-14 flex flex-col">
                <div className="text-center text-[9px] bg-gray-100 border-b border-black font-bold">管理者</div>
              </div>
              <div className="border border-black w-14 flex flex-col">
                <div className="text-center text-[9px] bg-gray-100 border-b border-black font-bold">配車担当</div>
              </div>
              <div className="border border-black w-14 flex flex-col">
                <div className="text-center text-[9px] bg-gray-100 border-b border-black font-bold">乗務員</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
