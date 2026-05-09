import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { formatFullDateWithNthDay } from '../utils/dateUtils';
import { CalendarPicker } from './CalendarPicker';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind Class Merger Utility
 */
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DateDisplayProps {
    selectedDate: Date;
    onDateChange: (newDate: Date) => void;
    userRole?: string;
}

/**
 * AGENTS.md 准拠: ユーザー指定の表示形式
 * 100pt Version: 日本の祝日対応カスタムカレンダーを統合
 */
export const DateDisplay: React.FC<DateDisplayProps> = ({ selectedDate, onDateChange, userRole }) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsPickerOpen(!isPickerOpen);
    };

    // 外部クリックで閉じる処理
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        if (isPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPickerOpen]);

    return (
        <div ref={containerRef} className="tw-relative">
            <button
                onClick={handleToggle}
                className={cn(
                    "tw-flex tw-items-center tw-gap-2 tw-px-3 tw-py-1.5 tw-rounded-lg tw-border tw-transition-all tw-duration-200 tw-outline-none",
                    "tw-bg-white tw-border-slate-200 tw-shadow-sm hover:tw-border-slate-300",
                    isPickerOpen && "tw-border-blue-400 tw-ring-2 tw-ring-blue-400/20"
                )}
            >
                <span className="tw-text-sm tw-font-bold tw-text-slate-700 tw-tabular-nums">
                    {formatFullDateWithNthDay(selectedDate)}
                </span>
                <div className="tw-p-1 tw-px-1.5 tw-rounded tw-bg-blue-50">
                    <Calendar size={14} className="tw-text-blue-600" />
                </div>
            </button>

            {/* カスタムカレンダーピッカー */}
            {isPickerOpen && (
                <div className="tw-animate-in tw-fade-in tw-slide-in-from-top-1 tw-duration-200">
                    <CalendarPicker
                        selectedDate={selectedDate}
                        onDateChange={onDateChange}
                        onClose={() => setIsPickerOpen(false)}
                        userRole={userRole}
                    />
                </div>
            )}
        </div>
    );
};
