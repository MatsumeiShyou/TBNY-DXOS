import React, { type ElementType } from 'react';
import Card from '../ui/Card';

interface SummaryCardProps {
  title: string;
  value: number;
  icon: ElementType;
  color?: 'blue' | 'red';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, icon: Icon, color }) => {
  const iconColorClass = (color === 'blue' && 'tw-text-blue-500 dark:tw-text-blue-400') ||
                         (color === 'red' && 'tw-text-error') ||
                         'tw-text-text-secondary';

  return (
    <Card className="tw-p-6">
        <div className="tw-flex tw-justify-between tw-items-start">
            <p className="tw-text-sm tw-font-semibold tw-text-text-secondary tw-uppercase tw-tracking-wider">{title}</p>
            <Icon className={`tw-w-6 tw-h-6 ${iconColorClass}`} />
        </div>
        <p className="tw-text-4xl tw-font-bold tw-text-text-primary tw-mt-2">{value.toLocaleString()}</p>
    </Card>
  );
};

export default SummaryCard;
