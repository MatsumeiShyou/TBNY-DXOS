import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { InspectionPage } from './pages/InspectionPage';
import { RouteListPage } from './pages/RouteListPage';
import { StopDetailPage } from './pages/StopDetailPage';
import { EndShiftPage } from './pages/EndShiftPage';
import { ReportPage } from './pages/ReportPage';
import { MenuPage } from './pages/MenuPage';
import { CURRENT_USER, ADMIN_PHONE_NUMBER, MOCK_COLLEAGUES, MOCK_VEHICLES } from './constants'; 
import type { Stop, User, Vehicle, RouteInfo, Colleague, CargoItem } from './types';
import { StopStatus, DriverStatus } from './types';
import { Modal, Button, Card } from './components/Widgets';
import { HelpProvider } from './components/Help';

// Dummy stubs for Supabase logic (to be linked to Bridge later)
const fetchAllRoutes = async (): Promise<RouteInfo[]> => {
  return [
    { id: 'r-1', name: '東京エリア通常', area: '東京都心部' },
    { id: 'r-2', name: '埼玉ルートB', area: 'さいたま市' },
    { id: 'r-3', name: '横浜・川崎定期便', area: '神奈川県' },
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
  <div className="tw-p-4 tw-space-y-4">
    <h2 className="tw-text-xl tw-font-bold">給油報告</h2>
    <div className="tw-bg-white tw-p-6 tw-rounded-xl tw-border tw-border-dashed tw-border-slate-300 tw-text-center tw-space-y-4">
      <i className="fa-solid fa-camera tw-text-4xl tw-text-slate-300"></i>
      <p className="tw-font-bold tw-text-slate-600">レシートを撮影</p>
      <button className="tw-bg-slate-800 tw-text-white tw-px-6 tw-py-3 tw-rounded-xl tw-font-bold">カメラを起動</button>
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
      <div className="tw-space-y-4 tw-animate-fade-in tw-pb-4">
          <div className="tw-bg-red-50 tw-border-l-4 tw-border-red-500 tw-p-4 tw-rounded-r-xl">
              <h3 className="tw-font-bold tw-text-red-700 tw-text-lg tw-flex tw-items-center">
                <i className="fa-solid fa-truck-medical tw-mr-2"></i>人命救助最優先
              </h3>
              <p className="tw-text-sm tw-text-red-600 tw-mt-1">けが人がいる場合は、迷わず救急車を呼んでください。</p>
          </div>
          <div className="tw-grid tw-gap-4">
              <a href="tel:119" className="tw-block tw-w-full tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-rounded-xl tw-shadow-lg tw-shadow-red-900/20 tw-p-6 tw-text-center active:tw-scale-[0.98] tw-transition-transform tw-flex tw-items-center tw-justify-between tw-group">
                  <div className="tw-text-left">
                      <div className="tw-text-2xl tw-font-bold">119番</div>
                      <div className="tw-text-sm tw-opacity-90 tw-font-bold">救急車・消防</div>
                  </div>
                  <div className="tw-w-12 tw-h-12 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center group-hover:tw-bg-white/30 tw-animate-pulse">
                      <i className="fa-solid fa-kit-medical tw-text-2xl"></i>
                  </div>
              </a>
              <a href="tel:110" className="tw-block tw-w-full tw-bg-blue-600 hover:tw-bg-blue-700 tw-text-white tw-rounded-xl tw-shadow-lg tw-shadow-blue-900/20 tw-p-5 tw-text-center active:tw-scale-[0.98] tw-transition-transform tw-flex tw-items-center tw-justify-between tw-group">
                  <div className="tw-text-left">
                      <div className="tw-text-xl tw-font-bold">110番</div>
                      <div className="tw-text-sm tw-opacity-90 tw-font-bold">警察への通報</div>
                  </div>
                  <div className="tw-w-10 tw-h-10 tw-bg-white/20 tw-rounded-full tw-flex tw-items-center tw-justify-center group-hover:tw-bg-white/30">
                      <i className="fa-solid fa-shield-halved tw-text-xl"></i>
                  </div>
              </a>
              <div className="tw-relative tw-flex tw-py-2 tw-items-center">
                  <div className="tw-flex-grow tw-border-t tw-border-slate-200"></div>
                  <span className="tw-flex-shrink-0 tw-mx-4 tw-text-slate-400 tw-text-xs tw-font-bold">報告</span>
                  <div className="tw-flex-grow tw-border-t tw-border-slate-200"></div>
              </div>
              <a href={`tel:${ADMIN_PHONE_NUMBER}`} className="tw-block tw-w-full tw-bg-white tw-border tw-border-slate-300 tw-text-slate-700 tw-rounded-xl tw-p-4 tw-text-center active:tw-bg-slate-50 tw-font-bold tw-flex tw-items-center tw-justify-center">
                  <i className="fa-solid fa-phone tw-mr-2"></i> 管理者へ連絡
              </a>
          </div>
          <button onClick={() => onSelectType('BACK')} className="tw-text-sm tw-text-slate-400 tw-w-full tw-py-2 tw-underline hover:tw-text-slate-600">
              メニューに戻る
          </button>
      </div>
    );
  }

  if (step === 'SEARCHING') {
    return (
      <div className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-12 tw-space-y-6 tw-animate-fade-in">
        <div className="tw-relative">
          <div className="tw-w-20 tw-h-20 tw-border-4 tw-border-blue-100 tw-border-t-primary tw-rounded-full tw-animate-spin"></div>
          <div className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center">
             <i className="fa-solid fa-satellite-dish tw-text-2xl tw-text-primary tw-animate-pulse"></i>
          </div>
        </div>
        <div className="tw-text-center tw-space-y-2">
          <h3 className="tw-text-xl tw-font-bold tw-text-slate-800">応援車両を検索中...</h3>
          <p className="tw-text-sm tw-text-slate-500">現在位置から救援可能な車両を探しています。<br/>そのままお待ちください。</p>
        </div>
      </div>
    );
  }

  if (step === 'RESULT_CALL') {
    return (
      <div className="tw-space-y-6 tw-text-center tw-py-2 tw-animate-fade-in">
        <div className="tw-bg-yellow-50 tw-border tw-border-yellow-200 tw-rounded-xl tw-p-4 tw-flex tw-items-start tw-text-left tw-mb-6">
           <i className="fa-solid fa-circle-exclamation tw-text-yellow-600 tw-text-xl tw-mt-1 tw-mr-3 tw-shrink-0"></i>
           <div>
              <h3 className="tw-font-bold tw-text-yellow-900 tw-text-lg">近くに対応可能な車両がいません</h3>
              <p className="tw-text-sm tw-text-yellow-800 tw-mt-1 tw-leading-relaxed">
                システムによる自動調整が成立しませんでした。<br/>
                配車担当者に直接連絡し、指示を仰いでください。
              </p>
           </div>
        </div>
        <div className="tw-py-2">
          <a href={`tel:${ADMIN_PHONE_NUMBER}`} className="tw-group tw-block tw-w-full tw-bg-red-600 hover:tw-bg-red-700 tw-text-white tw-rounded-xl tw-shadow-xl tw-shadow-red-900/20 active:tw-scale-[0.98] tw-transition-all tw-overflow-hidden tw-relative">
            <div className="tw-absolute tw-inset-0 tw-bg-white/10 group-hover:tw-bg-white/20 tw-transition-colors"></div>
            <div className="tw-p-6 tw-flex tw-flex-col tw-items-center tw-justify-center">
               <i className="fa-solid fa-phone-volume tw-text-4xl tw-mb-2 tw-animate-pulse"></i>
               <span className="tw-text-2xl tw-font-bold">管理者へ発信</span>
               <span className="tw-font-mono tw-text-lg tw-opacity-90 tw-mt-1">{ADMIN_PHONE_NUMBER}</span>
            </div>
          </a>
          <p className="tw-text-xs tw-text-slate-400 tw-mt-3">※ワンタップで発信します</p>
        </div>
        <button onClick={onClose} className="tw-text-sm tw-text-slate-400 tw-font-bold tw-underline tw-p-4 hover:tw-text-slate-600">
          閉じる
        </button>
      </div>
    );
  }

  return (
    <div className="tw-space-y-4 tw-animate-fade-in">
      <div className="tw-bg-blue-50 tw-p-4 tw-rounded-xl tw-border tw-border-blue-100 tw-flex tw-items-start tw-text-blue-900 tw-mb-2">
        <i className="fa-solid fa-circle-info tw-mt-1 tw-mr-3 tw-text-lg tw-shrink-0"></i>
        <div className="tw-text-sm">
          <p className="tw-font-bold">どのようなトラブルですか？</p>
          <p>状況に応じて、システムが最適な対応方法を案内します。</p>
        </div>
      </div>
      <div className="tw-grid tw-grid-cols-1 tw-gap-3">
        <button onClick={() => onSelectType('DELAY')} className="tw-bg-white tw-border-2 tw-border-slate-200 hover:tw-border-orange-400 hover:tw-bg-orange-50 tw-p-5 tw-rounded-xl tw-text-left tw-flex tw-items-center tw-transition-all tw-group active:tw-scale-[0.99] tw-touch-manipulation">
          <div className="tw-w-14 tw-h-14 tw-bg-orange-100 tw-text-orange-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-4 group-hover:tw-bg-orange-600 group-hover:tw-text-white tw-transition-colors tw-shrink-0">
            <i className="fa-solid fa-clock-rotate-left tw-text-2xl"></i>
          </div>
          <div className="tw-flex-1">
            <div className="tw-font-bold tw-text-slate-800 tw-text-lg">遅延・荷量オーバー</div>
            <div className="tw-text-xs tw-text-slate-500 tw-mt-0.5">時間に間に合わない、積みきれない等</div>
          </div>
          <i className="fa-solid fa-chevron-right tw-ml-2 tw-text-slate-300"></i>
        </button>
        <button onClick={() => onSelectType('TROUBLE')} className="tw-bg-white tw-border-2 tw-border-slate-200 hover:tw-border-slate-500 hover:tw-bg-slate-50 tw-p-5 tw-rounded-xl tw-text-left tw-flex tw-items-center tw-transition-all tw-group active:tw-scale-[0.99] tw-touch-manipulation">
          <div className="tw-w-14 tw-h-14 tw-bg-slate-100 tw-text-slate-600 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-4 group-hover:tw-bg-slate-600 group-hover:tw-text-white tw-transition-colors tw-shrink-0">
            <i className="fa-solid fa-wrench tw-text-2xl"></i>
          </div>
          <div className="tw-flex-1">
            <div className="tw-font-bold tw-text-slate-800 tw-text-lg">車両故障・トラブル</div>
            <div className="tw-text-xs tw-text-slate-500 tw-mt-0.5">パンク、バッテリー上がり、事故以外</div>
          </div>
          <i className="fa-solid fa-chevron-right tw-ml-2 tw-text-slate-300"></i>
        </button>
        <button onClick={() => onSelectType('ACCIDENT')} className="tw-bg-red-50 tw-border-2 tw-border-red-100 hover:tw-bg-red-100 tw-p-5 tw-rounded-xl tw-text-left tw-flex tw-items-center tw-transition-all tw-mt-4 active:tw-scale-[0.99] tw-touch-manipulation tw-group tw-w-full">
          <div className="tw-w-14 tw-h-14 tw-bg-red-600 tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-4 tw-animate-pulse tw-shrink-0">
            <i className="fa-solid fa-car-burst tw-text-2xl"></i>
          </div>
          <div className="tw-flex-1">
            <div className="tw-font-bold tw-text-red-700 tw-text-lg">交通事故・人身事故</div>
            <div className="tw-text-xs tw-text-red-600 tw-font-bold tw-mt-0.5">救急・警察への連絡はこちら</div>
          </div>
          <i className="fa-solid fa-chevron-right tw-ml-2 tw-text-red-300"></i>
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
      case 'end': return <EndShiftPage stops={stops} currentVehicle={currentVehicleObj} workStartTime={workStartTime} mode={endShiftMode} onComplete={handleEndShiftComplete} onCancel={() => setView(endShiftMode === 'INTERMEDIATE' ? 'route' : 'report')} />;
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
          <div className="tw-space-y-4">
            <p className="tw-text-sm tw-text-slate-500">交換可能なコース一覧</p>
            <div className="tw-space-y-2">
              {swappableCourses.length === 0 ? (
                <div className="tw-text-center tw-py-4 tw-text-slate-400 tw-text-sm">交換可能なコースはありません</div>
              ) : (
                swappableCourses.map(course => (
                  <button key={course.id} onClick={() => handleChangeCourse(course.id)} className="tw-w-full tw-bg-white tw-border tw-border-slate-200 hover:tw-bg-slate-50 tw-p-4 tw-rounded-xl tw-text-left tw-shadow-sm active:tw-scale-[0.99] tw-transition-all">
                    <div className="tw-flex tw-justify-between tw-items-center">
                      <div>
                        <div className="tw-font-bold tw-text-slate-800">{course.name}</div>
                        <div className="tw-text-xs tw-text-slate-500 tw-mt-1">{course.area}</div>
                      </div>
                      <i className="fa-solid fa-arrow-right-arrow-left tw-text-slate-300"></i>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </Modal>

        <Modal isOpen={isVehicleModalOpen} onClose={() => setVehicleModalOpen(false)} title="車両乗り換え">
          <div className="tw-space-y-4">
            <p className="tw-text-sm tw-text-slate-500 tw-font-bold">現在乗車中: <span className="tw-text-primary">{user.vehicleName}</span></p>
            <div className="tw-bg-blue-50 tw-text-blue-800 tw-p-3 tw-rounded-lg tw-text-xs tw-leading-relaxed tw-border tw-border-blue-100">
              <i className="fa-solid fa-circle-info tw-mr-2"></i>
              未使用車両への交換に申請は不要です。選択すると即座に配車が変更されます。
            </div>
            <div className="tw-space-y-2 tw-max-h-[50vh] tw-overflow-y-auto">
              {availableVehicles.length === 0 ? (
                  <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-lg tw-text-yellow-800 tw-text-sm">空き車両はありません。</div>
              ) : (
                  availableVehicles.map(vehicle => (
                    <button key={vehicle.id} onClick={() => handleVehicleChange(vehicle)} className="tw-w-full tw-bg-white tw-border tw-border-slate-200 hover:tw-bg-slate-50 tw-p-4 tw-rounded-xl tw-text-left tw-shadow-sm active:tw-scale-[0.99] tw-transition-all">
                      <div className="tw-flex tw-justify-between tw-items-center">
                          <div>
                            <div className="tw-font-bold tw-text-slate-800 tw-flex tw-items-center">
                              <i className="fa-solid fa-truck tw-text-slate-400 tw-mr-2"></i>{vehicle.name}
                            </div>
                            <div className="tw-text-xs tw-text-slate-500 tw-mt-1 tw-font-mono tw-bg-slate-100 tw-inline-block tw-px-2 tw-py-0.5 tw-rounded">{vehicle.plateNumber}</div>
                          </div>
                          <i className="fa-solid fa-arrow-right-arrow-left tw-text-slate-300"></i>
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
             <div className="tw-space-y-4">
               <div className="tw-bg-slate-50 tw-p-3 tw-rounded-lg tw-border tw-border-slate-200">
                   <span className="tw-text-xs tw-font-bold tw-text-slate-400 tw-block tw-mb-1">対象案件</span>
                   <div className="tw-font-bold tw-text-slate-800">{selectedStopForTransfer?.customerName}</div>
               </div>
               <div>
                   <p className="tw-text-sm tw-font-bold tw-text-slate-500 tw-mb-2">依頼先の同僚</p>
                   <div className="tw-space-y-2">
                     {MOCK_COLLEAGUES.map(colleague => (
                         <button key={colleague.id} onClick={() => handleSelectColleague(colleague)} className="tw-w-full tw-bg-white tw-border tw-border-slate-200 hover:tw-bg-slate-50 tw-p-3 tw-rounded-xl tw-flex tw-items-center tw-justify-between tw-transition-colors tw-group">
                           <div className="tw-flex tw-items-center">
                               <div className={`tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-bold tw-mr-3 ${colleague.status === DriverStatus.IDLE ? 'tw-bg-green-100 tw-text-green-600' : 'tw-bg-slate-100 tw-text-slate-600'}`}>
                                 {colleague.name.slice(0,1)}
                               </div>
                               <div className="tw-text-left">
                                 <div className="tw-font-bold tw-text-sm tw-text-slate-800">{colleague.name}</div>
                                 <div className="tw-text-xs tw-text-slate-400">{colleague.distance} - {colleague.status}</div>
                               </div>
                           </div>
                           <i className="fa-solid fa-chevron-right tw-text-slate-300 group-hover:tw-text-primary"></i>
                         </button>
                     ))}
                   </div>
               </div>
             </div>
          )}
          {transferStep === 'CONFIRM' && selectedColleagueForTransfer && (
             <div className="tw-space-y-6 tw-text-center tw-pt-2">
                <div className="tw-w-20 tw-h-20 tw-bg-primary tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-shadow-lg">
                   <i className="fa-solid fa-phone tw-text-3xl tw-animate-pulse"></i>
                </div>
                <div className="tw-space-y-2">
                   <h3 className="tw-font-bold tw-text-lg tw-text-slate-800">{selectedColleagueForTransfer.name} さんに連絡</h3>
                   <p className="tw-text-sm tw-text-slate-500">必ず電話で状況を説明してから申請してください。</p>
                </div>
                <div className="tw-flex tw-grid tw-gap-3">
                   <Button onClick={handleExecuteTransfer} className="tw-bg-green-600 hover:tw-bg-green-700">
                      <i className="fa-solid fa-phone tw-mr-2"></i>電話発信して申請
                   </Button>
                   <button onClick={() => setTransferStep('SELECT')} className="tw-text-sm tw-text-slate-400 tw-font-bold tw-underline tw-py-2">同僚選択に戻る</button>
                </div>
             </div>
          )}
        </Modal>

        <Modal isOpen={isIncomingRequestModalOpen} onClose={() => setIsIncomingRequestModalOpen(false)} title="交換依頼が届いています">
          {incomingRequest && (
            <div className="tw-space-y-6">
                <div className="tw-flex tw-flex-col tw-items-center tw-py-4">
                  <div className="tw-w-16 tw-h-16 tw-rounded-full tw-bg-blue-100 tw-text-primary tw-flex tw-items-center tw-justify-center tw-mb-2 tw-animate-bounce">
                      <i className="fa-solid fa-bell tw-text-2xl"></i>
                  </div>
                  <div className="tw-font-bold tw-text-lg tw-text-slate-800">{incomingRequest.colleagueName}</div>
                </div>
                <Card className="tw-bg-blue-50 tw-border-blue-200">
                  <div className="tw-text-xs tw-font-bold tw-text-blue-400 tw-mb-1">依頼案件</div>
                  <div className="tw-font-bold tw-text-blue-900 tw-text-lg">{incomingRequest.stopName}</div>
                </Card>
                <div className="tw-flex tw-space-x-3">
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
