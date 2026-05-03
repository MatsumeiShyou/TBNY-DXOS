import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InspectionPage } from './pages/InspectionPage';
import { RouteListPage } from './pages/RouteListPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { EndShiftPage } from './pages/EndShiftPage';
import { ReportPage } from './pages/ReportPage';
import { MenuPage } from './pages/MenuPage';
import { CURRENT_USER, ADMIN_PHONE_NUMBER, MOCK_COLLEAGUES, MOCK_VEHICLES } from './constants'; 
import type { Stop, User, Vehicle, RouteInfo, Colleague } from './types';
import { StopStatus, DriverStatus } from './types';
import { Modal, Button, Card } from './components/Widgets';
import { HelpProvider } from './components/Help';

// Dummy stubs for Supabase logic (to be linked to Bridge later)
const fetchAllRoutes = async (): Promise<RouteInfo[]> => {
  return [
    { id: 'r-1', name: '東京エリア通常', area: '東京都心部', stops: [] },
    { id: 'r-2', name: '埼玉ルートB', area: 'さいたま市', stops: [] },
    { id: 'r-3', name: '横浜・川崎定期便', area: '神奈川県', stops: [] },
  ];
};

const fetchRouteWithStops = async (id: string): Promise<{name: string, stops: Stop[]}> => {
  // Mocking data based on prototype logic
  return {
    name: id === 'r-1' ? '東京エリア通常' : '別コース',
    stops: [
       {
         id: 's-1',
         customerName: '銀座オフィスビル A棟',
         address: '東京都中央区銀座1-1-1',
         lat: 35.67, lng: 139.76,
         scheduledTime: '09:00',
         status: StopStatus.PENDING,
         items: [
           { id: 'c-1', name: '段ボール', defaultWeight: 150, isCollected: false },
           { id: 'c-2', name: '新聞・雑誌', defaultWeight: 50, isCollected: false }
         ],
         isPriority: true,
         notes: '裏口から入ってください'
       }
    ]
  };
};

const recordDecision = async (type: string, userId: string, meta: any, data?: any, targetId?: string) => {
  console.log(`[Decision Log] ${type}`, { userId, meta, data, targetId });
};

// --- Fuel Page (Ported) ---
const FuelPage = () => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold">給油報告</h2>
    <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-4">
      <i className="fa-solid fa-camera text-4xl text-slate-300"></i>
      <p className="font-bold text-slate-600">レシートを撮影</p>
      <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold">カメラを起動</button>
    </div>
  </div>
);

// --- SOS Content (Ported) ---
const SOSContent = ({ 
  step, 
  onSelectType, 
  onClose 
}: { 
  step: 'MENU' | 'SEARCHING' | 'RESULT_CALL' | 'ACCIDENT_ACTIONS', 
  onSelectType: (type: string) => void,
  onClose: () => void 
}) => {
  if (step === 'ACCIDENT_ACTIONS') {
    return (
      <div className="space-y-4 animate-fade-in pb-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
              <h3 className="font-bold text-red-700 text-lg flex items-center">
                <i className="fa-solid fa-truck-medical mr-2"></i>人命救助最優先
              </h3>
              <p className="text-sm text-red-600 mt-1">けが人がいる場合は、迷わず救急車を呼んでください。</p>
          </div>
          <div className="grid gap-4">
              <a href="tel:119" className="block w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-900/20 p-6 text-center active:scale-[0.98] transition-transform flex items-center justify-between group">
                  <div className="text-left">
                      <div className="text-2xl font-bold">119番</div>
                      <div className="text-sm opacity-90 font-bold">救急車・消防</div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 animate-pulse">
                      <i className="fa-solid fa-kit-medical text-2xl"></i>
                  </div>
              </a>
              <a href="tel:110" className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-900/20 p-5 text-center active:scale-[0.98] transition-transform flex items-center justify-between group">
                  <div className="text-left">
                      <div className="text-xl font-bold">110番</div>
                      <div className="text-sm opacity-90 font-bold">警察への通報</div>
                  </div>
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30">
                      <i className="fa-solid fa-shield-halved text-xl"></i>
                  </div>
              </a>
              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold">報告</span>
                  <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <a href={`tel:${ADMIN_PHONE_NUMBER}`} className="block w-full bg-white border border-slate-300 text-slate-700 rounded-xl p-4 text-center active:bg-slate-50 font-bold flex items-center justify-center">
                  <i className="fa-solid fa-phone mr-2"></i> 管理者へ連絡
              </a>
          </div>
          <button onClick={() => onSelectType('BACK')} className="text-sm text-slate-400 w-full py-2 underline hover:text-slate-600">
              メニューに戻る
          </button>
      </div>
    );
  }

  if (step === 'SEARCHING') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-100 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <i className="fa-solid fa-satellite-dish text-2xl text-primary animate-pulse"></i>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-slate-800">応援車両を検索中...</h3>
          <p className="text-sm text-slate-500">現在位置から救援可能な車両を探しています。<br/>そのままお待ちください。</p>
        </div>
      </div>
    );
  }

  if (step === 'RESULT_CALL') {
    return (
      <div className="space-y-6 text-center py-2 animate-fade-in">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start text-left mb-6">
           <i className="fa-solid fa-circle-exclamation text-yellow-600 text-xl mt-1 mr-3 shrink-0"></i>
           <div>
              <h3 className="font-bold text-yellow-900 text-lg">近くに対応可能な車両がいません</h3>
              <p className="text-sm text-yellow-800 mt-1 leading-relaxed">
                システムによる自動調整が成立しませんでした。<br/>
                配車担当者に直接連絡し、指示を仰いでください。
              </p>
           </div>
        </div>
        <div className="py-2">
          <a href={`tel:${ADMIN_PHONE_NUMBER}`} className="group block w-full bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xl shadow-red-900/20 active:scale-[0.98] transition-all overflow-hidden relative">
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div className="p-6 flex flex-col items-center justify-center">
               <i className="fa-solid fa-phone-volume text-4xl mb-2 animate-pulse"></i>
               <span className="text-2xl font-bold">管理者へ発信</span>
               <span className="font-mono text-lg opacity-90 mt-1">{ADMIN_PHONE_NUMBER}</span>
            </div>
          </a>
          <p className="text-xs text-slate-400 mt-3">※ワンタップで発信します</p>
        </div>
        <button onClick={onClose} className="text-sm text-slate-400 font-bold underline p-4 hover:text-slate-600">
          閉じる
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start text-blue-900 mb-2">
        <i className="fa-solid fa-circle-info mt-1 mr-3 text-lg shrink-0"></i>
        <div className="text-sm">
          <p className="font-bold">どのようなトラブルですか？</p>
          <p>状況に応じて、システムが最適な対応方法を案内します。</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3">
        <button onClick={() => onSelectType('DELAY')} className="bg-white border-2 border-slate-200 hover:border-orange-400 hover:bg-orange-50 p-5 rounded-xl text-left flex items-center transition-all group active:scale-[0.99] touch-manipulation">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
            <i className="fa-solid fa-clock-rotate-left text-2xl"></i>
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800 text-lg">遅延・荷量オーバー</div>
            <div className="text-xs text-slate-500 mt-0.5">時間に間に合わない、積みきれない等</div>
          </div>
          <i className="fa-solid fa-chevron-right ml-2 text-slate-300"></i>
        </button>
        <button onClick={() => onSelectType('TROUBLE')} className="bg-white border-2 border-slate-200 hover:border-slate-500 hover:bg-slate-50 p-5 rounded-xl text-left flex items-center transition-all group active:scale-[0.99] touch-manipulation">
          <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mr-4 group-hover:bg-slate-600 group-hover:text-white transition-colors shrink-0">
            <i className="fa-solid fa-wrench text-2xl"></i>
          </div>
          <div className="flex-1">
            <div className="font-bold text-slate-800 text-lg">車両故障・トラブル</div>
            <div className="text-xs text-slate-500 mt-0.5">パンク、バッテリー上がり、事故以外</div>
          </div>
          <i className="fa-solid fa-chevron-right ml-2 text-slate-300"></i>
        </button>
        <button onClick={() => onSelectType('ACCIDENT')} className="bg-red-50 border-2 border-red-100 hover:bg-red-100 p-5 rounded-xl text-left flex items-center transition-all mt-4 active:scale-[0.99] touch-manipulation group w-full">
          <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center mr-4 animate-pulse shrink-0">
            <i className="fa-solid fa-car-burst text-2xl"></i>
          </div>
          <div className="flex-1">
            <div className="font-bold text-red-700 text-lg">交通事故・人身事故</div>
            <div className="text-xs text-red-600 font-bold mt-0.5">救急・警察への連絡はこちら</div>
          </div>
          <i className="fa-solid fa-chevron-right ml-2 text-red-300"></i>
        </button>
      </div>
    </div>
  );
};

// --- TTS Helper ---
const speak = (text: string) => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  }
};

export default function DriverApp() {
  const [view, setView] = useState('inspection'); 
  const [user, setUser] = useState<User>(CURRENT_USER);
  const [stops, setStops] = useState<Stop[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null);
  const [currentRouteId, setCurrentRouteId] = useState<string>('r-1');
  const [currentRouteName, setCurrentRouteName] = useState<string>('東京エリア通常');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [endShiftMode, setEndShiftMode] = useState<'FINAL' | 'INTERMEDIATE'>('FINAL');
  const [reportComment, setReportComment] = useState('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [availableCourses, setAvailableCourses] = useState<RouteInfo[]>([]);
  const [isVehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [sosStep, setSosStep] = useState<'MENU' | 'SEARCHING' | 'RESULT_CALL' | 'ACCIDENT_ACTIONS'>('MENU');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedStopForTransfer, setSelectedStopForTransfer] = useState<Stop | null>(null);
  const [transferStep, setTransferStep] = useState<'SELECT' | 'CONFIRM'>('SELECT');
  const [selectedColleagueForTransfer, setSelectedColleagueForTransfer] = useState<Colleague | null>(null);
  const [isIncomingRequestModalOpen, setIsIncomingRequestModalOpen] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<{stopName: string, colleagueName: string} | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const routes = await fetchAllRoutes();
      setAvailableCourses(routes);
      const routeData = await fetchRouteWithStops(currentRouteId);
      if (routeData) {
        setStops(routeData.stops);
        setCurrentRouteName(routeData.name);
      }
    };
    loadData();
  }, [currentRouteId]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  const handleInspectionComplete = () => {
    setWorkStartTime(new Date());
    setUser(prev => ({ ...prev, currentStatus: DriverStatus.DRIVING }));
    recordDecision('SHIFT_START', user.id, { code: 'NORMAL_OPERATION' });
    setView('route');
  };

  const handleSelectStop = (id: string) => {
    setSelectedStopId(id);
    setView('stop');
  };

  const handleUpdateStop = async (stopId: string, updates: Partial<Stop>) => {
    setStops(prev => prev.map(s => s.id === stopId ? { ...s, ...updates } : s));
    if (updates.status === StopStatus.IN_PROGRESS) {
       setUser(prev => ({ ...prev, currentStatus: DriverStatus.LOADING }));
       await recordDecision('STOP_ARRIVAL', user.id, { code: 'NORMAL_OPERATION' }, { time: updates.arrivalTime }, stopId);
    } else if (updates.status === StopStatus.COMPLETED) {
       setUser(prev => ({ ...prev, currentStatus: DriverStatus.DRIVING }));
       await recordDecision('STOP_COMPLETION', user.id, { code: 'NORMAL_OPERATION' }, { items: updates.items, time: updates.departureTime }, stopId);
    }
  };

  const handleReorderStops = async (newStops: Stop[]) => {
    setStops(newStops);
    await recordDecision('ROUTE_REORDER', user.id, { code: 'NORMAL_OPERATION' }, { stops: newStops });
  };

  const handleStatusReport = (status: string) => {
    console.log('Status Reported:', status);
  };

  const handleChangeCourse = (routeId: string) => {
    setCurrentRouteId(routeId);
    setIsCourseModalOpen(false);
    setIsMenuOpen(false);
  };

  const handleStartEndShift = (mode: 'FINAL' | 'INTERMEDIATE') => {
    setEndShiftMode(mode);
    setView('end');
  };

  const handleEndShiftComplete = (adjustedWeights?: Record<string, number>) => {
    if (endShiftMode === 'INTERMEDIATE') {
      setStops(prev => prev.map(s => {
        if (s.status === StopStatus.COMPLETED) {
          const newItems = s.items.map(i => i.isCollected ? { ...i, isUnloaded: true } : i);
          return { ...s, items: newItems };
        }
        return s;
      }));
      setUser(prev => ({ ...prev, currentStatus: DriverStatus.OFFLINE }));
      setView('route');
    } else {
      recordDecision('SHIFT_END', user.id, { code: 'NORMAL_OPERATION' }, { adjustedWeights });
      setUser(prev => ({ ...prev, currentStatus: DriverStatus.OFFLINE }));
      setView('report');
    }
  };

  const handleVehicleChange = async (vehicle: Vehicle) => {
    await recordDecision('VEHICLE_SWAP', user.id, { code: 'NORMAL_OPERATION' }, { 
      oldVehicleId: user.vehicleId, 
      newVehicleId: vehicle.id,
      reason: 'Driver Request'
    }, vehicle.id);
    setUser(prev => ({ ...prev, vehicleId: vehicle.id, vehicleName: vehicle.name }));
    setVehicleModalOpen(false);
    setIsMenuOpen(false);
    showToast(`車両を変更しました: ${vehicle.name}`, 'info');
  };
  
  const handleOpenVehicleModal = () => {
    const hasLoad = stops.some(s => s.status === StopStatus.COMPLETED && s.items.some(i => i.isCollected && !i.isUnloaded));
    if (hasLoad) {
      alert("車両交換エラー: 積載物が残っています。");
      return;
    }
    setVehicleModalOpen(true);
  };

  const handleEmergencyClick = () => {
    setSosStep('MENU');
    setIsSOSModalOpen(true);
  };

  const handleSOSTypeSelect = async (type: string) => {
    if (type === 'BACK') {
      setSosStep('MENU');
      return;
    }
    await recordDecision('TROUBLE_REPORT', user.id, { code: 'EXCEPTION', text: type });
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

  const handleSelectColleague = (colleague: Colleague) => {
    setSelectedColleagueForTransfer(colleague);
    setTransferStep('CONFIRM');
  };
  
  const handleExecuteTransfer = async () => {
    if (selectedStopForTransfer && selectedColleagueForTransfer) {
      const stopId = selectedStopForTransfer.id;
      const targetColleagueName = selectedColleagueForTransfer.name;
      window.location.href = `tel:${selectedColleagueForTransfer.phoneNumber}`;
      setStops(prev => prev.map(s => s.id === stopId ? { ...s, transferStatus: 'REQUESTING' } : s));
      await recordDecision('SWAP_REQUEST', user.id, { code: 'NORMAL_OPERATION' }, { colleagueId: selectedColleagueForTransfer.id }, stopId);
      setIsTransferModalOpen(false);
      showToast('申請データを送信しました。', 'info');
      setTimeout(() => {
        setStops(prev => prev.filter(s => s.id !== stopId));
        const message = `${targetColleagueName}さんが案件の譲渡を承認しました`;
        showToast(message, 'success');
        speak(message);
      }, 8000); 
    }
  };
  
  const handleCancelOutgoingRequest = (stopId: string) => {
     setStops(prev => prev.map(s => s.id === stopId ? { ...s, transferStatus: undefined } : s));
     showToast('依頼を取り消しました', 'info');
  };

  const handleDemoReceiveRequest = () => {
    const request = { stopName: '川崎物流倉庫 A棟', colleagueName: '鈴木 一郎' };
    setIncomingRequest(request);
    setIsIncomingRequestModalOpen(true);
    speak(`${request.colleagueName}さんから、案件の交換依頼が届いています`);
  };
  
  const handleApproveIncoming = async () => {
    if (incomingRequest) {
      const newStop: Stop = {
        id: `s-swap-${Date.now()}`,
        customerName: incomingRequest.stopName,
        address: '神奈川県川崎市川崎区1-1',
        lat: 35.5, lng: 139.7,
        scheduledTime: '15:00',
        status: StopStatus.PENDING,
        items: [{ id: 'c-swap-1', name: '緊急回収品', defaultWeight: 50, isCollected: false }],
        notes: 'スワップ案件'
      };
      setStops(prev => [...prev, newStop].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)));
      await recordDecision('SWAP_APPROVE', user.id, { code: 'NORMAL_OPERATION' }, { stop: newStop });
      setIsIncomingRequestModalOpen(false);
      setIncomingRequest(null);
      setIsMenuOpen(false);
      showToast(`${incomingRequest.colleagueName}さんからの依頼を承認しました`, 'info');
    }
  };
  
  const handleRejectIncoming = async () => {
     if (incomingRequest) {
        await recordDecision('SWAP_REJECT', user.id, { code: 'NORMAL_OPERATION' });
        setIncomingRequest(null);
        setIsIncomingRequestModalOpen(false);
        setIsMenuOpen(false);
        showToast('依頼を却下しました', 'info');
     }
  };

  const currentVehicleObj = { 
    id: user.vehicleId, 
    name: user.vehicleName, 
    plateNumber: '...', 
    isInspected: true, 
    tareWeight: 2800 
  };

  const availableVehicles = MOCK_VEHICLES.filter(v => v.id !== user.vehicleId);
  const swappableCourses = availableCourses.filter(c => c.id !== currentRouteId);
  const outgoingRequests = stops.filter(s => s.transferStatus === 'REQUESTING');

  const renderContent = () => {
    switch (view) {
      case 'inspection': return <InspectionPage onComplete={handleInspectionComplete} />;
      case 'route': return <RouteListPage stops={stops} currentRouteName={currentRouteName} onSelectStop={handleSelectStop} onStatusReport={handleStatusReport} onChangeCourse={() => setIsCourseModalOpen(true)} onTransferRequest={handleTransferRequestTrigger} onIntermediateUnload={() => handleStartEndShift('INTERMEDIATE')} onReorderStops={handleReorderStops} />;
      case 'stop':
        const stop = stops.find(s => s.id === selectedStopId);
        if (!stop) return <div>Error: Stop not found</div>;
        return <StopDetailPage stop={stop} onUpdateStop={handleUpdateStop} onBack={() => setView('route')} />;
      case 'fuel': return <FuelPage />;
      case 'report': return <ReportPage stops={stops} user={user} workStartTime={workStartTime} reportComment={reportComment} onCommentChange={setReportComment} onEditStop={(id) => { setSelectedStopId(id); setView('stop'); }} />;
      case 'end': return <EndShiftPage stops={stops} currentVehicle={currentVehicleObj} mode={endShiftMode} onComplete={handleEndShiftComplete} onCancel={() => setView(endShiftMode === 'INTERMEDIATE' ? 'route' : 'report')} />;
      default: return <div>Unknown View</div>;
    }
  };

  const getPageTitle = () => {
    if (view === 'inspection') return '始業前点検';
    if (view === 'route') return 'ルート一覧';
    if (view === 'stop') return '案件詳細';
    if (view === 'fuel') return '給油報告';
    if (view === 'report') return '業務日報';
    if (view === 'end') return '業務終了報告';
    return 'Driver App';
  };

  return (
    <HelpProvider>
      <Layout 
        user={user} 
        title={getPageTitle()}
        onEmergencyClick={handleEmergencyClick}
        onMenuClick={() => setIsMenuOpen(true)}
        currentView={view}
        onNavigate={setView}
        showNav={view !== 'inspection' && view !== 'stop' && view !== 'end'}
        onVehicleClick={handleOpenVehicleModal}
        toastMessage={toast?.message}
        toastType={toast?.type}
        onToastClose={() => setToast(null)}
      >
        {renderContent()}

        <MenuPage 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          user={user}
          incomingRequest={incomingRequest}
          outgoingRequests={outgoingRequests}
          onApproveIncoming={handleApproveIncoming}
          onRejectIncoming={handleRejectIncoming}
          onCancelOutgoing={handleCancelOutgoingRequest}
          onVehicleChange={handleOpenVehicleModal}
          onCourseChange={() => setIsCourseModalOpen(true)}
          onDemoTrigger={handleDemoReceiveRequest}
        />

        <Modal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title="担当コース変更">
          <div className="space-y-4">
            <p className="text-sm text-slate-500">交換可能なコース一覧</p>
            <div className="space-y-2">
              {swappableCourses.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm">交換可能なコースはありません</div>
              ) : (
                swappableCourses.map(course => (
                  <button key={course.id} onClick={() => handleChangeCourse(course.id)} className="w-full bg-white border border-slate-200 hover:bg-slate-50 p-4 rounded-xl text-left shadow-sm active:scale-[0.99] transition-all">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{course.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{course.area}</div>
                      </div>
                      <i className="fa-solid fa-arrow-right-arrow-left text-slate-300"></i>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Modal>

        <Modal isOpen={isVehicleModalOpen} onClose={() => setVehicleModalOpen(false)} title="車両乗り換え">
          <div className="space-y-4">
            <p className="text-sm text-slate-500 font-bold">現在乗車中: <span className="text-primary">{user.vehicleName}</span></p>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs leading-relaxed border border-blue-100">
              <i className="fa-solid fa-circle-info mr-2"></i>
              未使用車両への交換に申請は不要です。選択すると即座に配車が変更されます。
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {availableVehicles.length === 0 ? (
                  <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 text-sm">空き車両はありません。</div>
              ) : (
                  availableVehicles.map(vehicle => (
                    <button key={vehicle.id} onClick={() => handleVehicleChange(vehicle)} className="w-full bg-white border border-slate-200 hover:bg-slate-50 p-4 rounded-xl text-left shadow-sm active:scale-[0.99] transition-all">
                      <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-slate-800 flex items-center">
                              <i className="fa-solid fa-truck text-slate-400 mr-2"></i>{vehicle.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded">{vehicle.plateNumber}</div>
                          </div>
                          <i className="fa-solid fa-arrow-right-arrow-left text-slate-300"></i>
                      </div>
                    </button>
                  ))
              )}
            </div>
            <Button variant="secondary" onClick={() => setVehicleModalOpen(false)}>キャンセル</Button>
          </div>
        </Modal>

        <Modal isOpen={isSOSModalOpen} onClose={() => setIsSOSModalOpen(false)} title="トラブル・救援">
          <SOSContent step={sosStep} onSelectType={handleSOSTypeSelect} onClose={() => setIsSOSModalOpen(false)} />
        </Modal>

        <Modal isOpen={isTransferModalOpen} onClose={() => { setIsTransferModalOpen(false); setTransferStep('SELECT'); }} title={transferStep === 'SELECT' ? "案件の譲渡・交換" : "連絡と申請"}>
          {transferStep === 'SELECT' && (
             <div className="space-y-4">
               <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <span className="text-xs font-bold text-slate-400 block mb-1">対象案件</span>
                   <div className="font-bold text-slate-800">{selectedStopForTransfer?.customerName}</div>
               </div>
               <div>
                   <p className="text-sm font-bold text-slate-500 mb-2">依頼先の同僚</p>
                   <div className="space-y-2">
                     {MOCK_COLLEAGUES.map(colleague => (
                         <button key={colleague.id} onClick={() => handleSelectColleague(colleague)} className="w-full bg-white border border-slate-200 hover:bg-slate-50 p-3 rounded-xl flex items-center justify-between transition-colors group">
                           <div className="flex items-center">
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${colleague.status === DriverStatus.IDLE ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {colleague.name.slice(0,1)}
                               </div>
                               <div className="text-left">
                                 <div className="font-bold text-sm text-slate-800">{colleague.name}</div>
                                 <div className="text-xs text-slate-400">{colleague.distance} - {colleague.status}</div>
                               </div>
                           </div>
                           <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-primary"></i>
                         </button>
                     ))}
                   </div>
               </div>
             </div>
          )}
          {transferStep === 'CONFIRM' && selectedColleagueForTransfer && (
             <div className="space-y-6 text-center pt-2">
                <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                   <i className="fa-solid fa-phone text-3xl animate-pulse"></i>
                </div>
                <div className="space-y-2">
                   <h3 className="font-bold text-lg text-slate-800">{selectedColleagueForTransfer.name} さんに連絡</h3>
                   <p className="text-sm text-slate-500">必ず電話で状況を説明してから申請してください。</p>
                </div>
                <div className="flex grid gap-3">
                   <Button onClick={handleExecuteTransfer} className="bg-green-600 hover:bg-green-700">
                      <i className="fa-solid fa-phone mr-2"></i>電話発信して申請
                   </Button>
                   <button onClick={() => setTransferStep('SELECT')} className="text-sm text-slate-400 font-bold underline py-2">同僚選択に戻る</button>
                </div>
             </div>
          )}
        </Modal>

        <Modal isOpen={isIncomingRequestModalOpen} onClose={() => setIsIncomingRequestModalOpen(false)} title="交換依頼が届いています">
          {incomingRequest && (
            <div className="space-y-6">
                <div className="flex flex-col items-center py-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-2 animate-bounce">
                      <i className="fa-solid fa-bell text-2xl"></i>
                  </div>
                  <div className="font-bold text-lg text-slate-800">{incomingRequest.colleagueName}</div>
                </div>
                <Card className="bg-blue-50 border-blue-200">
                  <div className="text-xs font-bold text-blue-400 mb-1">依頼案件</div>
                  <div className="font-bold text-blue-900 text-lg">{incomingRequest.stopName}</div>
                </Card>
                <div className="flex space-x-3">
                  <Button variant="secondary" onClick={handleRejectIncoming}>却下</Button>
                  <Button onClick={handleApproveIncoming}>承認して追加</Button>
                </div>
            </div>
          )}
        </Modal>
      </Layout>
    </HelpProvider>
  );
}
