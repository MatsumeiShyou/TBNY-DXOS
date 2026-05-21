import React from 'react';

const GlobalSpinner: React.FC = () => {
  return (
    <div className="tw-fixed tw-inset-0 tw-bg-black/50 tw-z-[100] tw-flex tw-items-center tw-justify-center" aria-label="読み込み中">
      <div className="tw-w-16 tw-h-16 tw-border-4 tw-border-t-interactive-default tw-border-background-primary tw-rounded-full tw-animate-spin"></div>
    </div>
  );
};

export default GlobalSpinner;
