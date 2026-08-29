import React from 'react';
import { GripVertical } from 'lucide-react';

interface SplitData {
  id: string;
  driverId: string;
  time: string;
  driverName?: string;
  vehicle?: string;
}

interface SplitLineProps {
  split: SplitData | null | undefined;
  draggingSplitId: string | null;
  setDraggingSplitId: (id: string | null) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  setRelativeOffsetY?: (y: number) => void;
  openSplitEdit: (e: React.MouseEvent, driverId: string, time: string) => void;
  driverId: string;
  time: string;
}

const SplitLine: React.FC<SplitLineProps> = ({ split, draggingSplitId, setDraggingSplitId, setDragOffset, setRelativeOffsetY, openSplitEdit, driverId, time }) => {
  if (!split) return null;

  return (
    <div className={`absolute inset-0 bg-black text-white flex items-center justify-center text-sm font-bold z-10 border-b border-white cursor-pointer hover:bg-gray-800 transition-colors ${draggingSplitId === split.id ? 'opacity-50' : ''}`} onClick={(e) => openSplitEdit(e, driverId, time)}>
        <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/20" onMouseDown={(e) => { e.stopPropagation(); setDraggingSplitId(split.id); const rect = e.currentTarget.parentElement?.getBoundingClientRect(); setDragOffset({ x: e.clientX, y: e.clientY }); if(setRelativeOffsetY) setRelativeOffsetY(rect ? e.clientY - rect.top : 0); }}>
            <GripVertical size={12} className="text-gray-400" />
        </div>
        {split.driverName} / {split.vehicle}
    </div>
  );
}

export default SplitLine;
