import React from 'react';
import { Driver } from '../types';

interface DriverColumnHeaderProps {
  driver: Driver;
  onEdit: (driverId: string) => void;
}

export default function DriverColumnHeader({ driver, onEdit }: DriverColumnHeaderProps) {
  return (
    <div 
      className="w-[180px] border-r border-white text-center font-bold flex flex-col cursor-pointer hover:bg-gray-800 transition-colors" 
      onClick={() => onEdit(driver.id)}
    >
      {/* ★紙ベースを再現したコース名の黄色い帯（アルファベットのみ） */}
      <div className="bg-yellow-400 text-black text-[11px] py-0.5 border-b border-black/20 font-bold tracking-widest">
        {driver.course}
      </div>
      {/* ドライバー・車両情報 */}
      <div className="py-2 text-sm">
        {driver.name} / {driver.currentVehicle}
      </div>
    </div>
  );
}
