/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import NumberInput from './NumberInput';
import Button from './Button';

interface WeighingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (weight: number) => void;
  title: string;
  label: string;
  initialValue?: number;
  step?: number;
}

const WeighingModal: React.FC<WeighingModalProps> = ({ isOpen, onClose, onConfirm, title, label, initialValue, step = 1 }) => {
  const [weight, setWeight] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // モーダルが開いた時に値をリセット or 初期値を設定
    if (isOpen) {
      setWeight(initialValue?.toString() || '');
      setError('');
    }
  }, [isOpen, initialValue]);

  const handleConfirm = () => {
    const weightNum = parseInt(weight, 10);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('有効な重量を入力してください。');
      return;
    }
    if (step > 1 && weightNum % step !== 0) {
        setError(`重量は${step}kg単位で入力してください。`);
        return;
    }
    setError('');
    onConfirm(weightNum);
    onClose();
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="tw-space-y-4">
        <NumberInput
          id="weighingValue"
          label={label}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例: 3500"
          unit="kg"
          step={step > 1 ? step : 10}
          required
          autoFocus
        />
        {error && <p className="tw-text-red-500 tw-text-sm">{error}</p>}
      </div>
      <div className="tw-flex tw-justify-end tw-space-x-2 tw-mt-6">
        <Button variant="secondary" onClick={onClose}>キャンセル</Button>
        <Button onClick={handleConfirm} disabled={!weight}>確定</Button>
      </div>
    </Modal>
  );
};

export default WeighingModal;