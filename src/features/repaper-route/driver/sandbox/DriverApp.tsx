import { useState, useEffect } from 'react';
import { useDriverOSBridge } from '../bridge/useDriverOSBridge';
import { Layout } from './components/Layout';
import { InspectionPage } from './pages/InspectionPage';
import { RouteListPage } from './pages/RouteListPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { EndShiftPage } from './pages/EndShiftPage';
import { ReportPage } from './pages/ReportPage';
import { MenuPage } from './pages/MenuPage';
import type { Stop, User, Vehicle, Colleague } from './types';
import { StopStatus, DriverStatus } from './types';
import { Modal, Button, Card } from './components/Widgets';
import { HelpProvider } from './components/Help';
import { SOSContent } from './components/SOSContent';

/**
 * DriverApp (Production Mode)
 * 
 * 真実のデータ（Supabase）のみをソースとするドライバーアプリ。
 */
export default function DriverApp() {
  const bridge = useDriverOSBridge();
  const [view, setView] = useState('inspection'); 
  const [user, setUser] = useState<User | null>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [endShiftMode, setEndShiftMode] = useState<'FINAL' | 'INTERMEDIATE'>('FINAL');
  const [reportComment, setReportComment] = useState('');
  const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [sosStep, setSosStep] = useState<'MENU' | 'SEARCHING' | 'RESULT_CALL' | 'ACCIDENT_ACTIONS'>('MENU');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStopForTransfer, setSelectedStopForTransfer] = useState<Stop | null>(null);
  const [transferStep, setTransferStep] = useState<'SELECT' | 'CONFIRM'>('SELECT');
  const [selectedColleagueForTransfer, setSelectedColleagueForTransfer] = useState<Colleague | null>(null);

  // DB データの同期
  useEffect(() => {
    if (bridge.stops) setStops(bridge.stops);
  }, [bridge.stops]);

  useEffect(() => {
    if (bridge.user) setUser(bridge.user);
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
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center animate-pulse">
          <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
          <p className="font-bold">真実を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <HelpProvider>
      <Layout 
        user={user} 
        title="本日の案件リスト"
        currentView={view} 
        onNavigate={setView}
        onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
        onVehicleClick={() => setVehicleModalOpen(true)}
        onEmergencyClick={() => { setSosStep('MENU'); setIsSOSModalOpen(true); }}
        toastMessage={toast?.message}
        toastType={toast?.type}
        onToastClose={() => setToast(null)}
      >
        {view === 'inspection' && <InspectionPage onComplete={handleInspectionComplete} />}
        {view === 'route' && (
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
        )}
        {view === 'stop' && selectedStopId && (
          <StopDetailPage 
            stop={stops.find(s => s.id === selectedStopId)!} 
            onUpdateStop={handleUpdateStop}
            onBack={() => setView('route')}
          />
        )}
        {view === 'end' && (
          <EndShiftPage 
            stops={stops} 
            currentVehicle={bridge.availableVehicles.find(v => v.id === user.vehicleId) || { id: 'default', name: '不明', plateNumber: '-', tareWeight: 2500, isInspected: true }}
            mode={endShiftMode}
            onComplete={handleEndShiftComplete} 
            onCancel={() => setView('route')} 
          />
        )}
        {view === 'report' && (
          <ReportPage 
            stops={stops}
            user={user}
            workStartTime={null}
            reportComment={reportComment} 
            onCommentChange={setReportComment} 
            onEditStop={(id) => {
              setSelectedStopId(id);
              setView('stop-detail');
            }}
          />
        )}
        {view === 'fuel' && <div className="p-4"><h2 className="text-xl font-bold">給油報告（準備中）</h2></div>}
      </Layout>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <MenuPage 
          isOpen={true}
          onClose={() => setIsMenuOpen(false)}
          user={user}
          onVehicleChange={() => { setVehicleModalOpen(true); setIsMenuOpen(false); }}
          onCourseChange={() => { showToast('コース変更は管理者へ連絡してください', 'info'); }}
          onFuelReport={() => { setView('fuel'); setIsMenuOpen(false); }}
          onLogout={() => window.location.reload()}
        />
      )}

      {/* Vehicle Modal */}
      {isVehicleModalOpen && (
        <Modal isOpen={true} title="車両乗り換え" onClose={() => setVehicleModalOpen(false)}>
          <div className="grid gap-3">
            {bridge.availableVehicles.map(v => (
              <Card key={v.id} onClick={() => handleVehicleChange(v)} className="p-4 active:bg-slate-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">{v.name}</div>
                    <div className="text-sm text-slate-500">{v.plateNumber}</div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-slate-300"></i>
                </div>
              </Card>
            ))}
          </div>
        </Modal>
      )}

      {/* SOS Modal */}
      {isSOSModalOpen && (
        <Modal isOpen={true} title="緊急事態報告" onClose={() => setIsSOSModalOpen(false)}>
          <SOSContent 
            step={sosStep} 
            onSelectType={handleSOSTypeSelect} 
            onClose={() => setIsSOSModalOpen(false)} 
          />
        </Modal>
      )}

      {/* Transfer Modal */}
      {isTransferModalOpen && (
        <Modal 
          isOpen={true}
          title={transferStep === 'SELECT' ? "譲渡先を選択" : "譲渡の確認"} 
          onClose={() => setIsTransferModalOpen(false)}
        >
          {transferStep === 'SELECT' ? (
            <div className="grid gap-3">
              {bridge.availableColleagues.map(c => (
                <Card key={c.id} onClick={() => { setSelectedColleagueForTransfer(c); setTransferStep('CONFIRM'); }} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{c.name}</div>
                      <div className="text-sm text-slate-500">{c.distance} 付近</div>
                    </div>
                    <i className="fa-solid fa-truck-fast text-blue-500"></i>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <div className="p-6 bg-blue-50 rounded-2xl">
                <p className="text-slate-600 mb-2">譲渡する案件</p>
                <h3 className="text-xl font-bold">{selectedStopForTransfer?.customerName}</h3>
                <div className="my-4 text-2xl text-blue-600"><i className="fa-solid fa-arrow-down"></i></div>
                <p className="text-slate-600 mb-2">譲渡先ドライバー</p>
                <h3 className="text-xl font-bold">{selectedColleagueForTransfer?.name}</h3>
              </div>
              <Button 
                variant="primary" 
                onClick={handleExecuteTransfer}
                className="py-4 text-lg"
              >
                電話して依頼を確定する
              </Button>
            </div>
          )}
        </Modal>
      )}
    </HelpProvider>
  );
}
