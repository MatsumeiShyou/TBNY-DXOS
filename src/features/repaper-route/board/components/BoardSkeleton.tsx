/**
 * BoardSkeleton (Phase 3-3: Skeleton Screen)
 * Provides a shimmering loading state that mimics the Board's layout.
 */
export const BoardSkeleton = () => {
    return (
        <div className="tw-flex tw-flex-col tw-h-full tw-w-full tw-bg-white tw-overflow-hidden tw-animate-pulse">
            {/* Header Skeleton */}
            <div className="tw-flex tw-border-b tw-border-gray-200 tw-bg-gray-50/50">
                <div className="tw-w-20 tw-h-16 tw-border-r tw-border-gray-200 tw-flex tw-items-center tw-justify-center tw-p-2">
                    <div className="tw-h-3 tw-bg-gray-200 tw-rounded tw-w-full" />
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="tw-flex-1 tw-h-16 tw-border-r tw-border-gray-200 tw-p-2 tw-flex tw-flex-col tw-justify-center">
                        <div className="tw-h-4 tw-bg-gray-200 tw-rounded tw-w-3/4 tw-mb-1.5" />
                        <div className="tw-h-3 tw-bg-gray-100 tw-rounded tw-w-1/2" />
                    </div>
                ))}
            </div>

            {/* Grid Skeleton */}
            <div className="tw-flex-1 tw-flex tw-overflow-hidden">
                {/* Time Axis */}
                <div className="tw-w-20 tw-border-r tw-border-gray-200 tw-bg-gray-50/30">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="tw-h-20 tw-border-b tw-border-gray-100 tw-p-2">
                            <div className="tw-h-3 tw-bg-gray-100 tw-rounded tw-w-1/2" />
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                {[1, 2, 3, 4, 5].map(j => (
                    <div key={j} className="tw-flex-1 tw-border-r tw-border-gray-200 tw-relative tw-bg-white">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="tw-h-20 tw-border-b tw-border-gray-50" />
                        ))}
                        
                        {/* Fake Job Blocks (Randomly placed for realism) */}
                        {j === 1 && (
                            <>
                                <div className="tw-absolute tw-top-4 tw-left-2 tw-right-2 tw-h-24 tw-bg-blue-50/60 tw-rounded-md tw-border tw-border-blue-100/50" />
                                <div className="tw-absolute tw-top-40 tw-left-2 tw-right-2 tw-h-16 tw-bg-blue-50/60 tw-rounded-md tw-border tw-border-blue-100/50" />
                            </>
                        )}
                        {j === 2 && (
                            <div className="tw-absolute tw-top-20 tw-left-2 tw-right-2 tw-h-32 tw-bg-emerald-50/60 tw-rounded-md tw-border tw-border-emerald-100/50" />
                        )}
                        {j === 3 && (
                            <>
                                <div className="tw-absolute tw-top-10 tw-left-2 tw-right-2 tw-h-20 tw-bg-gray-50/60 tw-rounded-md tw-border tw-border-gray-100/50" />
                                <div className="tw-absolute tw-top-60 tw-left-2 tw-right-2 tw-h-24 tw-bg-blue-50/60 tw-rounded-md tw-border tw-border-blue-100/50" />
                            </>
                        )}
                        {j === 4 && (
                            <div className="tw-absolute tw-top-4 tw-left-2 tw-right-2 tw-h-40 tw-bg-purple-50/60 tw-rounded-md tw-border tw-border-purple-100/50" />
                        )}
                    </div>
                ))}
            </div>

            {/* Sidebar Skeleton (collapsed) */}
            <div className="tw-w-1 tw-bg-gray-50 tw-border-l tw-border-gray-200" />
        </div>
    );
};
