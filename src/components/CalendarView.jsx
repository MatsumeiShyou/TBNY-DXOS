import React, { useState, useMemo } from 'react';
import { Trash2, Clock, Plus, Ban, ArrowRightLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth } from '../utils/calendarUtils';
import { formatPreferredTime } from '../utils/timeUtils';
import { storageService } from '../services/storageService';
import SpotRegistrationModal from './SpotRegistrationModal';
import RecurringDeleteModal from './RecurringDeleteModal';

const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];

export default function CalendarView({ 
  monthlyExceptions, 
  masterCustomers, 
  onChangeDate,
  setViewMode,
  currentDate: parentDate,
  addSpotJob,
  deleteJobFromCalendar,
  moveSpotJob
}) {
  const [currentDate, setCurrentDate] = useState(() => parentDate || new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-12

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const [spotModalState, setSpotModalState] = useState({ isOpen: false, dateStr: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, dateStr: null, jobId: null, seriesId: null });

  const handleOpenSpotModal = (dateStr) => {
    setSpotModalState({ isOpen: true, dateStr });
  };

  const handleCloseSpotModal = () => {
    setSpotModalState({ isOpen: false, dateStr: null });
  };

  const handleSaveSpot = (targetDates, spotJob) => {
    if (addSpotJob) addSpotJob(targetDates, spotJob);
  };

  const handleDeleteJob = (dateString, job) => {
    if (job.seriesId) {
      setDeleteModalState({ isOpen: true, dateStr: dateString, jobId: job.id, seriesId: job.seriesId });
    } else {
      if (deleteJobFromCalendar) deleteJobFromCalendar(dateString, job.id);
    }
  };

  const handleConfirmDelete = (scope) => {
    if (deleteJobFromCalendar && deleteModalState.jobId) {
      deleteJobFromCalendar(deleteModalState.dateStr, deleteModalState.jobId, scope, deleteModalState.seriesId);
    }
    setDeleteModalState({ isOpen: false, dateStr: null, jobId: null, seriesId: null });
  };

  const handleMoveJob = (sourceDate, targetDate, jobId) => {
    if (moveSpotJob) moveSpotJob(sourceDate, targetDate, jobId);
  };

  const handleMoveToDispatch = (dateString) => {
    if (onChangeDate && setViewMode) {
      onChangeDate(new Date(dateString));
      setViewMode('dispatch');
    }
  };

  const generateCalendarGrid = () => {
    const gridYear = currentDate.getFullYear();
    const gridMonth = currentDate.getMonth();
    const firstDay = new Date(gridYear, gridMonth, 1);
    const lastDay = new Date(gridYear, gridMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(1 - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) {
      endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    }

    const grid = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${dd}`;
      grid.push({
        date: new Date(d),
        dateNum: d.getDate(),
        isCurrentMonth: d.getMonth() === gridMonth,
        dateString
      });
      d.setDate(d.getDate() + 1);
    }
    return grid;
  };

  const calendarGrid = generateCalendarGrid();
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h2>
          <div className="flex bg-gray-100 rounded">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-gray-200 rounded-l transition-colors text-gray-600"><ChevronLeft size={20}/></button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              今月
            </button>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-gray-200 rounded-r transition-colors text-gray-600"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="text-sm text-gray-500 font-bold hidden sm:block">
          月間スケジュール
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-gray-200 border border-gray-300 rounded-lg overflow-hidden shadow flex flex-col h-full min-h-[600px]">
          <div className="grid grid-cols-7 bg-white border-b shrink-0">
            {weekDays.map((day, i) => (
              <div key={day} className={`text-center py-2 text-sm font-bold border-r last:border-r-0 ${i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-600'}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1 bg-gray-200 gap-px">
            {calendarGrid.map((cell, idx) => {
              const dateStr = cell.dateString;
              const exp = monthlyExceptions[dateStr] || { spotJobs: [], cancellations: [], reschedules: [] };
              const { spotJobs, cancellations, reschedules } = exp;
              
              const dailyState = storageService.loadDailyStateSync(dateStr);
              const actualSpotJobs = spotJobs.map(job => {
                if (dailyState) {
                   const jobInJobs = (dailyState.jobs || []).find(j => j.id === job.id);
                   if (jobInJobs) return { ...job, driverId: jobInJobs.driverId };
                   const jobInPending = (dailyState.pendingJobs || []).find(j => j.id === job.id);
                   if (jobInPending) return { ...job, driverId: undefined };
                }
                return job;
              });

              return (
                <div 
                  key={dateStr} 
                  className={`bg-white p-2 flex flex-col transition-colors group relative ${!cell.isCurrentMonth ? 'bg-gray-50' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    handleMoveJob(data.sourceDate, dateStr, data.jobId);
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <button
                      type="button"
                      onClick={() => handleMoveToDispatch(dateStr)}
                      className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-blue-100 hover:text-blue-700 ${
                        cell.date.getDay() === 0 ? 'text-red-500' : cell.date.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'
                      }`}
                    >
                      {cell.dateNum}
                    </button>
                    <button 
                      onClick={() => handleOpenSpotModal(dateStr)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] bg-green-100 hover:bg-green-200 text-green-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-green-300"
                    >
                      <Plus size={10} /> スポット
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                    {actualSpotJobs.map(job => (
                      <div 
                        key={job.id} 
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', JSON.stringify({ sourceDate: dateStr, jobId: job.id }));
                        }}
                        className="text-xs border rounded p-1.5 cursor-grab bg-white border-blue-300 shadow-sm relative"
                      >
                        <div className="absolute top-0 right-0 bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-bl-lg rounded-tr-[3px] font-bold">SPOT</div>
                        <div className="flex justify-between items-start mb-1 pr-8">
                          <span className="font-bold text-gray-800 truncate">{job.title}</span>
                          <button onClick={() => handleDeleteJob(dateStr, job)} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                        {job.preferredTime && <div className="text-[10px] text-gray-600 flex items-center gap-0.5"><Clock size={10} /> {formatPreferredTime(job.preferredTime)}</div>}
                        <div className={`text-[10px] font-bold mt-1 ${job.driverId ? 'text-blue-600' : 'text-orange-600'}`}>{job.driverId ? '配車済' : '未配車'}</div>
                      </div>
                    ))}

                    {cancellations.map((cid, i) => {
                      const cust = masterCustomers.find(c => c.id === cid);
                      return (
                        <div key={`cancel_${cid}_${i}`} className="text-[10px] bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                           <Ban size={10} />休止: {cust ? cust.name : '不明'}
                        </div>
                      )
                    })}
                    {reschedules.map((resJob, i) => (
                        <div key={`res_${resJob.id}_${i}`} className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded flex items-center gap-1 font-bold">
                           <ArrowRightLeft size={10} />振替: {resJob.title}
                        </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SpotRegistrationModal 
        isOpen={spotModalState.isOpen}
        onClose={handleCloseSpotModal}
        onSave={handleSaveSpot}
        targetDate={spotModalState.dateStr}
        masterCustomers={masterCustomers}
      />

      <RecurringDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, dateStr: null, jobId: null, seriesId: null })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
