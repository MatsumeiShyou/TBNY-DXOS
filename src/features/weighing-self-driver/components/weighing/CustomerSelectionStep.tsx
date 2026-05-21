

import React from 'react';
import { useWeighingSession } from '../../contexts/WeighingSessionContext';
import { useWeighingAuth } from '../../contexts/WeighingAuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import HelpTooltip from '../ui/HelpTooltip';
import { ArrowLeft, User, Building } from 'lucide-react';

const CustomerSelectionStep: React.FC = () => {
  const { prevStep, setCustomerAsLocation, setCustomerChoiceMade, maxSteps } = useWeighingSession();
  const { driverName, companyName, userType } = useWeighingAuth();
  const { isPulseEffectEnabled } = useSettings();

  const entityName = userType === 'company' && companyName ? companyName : driverName;
  const ownGoodsButtonLabel = entityName ? `${entityName}の荷物として記録する` : '自社の荷物として記録する';


  const handleSelectOwnGoods = () => {
    if (entityName) {
      // Set the customer's name or company name as the location for this session
      setCustomerAsLocation({ id: 'customer-self', name: entityName });
    }
    // Set the flag to move to the next screen (SelectionStep)
    setCustomerChoiceMade(true);
  };

  const handleSelectCollectionPoint = () => {
    // Just set the flag to move to the next screen (SelectionStep)
    // customerAsLocation remains null
    setCustomerChoiceMade(true);
  };

  return (
    <Card>
      <div className="tw-flex tw-justify-between tw-items-start tw-mb-6">
        <div>
          <h2 className="tw-text-xl tw-font-bold tw-mb-1">ステップ 2/{maxSteps}</h2>
          <p className="tw-text-2xl tw-font-bold tw-text-slate-700 dark:text-slate-300">記録の種類を選択してください</p>
        </div>
        <HelpTooltip title="記録の種類の選択">
          <div className="tw-space-y-4 tw-text-slate-600 dark:text-slate-300 tw-leading-relaxed">
            <h4 className="tw-font-bold tw-text-slate-800 dark:text-slate-200">どちらを選べばいい？</h4>
            <div className="tw-mt-2 tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
              <h5 className="tw-font-semibold tw-text-blue-600 dark:text-blue-400">「自社の荷物として記録」を選ぶ場合</h5>
              <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">持ち込んだ荷物がすべて自分（または自社）のものである場合や、回収先が1箇所のみの場合に選択します。</p>
              <p className="tw-text-xs tw-mt-1 tw-text-slate-500 dark:text-slate-400">例： 鈴木様が、ご自身の段ボールだけを持ち込んだ。</p>
            </div>
            <div className="tw-mt-2 tw-p-3 tw-bg-slate-100 dark:bg-slate-700 tw-rounded-lg tw-border tw-border-slate-200 dark:border-slate-600">
              <h5 className="tw-font-semibold tw-text-blue-600 dark:text-blue-400">「回収先を選んで記録」を選ぶ場合</h5>
              <p className="tw-text-sm tw-text-slate-700 dark:text-slate-200">複数の異なる場所から荷物を回収してきた場合に選択します。荷物ごとに、どの回収先のものかを記録できます。</p>
              <p className="tw-text-xs tw-mt-1 tw-text-slate-500 dark:text-slate-400">例： A商事から新聞を、B新聞社から雑誌を回収した。</p>
            </div>
          </div>
        </HelpTooltip>
      </div>

      <div className="tw-text-center tw-space-y-4">
        <p className="tw-text-slate-600 dark:text-slate-300 tw-mb-8">どなたの荷物を記録しますか？</p>
        
        <div className="tw-space-y-4">
          <Button onClick={handleSelectOwnGoods} size="lg" fullWidth variant="primary" className={isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}>
            <User className="tw-mr-3 tw-h-6 tw-w-6" />
            {ownGoodsButtonLabel}
          </Button>
          <Button onClick={handleSelectCollectionPoint} size="lg" fullWidth variant="secondary" className={isPulseEffectEnabled ? 'tw-highlight-navigation' : ''}>
            <Building className="tw-mr-3 tw-h-6 tw-w-6" />
            回収先を選んで記録する
          </Button>
        </div>
      </div>

      <div className="tw-flex tw-justify-start tw-mt-8">
        <Button onClick={prevStep} variant="secondary">
          <ArrowLeft className="tw-mr-2 tw-h-4 tw-w-4" />
          総重量計量に戻る
        </Button>
      </div>
    </Card>
  );
};

export default CustomerSelectionStep;
