import { History, RotateCcw } from 'lucide-react';
import { BoardAction } from '../../../../../../../../../types';

interface BoardTimelineProps {
    actions: BoardAction[];
    previewIndex: number | null;
    onSeek: (index: number) => void;
    onReset: () => void;
}

export const BoardTimeline: React.FC<BoardTimelineProps> = ({
    actions,
    previewIndex,
    onSeek,
    onReset
}) => {
    const isPreviewing = previewIndex !== null;
    const currentIndex = previewIndex !== null ? previewIndex : actions.length;

    if (actions.length === 0) return null;

    return (
        <div className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-z-50 tw-bg-white/80 tw-backdrop-blur-md tw-border-t tw-border-gray-200 tw-px-6 tw-py-3 tw-shadow-2xl tw-animate-in tw-slide-in-from-bottom tw-duration-300">
            <div className="tw-max-w-7xl tw-mx-auto tw-flex tw-items-center tw-gap-6">
                {/* Status Indicator */}
                <div className="tw-flex tw-items-center tw-gap-3 tw-min-w-[140px]">
                    <div className={`p-2 rounded-full ${isPreviewing ? 'bg-amber-100 text-amber-600 animate-pulse' : 'bg-blue-100 text-blue-600'}`}>
                        <History size={18} />
                    </div>
                    <div>
                        <p className="tw-text-xs tw-font-bold tw-text-gray-500 tw-uppercase tw-tracking-wider">
                            {isPreviewing ? 'Preview Mode' : 'Live Timeline'}
                        </p>
                        <p className="tw-text-sm tw-font-semibold tw-text-gray-900">
                            {currentIndex} / {actions.length} Actions
                        </p>
                    </div>
                </div>

                {/* Timeline Slider */}
                <div className="tw-flex-1 tw-group tw-relative">
                    <input
                        type="range"
                        min="0"
                        max={actions.length}
                        value={currentIndex}
                        onChange={(e) => onSeek(parseInt(e.target.value))}
                        className="tw-w-full tw-h-2 tw-bg-gray-200 tw-rounded-lg tw-appearance-none tw-cursor-pointer tw-accent-blue-600 tw-transition-all tw-hover:h-3 tw-focus:outline-none"
                    />
                    
                    {/* Action Labels (Subtle markers) */}
                    <div className="tw-absolute tw--top-6 tw-left-0 tw-right-0 tw-flex tw-justify-between tw-px-1 tw-opacity-0 tw-group-hover:opacity-100 tw-transition-opacity tw-pointer-events-none">
                        <span className="tw-text-[10px] tw-text-gray-400 tw-font-mono">START</span>
                        <span className="tw-text-[10px] tw-text-gray-400 tw-font-mono">NOW</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="tw-flex tw-items-center tw-gap-2">
                    {isPreviewing && (
                        <button
                            onClick={onReset}
                            className="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-py-2 tw-bg-gray-900 tw-text-white tw-rounded-full tw-text-sm tw-font-medium tw-hover:bg-gray-800 tw-transition-colors tw-shadow-lg"
                        >
                            <RotateCcw size={16} />
                            <span>Return to Live</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Current Action Tooltip (Simplified) */}
            {isPreviewing && currentIndex > 0 && (
                <div className="tw-absolute tw--top-16 tw-left-1/2 tw--translate-x-1/2 tw-bg-gray-900 tw-text-white tw-px-4 tw-py-2 tw-rounded-lg tw-text-xs tw-shadow-xl tw-animate-in tw-fade-in tw-zoom-in tw-duration-200">
                    <span className="tw-text-amber-400 tw-font-bold tw-mr-2">{actions[currentIndex-1].action_type}</span>
                    <span className="tw-text-gray-300">by {actions[currentIndex-1].user_id?.slice(0, 8)}</span>
                </div>
            )}
        </div>
    );
};
