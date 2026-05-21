
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { submitWeighingRecord as submitToApi } from '../services/gasApi';
import { addRequestToQueue, getQueuedRequests, removeRequestFromQueue } from '../services/db';
import useOnlineStatus from '../hooks/useOnlineStatus';
import { useWeighingSession } from './WeighingSessionContext';
import { useToast } from './ToastContext';
import type { WeighingRecordPayload } from '../types';


interface OfflineQueueContextType {
  submitRecord: (data: Omit<WeighingRecordPayload, 'recordId' | 'netWeight' | 'weighedAt'>) => Promise<void>;
  isSubmitting: boolean;
  queueLength: number;
}

const OfflineQueueContext = createContext<OfflineQueueContextType | undefined>(undefined);

export const OfflineQueueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  const isOnline = useOnlineStatus();
  const { resetSession } = useWeighingSession();
  const { addToast } = useToast();

  const processQueue = useCallback(async () => {
    if (!isOnline) return;

    const queuedRequests = await getQueuedRequests();
    if (queuedRequests.length === 0) return;

    addToast(`オンラインに復帰しました。${queuedRequests.length}件の未送信データを送信します。`, 'info');

    for (const req of queuedRequests) {
      try {
        await submitToApi(req.payload);
        await removeRequestFromQueue(req.id);
      } catch (error) {
        console.error('Failed to submit queued request:', error);
        addToast(`記録 (ID: ${req.id.substring(0,6)}) の送信に失敗しました。`, 'error');
        // Stop processing on failure to maintain order
        break; 
      }
    }
    const remaining = await getQueuedRequests();
    if (remaining.length === 0) {
      addToast('すべてのデータが送信されました。', 'success');
    }
    setQueueLength(remaining.length);
  }, [isOnline, addToast]);

  useEffect(() => {
    processQueue();
    const updateQueueLength = async () => {
        const requests = await getQueuedRequests();
        setQueueLength(requests.length);
    };
    updateQueueLength();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const submitRecord = async (data: Omit<WeighingRecordPayload, 'recordId' | 'netWeight' | 'weighedAt'>) => {
    setIsSubmitting(true);
    
    const netWeight = data.grossWeight - data.tareWeight;
    const payload: WeighingRecordPayload = {
      ...data,
      recordId: self.crypto.randomUUID(),
      netWeight,
      weighedAt: new Date().toISOString()
    };
    
    if (isOnline) {
      try {
        await submitToApi(payload);
        addToast('記録を送信しました。', 'success');
        resetSession();
      } catch (error) {
        console.error('Submission failed, adding to queue:', error);
        await addRequestToQueue(payload);
        setQueueLength(prev => prev + 1);
        addToast('送信に失敗しました。オフラインキューに保存しました。', 'error');
        resetSession();
      }
    } else {
      await addRequestToQueue(payload);
      setQueueLength(prev => prev + 1);
      addToast('オフラインです。記録を保存しました。オンライン時に自動送信します。', 'info');
      resetSession();
    }
    setIsSubmitting(false);
  };

  return (
    <OfflineQueueContext.Provider value={{ submitRecord, isSubmitting, queueLength }}>
      {children}
    </OfflineQueueContext.Provider>
  );
};

export const useOfflineQueue = () => {
  const context = useContext(OfflineQueueContext);
  if (context === undefined) {
    throw new Error('useOfflineQueue must be used within an OfflineQueueProvider');
  }
  return context;
};
