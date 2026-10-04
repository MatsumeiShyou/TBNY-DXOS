import React, { useState, useRef, useEffect } from 'react';
import { Driver } from '../types';
import { Printer, FileDown } from 'lucide-react';

interface DriverColumnHeaderProps {
  driver: Driver;
  jobCount: number;
  onEdit: (driverId: string) => void;
  onPrint: (driverId: string) => void;
  onPdfPrint?: (driverId: string) => void;
}

export default function DriverColumnHeader({ driver, jobCount, onEdit, onPrint, onPdfPrint }: DriverColumnHeaderProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setContextMenu({ x, y });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (jobCount > 0) {
      onPrint(driver.id);
    }
  };

  const handlePdfPrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (jobCount > 0 && onPdfPrint) {
      onPdfPrint(driver.id);
    }
  };

  return (
    <div 
      className="w-[180px] border-r border-white text-center font-bold flex flex-col cursor-pointer hover:bg-gray-800 transition-colors relative" 
      onClick={() => onEdit(driver.id)}
      onContextMenu={handleContextMenu}
    >
      <div className="bg-yellow-400 text-black text-[11px] py-0.5 border-b border-black/20 font-bold tracking-widest flex items-center justify-between px-2">
        <span>{driver.course}</span>
        <div className="flex gap-1">
          <button
            onClick={handlePdfPrintClick}
            disabled={jobCount === 0}
            className={`p-0.5 rounded ${jobCount > 0 ? 'hover:bg-yellow-500 text-black' : 'text-gray-500 cursor-not-allowed opacity-50'}`}
            title="PDF出力 (新機能)"
          >
            <FileDown size={12} />
          </button>
          <button
            onClick={handlePrintClick}
            disabled={jobCount === 0}
            className={`p-0.5 rounded ${jobCount > 0 ? 'hover:bg-yellow-500 text-black' : 'text-gray-500 cursor-not-allowed opacity-50'}`}
            title="印刷 (従来)"
          >
            <Printer size={12} />
          </button>
        </div>
      </div>
      <div className="py-2 text-sm flex items-center justify-center">
        {driver.name || '未定'} / {driver.currentVehicle || '未定'}
      </div>

      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute z-50 bg-white border border-gray-300 shadow-lg py-1 rounded text-sm text-black whitespace-nowrap min-w-[120px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${jobCount === 0 ? 'opacity-50 cursor-not-allowed text-gray-400' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (jobCount > 0) {
                onPrint(driver.id);
                setContextMenu(null);
              }
            }}
            disabled={jobCount === 0}
          >
            <Printer size={14} /> 印刷 (従来)
          </button>
          <button
            className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${jobCount === 0 ? 'opacity-50 cursor-not-allowed text-gray-400' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (jobCount > 0 && onPdfPrint) {
                onPdfPrint(driver.id);
                setContextMenu(null);
              }
            }}
            disabled={jobCount === 0}
          >
            <FileDown size={14} /> PDF出力 (新)
          </button>
        </div>
      )}
    </div>
  );
}
