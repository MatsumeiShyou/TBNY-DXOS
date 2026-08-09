import { GripVertical } from 'lucide-react';

export default function SplitLine({ split, draggingSplitId, setDraggingSplitId, setDragOffset, openSplitEdit, driverId, time }) {
  if (!split) return null;

  return (
    <div className={`absolute inset-0 bg-black text-white flex items-center justify-center text-sm font-bold z-10 border-b border-white cursor-pointer hover:bg-gray-800 transition-colors ${draggingSplitId === split.id ? 'opacity-50' : ''}`} onClick={(e) => openSplitEdit(e, driverId, time)}>
        <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/20" onMouseDown={(e) => { e.stopPropagation(); setDraggingSplitId(split.id); setDragOffset({ x: e.clientX, y: e.clientY }); }}>
            <GripVertical size={12} className="text-gray-400" />
        </div>
        {split.driverName} / {split.vehicle}
    </div>
  );
}
