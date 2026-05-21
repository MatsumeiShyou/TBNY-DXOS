import React from 'react';

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div className={`tw-bg-background-tertiary tw-animate-pulse tw-rounded-md ${className}`}></div>
  );
};

export default Skeleton;
