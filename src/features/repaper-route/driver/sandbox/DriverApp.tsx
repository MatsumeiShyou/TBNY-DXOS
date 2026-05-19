import { useState, useEffect, useRef } from 'react';
import { useDriverOSBridge } from '../bridge/useDriverOSBridge';
import { Layout } from './components/Layout';
import { InspectionPage } from './pages/InspectionPage';
import { RouteListPage } from './pages/RouteListPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { EndShiftPage } from './pages/EndShiftPage';
import { ReportPage } from './pages/ReportPage';
import { MenuPage } from './pages/MenuPage';
import { FuelPage } from './pages/FuelPage';
import type { Stop, User, Vehicle, Colleague } from './types';
import { StopStatus, DriverStatus } from './types';
import { Modal, Button, Card } from './components/Widgets';
import { HelpProvider } from './components/Help';
import { SOSContent } from './components/SOSContent';
import { AgentNamespace } from './components/AgentContext';
import { VehicleSelector } from '../../components/VehicleSelector';
import { NumericKeypadProvider } from './components/NumericKeypadContext';
import { NumericKeypad } from './components/NumericKeypad';
import { Loader2, Truck, ArrowDown } from 'lucide-react';

/**
 * DriverApp (Production Mode)
 * 
 * 真実のデータ（Supabase）のみをソースとするドライバーアプリ。
 */

// --- 状態永続化 (State Persistence) ---
const PERSIST_KEY = 'TBNY_DRIVER_SESSION_V1';

// セッション期限切れ判定関数 (日本時間基準)
const isSessionExpired = (savedAtIsoString: string): boolean => {
  if (!savedAtIsoString) return true;
  try {
    const savedDate = new Date(savedAtIsoString);
    const nowDate = new Date();

    // 日本時間 (JST: UTC+9時間) 基準の YYYY-MM-DD 文字列を取得して日付比較
    const getJSTDateString = (date: Date) => {
      const jstOffset = 9 * 60 * 60 * 1000;
      const jstDate = new Date(date.getTime() + jstOffset);
      return jstDate.toISOString().split('T')[0];
    };

    if (getJSTDateString(savedDate) !== getJSTDateString(nowDate)) {
      return true; // 日付が変わっている場合は期限切れ
    }

    // 操作から12時間以上経過しているか判定
    const diffMs = nowDate.getTime() - savedDate.getTime();
    const twelveHoursMs = 12 * 60 * 60 * 1000;
    if (diffMs > twelveHoursMs) {
      return true;
    }

    return false;
  } catch {
    return true; // パース失敗時は安全のため期限切れとみなす
  }
};

// 初期値の遅延取得関数
const getInitialState = (key: string, defaultValue: unknown) => {
  const saved = localStorage.getItem(PERSIST_KEY);
  if (!saved) return defaultValue;
  try {
    const data = JSON.parse(saved);

    // 最初のステート初期化時に期限切れチェックを実行
    if (data.updatedAt && isSessionExpired(data.updatedAt)) {
      localStorage.removeItem(PERSIST_KEY); // 古いセッションを破棄
      return defaultValue;
    }

    // 同日内の短い再起動でも、一時画面であれば仕事のリスト画面へ安全に引き戻す
    if (key === 'view') {
      const value = data[key];
      if (value === 'fuel' || value === 'report') {
        return 'route';
      }
    }

    return data[key] !== undefined ? data[key] : defaultValue;
  } catch {
    return defaultValue;
  }
};

export default function DriverApp() {
  const bridge = useDriverOSBridge();
  const [view, setView] = useState<string>(() => getInitialState('view', 'inspection')); 
  const [user, setUser] = useState<User | null>(() => getInitialState('user', null));
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(() => getInitialState('selectedStopId', null));

  const prevBridgeStopsRef = useRef<Stop[]>([]);
  const prevBridgeUserRef = useRef<User | null>(null);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [endShiftMode, setEndShiftMode] = useState<'FINAL' | 'INTERMEDIATE'>('FINAL');
  const [reportComment, setReportComment] = useState(() => getInitialState('reportComment', ''));
  const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [sosStep, setSosStep] = useState<'MENU' | 'SEARCHING' | 'RESULT_CALL' | 'ACCIDENT_ACTIONS'>('MENU');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStopForTransfer, setSelectedStopForTransfer] = useState<Stop | null>(null);
  const [transferStep, setTransferStep] = useState<'SELECT' | 'CONFIRM'>('SELECT');
  const [selectedColleagueForTransfer, setSelectedColleagueForTransfer] = useState<Colleague | null>(null);

  // 1. 保存 (Sync to Local) - 変更時のみ実行
  useEffect(() => {
    const sessionData = {
      view,
      selectedStopId,
      reportComment,
      user,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify(sessionData));
  }, [view, selectedStopId, reportComment, user]);

  // DB データの同期 (F-SSOT 改善)
  useEffect(() => {
    if (bridge.stops && bridge.stops !== prevBridgeStopsRef.current) {
      setStops(bridge.stops);
      prevBridgeStopsRef.current = bridge.stops;
    }
  }, [bridge.stops]);

  useEffect(() => {
    if (bridge.user && bridge.user !== prevBridgeUserRef.current) {
      setUser(bridge.user);
      prevBridgeUserRef.current = bridge.user;
    }
  }, [bridge.user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleInspectionComplete = () => {
    if (!user) return;

    setUser(prev => prev ? { ...prev, currentStatus: DriverStatus.DRIVING } : null);
    bridge.recordDecision('SHIFT_START', user.id, { code: 'NORMAL_OPERATION' });
    setView('route');
  };

  const handleSelectStop = (id: string) => {
    setSelectedStopId(id);
    setView('stop');
  };

  const handleUpdateStop = async (stopId: string, updates: Partial<Stop>) => {
    if (!user) return;
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, ...updates } : s));
    
    if (updates.status === StopStatus.IN_PROGRESS) {
       setUser(prev => prev ? { ...prev, currentStatus: DriverStatus.LOADING } : null);
       await bridge.recordDecision('STOP_ARRIVAL', user.id, { code: 'NORMAL_OPERATION' }, { time: updates.arrivalTime }, stopId);
    } else if (updates.status === StopStatus.COMPLETED) {
       setUser(prev => prev ? { ...prev, currentStatus: DriverStatus.DRIVING } : null);
       await bridge.recordDecision('STOP_COMPLETION', user.id, { code: 'NORMAL_OPERATION' }, { items: updates.items, time: updates.departureTime }, stopId);
    }
  };





  const handleEndShiftComplete = (adjustedWeights?: Record<string, number>) => {
    if (!user) return;
    if (endShiftMode === 'INTERMEDIATE') {
      setStops(prev => prev.map(s => {
        if (s.status === StopStatus.COMPLETED) {
          const newItems = s.items.map(i => i.isCollected ? { ...i, isUnloaded: true } : i);
          return { ...s, items: newItems };
        }
        return s;
      }));
      setUser(prev => prev ? { ...prev, currentStatus: DriverStatus.OFFLINE } : null);
      setView('route');
    } else {
      bridge.recordDecision('SHIFT_END', user.id, { code: 'NORMAL_OPERATION' }, { adjustedWeights });
      setUser(prev => prev ? { ...prev, currentStatus: DriverStatus.OFFLINE } : null);
      localStorage.removeItem(PERSIST_KEY); // クリア
      setView('report');
    }
  };

  const handleVehicleChange = async (vehicle: Vehicle) => {
    if (!user) return;
    await bridge.recordDecision('VEHICLE_SWAP', user.id, { code: 'NORMAL_OPERATION' }, { 
      oldVehicleId: user.vehicleId, 
      newVehicleId: vehicle.id,
      reason: 'Driver Request'
    }, vehicle.id);
    setUser(prev => prev ? { ...prev, vehicleId: vehicle.id, vehicleName: vehicle.name } : null);
    setVehicleModalOpen(false);
    setIsMenuOpen(false);
    showToast(`車両を変更しました: ${vehicle.name}`, 'info');
  };



  const handleSOSTypeSelect = async (type: string) => {
    if (!user) return;
    if (type === 'BACK') {
      setSosStep('MENU');
      return;
    }
    await bridge.recordDecision('TROUBLE_REPORT', user.id, { code: 'EXCEPTION', text: type });
    if (type === 'ACCIDENT') {
      setSosStep('ACCIDENT_ACTIONS');
      return;
    }
    setSosStep('SEARCHING');
    setTimeout(() => { setSosStep('RESULT_CALL'); }, 2500);
  };
  
  const handleTransferRequestTrigger = (stop: Stop) => {
    setSelectedStopForTransfer(stop);
    setTransferStep('SELECT');
    setSelectedColleagueForTransfer(null);
    setIsTransferModalOpen(true);
  };

  const handleExecuteTransfer = async () => {
    if (!user || !selectedStopForTransfer || !selectedColleagueForTransfer) return;
    const stopId = selectedStopForTransfer.id;
    window.location.href = `tel:${selectedColleagueForTransfer.phoneNumber}`;
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, transferStatus: 'REQUESTING' } : s));
    await bridge.recordDecision('SWAP_REQUEST', user.id, { code: 'NORMAL_OPERATION' }, { colleagueId: selectedColleagueForTransfer.id }, stopId);
    setIsTransferModalOpen(false);
    showToast('申請データを送信しました。', 'info');
  };

  if (bridge.isLoading || !user) {
    return (
      <div className="tw-h-screen tw-flex tw-items-center tw-justify-center tw-bg-slate-900 tw-text-white">
        <div className="tw-text-center tw-animate-pulse">
          <Loader2 className="tw-animate-spin tw-text-4xl tw-mb-4" />
          <p className="tw-font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
     if (view === 'inspection') return '始業前点検';
     if (view === 'route') return '本日の案件リスト';
     if (view === 'stop') return '案件詳細';
     if (view === 'fuel') return '給油報告';
     if (view === 'report') return '業務日報サマリ';
     if (view === 'end') return '本日の業務終了';
     return '本日の案件リスト';
   };

  return (
    <HelpProvider>
      <NumericKeypadProvider>
        <AgentNamespace ns="layout">
        <Layout 
          user={user} 
          title={getPageTitle()}
          currentView={view} 
          onNavigate={setView}
          onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
          onVehicleClick={() => setVehicleModalOpen(true)}
          toastMessage={toast?.message}
          toastType={toast?.type}
          onToastClose={() => setToast(null)}
        >
          <AgentNamespace ns="pages">
            {view === 'inspection' && <AgentNamespace ns="inspection"><InspectionPage onComplete={handleInspectionComplete} /></AgentNamespace>}
            {view === 'route' && (
              <AgentNamespace ns="route">
                <RouteListPage 
                  stops={stops} 
                  currentRouteName="コースA-1" 
                  onSelectStop={handleSelectStop} 
                  onStatusReport={() => {}}
                  onChangeCourse={() => showToast('コース変更は管理者へ連絡してください', 'info')}
                  onTransferRequest={handleTransferRequestTrigger}
                  onIntermediateUnload={() => { setEndShiftMode('INTERMEDIATE'); setView('end'); }}
                  onReorderStops={setStops}
                />
              </AgentNamespace>
            )}
            {view === 'stop' && selectedStopId && (
              <AgentNamespace ns="stop">
                <StopDetailPage 
                  stop={stops.find(s => s.id === selectedStopId)!} 
                  onUpdateStop={handleUpdateStop}
                  onBack={() => setView('route')}
                />
              </AgentNamespace>
            )}
            {view === 'end' && (
              <AgentNamespace ns="end-shift">
                <EndShiftPage 
                  stops={stops} 
                  currentVehicle={bridge.availableVehicles.find(v => v.id === user.vehicleId) || { id: 'default', name: '不明', plateNumber: '-', tareWeight: 2500, isInspected: true }}
                  mode={endShiftMode}
                  onComplete={handleEndShiftComplete} 
                  onCancel={() => setView('route')} 
                />
              </AgentNamespace>
            )}
            {view === 'report' && (
              <AgentNamespace ns="report">
                <ReportPage 
                  stops={stops}
                  user={user}
                  workStartTime={null}
                  reportComment={reportComment} 
                  onCommentChange={setReportComment} 
                  onEditStop={(id) => {
                    setSelectedStopId(id);
                    setView('stop');
                  }}
                />
              </AgentNamespace>
            )}
             {view === 'fuel' && (
               <AgentNamespace ns="fuel">
                 <FuelPage onBack={() => setView('route')} />
               </AgentNamespace>
             )}
          </AgentNamespace>
        </Layout>
      </AgentNamespace>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <AgentNamespace ns="menu">
          <MenuPage 
            isOpen={true}
            onClose={() => setIsMenuOpen(false)}
            user={user}
            onVehicleChange={() => { setVehicleModalOpen(true); setIsMenuOpen(false); }}
            onCourseChange={() => { showToast('コース変更は管理者へ連絡してください', 'info'); }}
            onFuelReport={() => { setView('fuel'); setIsMenuOpen(false); }}
            onLogout={() => { localStorage.removeItem(PERSIST_KEY); window.location.reload(); }}
          />
        </AgentNamespace>
      )}

      {/* Vehicle Modal */}
      {isVehicleModalOpen && (
        <AgentNamespace ns="vehicle-swap">
          <Modal isOpen={true} title="車両を選択" onClose={() => setVehicleModalOpen(false)} agentId="modal">
            <div className="tw-p-1">
              <VehicleSelector 
                vehicles={bridge.availableVehicles}
                selectedVehicleId={user.vehicleId}
                onSelect={(v) => { handleVehicleChange(v as Vehicle); }}
              />
              <p className="tw-mt-4 tw-text-[10px] tw-text-slate-400 tw-text-center">
                ※車両を変更すると、本日の運行実績データに紐付けられます
              </p>
            </div>
          </Modal>
        </AgentNamespace>
      )}

      {/* SOS Modal */}
      {isSOSModalOpen && (
        <AgentNamespace ns="sos">
          <Modal isOpen={true} title="緊急事態報告" onClose={() => setIsSOSModalOpen(false)} agentId="modal">
            <SOSContent 
              step={sosStep} 
              onSelectType={handleSOSTypeSelect} 
              onClose={() => setIsSOSModalOpen(false)} 
            />
          </Modal>
        </AgentNamespace>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <AgentNamespace ns="transfer">
          <Modal 
            isOpen={true}
            title={transferStep === 'SELECT' ? "譲渡先を選択" : "譲渡の確認"} 
            onClose={() => setIsTransferModalOpen(false)}
            agentId="modal"
          >
            {transferStep === 'SELECT' ? (
              <div className="tw-grid tw-gap-3">
                {bridge.availableColleagues.map(c => (
                  <Card key={c.id} onClick={() => { setSelectedColleagueForTransfer(c); setTransferStep('CONFIRM'); }} className="tw-p-4 tw-active:tw-bg-slate-50 tw-transition-colors" agentId={`card:${c.id}`}>
                    <div className="tw-flex tw-justify-between tw-items-center">
                      <div>
                        <div className="tw-font-bold tw-text-slate-800">{c.name}</div>
                        <div className="tw-text-sm tw-text-slate-500">{c.distance} 付近</div>
                      </div>
                      <Truck className="tw-text-blue-500" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="tw-space-y-6 tw-text-center">
                <div className="tw-p-6 tw-bg-blue-50 tw-rounded-2xl">
                  <p className="tw-text-slate-600 tw-mb-2">譲渡する案件</p>
                  <h3 className="tw-text-xl tw-font-bold">{selectedStopForTransfer?.customerName}</h3>
                  <div className="tw-my-4 tw-text-2xl tw-text-blue-600"><ArrowDown /></div>
                  <p className="tw-text-slate-600 tw-mb-2">譲渡先ドライバー</p>
                  <h3 className="tw-text-xl tw-font-bold">{selectedColleagueForTransfer?.name}</h3>
                </div>
                <Button 
                  variant="primary" 
                  onClick={handleExecuteTransfer}
                  className="tw-py-4 tw-text-lg"
                  agentId="confirm-button"
                >
                  電話して依頼を確定する
                </Button>
              </div>
            )}
          </Modal>
        </AgentNamespace>
      )}
      <NumericKeypad />
    </NumericKeypadProvider>
  </HelpProvider>
  );
}
