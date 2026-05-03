
import React from 'react';
import './sandbox/sandbox.css';
import DriverApp from './sandbox/DriverApp';
import { useDriverOSBridge } from './bridge/useDriverOSBridge';

/**
 * DriverOSApp
 * 
 * TBNY DXOS におけるドライバーアプリのエントリポイント。
 */
const DriverOSApp: React.FC = () => {
  // Bridge hook can be used here for future global OS synchronization
  useDriverOSBridge();

  return (
    <div className="tw-w-full tw-h-full tw-bg-slate-50 tw-overflow-hidden tw-relative">
      <DriverApp />
    </div>
  );
};

export default DriverOSApp;
