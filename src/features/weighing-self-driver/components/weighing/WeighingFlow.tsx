import React from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import StartStep from './StartStep';
import ItemsStep from './ItemsStep';
import TareStep from './TareStep';
import ConfirmStep from './ConfirmStep';
import ExpressTareStep from './ExpressTareStep';
import SelectionStep from './SelectionStep';
import CustomerSelectionStep from './CustomerSelectionStep';

const WeighingFlow: React.FC = () => {
  const { currentStep, isExpressMode, flowType, customerChoiceMade } = useWeighingSession();

  const renderStep = () => {
    // Flow 1: Fully automatic express mode
    if (isExpressMode) {
      switch (currentStep) {
        case 1:
          return <StartStep />;
        case 2:
          return <ExpressTareStep />;
        case 3:
          return <ConfirmStep />;
        default:
          return <StartStep />;
      }
    }

    // Step-based flow for all users (unified)
    switch (currentStep) {
      case 1:
        return <StartStep />;
      case 2:
        // All users start by choosing the type of record.
        if (!customerChoiceMade) {
          return <CustomerSelectionStep />;
        }
        // After choosing "Select collection point", they see this selection screen.
        return <SelectionStep />;
      case 3:
        if (flowType === 'simple') {
          return <TareStep />;
        }
        return <ItemsStep />; // default flow
      case 4:
        if (flowType === 'simple') {
          return <ConfirmStep />;
        }
        return <TareStep />; // default flow
      case 5:
        // Only reachable in default flow
        return <ConfirmStep />;
      default:
        return <StartStep />;
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {renderStep()}
      </div>
    </main>
  );
};

export default WeighingFlow;