
interface SkeletonProps {
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
    return (
        <div className="tw-space-y-3 tw-w-full tw-animate-pulse">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
                />
            ))}
        </div>
    );
};

export const JobCardSkeleton: React.FC = () => (
    <div className="tw-relative tw-flex tw-items-start tw-gap-4 tw-mb-4">
        <div className="tw-relative tw-z-10 tw-flex-shrink-0 tw-w-10 tw-h-10 tw-rounded-full tw-bg-gray-200 tw-dark:bg-gray-700" />
        <div className="tw-bg-white tw-dark:bg-gray-800 tw-rounded-lg tw-p-4 tw-flex-grow tw-shadow-md">
            <Skeleton className="tw-h-6 tw-w-3/4 tw-mb-2" />
            <Skeleton className="tw-h-4 tw-w-1/2" />
        </div>
    </div>
);
