import { BoardDriver } from '../../../types';
import { PlusCircle } from 'lucide-react';

interface DriverHeaderProps {
    drivers: BoardDriver[];
    onEditHeader: (driverId: string) => void;
    onAddColumn: () => void;
    canEditBoard: boolean;
    stickyTop?: string;
}

export const DriverHeader: React.FC<DriverHeaderProps> = ({
    drivers,
    onEditHeader,
    onAddColumn,
    canEditBoard,
    stickyTop = 'top-0'
}) => {
    return (
        <div className={`flex border-b border-white bg-black text-white sticky ${stickyTop} z-40 shadow-sm min-w-max`}>
            {/* 時間軸ラベル - 64px 固定 */}
            <div
                style={{ width: '64px', minWidth: '64px', flexShrink: 0 }}
                className="tw-border-r tw-border-white tw-bg-gray-900 tw-flex tw-items-center tw-justify-center tw-font-bold tw-sticky tw-left-0 tw-z-50 tw-text-xs tw-text-slate-400"
            >
                時間
            </div>
            <div className="tw-flex">
                {drivers.map(driver => {
                    return (
                        <div
                            key={driver.id}
                            style={{ width: '180px', minWidth: '180px', flexShrink: 0 }}
                            className="tw-border-r tw-border-white tw-text-center tw-font-bold tw-flex tw-flex-col tw-cursor-pointer tw-hover:bg-gray-800 tw-transition-colors"
                            onClick={() => onEditHeader(driver.id)}
                        >
                            {/* ★紙ベースを再現したコース名の黄色い帯（アルファベットのみ） */}
                            <div className="tw-bg-yellow-400 tw-text-black tw-text-[11px] tw-py-0.5 tw-border-b tw-border-black/20 tw-font-bold tw-tracking-widest tw-uppercase">
                                {driver.course || driver.name.charAt(0)}
                            </div>
                            {/* ドライバー・車両情報 - JS版の1行スタイル */}
                            <div className="tw-py-2 tw-text-sm tw-truncate tw-px-1">
                                {driver.driverName || '未割当'} <span className="tw-text-xs tw-text-gray-500">/</span> {driver.currentVehicle}
                            </div>
                        </div>
                    );
                })}

                {/* Add Column Button */}
                {canEditBoard && (
                    <div
                        style={{ width: '50px', minWidth: '50px', flexShrink: 0 }}
                        className="tw-flex tw-items-center tw-justify-center tw-bg-gray-800 tw-hover:bg-gray-700 tw-cursor-pointer tw-transition-colors tw-border-r tw-border-white"
                        onClick={onAddColumn}
                        title="コースを追加"
                    >
                        <PlusCircle size={20} className="tw-text-gray-400 tw-hover:text-white" />
                    </div>
                )}
            </div>
        </div>
    );
};
