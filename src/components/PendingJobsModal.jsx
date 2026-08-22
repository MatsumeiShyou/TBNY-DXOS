import { useMemo } from 'react';
import { X, Database, ArrowUpDown, Clock, AlertTriangle } from 'lucide-react';
import { formatPreferredTime } from '../utils/timeUtils';

export default function PendingJobsModal({ selectedCell, pendingJobs, driverName, onAddJob, onClose }) {
  if (!selectedCell) return null;

  // 50音順 (かな読み) で自動ソート
  const sortedJobs = useMemo(() => {
    return [...pendingJobs].sort((a, b) => {
      const kanaA = a.kana || a.title;
      const kanaB = b.kana || b.title;
      return kanaA.localeCompare(kanaB, 'ja');
    });
  }, [pendingJobs]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-transparent animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col h-auto max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-300">{driverName} / {selectedCell.time}〜</div>
            <div className="font-bold flex items-center gap-2"><Database size={16} />未配車リスト</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-end text-xs text-gray-600 font-bold">
          <span className="text-gray-500">全 {sortedJobs.length} 件</span>
        </div>
        <div className="overflow-y-auto flex-1 bg-white">
          {sortedJobs.length === 0 && <div className="p-8 text-center text-gray-400 text-xs">未配車の案件はありません</div>}
          {sortedJobs.map(job => (
            <div key={job.id} onClick={() => onAddJob(job)} className="p-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="flex items-center gap-1">
                    {job.jobType === 'spot' ? (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">スポット</span>
                    ) : (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">定期</span>
                    )}
                    {job.preferredTime && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold border bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-0.5 whitespace-nowrap"><Clock size={10} /> {formatPreferredTime(job.preferredTime)}</span>
                    )}
                  </div>
                  <span className="font-bold text-gray-800 group-hover:text-blue-700 truncate">{job.title}</span>
                </div>
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded text-gray-600 whitespace-nowrap ml-2">{job.duration}分</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 flex gap-2 pl-1 items-center">
                {job.area && <span>📍{job.area}</span>}
                {job.requiredVehicle && <span className="text-red-600 bg-red-50 px-1 rounded flex items-center gap-0.5 border border-red-100"><AlertTriangle size={10} /> 必須: {job.requiredVehicle}</span>}
                {job.note && <span className="text-red-500">⚠ {job.note}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

