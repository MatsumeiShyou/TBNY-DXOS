import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Job, Customer, Driver } from '../types';

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
}) => {
  const driver = drivers.find((d) => d.id === driverId);
  const targetJobs = jobs.filter((j) => j.driverId === driverId);

  // ソート処理
  // 1. startTime昇順
  // 2. startTimeなしは後ろ
  const sortedJobs = useMemo(() => {
    return [...targetJobs].sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      return 0; // 同時刻またはどちらも無し
    });
  }, [targetJobs]);

  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  const content = (
    <div className="fixed inset-0 z-[9999] bg-white text-black p-8 print:p-0 print:static print:block overflow-auto font-sans">
      <div className="max-w-[210mm] mx-auto bg-white">
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-black pb-2 mb-4">
          <h1 className="text-2xl font-bold tracking-widest">回収指示書</h1>
          <div className="text-right text-sm space-y-1">
            <div>日付: {today}</div>
            <div className="text-lg font-bold border border-black px-4 py-1 inline-block mt-1">
              担当: {driver?.name || '未設定'}
              {driver?.currentVehicle ? ` (${driver.currentVehicle})` : ''}
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-xs mb-6">
          <thead>
            <tr className="text-center font-bold">
              <th className="border border-black px-1 py-1 w-10">運行順</th>
              <th className="border border-black px-1 py-1 w-48">回収先</th>
              <th className="border border-black px-1 py-1 w-64">住所・その他</th>
              <th className="border border-black px-1 py-1 w-16">時間</th>
              <th className="border border-black px-1 py-1 w-24">品目</th>
              <th className="border border-black px-1 py-1 w-16">概算重量</th>
              <th className="border border-black px-1 py-1 w-16 text-red-600">入力重量</th>
            </tr>
          </thead>
          <tbody>
            {sortedJobs.map((job, index) => {
              const customer = customers.find((c) => c.id === job.originalCustomerId);
              const isOrphan = job.isOrphan || (job.originalCustomerId && !customer);

              // プレフィックスの生成
              const prefixes: string[] = [];
              if (job.preferredTime) prefixes.push(`時間指定 ${job.preferredTime}着`);
              if (job.requiredVehicle || customer?.requiredVehicle) prefixes.push('【要車両】');
              if (job.isDeleted || customer?.isDeleted) prefixes.push('【削除済】');
              if (job.isSuspended) prefixes.push('【一時停止】');

              // 顧客名と住所の解決
              let customerName = customer?.name || job.title;
              let address = customer?.address || ''; // areaではなくaddressを使用
              if (isOrphan) {
                customerName = '【顧客マスタ未解決】';
                address = '【顧客マスタ未解決】';
              }

              // 備考の併記ルール
              let noteStr = '';
              const cNote = customer?.note || '';
              const jNote = job.note || '';

              if (isOrphan && job.originalCustomerId) {
                noteStr = `[ID: ${job.originalCustomerId}] ${jNote}`;
              } else if (cNote && jNote) {
                if (cNote === jNote) {
                  noteStr = cNote;
                } else {
                  noteStr = `${cNote} / ${jNote}`;
                }
              } else {
                noteStr = cNote || jNote;
              }
              
              if (noteStr) prefixes.push(noteStr);
              
              // Excelでは注意事項は改行して赤字で住所列に表示される
              const notesElements = prefixes.map((p, i) => (
                <div key={i} className="text-red-600 font-bold text-[11px] leading-tight mt-1">{p}</div>
              ));

              return (
                <tr key={job.id || index} className="break-inside-avoid h-16">
                  {/* 運行順: 手書き用の空欄 */}
                  <td className="border border-black px-1 py-1 text-center font-medium"></td>
                  
                  {/* 回収先 */}
                  <td className="border border-black px-1 py-1 font-bold align-top">
                    <div className="mt-1">{customerName}</div>
                  </td>
                  
                  {/* 住所・その他（赤字の注意事項含む） */}
                  <td className="border border-black px-1 py-1 align-top">
                    <div className="mb-1">{address}</div>
                    {notesElements}
                  </td>
                  
                  {/* 時間: 手書き用の空欄 */}
                  <td className="border border-black px-1 py-1 text-[10px] leading-tight flex flex-col justify-between h-full min-h-[3.5rem]">
                    <div className="flex justify-between"><span>到着 :</span></div>
                    <div className="flex justify-between border-t border-dotted border-gray-400 mt-2 pt-1"><span>出発 :</span></div>
                  </td>
                  
                  {/* 品目: 手書き用の空欄 */}
                  <td className="border border-black px-1 py-1"></td>
                  
                  {/* 概算重量: 手書き用の空欄 */}
                  <td className="border border-black px-1 py-1 text-right align-bottom">kg</td>
                  
                  {/* 入力重量: 手書き用の空欄 */}
                  <td className="border border-black px-1 py-1 text-right align-bottom text-red-500">kg</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex justify-between mt-4 break-inside-avoid text-xs mb-8 gap-2">
          {/* 左側のブロック（休憩・チェック欄・サイン） */}
          <div className="w-[48%] flex flex-col gap-2">
            {/* 休憩欄 */}
            <div className="border border-black p-2 h-24">
              <table className="w-full text-[10px]">
                <tbody>
                  <tr>
                    <td className="w-10">休憩</td>
                    <td>出発 : </td>
                    <td>場所</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>到着 : </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>休憩</td>
                    <td>出発 : </td>
                    <td>場所</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td>到着 : </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* レシート貼付・サイン欄 */}
            <div className="border-[3px] border-black p-2 relative h-40 flex flex-col justify-end">
              <div className="absolute top-2 left-2 flex items-center">
                <span className="font-bold text-lg mr-1">┗</span> 右側のレシートを貼付してください
              </div>
              
              <div className="space-y-1">
                <div>チェック欄</div>
                <div className="flex items-center"><div className="w-3 h-3 border border-black mr-2"></div> 伝票入力漏れありません</div>
                <div className="flex items-center"><div className="w-3 h-3 border border-black mr-2"></div> 記入漏れありません</div>
                
                <div className="flex items-center mt-2">
                  <div className="border border-black px-2 py-1 flex items-center bg-white">
                    サイン <span className="inline-block w-40 border-b border-black ml-2 mb-1"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側のブロック（連絡・報告欄） */}
          <div className="w-[48%] border border-black p-2 relative">
            <div className="absolute top-1 left-2">連絡・報告欄</div>
            {/* 罫線を複数行引く */}
            <div className="mt-6 flex flex-col gap-4">
              <div className="border-b border-gray-400 w-full h-4"></div>
              <div className="border-b border-gray-400 w-full h-4"></div>
              <div className="border-b border-gray-400 w-full h-4"></div>
              <div className="border-b border-gray-400 w-full h-4"></div>
              <div className="border-b border-gray-400 w-full h-4"></div>
              <div className="border-b border-gray-400 w-full h-4"></div>
              <div className="border-b border-gray-400 w-full h-4"></div>
              <div className="border-b border-gray-400 w-full h-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  if (!driverId) return null;

  return createPortal(content, document.body);
};
