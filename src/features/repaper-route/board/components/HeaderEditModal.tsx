import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import type { BoardDriver } from '../../types';

interface HeaderEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    driver: BoardDriver | null;
    masterDrivers: any[];
    masterVehicles: any[];
    onSave: (updatedDriver: BoardDriver) => void;
    onDelete?: () => void;
}

export const HeaderEditModal: React.FC<HeaderEditModalProps> = ({
    isOpen,
    onClose,
    driver,
    masterDrivers,
    masterVehicles,
    onSave,
    onDelete
}) => {
    const [course, setCourse] = useState('');
    const [selectedDriverId, setSelectedDriverId] = useState('');
    const [vehicleCallsign, setVehicleCallsign] = useState('');

    useEffect(() => {
        if (driver && isOpen) {
            setCourse(driver.course || '');
            setSelectedDriverId(driver.id || '');
            setVehicleCallsign(driver.vehicleCallsign || driver.currentVehicle || '');
        }
    }, [driver, isOpen]);

    const handleSave = () => {
        if (!driver) return;

        const selectedMaster = masterDrivers.find(d => d.id === selectedDriverId);

        const updated: BoardDriver = {
            ...driver,
            course: course,
            id: selectedDriverId, // 実際のIDを更新
            driverName: selectedMaster?.driver_name || selectedMaster?.name || driver.driverName,
            currentVehicle: vehicleCallsign,
            vehicleCallsign: vehicleCallsign
        };

        onSave(updated);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="コース・担当者編集">
            <div className="tw-space-y-4 tw-p-4">
                <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">コース名</label>
                    <input
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="tw-w-full tw-border tw-rounded-md tw-p-2 tw-text-sm"
                        placeholder="例: Aコース"
                    />
                </div>

                <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">担当ドライバー</label>
                    <select
                        value={selectedDriverId}
                        onChange={(e) => setSelectedDriverId(e.target.value)}
                        className="tw-w-full tw-border tw-rounded-md tw-p-2 tw-text-sm"
                    >
                        <option value="">（未設定）</option>
                        {masterDrivers.map(d => (
                            <option key={d.id} value={d.id}>
                                {d.driver_name || d.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">使用車両（通称/番号）</label>
                    <select
                        value={vehicleCallsign}
                        onChange={(e) => setVehicleCallsign(e.target.value)}
                        className="tw-w-full tw-border tw-rounded-md tw-p-2 tw-text-sm tw-bg-white"
                    >
                        <option value="">（未選択）</option>
                        {masterVehicles.map(v => (
                            <option key={v.id} value={v.callsign || v.number || v.id}>
                                {v.callsign ? `${v.callsign} (${v.number})` : v.number || v.id}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="tw-flex tw-justify-between tw-items-center tw-pt-4">
                    <div>
                        {course.toLowerCase().includes('test') && onDelete && (
                            <button
                                onClick={() => {
                                    if (window.confirm('このコース（列）を削除しますか？')) {
                                        onDelete();
                                        onClose();
                                    }
                                }}
                                className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-red-600 tw-bg-red-50 tw-rounded-md tw-hover:bg-red-100 tw-border tw-border-red-200"
                            >
                                コース削除
                            </button>
                        )}
                    </div>
                    <div className="tw-flex tw-gap-2">
                        <button
                            onClick={onClose}
                            className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-gray-600 tw-bg-gray-100 tw-rounded-md tw-hover:bg-gray-200"
                        >
                            キャンセル
                        </button>
                        <button
                            onClick={handleSave}
                            className="tw-px-4 tw-py-2 tw-text-sm tw-font-medium tw-text-white tw-bg-blue-600 tw-rounded-md tw-hover:bg-blue-700"
                        >
                            保存
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default HeaderEditModal;
