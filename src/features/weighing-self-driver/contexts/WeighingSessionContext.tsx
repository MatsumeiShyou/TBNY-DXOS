/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useCallback } from 'react';
import type { WeighingItem } from '../types';

type FlowType = 'default' | 'simple' | null;

interface WeighingSessionContextType {
  currentStep: number;
  grossWeight: number | null;
  tareWeight: number | null;
  items: WeighingItem[];
  isExpressMode: boolean;
  flowType: FlowType;
  maxSteps: number;
  customerAsLocation: { id: string; name: string } | null;
  customerChoiceMade: boolean;
  setCustomerChoiceMade: (made: boolean) => void;
  setCustomerAsLocation: (customer: { id: string; name: string } | null) => void;
  setIsExpressMode: (isExpress: boolean) => void;
  setFlowType: (type: FlowType) => void;
  setMaxSteps: (steps: number) => void;
  setGrossWeight: (weight: number) => void;
  setTareWeight: (weight: number | null) => void;
  addItem: (item: WeighingItem) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, item: WeighingItem) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetSession: () => void;
}

const WeighingSessionContext = createContext<WeighingSessionContextType | undefined>(undefined);

export const WeighingSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [grossWeight, setGrossWeight] = useState<number | null>(null);
  const [tareWeight, setTareWeight] = useState<number | null>(null);
  const [items, setItems] = useState<WeighingItem[]>([]);
  const [isExpressMode, setIsExpressMode] = useState(false);
  const [flowType, setFlowType] = useState<FlowType>(null);
  const [maxSteps, setMaxSteps] = useState(5); // Default to longest flow steps
  const [customerAsLocation, setCustomerAsLocation] = useState<{ id: string; name: string } | null>(null);
  const [customerChoiceMade, setCustomerChoiceMade] = useState(false);


  const addItem = (item: WeighingItem) => {
    setItems(prevItems => [...prevItems, item]);
  };

  const removeItem = (index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, updatedItem: WeighingItem) => {
    setItems(prevItems => {
        const newItems = [...prevItems];
        newItems[index] = updatedItem;
        return newItems;
    });
  };

  const resetFlowStateAfterGross = useCallback(() => {
    setTareWeight(null);
    setItems([]);
    setFlowType(null);
    setCustomerAsLocation(null);
    setCustomerChoiceMade(false);
  }, []);

  const nextStep = useCallback(() => setCurrentStep(prev => prev + 1), []);
  
  const prevStep = useCallback(() => {
    setCurrentStep(prev => {
        const newStep = prev > 1 ? prev - 1 : 1;
        if (newStep === 1) {
            resetFlowStateAfterGross();
        }
        return newStep;
    });
  }, [resetFlowStateAfterGross]);
  
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= maxSteps) {
      if (step === 1) {
          resetFlowStateAfterGross();
      }
      setCurrentStep(step);
    }
  }, [maxSteps, resetFlowStateAfterGross]);


  const resetSession = useCallback(() => {
    setCurrentStep(1);
    setGrossWeight(null);
    setTareWeight(null);
    setItems([]);
    setIsExpressMode(false);
    setFlowType(null);
    setMaxSteps(5);
    setCustomerAsLocation(null);
    setCustomerChoiceMade(false);
  }, []);

  return (
    <WeighingSessionContext.Provider value={{
      currentStep,
      grossWeight,
      tareWeight,
      items,
      isExpressMode,
      flowType,
      maxSteps,
      customerAsLocation,
      customerChoiceMade,
      setCustomerChoiceMade,
      setCustomerAsLocation,
      setIsExpressMode,
      setFlowType,
      setMaxSteps,
      setGrossWeight,
      setTareWeight: setTareWeight as (weight: number | null) => void,
      addItem,
      removeItem,
      updateItem,
      nextStep,
      prevStep,
      goToStep,
      resetSession
    }}>
      {children}
    </WeighingSessionContext.Provider>
  );
};

export const useWeighingSession = () => {
  const context = useContext(WeighingSessionContext);
  if (context === undefined) {
    throw new Error('useWeighingSession must be used within a WeighingSessionProvider');
  }
  return context;
};
