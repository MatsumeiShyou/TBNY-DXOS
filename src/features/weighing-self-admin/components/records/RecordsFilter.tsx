import React, { useState, useEffect } from 'react';
import type { RecordFilters, WeighingRecord, Driver } from '../../types';
import { getCompanies, getDriversMaster } from '../../services/api';
import Button from '../ui/Button';

interface RecordsFilterProps {
  initialFilters: RecordFilters;
  onApplyFilters: (filters: RecordFilters) => void;
  onClearFilters: () => void;
}

const RecordsFilter: React.FC<RecordsFilterProps> = ({ initialFilters, onApplyFilters, onClearFilters }) => {
  const [filters, setFilters] = useState<RecordFilters>(initialFilters);
  const [companies, setCompanies] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const statuses: WeighingRecord['status'][] = ['完了', '未確認', '修正済'];

  useEffect(() => {
    getCompanies()
      .then(setCompanies)
      .catch(err => {
        console.error('Failed to fetch companies in RecordsFilter:', err);
        setCompanies([]);
      });
    getDriversMaster()
      .then(setDrivers)
      .catch(err => {
        console.error('Failed to fetch drivers in RecordsFilter:', err);
        setDrivers([]);
      });
  }, []);
  
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };
  
  const handleClear = () => {
    setFilters({});
    onClearFilters();
  }

  return (
    <div className="tw-p-4 tw-bg-background-tertiary tw-rounded-lg tw-border tw-border-border-default tw-space-y-4 animate-fade-in">
      <div className="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 lg:tw-grid-cols-5 tw-gap-4 tw-items-end">
        <div>
          <label htmlFor="keyword" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">キーワード</label>
          <input
            id="keyword"
            type="text"
            name="keyword"
            value={filters.keyword || ''}
            onChange={handleChange}
            placeholder="記録ID, ドライバー名..."
            className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
          />
        </div>
        <div>
          <label htmlFor="companyName" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">協力会社</label>
          <select
            id="companyName"
            name="companyName"
            value={filters.companyName || ''}
            onChange={handleChange}
            className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
          >
            <option value="">すべて</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="driverId" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">ドライバー</label>
          <select
            id="driverId"
            name="driverId"
            value={filters.driverId || ''}
            onChange={handleChange}
            className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
          >
            <option value="">すべて</option>
            {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="status" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">ステータス</label>
          <select
            id="status"
            name="status"
            value={filters.status || ''}
            onChange={handleChange}
            className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
          >
            <option value="">すべて</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="tw-grid tw-grid-cols-2 tw-gap-2">
            <div>
              <label htmlFor="dateFrom" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">開始日</label>
              <input
                id="dateFrom"
                type="date"
                name="dateFrom"
                value={filters.dateFrom || ''}
                onChange={handleChange}
                className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
              />
            </div>
            <div>
              <label htmlFor="dateTo" className="tw-block tw-text-sm tw-font-medium tw-text-text-secondary tw-mb-1">終了日</label>
              <input
                id="dateTo"
                type="date"
                name="dateTo"
                value={filters.dateTo || ''}
                onChange={handleChange}
                className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
              />
            </div>
        </div>
      </div>
      <div className="tw-flex tw-justify-end tw-gap-2 tw-pt-2">
        <Button variant="secondary" onClick={handleClear}>クリア</Button>
        <Button onClick={handleApply}>フィルタを適用</Button>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default RecordsFilter;
