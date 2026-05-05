
import React from 'react';
import DriverApp from './sandbox/DriverApp';


/**
 * DriverOSApp
 * 
 * TBNY DXOS におけるドライバーアプリのエントリポイント。
 */
const DriverOSApp: React.FC = () => {
  return (
    <div className="tw-w-full tw-h-full tw-bg-slate-50 tw-overflow-hidden tw-relative">
      <DriverApp />
    </div>
  );
};

export default DriverOSApp;
