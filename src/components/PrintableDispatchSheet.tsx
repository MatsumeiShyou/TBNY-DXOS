import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
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

  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  const MAX_HEIGHT_PX = 1040; // 調整

  useLayoutEffect(() => {
    if (contentRef.current) {
      const currentHeight = contentRef.current.scrollHeight;
      if (currentHeight > MAX_HEIGHT_PX) {
        setScale(MAX_HEIGHT_PX / currentHeight);
      } else {
        setScale(1);
      }
    }
  }, [printableData]);

  if (!driverId || !printableData) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] bg-gray-500 overflow-auto print:bg-white print:static print:block flex flex-col items-center py-8 print:p-0">
      
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

      <div className="w-[210mm] min-h-[297mm] bg-white relative print:w-[210mm] print:h-[297mm] print:overflow-hidden print:p-[10mm] shadow-2xl print:shadow-none print:mt-0 mt-8">
        <div 
          ref={contentRef}
          style={{ 
            transform: `scale(${scale})`, 
            transformOrigin: 'top center',
            width: '100%'
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-end border-b-[3px] border-black pb-1 mb-2">
            <h1 className="text-xl font-bold tracking-widest flex items-center gap-4">
              運行指示
              <span className="text-sm font-normal border border-black px-2 py-0.5">
                {printableData.vehicleName} (空車約____kg)
              </span>
            </h1>
            <div className="text-center border border-black px-4 py-0.5 text-sm font-bold">
              受領書を全て添付願います
            </div>
            <div className="text-right text-xs font-bold space-y-1 flex items-center gap-4">
              <div>{printableData.date}</div>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse text-[10px] mb-4 border-[2px] border-black table-fixed leading-tight" style={{ pageBreakInside: 'avoid' }}>
            <thead>
              <tr className="text-center font-bold border-b-[2px] border-black">
                <th className="border-r border-black w-6"></th> {/* 期間 */}
                <th className="border-r border-black w-10">管理</th>
                <th className="border-r border-black w-[90px]">回収先</th>
                <th className="border-r border-black w-[150px]">住所・その他</th>
                <th className="border-r border-black w-8">順番</th>
                <th className="border-r border-black w-[50px]">時間</th>
                <th className="border-r border-black w-[80px]">品目</th>
                <th className="border-r border-black w-14">概算重量</th>
                <th className="w-16">入力重量</th>
              </tr>
            </thead>
            {printableData.groups.map((group, groupIndex) => (
              <tbody key={group.period} className="border-b-[3px] border-black">
                {group.blocks.map((block, blockIndex) => {
                  const rows = [];
                  for (let r = 0; r < block.rowCount; r++) {
                    const isFirstRow = r === 0;
                    const isLastRow = r === block.rowCount - 1;
                    
                    // 厚木事業所と通常の出し分け
                    let actionLabel = '';
                    let actionExtra = '';
                    if (block.isAtsugi) {
                      if (block.id.includes('start')) { // 先頭の厚木事業所
                        if (r === 0) { actionLabel = '出発'; actionExtra = '総重量→'; }
                        else if (r === 1) { actionLabel = '到着'; }
                        else if (r === 2) { actionLabel = '出発'; }
                      } else { // 末尾の厚木事業所
                        if (r === 0) { actionLabel = '到着'; }
                        else if (r === 1) { actionLabel = ''; }
                      }
                    } else {
                      if (r === 0) actionLabel = '到着';
                      else if (r === 1) actionLabel = '出発';
                      else if (r === 2) actionLabel = '↓';
                    }

                    // 住所・その他の列の内容
                    let addressContent: React.ReactNode = null;
                    if (r === 0) addressContent = block.address;
                    else if (r > 0 && block.notes[r - 1]) {
                      addressContent = (
                        <div className="text-red-600 font-bold border-red-600 border px-1 inline-block bg-white text-[9px] leading-none py-0.5">
                          {block.notes[r - 1]}
                        </div>
                      );
                    }

                    // 回収先列の内容
                    let customerContent: React.ReactNode = null;
                    if (r === 0) customerContent = block.customerName;
                    else if (r === 1) customerContent = block.schedule;
                    else if (r === 2 && !block.isAtsugi) customerContent = '↓';

                    // 品目
                    const item = block.items[r];

                    rows.push(
                      <tr key={`${block.id}-${r}`} className={`${isLastRow ? '' : 'border-b border-gray-300'}`}>
                        {/* 期間 (rowSpan for the whole group) */}
                        {isFirstRow && blockIndex === 0 && (
                          <td rowSpan={group.blocks.reduce((acc, b) => acc + b.rowCount, 0)} className="border-r-[2px] border-black bg-gray-50 font-bold text-center align-middle writing-vertical-rl" style={{ writingMode: 'vertical-rl', textOrientation: 'upright' }}>
                            {group.period}
                          </td>
                        )}

                        {/* 管理 */}
                        {isFirstRow && (
                          <td rowSpan={block.rowCount} className="border-r-[2px] border-black font-bold align-top pt-1 px-1 text-center bg-gray-50/30">
                            {!block.isAtsugi && block.manager && (
                              <div className="break-all">{block.manager}</div>
                            )}
                          </td>
                        )}

                        {/* 回収先 */}
                        <td className={`border-r-[2px] border-black px-1 font-bold ${r === 0 ? 'text-xs' : 'text-[9px]'}`}>
                          {customerContent}
                        </td>

                        {/* 住所・その他 */}
                        <td className="border-r-[2px] border-black px-1">
                          {addressContent}
                        </td>

                        {/* 順番 */}
                        {isFirstRow && (
                          <td rowSpan={block.rowCount} className="border-r-[2px] border-black font-bold text-center align-top pt-1 text-xs">
                            {block.sequence}
                          </td>
                        )}

                        {/* 時間 */}
                        <td className="border-r-[2px] border-black px-1">
                          <div className="flex justify-between items-center w-full">
                            <span className="w-6">{actionLabel ? actionLabel : ''}</span>
                            <span>{actionLabel && actionLabel !== '↓' ? ':' : ''}</span>
                            <span className="text-[8px] text-gray-500 font-normal ml-1">
                              {r === 0 && !block.isAtsugi ? block.plannedStartTime : actionExtra}
                            </span>
                          </div>
                        </td>

                        {/* 品目 */}
                        <td className="border-r border-black px-1 font-bold">
                          {item ? item.name : ''}
                        </td>

                        {/* 概算重量 */}
                        <td className="border-r-[2px] border-black px-1 text-right text-[9px] text-gray-500">
                          {item ? (item.estimatedWeight + ' kg') : ''}
                          {!item && r === 0 && block.isAtsugi && block.id.includes('start') ? 'kg' : ''}
                          {!item && !block.isAtsugi ? 'kg' : ''}
                        </td>

                        {/* 入力重量 */}
                        <td className="px-1 text-right font-bold text-xs">
                          {(!block.isAtsugi || (r === 0 && block.id.includes('start'))) ? 'kg' : ''}
                        </td>
                      </tr>
                    );
                  }
                  
                  // blockの最後に太い下線を引く
                  if (blockIndex < group.blocks.length - 1) {
                    rows[rows.length - 1] = React.cloneElement(rows[rows.length - 1], {
                      className: 'border-b-[2px] border-black'
                    });
                  }
                  
                  return rows;
                })}
              </tbody>
            ))}
          </table>

          {/* Footer */}
          <div className="flex gap-2 text-[10px]" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            {/* 左側のブロック（休憩・給油） */}
            <div className="w-[45%] flex flex-col gap-1 border-[2px] border-black p-1">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-b border-black">
                    <td rowSpan={2} className="w-8 border-r border-black text-center font-bold bg-gray-100">休憩</td>
                    <td className="px-1 w-12 border-r border-gray-300">到着 : </td>
                    <td className="px-1">場所</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="px-1 border-r border-gray-300">出発 : </td>
                    <td className="px-1"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td rowSpan={2} className="w-8 border-r border-black text-center font-bold bg-gray-100">休憩</td>
                    <td className="px-1 border-r border-gray-300">到着 : </td>
                    <td className="px-1">場所</td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="px-1 border-r border-gray-300">出発 : </td>
                    <td className="px-1"></td>
                  </tr>
                  <tr className="border-b border-black">
                    <td rowSpan={2} className="w-8 border-r border-black text-center font-bold bg-gray-100">給油</td>
                    <td className="px-1 border-r border-gray-300">到着 : </td>
                    <td className="px-1">場所</td>
                  </tr>
                  <tr>
                    <td className="px-1 border-r border-gray-300">出発 : </td>
                    <td className="px-1"></td>
                  </tr>
                </tbody>
              </table>
              <div className="font-bold flex items-center">
                <span className="text-lg leading-none mr-1">┗</span> 給油のレシートを添付してください
              </div>
            </div>

            {/* 右側のブロック（連絡・報告欄） */}
            <div className="w-[55%] flex flex-col">
              <div className="border-[2px] border-black p-1 flex-1 relative min-h-[90px]">
                <div className="absolute top-0 left-1 font-bold">連絡・報告欄</div>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="border-b border-gray-400 w-full h-3"></div>
                  <div className="border-b border-gray-400 w-full h-3"></div>
                  <div className="border-b border-gray-400 w-full h-3"></div>
                  <div className="border-b border-gray-400 w-full h-3"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 最下部（チェック欄・サイン） */}
          <div className="mt-2 flex gap-4 text-[10px] items-end" style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
            <div>
              <div className="font-bold mb-1">チェック欄</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 border border-black"></div> 伝票入力漏れありません</div>
              <div className="flex items-center gap-1 mt-1"><div className="w-3 h-3 border border-black"></div> 記入漏れありません</div>
            </div>
            <div className="flex items-center border-[2px] border-black px-2 py-1 bg-white">
              <span className="font-bold w-12 text-center">サイン</span>
              <div className="flex flex-col border-l border-black pl-1 w-40 h-8 justify-between">
                <div className="border-b border-gray-300 flex-1"></div>
                <div className="flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};
