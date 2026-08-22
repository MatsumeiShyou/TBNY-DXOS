import React, { useMemo } from 'react';
import { Database, ArrowUpDown, Clock, AlertTriangle, GripVertical } from 'lucide-react';
import { formatPreferredTime } from '../utils/timeUtils';

export default function PendingJobsDock({ pendingJobs, selectedCell, onAddJob }) {
  // 50音順 (かな読み) で自動ソート
  const sortedJobs = useMemo(() => {
    return [...pendingJobs].sort((a, b) => {
      const kanaA = a.kana || a.title;
      const kanaB = b.kana || b.title;
      return kanaA.localeCompare(kanaB, 'ja');
    });
  }, [pendingJobs]);

  const handleDragStart = (e, job) => {
    // ドラッグ時にジョブデータを転送
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'PENDING_JOB', job }));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-20 shrink-0">
      <div className="bg-gray-800 text-white p-3 flex justify-between items-center shrink-0">
        <div className="font-bold flex items-center gap-2"><Database size={16} />未配車リスト</div>
      </div>
      
      <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-end text-xs text-gray-600 font-bold shrink-0">
        <span className="text-gray-500">全 {sortedJobs.length} 件</span>
      </div>
      
      <div className="overflow-y-auto flex-1 bg-gray-50 p-2 space-y-2 custom-scrollbar">
        {sortedJobs.length === 0 && (
          <div className="p-8 text-center text-gray-400 text-xs">未配車の案件はありません</div>
        )}
        
        {sortedJobs.map(job => (
          <div 
            key={job.id} 
            draggable={!job.isReadOnly}
            onDragStart={(e) => {
              if (job.isReadOnly) {
                e.preventDefault();
                return;
              }
              handleDragStart(e, job);
            }}
            onClick={() => {
              if (job.isReadOnly) {
                alert('スポット案件はテンプレート（ひな形）には組み込めません。本番へ適用後に追加してください。');
                return;
              }
              if (selectedCell && onAddJob) {
                onAddJob(job, selectedCell.driverId, selectedCell.time);
              }
            }}
            className={`bg-white p-3 border rounded transition-all group flex items-start gap-2 border-gray-200 ${
              job.isReadOnly 
                ? 'opacity-60 cursor-not-allowed bg-gray-50' 
                : 'hover:border-blue-400 hover:shadow-md shadow-sm ' + (selectedCell ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing')
            }`}
          >
            <div className="text-gray-300 mt-1 cursor-grab active:cursor-grabbing">
              <GripVertical size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {job.jobType === 'spot' ? (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap shrink-0">
                      スポット
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 whitespace-nowrap shrink-0">
                      定期
                    </span>
                  )}
                  {job.preferredTime && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border bg-gray-50 text-gray-700 border-gray-200 flex items-center gap-0.5 whitespace-nowrap shrink-0 ml-1">
                      <Clock size={10} /> {formatPreferredTime(job.preferredTime)}
                    </span>
                  )}
                </div>
                <span className="text-xs bg-gray-100 font-bold px-1.5 py-0.5 rounded text-gray-600 whitespace-nowrap shrink-0 ml-1 border border-gray-200">
                  {job.duration}分
                </span>
              </div>
              
              <div className="font-bold text-gray-800 text-sm truncate mb-1" title={job.title}>
                {job.title}
              </div>
              
              <div className="text-[11px] text-gray-500 flex flex-wrap gap-1.5 items-center">
                {job.area && <span className="truncate max-w-[100px]" title={job.area}>📍{job.area}</span>}
                {job.requiredVehicle && (
                  <span className="text-red-600 bg-red-50 px-1 rounded flex items-center gap-0.5 border border-red-100 font-bold shrink-0">
                    <AlertTriangle size={10} /> 必須: {job.requiredVehicle}
                  </span>
                )}
                {job.note && <span className="text-red-500 w-full mt-0.5 text-[10px] whitespace-pre-line leading-tight" title={job.note}>⚠ {job.note}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
