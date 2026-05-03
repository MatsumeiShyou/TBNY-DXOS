
import React from 'react';
import DriverApp from './sandbox/DriverApp';
import { useDriverOSBridge } from './bridge/useDriverOSBridge';

/**
 * DriverOSApp
 * 
 * TBNY DXOS におけるドライバーアプリのエントリポイント。
 */
const DriverOSApp: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useDriverOSBridge();

  return (
    <div className="tw-w-full tw-h-full tw-bg-slate-50 tw-overflow-hidden tw-relative">
      <DriverApp />
    </div>
  );
};

export default DriverOSApp;
