import React from 'react';
import { GripVertical, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { COLOR_PALETTE, QUARTER_HEIGHT_REM } from '../data/constants';
import { timeToMinutes, isTimeWarning, formatPreferredTime } from '../utils/timeUtils';
import { Job, ColorPalette } from '../types';

export interface JobCardJob extends Job {
  isDeleted?: boolean;
  isSuspended?: boolean;
  isVehicleError?: boolean;
  preferredTime?: string;
  isOrphan?: boolean;
  isError?: boolean;
}

interface JobCardProps {
  job: JobCardJob;
  time: string;
  driverId: string;
  jobColorMap: Record<string, ColorPalette>;
  draggingJobId: string | null;
  dragCurrent: { x: number; y: number };
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;
  setSelectedCell: (cell: { driverId: string; time: string } | null) => void;
  recordHistory: () => void;
  setResizingState: (state: { id: string; direction: 'top' | 'bottom'; startY: number; originalDuration: number; originalStartTime?: string }) => void;
  setDraggingJobId: (id: string | null) => void;
  setDragButton: (btn: number) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  setRelativeOffsetY?: (y: number) => void;
  setDragCurrent: (current: { x: number; y: number }) => void;
  setDragMousePos: (pos: { x: number; y: number }) => void;
  renderJobHourLines: (job: JobCardJob) => React.ReactNode;
  onDoubleClickJob?: (job: JobCardJob, cell: { driverId: string; time: string }) => void;
}

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
  setRelativeOffsetY,
  setDragCurrent,
  setDragMousePos,
  renderJobHourLines,
  onDoubleClickJob
}: JobCardProps) {
  return (
    <div 
      className={`px-1 py-0.5 group/card transition-transform duration-75 absolute top-0 left-0 w-full rounded shadow-sm border p-1 text-xs font-bold leading-tight flex flex-col justify-center ${job.isOrphan ? 'bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_10px,#b91c1c_10px,#b91c1c_20px)] text-white border-red-900 shadow-inner' : job.isDeleted ? 'bg-orange-50 text-orange-900 border-2 border-dashed border-orange-500' : job.isSuspended ? 'bg-yellow-100 text-yellow-900 border-2 border-dotted border-yellow-500' : job.isVehicleError ? 'bg-red-100 text-red-900 border-red-500' : `${(jobColorMap[job.id] || COLOR_PALETTE[0]).bg} ${(jobColorMap[job.id] || COLOR_PALETTE[0]).text} ${(jobColorMap[job.id] || COLOR_PALETTE[0]).border}`} ${draggingJobId === job.id ? 'opacity-40 shadow-none ring-0' : 'hover:brightness-95'} ${selectedJobId === job.id ? 'ring-2 ring-blue-600 z-40' : 'z-20'}`}
      style={{ height: `${(job.duration / 15) * QUARTER_HEIGHT_REM}rem` }}
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedJobId(job.id); setSelectedCell(null); }}
      onDoubleClick={(e: React.MouseEvent) => { 
        e.stopPropagation(); 
        if (onDoubleClickJob) {
          onDoubleClickJob(job, { driverId, time });
        } else {
          setSelectedCell({ driverId, time }); 
        }
      }}
    >
      {renderJobHourLines(job)}
      {job.isVehicleError && <div className="absolute top-0 right-0 p-0.5 z-30 bg-red-500 text-white rounded-bl-md shadow"><AlertTriangle size={12} /></div>}
      {!job.isVehicleError && job.preferredTime && job.startTime && isTimeWarning(job.startTime, job.duration, job.preferredTime) && <div className="absolute top-0 right-0 p-0.5 z-30 bg-amber-500 text-white rounded-bl-md shadow" title={`希望: ${formatPreferredTime(job.preferredTime)}`}><AlertTriangle size={12} /></div>}
      <div className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize z-20 hover:bg-black/10 transition-colors rounded-t" onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); recordHistory(); setResizingState({ id: job.id, direction: 'top', startY: e.clientY, originalDuration: job.duration, originalStartTime: job.startTime }); }} />
      <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing z-20 hover:bg-black/5 rounded-l" onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); if (e.button === 2) e.preventDefault(); setDraggingJobId(job.id); setSelectedJobId(job.id); setSelectedCell(null); setDragButton(e.button); const rect = e.currentTarget.parentElement?.getBoundingClientRect(); setDragOffset({ x: e.clientX, y: e.clientY }); if(setRelativeOffsetY) setRelativeOffsetY(rect ? e.clientY - rect.top : 0); setDragCurrent({ x: 0, y: 0 }); setDragMousePos({ x: e.clientX, y: e.clientY }); }}>
        <GripVertical size={12} className="text-black/20" />
      </div>
      <div className="flex items-center pl-5 overflow-hidden pointer-events-none">
        {job.isDeleted && <span className="flex-shrink-0 bg-red-100 text-red-700 border border-red-200 text-[9px] px-1 rounded-sm mr-1 font-bold leading-tight">削除済</span>}
        {job.isSuspended && !job.isDeleted && <span className="flex-shrink-0 bg-yellow-100 text-yellow-700 border border-yellow-200 text-[9px] px-1 rounded-sm mr-1 font-bold leading-tight">停止中</span>}
        <div className="truncate flex-1">{job.title}</div>
      </div>
      {job.duration > 15 && <div className="text-[10px] opacity-75 font-normal pl-5 pointer-events-none">{job.startTime} - ({job.duration}分)</div>}
      
      {job.netWeight != null && (
        <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-white/80 text-green-700 px-1 rounded text-[9px] pointer-events-none shadow-sm z-30 leading-none py-0.5">
          <CheckCircle2 size={10} />
          <span>{job.netWeight}kg</span>
        </div>
      )}
      {job.actualQuantity != null && job.netWeight == null && (
        <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-white/80 text-blue-700 px-1 rounded text-[9px] pointer-events-none shadow-sm z-30 leading-none py-0.5">
          <CheckCircle2 size={10} />
          <span>{job.actualQuantity}{job.quantityUnit || 'kg'}</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize z-20 hover:bg-black/10 transition-colors rounded-b" onMouseDown={(e: React.MouseEvent) => { e.stopPropagation(); recordHistory(); setResizingState({ id: job.id, direction: 'bottom', startY: e.clientY, originalDuration: job.duration, originalStartTime: job.startTime }); }} />
    </div>
  );
}
