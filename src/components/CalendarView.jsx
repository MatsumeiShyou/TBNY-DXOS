import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Trash2, Send, AlertTriangle, Clock } from 'lucide-react';
import { generateMonthlySchedule, getDaysInMonth } from '../utils/calendarUtils';
import { formatPreferredTime } from '../utils/timeUtils';

const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];

export default function CalendarView({ 
  monthlySchedules, 
  setMonthlySchedules, 
  masterCustomers, 
  systemSettings, 
  setPendingJobs 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const handleGenerate = () => {
    if (!confirm(`${year}年${month}月のスケジュールを自動展開します。現在の調整内容は上書きされます。よろしいですか？`)) return;
    const newSchedule = generateMonthlySchedule(year, month, masterCustomers);
    setMonthlySchedules(prev => ({
      ...prev,
      ...newSchedule
    }));
  };

  const handleDeleteJob = (dateString, jobId) => {
    setMonthlySchedules(prev => {
      const dayJobs = prev[dateString] || [];
      return {
        ...prev,
        [dateString]: dayJobs.filter(j => j.id !== jobId)
      };
    });
  };

  const handleMoveJob = (sourceDate, targetDate, jobId) => {
    if (sourceDate === targetDate) return;
    setMonthlySchedules(prev => {
      const sourceJobs = prev[sourceDate] || [];
      const targetJobs = prev[targetDate] || [];
      const jobToMove = sourceJobs.find(j => j.id === jobId);
      if (!jobToMove) return prev;

      return {
        ...prev,
        [sourceDate]: sourceJobs.filter(j => j.id !== jobId),
        [targetDate]: [...targetJobs, jobToMove]
      };
    });
  };

  const handleTransferToPending = (dateString) => {
    const jobsToTransfer = monthlySchedules[dateString] || [];
    if (jobsToTransfer.length === 0) return alert('転送するジョブがありません');

    // IDを振り直して転送（重複防止）
    const jobsWithNewIds = jobsToTransfer.map(j => ({
      ...j,
      id: `p_${j.originalCustomerId}_${Date.now()}_${Math.floor(Math.random()*1000)}`
    }));

    setPendingJobs(prev => [...prev, ...jobsWithNewIds]);
    
    // カレンダー上からは削除
    setMonthlySchedules(prev => ({
      ...prev,
      [dateString]: []
    }));
  };

  // カレンダー描画用のグリッド生成
  const calendarGrid = useMemo(() => {
    const days = getDaysInMonth(year, month);
    const firstDay = days[0].date.getDay(); // 月初の曜日 (0=Sun)
    const paddingDays = Array(firstDay).fill(null);
    return [...paddingDays, ...days];
  }, [year, month]);

  const holidays = systemSettings.holidays || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-hidden">
      
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            中長期スケジュール・カレンダー
          </h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded p-1">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronLeft size={20}/></button>
            <span className="font-bold text-gray-700 px-3">{year}年 {month}月</span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-200 rounded"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div>
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-bold shadow transition-colors"
          >
            <RefreshCw size={16} /> 指定月の自動展開
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg shadow border border-gray-200">
          
          {/* ヘッダー */}
          <div className="grid grid-cols-7 border-b bg-gray-50">
            {DAYS_JP.map((d, i) => (
              <div key={d} className={`p-2 text-center text-sm font-bold ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* カレンダー本体 */}
          <div className="grid grid-cols-7 auto-rows-[minmax(180px,auto)] bg-gray-200 gap-[1px]">
            {calendarGrid.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="bg-gray-50/50"></div>;
              }
              
              const dateStr = cell.dateString;
              const isHoliday = holidays.includes(dateStr);
              const dayJobs = monthlySchedules[dateStr] || [];

              return (
                <div 
                  key={dateStr} 
                  className={`bg-white p-2 flex flex-col transition-colors ${isHoliday ? 'bg-red-50/30' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    handleMoveJob(data.sourceDate, dateStr, data.jobId);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${cell.date.getDay() === 0 || isHoliday ? 'text-red-500' : cell.date.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                        {cell.dateNum}
                      </span>
                      {isHoliday && <span className="text-[10px] text-red-500 font-bold bg-red-100 px-1 rounded inline-block mt-0.5">休業日</span>}
                    </div>
                    {dayJobs.length > 0 && (
                      <button 
                        onClick={() => handleTransferToPending(dateStr)}
                        className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-300"
                        title="この日のジョブを配車盤(未配車リスト)へ送る"
                      >
                        <Send size={10} /> 転送
                      </button>
                    )}
                  </div>

                  {/* ジョブリスト */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                    {dayJobs.map(job => (
                      <div 
                        key={job.id} 
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify({ sourceDate: dateStr, jobId: job.id }));
                        }}
                        className={`text-xs border rounded p-1.5 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-sm bg-white ${isHoliday && !job.holidayCollection ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-gray-800 truncate pr-1">{job.title}</span>
                          <button 
                            onClick={() => handleDeleteJob(dateStr, job.id)}
                            className="text-gray-400 hover:text-red-500 shrink-0"
                            title="このジョブをキャンセル(削除)"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        {job.preferredTime && (
                           <div className="text-[10px] text-gray-600 flex items-center gap-0.5 mb-0.5">
                             <Clock size={10} /> {formatPreferredTime(job.preferredTime)}
                           </div>
                        )}
                        {isHoliday && !job.holidayCollection && (
                          <div className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                            <AlertTriangle size={10} /> 休業日警告(別日へ移動)
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
