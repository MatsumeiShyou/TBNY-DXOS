

import React from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import { useSettings } from '../../contexts/SettingsContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import HelpTooltip from '../ui/HelpTooltip';
import { ArrowLeft, ListPlus, Truck } from 'lucide-react';

const SelectionStep: React.FC = () => {
  const { nextStep, setFlowType, setMaxSteps, setCustomerChoiceMade, setCustomerAsLocation, maxSteps } = useWeighingSession();
  const { isPulseEffectEnabled } = useSettings();

  const handleSelectDefault = () => {
    setFlowType('default');
    setMaxSteps(5); // Start, Selection, Items, Tare, Confirm
    nextStep();
  };

  const handleSelectSimple = () => {
    setFlowType('simple');
    setMaxSteps(4); // Start, Selection, Tare, Confirm
    nextStep();
  };

  const handleGoBack = () => {
    // Reset the choice flag to go back to CustomerSelectionStep
    setCustomerChoiceMade(false);
    // Also reset the state set by the "Own Goods" choice to prevent bugs
    setCustomerAsLocation(null);
    setFlowType(null);
    setMaxSteps(5); // Reset max steps to the potential maximum
  };

  const backButtonText = '記録の種類選択に戻る';

  return (
    <Card>
      <div className="tw-flex tw-justify-between tw-items-start tw-mb-6">
        <div>
          <h2 className="tw-text-xl tw-font-bold tw-mb-1">ステップ 2/{maxSteps}</h2>
          <p className="tw-text-2xl tw-font-bold tw-text-slate-700 dark:text-slate-300">記録方法を選択してください</p>
        </div>
        <HelpTooltip title="記録方法の選択">
          <div className="tw-space-y-4 tw-text-slate-600 dark:text-slate-300 tw-leading-relaxed">
            <h4 className="tw-font-bold tw-text-slate-800 dark:text-slate-200">どちらを選べばいい？</h4>
            <div className="tw-mt-2 tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
              <h5 className="tw-font-semibold tw-text-blue-600 dark:text-blue-400">「品目を個別に追加する」を選ぶ場合</h5>
              <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">荷台に複数の品目（例: 段ボールと新聞）が混在している場合や、複数の回収先の荷物が含まれている場合に選択します。</p>
            </div>
            <div className="tw-mt-2 tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
              <h5 className="tw-font-semibold tw-text-blue-600 dark:text-blue-400">「まとめて最終計量へ」を選ぶ場合</h5>
              <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">荷台の品物が1種類だけで、すべてまとめて降ろす場合に選択します。入力ステップが少なく、素早く記録を完了できます。</p>
            </div>
          </div>
        </HelpTooltip>
      </div>

      <div className="tw-text-center tw-space-y-4">
        <p className="tw-text-slate-600 dark:text-slate-300 tw-mb-8">複数の品目や回収先を個別に記録しますか？</p>
        
        <div className="tw-space-y-4">
          <Button onClick={handleSelectDefault} size="lg" fullWidth variant="primary" className={isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}>
            <ListPlus className="tw-mr-3 tw-h-6 tw-w-6" />
            はい、品目を個別に追加する
          </Button>
          <Button onClick={handleSelectSimple} size="lg" fullWidth variant="secondary" className={isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}>
            <Truck className="tw-mr-3 tw-h-6 tw-w-6" />
            いいえ、まとめて最終計量へ
          </Button>
        </div>
      </div>

      <div className="tw-flex tw-justify-start tw-mt-8">
        <Button onClick={handleGoBack} variant="secondary">
          <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
          {backButtonText}
        </Button>
      </div>
    </Card>
  );
};

export default SelectionStep;
