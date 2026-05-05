
import React, { useState, useMemo } from 'react';
import type { Stop, User } from '../types';
import { StopStatus } from '../types';
import { Card, Button, Modal } from '../components/Widgets';
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
      <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in text-center space-y-6">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
          <i className="fa-solid fa-check text-6xl text-success"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">日報送信完了</h2>
          <p className="text-slate-500 mt-2">本日の業務は全て終了です。<br/>お疲れ様でした！</p>
        </div>
        <div className="w-full pt-8 space-y-4">
           <Button variant="outline" onClick={handleLogout} agentId="action:logout-button">
             業務を終了してログアウト
           </Button>
           <p className="text-xs text-slate-400 mt-4">
             アプリを閉じる場合は、そのままホーム画面に戻るか、<br/>ブラウザのタブを閉じてください。
           </p>
        </div>
      </div>
    );
  }

  const renderSummaryTab = () => (
    <div className="space-y-4 animate-fade-in pb-32">
      <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="text-xs text-slate-400 font-bold mb-1">総回収重量</div>
            <div className="text-2xl font-bold text-primary flex items-baseline">
              {stats.totalWeight.toLocaleString()} <span className="text-sm ml-1 text-slate-500">kg</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="text-xs text-slate-400 font-bold mb-1">進捗率</div>
            <div className="text-2xl font-bold text-slate-800 flex items-baseline">
              {stats.progress}<span className="text-sm ml-1">%</span>
              <span className="text-xs ml-2 text-slate-400">({stats.completedCount}件)</span>
            </div>
          </div>
      </div>

      <Card className="space-y-4" agentId="breakdown-card">
        <h3 className="font-bold text-slate-700 flex items-center">
          <i className="fa-solid fa-chart-simple mr-2 text-primary"></i>
          品目別回収実績
        </h3>
        <div className="space-y-3">
          {stats.sortedBreakdown.length > 0 ? (
            stats.sortedBreakdown.map((item, idx) => {
              const maxVal = stats.sortedBreakdown[0].weight;
              const percentage = (item.weight / maxVal) * 100;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className="font-mono text-slate-500">{item.weight} kg</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-slate-400 py-4 text-sm">データがありません</div>
          )}
        </div>
      </Card>

      <Card agentId="comment-card">
        <h3 className="font-bold text-slate-700 mb-2">日報コメント・特記事項</h3>
        <textarea
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          rows={4}
          placeholder="道路状況、車両の気になる点、お客様からの要望などを入力してください。"
          value={reportComment}
          onChange={(e) => onCommentChange(e.target.value)}
        ></textarea>
      </Card>

      <HelpTarget helpId="check-summary">
        <Card 
          className={`transition-colors border-2 ${checks.summary ? 'bg-primary/5 border-primary' : 'bg-red-50 border-red-200 animate-pulse'}`}
          onClick={() => setChecks(prev => ({...prev, summary: !prev.summary}))}
          agentId="check:summary-card"
        >
           <label className="flex items-center space-x-3 cursor-pointer p-1 w-full pointer-events-none">
              <div className={`w-6 h-6 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${checks.summary ? 'bg-primary border-primary' : 'border-red-300 bg-white'}`}>
                 {checks.summary && <i className="fa-solid fa-check text-white text-xs"></i>}
              </div>
              <div>
                 <span className={`block text-sm font-bold ${checks.summary ? 'text-primary' : 'text-slate-800'}`}>集計値を確認しました</span>
                 <span className="text-xs text-slate-500">実績数値に間違いはありません</span>
              </div>
           </label>
        </Card>
      </HelpTarget>
    </div>
  );

  const renderListTab = () => (
    <div className="space-y-3 animate-fade-in pb-32">
      <div className="flex text-xs font-bold text-slate-400 px-3">
          <div className="w-16">時間</div>
          <div className="flex-1">回収先 / 品目</div>
          <div className="w-20 text-right">実績</div>
      </div>
      {stops.length === 0 ? (
         <div className="text-center py-8 text-slate-400 text-sm">データがありません</div>
      ) : (
        stops.map((stop) => {
          const isCompleted = stop.status === StopStatus.COMPLETED;
          return (
              <Card key={stop.id} className={`p-3 border-l-4 ${isCompleted ? 'border-l-primary' : 'border-l-slate-200 opacity-60'}`} agentId={`stop-card:${stop.id}`}>
                  <div className="flex items-start">
                      <div className="w-16 pt-0.5 shrink-0">
                          <div className="text-sm font-bold text-slate-700 font-mono">{stop.arrivalTime || '--:--'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{stop.departureTime ? `~${stop.departureTime}` : ''}</div>
                          {!isCompleted && <span className="text-[10px] bg-slate-100 text-slate-400 px-1 rounded">未完了</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-800 truncate mb-1.5 leading-tight">{stop.customerName}</div>
                          <div className="space-y-1">
                              {stop.items.map(item => (
                                  <div key={item.id} className="flex justify-between items-center text-xs border-b border-dashed border-slate-100 last:border-0 pb-1 last:pb-0">
                                      <span className="text-slate-600 truncate mr-2">{item.name}</span>
                                      <span className={`font-mono font-bold ${item.isCollected ? 'text-slate-800' : 'text-slate-300'}`}>
                                          {item.isCollected ? `${item.actualWeight}kg` : '-'}
                                      </span>
                                  </div>
                              ))}
                          </div>
                          <div className="mt-3 flex justify-end border-t border-dashed border-slate-100 pt-2">
                             <button onClick={() => onEditStop(stop.id)} className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded font-bold transition-colors flex items-center">
                               <i className="fa-solid fa-pen mr-1.5"></i>修正
                             </button>
                          </div>
                      </div>
                  </div>
              </Card>
          )
        })
      )}
      <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-500 mb-2 px-2">その他業務記録</h4>
          <Card className="p-0 overflow-hidden" agentId="other-work-card">
             <div className="flex justify-between items-center p-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                     <i className="fa-solid fa-mug-hot text-xs"></i>
                   </div>
                   <span className="text-sm font-bold text-slate-700">休憩</span>
                </div>
                <div className="text-sm font-mono font-bold text-slate-600">12:00 ~ 13:00 <span className="text-xs text-slate-400">(60分)</span></div>
             </div>
             <div className="flex justify-between items-center p-3">
                <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                     <i className="fa-solid fa-gas-pump text-xs"></i>
                   </div>
                   <span className="text-sm font-bold text-slate-700">給油</span>
                </div>
                <div className="text-sm font-mono font-bold text-slate-600">-- <span className="text-xs text-slate-400">L</span></div>
             </div>
          </Card>
      </div>
      <HelpTarget helpId="check-list">
        <Card 
          className={`mt-6 transition-colors border-2 ${checks.list ? 'bg-primary/5 border-primary' : 'bg-red-50 border-red-200 animate-pulse'}`}
          onClick={() => setChecks(prev => ({...prev, list: !prev.list}))}
          agentId="check:list-card"
        >
           <label className="flex items-center space-x-3 cursor-pointer p-1 w-full pointer-events-none">
              <div className={`w-6 h-6 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${checks.list ? 'bg-primary border-primary' : 'border-red-300 bg-white'}`}>
                 {checks.list && <i className="fa-solid fa-check text-white text-xs"></i>}
              </div>
              <div>
                 <span className={`block text-sm font-bold ${checks.list ? 'text-primary' : 'text-slate-800'}`}>明細内容を確認しました</span>
                 <span className="text-xs text-slate-500">アプリ入力漏れ・訪問忘れはありません</span>
              </div>
           </label>
        </Card>
      </HelpTarget>
    </div>
  );

  const renderTabBadge = (isChecked: boolean) => {
    if (isChecked) return <i className="fa-solid fa-check text-green-500 ml-1"></i>;
    return <span className="ml-1 w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-500 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-2">
           <i className="fa-regular fa-calendar"></i>
           <span className="font-bold">{new Date().toLocaleDateString('ja-JP')}</span>
        </div>
        <div className="flex items-center space-x-2">
           <i className="fa-solid fa-truck"></i>
           <span className="font-bold">{user.vehicleName}</span>
        </div>
      </div>
      <div className="bg-slate-200 p-1 rounded-xl flex shadow-inner">
        <button onClick={() => setActiveTab('summary')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'summary' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <i className="fa-solid fa-chart-pie mr-1"></i>サマリ{renderTabBadge(checks.summary)}
        </button>
        <button onClick={() => setActiveTab('list')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all relative ${activeTab === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <i className="fa-solid fa-list mr-1"></i>明細{renderTabBadge(checks.list)}
        </button>
      </div>
      <div className="min-h-[300px]">
         {activeTab === 'summary' && renderSummaryTab()}
         {activeTab === 'list' && renderListTab()}
      </div>
      {isReadyToSubmit && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-40 rounded-t-2xl animate-slide-up">
           <Button onClick={() => setSubmitModalOpen(true)} className="bg-primary text-white shadow-lg shadow-blue-900/20" agentId="action:submit-button">
             <i className="fa-solid fa-paper-plane mr-2"></i>日報を提出する
           </Button>
        </div>
      )}
      <Modal isOpen={isInstructionModalOpen} onClose={() => setInstructionModalOpen(false)} title="日報提出の手順" agentId="instruction-modal">
        <div className="space-y-6 text-center">
           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <i className="fa-solid fa-list-check text-3xl"></i>
           </div>
           <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-700 mb-2">提出ボタンが表示されていませんか？</h4>
              <p className="text-sm text-slate-600 leading-relaxed">誤送信防止のため、以下の2点を確認してチェックを入れると提出ボタンが現れます。</p>
              <ul className="text-sm text-slate-600 mt-2 space-y-1 font-bold">
                <li><i className="fa-regular fa-square-check mr-2 text-primary"></i>サマリタブの集計値</li>
                <li><i className="fa-regular fa-square-check mr-2 text-primary"></i>明細タブの入力漏れ</li>
              </ul>
           </div>
           <Button onClick={() => setInstructionModalOpen(false)} agentId="instruction-modal:confirm-button">確認しました</Button>
        </div>
      </Modal>
      <Modal isOpen={isSubmitModalOpen} onClose={() => setSubmitModalOpen(false)} title="日報提出の確認" agentId="submit-confirm-modal">
        <div className="space-y-4">
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3 text-blue-900">
              <i className="fa-solid fa-circle-info mt-1 text-lg"></i>
              <div className="text-sm leading-relaxed">
                 <p className="font-bold mb-1">本日の業務を完了します。</p>
                 <p>提出後はデータの修正ができません。内容に間違いがないか最終確認をお願いします。</p>
              </div>
           </div>
           <div className="flex space-x-3">
             <Button variant="secondary" onClick={() => setSubmitModalOpen(false)} agentId="submit-confirm-modal:cancel-button">キャンセル</Button>
             <Button onClick={handleSubmit} agentId="submit-confirm-modal:execute-button">提出して終了</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};
