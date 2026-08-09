import { GripVertical, AlertTriangle } from 'lucide-react';
import { COLOR_PALETTE, QUARTER_HEIGHT_REM } from '../data/constants';
import { timeToMinutes, isTimeWarning, formatPreferredTime } from '../utils/timeUtils';

export default function JobCard({
  job,
  time,
  driverId,
  jobColorMap,
  draggingJobId,
  dragCurrent,
  selectedJobId,
  setSelectedJobId,
  setSelectedCell,
  recordHistory,
  setResizingState,
  setDraggingJobId,
  setDragButton,
  setDragOffset,
  setDragCurrent,
  setDragMousePos,
  renderJobHourLines
}) {
  return (
    <div 
      className={`px-1 py-0.5 group/card transition-transform duration-75 absolute top-0 left-0 w-full rounded shadow-sm border p-1 text-xs font-bold leading-tight flex flex-col justify-center ${job.isVehicleError ? 'bg-red-100 text-red-900 border-red-500' : `${(jobColorMap[job.id] || COLOR_PALETTE[0]).bg} ${(jobColorMap[job.id] || COLOR_PALETTE[0]).text} ${(jobColorMap[job.id] || COLOR_PALETTE[0]).border}`} ${draggingJobId === job.id ? 'opacity-40 shadow-none ring-0' : 'hover:brightness-95'} ${selectedJobId === job.id ? 'ring-2 ring-blue-600 z-40' : 'z-20'}`}
      style={{ height: `${(job.duration / 15) * QUARTER_HEIGHT_REM}rem`, transform: draggingJobId === job.id ? `translate(${dragCurrent.x}px, ${dragCurrent.y}px)` : 'none' }}
      onClick={(e) => { e.stopPropagation(); setSelectedJobId(job.id); }}
      onDoubleClick={(e) => { e.stopPropagation(); setSelectedCell({ driverId: driverId, time }); }}
    >
      {renderJobHourLines(job)}
      {job.isVehicleError && <div className="absolute top-0 right-0 p-0.5 z-30 bg-red-500 text-white rounded-bl-md shadow"><AlertTriangle size={12} /></div>}
      {!job.isVehicleError && job.preferredTime && isTimeWarning(job.startTime, job.duration, job.preferredTime) && <div className="absolute top-0 right-0 p-0.5 z-30 bg-amber-500 text-white rounded-bl-md shadow" title={`希望: ${formatPreferredTime(job.preferredTime)}`}><AlertTriangle size={12} /></div>}
      <div className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-20 hover:bg-black/10 transition-colors rounded-t" onMouseDown={(e) => { e.stopPropagation(); recordHistory(); setResizingState({ id: job.id, direction: 'top', startY: e.clientY, originalDuration: job.duration, originalStartTime: job.startTime }); }} />
      <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 hover:bg-black/5 rounded-l" onMouseDown={(e) => { e.stopPropagation(); if (e.button === 2) e.preventDefault(); setDraggingJobId(job.id); setSelectedJobId(job.id); setDragButton(e.button); setDragOffset({ x: e.clientX, y: e.clientY }); setDragCurrent({ x: 0, y: 0 }); setDragMousePos({ x: e.clientX, y: e.clientY }); }}>
        <GripVertical size={12} className="text-black/20" />
      </div>
      <div className="truncate pl-5 pointer-events-none">{job.title}</div>
      {job.duration > 15 && <div className="text-[10px] opacity-75 font-normal pl-5 pointer-events-none">{job.startTime} - ({job.duration}分)</div>}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize z-20 hover:bg-black/10 transition-colors rounded-b" onMouseDown={(e) => { e.stopPropagation(); recordHistory(); setResizingState({ id: job.id, direction: 'bottom', startY: e.clientY, originalDuration: job.duration, originalStartTime: job.startTime }); }} />
    </div>
  );
}
