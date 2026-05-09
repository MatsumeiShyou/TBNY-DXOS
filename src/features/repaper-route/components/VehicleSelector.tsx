import React, { useState, useMemo } from 'react';
import { Search, Truck, Check } from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  plateNumber?: string;
  isInspected?: boolean;
  [key: string]: any; // 他のプロパティを許容
}

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onSelect: (vehicle: Vehicle) => void;
}

/**
 * 産業用・高密度車両セレクター
 * 装飾を排し、検索性と情報密度を最優先したプロフェッショナル仕様。
 */
export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return vehicles.filter(v => 
      v.name.toLowerCase().includes(q) || 
      (v.plateNumber && v.plateNumber.toLowerCase().includes(q))
    );
  }, [vehicles, searchQuery]);

  return (
    <div className="tw-flex tw-flex-col tw-h-full tw-max-h-[400px] tw-bg-white">
      {/* Search Header */}
      <div className="tw-relative tw-mb-2">
        <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-pl-3 tw-flex tw-items-center tw-pointer-events-none">
          <Search size={14} className="tw-text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="車両名・ナンバーで検索..."
          className="tw-block tw-w-full tw-pl-9 tw-pr-3 tw-py-2 tw-border tw-border-slate-200 tw-rounded-lg tw-text-sm tw-placeholder-slate-400 tw-focus:tw-outline-none tw-focus:tw-ring-2 tw-focus:tw-ring-blue-500/20 tw-focus:tw-border-blue-500 tw-transition-all"
          autoFocus
        />
      </div>

      {/* Vehicle List */}
      <div className="tw-flex-1 tw-overflow-y-auto tw-border tw-border-slate-100 tw-rounded-lg tw-divide-y tw-divide-slate-50">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map(v => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(v)}
                className={`tw-w-full tw-flex tw-items-center tw-px-3 tw-py-2.5 tw-text-left tw-transition-colors tw-group
                  ${isSelected ? 'tw-bg-blue-50' : 'tw-hover:tw-bg-slate-50'}
                `}
              >
                {/* Minimal Icon */}
                <div className={`tw-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-md tw-mr-3 tw-transition-colors
                  ${isSelected ? 'tw-bg-blue-600 tw-text-white' : 'tw-bg-slate-100 tw-text-slate-400 tw-group-hover:tw-bg-slate-200'}
                `}>
                  <Truck size={16} />
                </div>

                {/* Info Container */}
                <div className="tw-flex-1 tw-min-w-0">
                  <div className="tw-flex tw-items-center tw-gap-2">
                    <span className={`tw-text-sm tw-font-bold tw-truncate ${isSelected ? 'tw-text-blue-700' : 'tw-text-slate-700'}`}>
                      {v.name}
                    </span>
                    {v.isInspected && (
                      <span className="tw-text-[9px] tw-font-black tw-bg-emerald-100 tw-text-emerald-700 tw-px-1.5 tw-py-0.5 tw-rounded tw-uppercase tw-tracking-wider">
                        点検済
                      </span>
                    )}
                  </div>
                  <div className="tw-text-[10px] tw-font-medium tw-text-slate-400 tw-font-mono">
                    {v.plateNumber || '---'}
                  </div>
                </div>

                {/* Selection Marker */}
                {isSelected && (
                  <div className="tw-ml-2 tw-text-blue-600">
                    <Check size={16} />
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="tw-py-8 tw-text-center tw-text-slate-400 tw-text-xs">
            該当する車両が見つかりません
          </div>
        )}
      </div>
    </div>
  );
};
