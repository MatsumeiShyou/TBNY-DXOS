
import React, { useState, useMemo } from 'react';
import type { Stop, User } from '../types';
import { StopStatus } from '../types';
import { Card, Button, StatusBadge, Modal } from '../components/Widgets';
import { HelpTarget } from '../components/Help';

interface Props {
  stops: Stop[];
  user: User;
  workStartTime: Date | null;
  reportComment: string;
  onCommentChange: (comment: string) => void;
  onEditStop: (stopId: string) => void;
}

export const ReportPage: React.FC<Props> = ({ stops, user, workStartTime, reportComment, onCommentChange, onEditStop }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'list'>('summary');
  const [isSubmitModalOpen, setSubmitModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isInstructionModalOpen, setInstructionModalOpen] = useState(true);
  const [checks, setChecks] = useState({ summary: false, list: false });

  const isReadyToSubmit = checks.summary && checks.list;

  const stats = useMemo(() => {
    const completed = stops.filter(s => s.status === StopStatus.COMPLETED);
    const totalStops = stops.length;
    const totalWeight = completed.reduce((sum, stop) => {
      return sum + stop.items.reduce((iSum, item) => iSum + (item.actualWeight || item.defaultWeight || 0), 0);
    }, 0);
    const itemBreakdown: Record<string, number> = {};
    completed.forEach(stop => {
      stop.items.forEach(item => {
        const weight = item.actualWeight || item.defaultWeight || 0;
        itemBreakdown[item.name] = (itemBreakdown[item.name] || 0) + weight;
      });
    });
    const sortedBreakdown = Object.entries(itemBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([name, weight]) => ({ name, weight }));
    const now = new Date();
    const startTime = workStartTime || new Date(now.setHours(8, 0, 0));
    const durationMs = new Date().getTime() - startTime.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return {
      completedCount: completed.length,
      progress: Math.round((completed.length / totalStops) * 100),
      totalWeight,
      sortedBreakdown,
      workDuration: `${hours}時間 ${minutes}分`
    };
  }, [stops, workStartTime]);

  const handleSubmit = () => {
    setIsSubmitted(true);
    setSubmitModalOpen(false);
  };

  const handleLogout = () => {
    window.location.reload();
  };

  if (isSubmitted) {
    return (
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-p-8 tw-animate-fade-in tw-text-center tw-space-y-6">
        <div className="tw-w-32 tw-h-32 tw-bg-green-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-animate-bounce">
          <i className="fa-solid fa-check tw-text-6xl tw-text-success"></i>
        </div>
        <div>
          <h2 className="tw-text-2xl tw-font-bold tw-text-slate-800">日報送信完了</h2>
          <p className="tw-text-slate-500 tw-mt-2">本日の業務は全て終了です。<br/>お疲れ様でした！</p>
        </div>
        <div className="tw-w-full tw-pt-8 tw-space-y-4">
           <Button variant="outline" onClick={handleLogout}>
             業務を終了してログアウト
           </Button>
           <p className="tw-text-xs tw-text-slate-400 tw-mt-4">
             アプリを閉じる場合は、そのままホーム画面に戻るか、<br/>ブラウザのタブを閉じてください。
           </p>
        </div>
      </div>
    );
  }

  const renderSummaryTab = () => (
    <div className="tw-space-y-4 tw-animate-fade-in tw-pb-32">
      <div className="tw-grid tw-grid-cols-2 tw-gap-3">
          <div className="tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-sm tw-border tw-border-slate-100">
            <div className="tw-text-xs tw-text-slate-400 tw-font-bold tw-mb-1">総回収重量</div>
            <div className="tw-text-2xl tw-font-bold tw-text-primary tw-flex tw-items-baseline">
              {stats.totalWeight.toLocaleString()} <span className="tw-text-sm tw-ml-1 tw-text-slate-500">kg</span>
            </div>
          </div>
          <div className="tw-bg-white tw-p-4 tw-rounded-xl tw-shadow-sm tw-border tw-border-slate-100">
            <div className="tw-text-xs tw-text-slate-400 tw-font-bold tw-mb-1">進捗率</div>
            <div className="tw-text-2xl tw-font-bold tw-text-slate-800 tw-flex tw-items-baseline">
              {stats.progress}<span className="tw-text-sm tw-ml-1">%</span>
              <span className="tw-text-xs tw-ml-2 tw-text-slate-400">({stats.completedCount}件)</span>
            </div>
          </div>
      </div>

      <Card className="tw-space-y-4">
        <h3 className="tw-font-bold tw-text-slate-700 tw-flex tw-items-center">
          <i className="fa-solid fa-chart-simple tw-mr-2 tw-text-primary"></i>
          品目別回収実績
        </h3>
        <div className="tw-space-y-3">
          {stats.sortedBreakdown.length > 0 ? (
            stats.sortedBreakdown.map((item, idx) => {
              const maxVal = stats.sortedBreakdown[0].weight;
              const percentage = (item.weight / maxVal) * 100;
              return (
                <div key={idx}>
                  <div className="tw-flex tw-justify-between tw-text-sm tw-mb-1">
                    <span className="tw-font-bold tw-text-slate-700">{item.name}</span>
                    <span className="tw-font-mono tw-text-slate-500">{item.weight} kg</span>
                  </div>
                  <div className="tw-w-full tw-bg-slate-100 tw-rounded-full tw-h-2.5 tw-overflow-hidden">
                    <div className="tw-bg-primary tw-h-2.5 tw-rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="tw-text-center tw-text-slate-400 tw-py-4 tw-text-sm">データがありません</div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="tw-font-bold tw-text-slate-700 tw-mb-2">日報コメント・特記事項</h3>
        <textarea
          className="tw-w-full tw-bg-slate-50 tw-border tw-border-slate-200 tw-rounded-lg tw-p-3 tw-text-sm focus:tw-ring-2 focus:tw-ring-primary focus:tw-outline-none"
          rows={4}
          placeholder="道路状況、車両の気になる点、お客様からの要望などを入力してください。"
          value={reportComment}
          onChange={(e) => onCommentChange(e.target.value)}
        ></textarea>
      </Card>

      <HelpTarget helpId="check-summary">
        <Card 
          className={`tw-transition-colors tw-border-2 ${checks.summary ? 'tw-bg-primary/5 tw-border-primary' : 'tw-bg-red-50 tw-border-red-200 tw-animate-pulse'}`}
          onClick={() => setChecks(prev => ({...prev, summary: !prev.summary}))}
        >
           <label className="tw-flex tw-items-center tw-space-x-3 tw-cursor-pointer tw-p-1 tw-w-full tw-pointer-events-none">
              <div className={`tw-w-6 tw-h-6 tw-shrink-0 tw-rounded tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-colors ${checks.summary ? 'tw-bg-primary tw-border-primary' : 'tw-border-red-300 tw-bg-white'}`}>
                 {checks.summary && <i className="fa-solid fa-check tw-text-white tw-text-xs"></i>}
              </div>
              <div>
                 <span className={`tw-block tw-text-sm tw-font-bold ${checks.summary ? 'tw-text-primary' : 'tw-text-slate-800'}`}>集計値を確認しました</span>
                 <span className="tw-text-xs tw-text-slate-500">実績数値に間違いはありません</span>
              </div>
           </label>
        </Card>
      </HelpTarget>
    </div>
  );

  const renderListTab = () => (
    <div className="tw-space-y-3 tw-animate-fade-in tw-pb-32">
      <div className="tw-flex tw-text-xs tw-font-bold tw-text-slate-400 tw-px-3">
          <div className="tw-w-16">時間</div>
          <div className="tw-flex-1">回収先 / 品目</div>
          <div className="tw-w-20 tw-text-right">実績</div>
      </div>
      {stops.length === 0 ? (
         <div className="tw-text-center tw-py-8 tw-text-slate-400 tw-text-sm">データがありません</div>
      ) : (
        stops.map((stop) => {
          const isCompleted = stop.status === StopStatus.COMPLETED;
          return (
              <Card key={stop.id} className={`tw-p-3 tw-border-l-4 ${isCompleted ? 'tw-border-l-primary' : 'tw-border-l-slate-200 tw-opacity-60'}`}>
                  <div className="tw-flex tw-items-start">
                      <div className="tw-w-16 tw-pt-0.5 tw-shrink-0">
                          <div className="tw-text-sm tw-font-bold tw-text-slate-700 tw-font-mono">{stop.arrivalTime || '--:--'}</div>
                          <div className="tw-text-[10px] tw-text-slate-400 tw-font-mono">{stop.departureTime ? `~${stop.departureTime}` : ''}</div>
                          {!isCompleted && <span className="tw-text-[10px] tw-bg-slate-100 tw-text-slate-400 tw-px-1 tw-rounded">未完了</span>}
                      </div>
                      <div className="tw-flex-1 tw-min-w-0">
                          <div className="tw-text-sm tw-font-bold tw-text-slate-800 tw-truncate tw-mb-1.5 tw-leading-tight">{stop.customerName}</div>
                          <div className="tw-space-y-1">
                              {stop.items.map(item => (
                                  <div key={item.id} className="tw-flex tw-justify-between tw-items-center tw-text-xs tw-border-b tw-border-dashed tw-border-slate-100 last:tw-border-0 tw-pb-1 last:tw-pb-0">
                                      <span className="tw-text-slate-600 tw-truncate tw-mr-2">{item.name}</span>
                                      <span className={`tw-font-mono tw-font-bold ${item.isCollected ? 'tw-text-slate-800' : 'tw-text-slate-300'}`}>
                                          {item.isCollected ? `${item.actualWeight}kg` : '-'}
                                      </span>
                                  </div>
                              ))}
                          </div>
                          <div className="tw-mt-3 tw-flex tw-justify-end tw-border-t tw-border-dashed tw-border-slate-100 tw-pt-2">
                             <button onClick={() => onEditStop(stop.id)} className="tw-text-xs tw-bg-slate-100 tw-text-slate-600 hover:tw-bg-slate-200 tw-border tw-border-slate-200 tw-px-3 tw-py-1.5 tw-rounded tw-font-bold tw-transition-colors tw-flex tw-items-center">
                               <i className="fa-solid fa-pen tw-mr-1.5"></i>修正
                             </button>
                          </div>
                      </div>
                  </div>
              </Card>
          )
        })
      )}
      <div className="tw-mt-6">
          <h4 className="tw-text-xs tw-font-bold tw-text-slate-500 tw-mb-2 tw-px-2">その他業務記録</h4>
          <Card className="tw-p-0 tw-overflow-hidden">
             <div className="tw-flex tw-justify-between tw-items-center tw-p-3 tw-border-b tw-border-slate-100">
                <div className="tw-flex tw-items-center tw-space-x-3">
                   <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-orange-100 tw-text-orange-600 tw-flex tw-items-center tw-justify-center">
                     <i className="fa-solid fa-mug-hot tw-text-xs"></i>
                   </div>
                   <span className="tw-text-sm tw-font-bold tw-text-slate-700">休憩</span>
                </div>
                <div className="tw-text-sm tw-font-mono tw-font-bold tw-text-slate-600">12:00 ~ 13:00 <span className="tw-text-xs tw-text-slate-400">(60分)</span></div>
             </div>
             <div className="tw-flex tw-justify-between tw-items-center tw-p-3">
                <div className="tw-flex tw-items-center tw-space-x-3">
                   <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-red-100 tw-text-red-600 tw-flex tw-items-center tw-justify-center">
                     <i className="fa-solid fa-gas-pump tw-text-xs"></i>
                   </div>
                   <span className="tw-text-sm tw-font-bold tw-text-slate-700">給油</span>
                </div>
                <div className="tw-text-sm tw-font-mono tw-font-bold tw-text-slate-600">-- <span className="tw-text-xs tw-text-slate-400">L</span></div>
             </div>
          </Card>
      </div>
      <HelpTarget helpId="check-list">
        <Card 
          className={`tw-mt-6 tw-transition-colors tw-border-2 ${checks.list ? 'tw-bg-primary/5 tw-border-primary' : 'tw-bg-red-50 tw-border-red-200 tw-animate-pulse'}`}
          onClick={() => setChecks(prev => ({...prev, list: !prev.list}))}
        >
           <label className="tw-flex tw-items-center tw-space-x-3 tw-cursor-pointer tw-p-1 tw-w-full tw-pointer-events-none">
              <div className={`tw-w-6 tw-h-6 tw-shrink-0 tw-rounded tw-border-2 tw-flex tw-items-center tw-justify-center tw-transition-colors ${checks.list ? 'tw-bg-primary border-primary' : 'tw-border-red-300 tw-bg-white'}`}>
                 {checks.list && <i className="fa-solid fa-check tw-text-white tw-text-xs"></i>}
              </div>
              <div>
                 <span className={`tw-block tw-text-sm tw-font-bold ${checks.list ? 'tw-text-primary' : 'tw-text-slate-800'}`}>明細内容を確認しました</span>
                 <span className="tw-text-xs tw-text-slate-500">アプリ入力漏れ・訪問忘れはありません</span>
              </div>
           </label>
        </Card>
      </HelpTarget>
    </div>
  );

  const renderTabBadge = (isChecked: boolean) => {
    if (isChecked) return <i className="fa-solid fa-check tw-text-green-500 tw-ml-1"></i>;
    return <span className="tw-ml-1 tw-w-2 tw-h-2 tw-rounded-full tw-bg-red-500 tw-inline-block tw-animate-pulse"></span>;
  };

  return (
    <div className="tw-p-4 tw-space-y-6">
      <div className="tw-flex tw-items-center tw-justify-between tw-text-sm tw-text-slate-500 tw-bg-white tw-p-3 tw-rounded-xl tw-border tw-border-slate-100 tw-shadow-sm">
        <div className="tw-flex tw-items-center tw-space-x-2">
           <i className="fa-regular fa-calendar"></i>
           <span className="tw-font-bold">{new Date().toLocaleDateString('ja-JP')}</span>
        </div>
        <div className="tw-flex tw-items-center tw-space-x-2">
           <i className="fa-solid fa-truck"></i>
           <span className="tw-font-bold">{user.vehicleName}</span>
        </div>
      </div>
      <div className="tw-bg-slate-200 tw-p-1 tw-rounded-xl tw-flex tw-shadow-inner">
        <button onClick={() => setActiveTab('summary')} className={`tw-flex-1 tw-py-2 tw-rounded-lg tw-text-xs tw-font-bold tw-transition-all tw-relative ${activeTab === 'summary' ? 'tw-bg-white tw-text-primary tw-shadow-sm' : 'tw-text-slate-500 hover:tw-text-slate-700'}`}>
          <i className="fa-solid fa-chart-pie tw-mr-1"></i>サマリ{renderTabBadge(checks.summary)}
        </button>
        <button onClick={() => setActiveTab('list')} className={`tw-flex-1 tw-py-2 tw-rounded-lg tw-text-xs tw-font-bold tw-transition-all tw-relative ${activeTab === 'list' ? 'tw-bg-white tw-text-primary tw-shadow-sm' : 'tw-text-slate-500 hover:tw-text-slate-700'}`}>
          <i className="fa-solid fa-list tw-mr-1"></i>明細{renderTabBadge(checks.list)}
        </button>
      </div>
      <div className="tw-min-h-[300px]">
         {activeTab === 'summary' && renderSummaryTab()}
         {activeTab === 'list' && renderListTab()}
      </div>
      {isReadyToSubmit && (
        <div className="tw-fixed tw-bottom-0 tw-left-0 tw-w-full tw-bg-white tw-border-t tw-border-slate-200 tw-p-4 tw-pb-safe tw-shadow-[0_-4px_20px_rgba(0,0,0,0.15)] tw-z-40 tw-rounded-t-2xl tw-animate-slide-up">
           <Button onClick={() => setSubmitModalOpen(true)} className="tw-bg-primary tw-text-white tw-shadow-lg tw-shadow-blue-900/20">
             <i className="fa-solid fa-paper-plane tw-mr-2"></i>日報を提出する
           </Button>
        </div>
      )}
      <Modal isOpen={isInstructionModalOpen} onClose={() => setInstructionModalOpen(false)} title="日報提出の手順">
        <div className="tw-space-y-6 tw-text-center">
           <div className="tw-w-16 tw-h-16 tw-bg-blue-50 tw-text-blue-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto">
              <i className="fa-solid fa-list-check tw-text-3xl"></i>
           </div>
           <div className="tw-text-left tw-bg-slate-50 tw-p-4 tw-rounded-xl tw-border tw-border-slate-200">
              <h4 className="tw-font-bold tw-text-slate-700 tw-mb-2">提出ボタンが表示されていませんか？</h4>
              <p className="tw-text-sm tw-text-slate-600 tw-leading-relaxed">誤送信防止のため、以下の2点を確認してチェックを入れると提出ボタンが現れます。</p>
              <ul className="tw-text-sm tw-text-slate-600 tw-mt-2 tw-space-y-1 tw-font-bold">
                <li><i className="fa-regular fa-square-check tw-mr-2 tw-text-primary"></i>サマリタブの集計値</li>
                <li><i className="fa-regular fa-square-check tw-mr-2 tw-text-primary"></i>明細タブの入力漏れ</li>
              </ul>
           </div>
           <Button onClick={() => setInstructionModalOpen(false)}>確認しました</Button>
        </div>
      </Modal>
      <Modal isOpen={isSubmitModalOpen} onClose={() => setSubmitModalOpen(false)} title="日報提出の確認">
        <div className="tw-space-y-4">
           <div className="tw-bg-blue-50 tw-p-4 tw-rounded-xl tw-border tw-border-blue-100 tw-flex tw-items-start tw-space-x-3 tw-text-blue-900">
              <i className="fa-solid fa-circle-info tw-mt-1 tw-text-lg"></i>
              <div className="tw-text-sm tw-leading-relaxed">
                 <p className="tw-font-bold tw-mb-1">本日の業務を完了します。</p>
                 <p>提出後はデータの修正ができません。内容に間違いがないか最終確認をお願いします。</p>
              </div>
           </div>
           <div className="tw-flex tw-space-x-3">
             <Button variant="secondary" onClick={() => setSubmitModalOpen(false)}>キャンセル</Button>
             <Button onClick={handleSubmit}>提出して終了</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};
