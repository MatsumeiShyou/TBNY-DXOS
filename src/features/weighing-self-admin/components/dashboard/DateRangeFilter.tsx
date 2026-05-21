import React, { useState } from 'react';
import type { DateRange } from '../../types';
import Button from '../ui/Button';

interface DateRangeFilterProps {
  onApply: (range: DateRange) => void;
  onClear: () => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onApply, onClear }) => {
  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  const getToday = () => formatDate(new Date());
  
  const getStartOfWeek = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return formatDate(new Date(now.setDate(diff)));
  };

  const getStartOfMonth = () => {
    const now = new Date();
    return formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };
  
  const getThirtyDaysAgo = () => {
      const now = new Date();
      now.setDate(now.getDate() - 30);
      return formatDate(now);
  }

  const [range, setRange] = useState<Partial<DateRange>>({ from: '', to: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleApply = () => {
    if (range.from && range.to) {
      onApply(range as DateRange);
    }
  };

  const handleClear = () => {
    setRange({ from: '', to: '' });
    onClear();
  };

  const setPreset = (from: string, to: string) => {
    const newRange = { from, to };
    setRange(newRange);
    onApply(newRange);
  };

  const presets = [
    { label: '今日', action: () => setPreset(getToday(), getToday()) },
    { label: '今週', action: () => setPreset(getStartOfWeek(), getToday()) },
    { label: '今月', action: () => setPreset(getStartOfMonth(), getToday()) },
    { label: '過去30日間', action: () => setPreset(getThirtyDaysAgo(), getToday()) },
  ];

  return (
    <div className="tw-p-4 tw-bg-background-secondary tw-rounded-lg tw-border tw-border-border-default">
      <div className="tw-flex tw-flex-wrap tw-items-end tw-gap-4">
        <div className="tw-flex tw-items-end tw-gap-2">
          <div>
            <label htmlFor="from" className="tw-block tw-text-xs tw-font-medium tw-text-text-secondary tw-mb-1">開始日</label>
            <input
              id="from"
              type="date"
              name="from"
              value={range.from || ''}
              onChange={handleChange}
              className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
            />
          </div>
          <span className="tw-mb-2 tw-text-text-secondary">-</span>
          <div>
            <label htmlFor="to" className="tw-block tw-text-xs tw-font-medium tw-text-text-secondary tw-mb-1">終了日</label>
            <input
              id="to"
              type="date"
              name="to"
              value={range.to || ''}
              onChange={handleChange}
              className="tw-w-full tw-h-10 tw-px-3 tw-text-sm tw-bg-background-primary tw-border tw-border-border-default tw-rounded-md focus:tw-outline-none focus:tw-border-interactive-default tw-transition-colors"
            />
          </div>
        </div>
        <div className="tw-flex tw-items-center tw-gap-2 tw-pt-5">
           {presets.map(p => (
               <Button key={p.label} variant="ghost" size="sm" onClick={p.action}>{p.label}</Button>
           ))}
        </div>
        <div className="tw-flex-grow tw-flex tw-justify-end tw-items-center tw-gap-2 tw-pt-5">
          <Button variant="secondary" onClick={handleClear}>リセット</Button>
          <Button onClick={handleApply} disabled={!range.from || !range.to}>適用</Button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
