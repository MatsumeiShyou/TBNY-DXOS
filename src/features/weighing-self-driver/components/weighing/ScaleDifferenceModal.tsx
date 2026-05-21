/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import NumberInput from '../ui/NumberInput';
import Button from '../ui/Button';
import { ArrowDown } from 'lucide-react';

interface ScaleDifferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  itemName: string;
  weightBefore: number;
}

const ScaleDifferenceModal: React.FC<ScaleDifferenceModalProps> = ({ isOpen, onClose, onConfirm, itemName, weightBefore }) => {
  const [weightAfter, setWeightAfter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWeightAfter('');
      setError('');
    }
  }, [isOpen]);
  
  const calculatedWeight = useMemo(() => {
    const weightNum = parseInt(weightAfter, 10);
    if (!isNaN(weightNum) && weightNum >= 0 && weightNum < weightBefore) {
        return weightBefore - weightNum;
    }
    return null;
  }, [weightAfter, weightBefore]);


  const handleConfirm = () => {
    const weightNum = parseInt(weightAfter, 10);
    if (isNaN(weightNum) || weightNum < 0) {
      setError('有効な重量を入力してください。');
      return;
    }
    if (weightNum % 10 !== 0) {
        setError('重量は10kg単位で入力してください。');
        return;
    }
    if (weightNum >= weightBefore) {
      setError('荷降ろし後の重量は、荷降ろし前の重量より小さくする必要があります。');
      return;
    }

    const finalWeight = weightBefore - weightNum;
    if (finalWeight <= 0) {
      setError('品目重量が0以下になります。重量を確認してください。');
      return;
    }

    setError('');
    onConfirm(finalWeight);
    onClose();
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`「${itemName}」の差分計量`}>
      <div className="space-y-4">
        <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">荷降ろし前の車両重量</p>
            <p className="text-2xl font-bold">{weightBefore.toLocaleString()} kg</p>
        </div>
        
        <div className="flex justify-center">
            <ArrowDown className="text-slate-400" size={24}/>
        </div>

        <NumberInput
          id="weightAfter"
          label="荷降ろし後の車両重量"
          value={weightAfter}
          onChange={(e) => setWeightAfter(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例: 2300"
          unit="kg"
          required
          autoFocus
        />

        {calculatedWeight !== null && (
            <div className="bg-blue-50 dark:bg-blue-900/50 border-l-4 border-blue-500 dark:border-blue-400 p-3 rounded-r-lg text-center">
                <p className="text-sm text-blue-700 dark:text-blue-300">計算された品目重量</p>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{calculatedWeight.toLocaleString()} kg</p>
            </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="flex justify-end space-x-2 mt-6">
        <Button variant="secondary" onClick={onClose}>キャンセル</Button>
        <Button onClick={handleConfirm} disabled={!weightAfter}>確定</Button>
      </div>
    </Modal>
  );
};

export default ScaleDifferenceModal;