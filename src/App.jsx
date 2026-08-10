
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Calendar, 
  Search, 
  X, 
  GripVertical, 
  Clock, 
  Database, 
  AlertTriangle, 
  Ban, 
  Edit3, 
  Trash2, 
  Undo2, 
  Redo2, 
  Menu 
} from 'lucide-react';

import {
  COLOR_PALETTE,
  MASTER_DRIVERS_LIST,
  MASTER_VEHICLES_LIST,
  CUSTOMERS,
  MASTER_ITEMS_LIST,
  INITIAL_DRIVERS,
  TIME_SLOTS,
  INITIAL_JOBS,
  QUARTER_HEIGHT_REM,
  PIXELS_PER_REM,
  CELL_HEIGHT_PX
} from './data/constants';
import { timeToMinutes, minutesToTime } from './utils/timeUtils';
import { useHistory } from './hooks/useHistory';

import Header from './components/Header';
import TimeAxis from './components/TimeAxis';
import DriverColumnHeader from './components/DriverColumnHeader';
import EditModal from './components/EditModal';
import PendingJobsModal from './components/PendingJobsModal';
import JobCard from './components/JobCard';
import SplitLine from './components/SplitLine';
import CourseManagementModal from './components/CourseManagementModal';
import WorkerManagementModal from './components/WorkerManagementModal';
import VehicleManagementModal from './components/VehicleManagementModal';
import CustomerManagementModal from './components/CustomerManagementModal';
import ItemManagementModal from './components/ItemManagementModal';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import SettingsModal from './components/SettingsModal';
import { storageService } from './services/storageService';

// 初期マスターデータ（workersマスタ）
const INITIAL_WORKERS = [
  { id: 'w_hatazawa', name: '畑澤', kana: 'はたざわ', license_types: ['普通', '中型', '大型'], is_active: true },
  { id: 'w_kikuchi', name: '菊地', kana: 'きくち', license_types: ['普通', '中型'], is_active: true },
  { id: 'w_banri', name: '万里', kana: 'ばんり', license_types: ['普通', '中型'], is_active: true },
  { id: 'w_katayama', name: '片山', kana: 'かたやま', license_types: ['普通', '中型', '大型'], is_active: true },
  { id: 'w_daiki', name: '大貴', kana: 'だいき', license_types: ['普通'], is_active: true },
  { id: 'w_suzuki', name: '鈴木', kana: 'すずき', license_types: ['普通', '中型'], is_active: true },
  { id: 'w_sato', name: '佐藤', kana: 'さとう', license_types: ['普通'], is_active: true },
  { id: 'w_tanaka', name: '田中', kana: 'たなか', license_types: ['普通', '中型'], is_active: true },
];

// 初期マスターデータ（vehiclesマスタ）
const INITIAL_VEHICLES = [
  { id: 'v_2025pk', name: '2025PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_2267pk', name: '2267PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_2618pk', name: '2618PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_5122pk', name: '5122PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_1111pk', name: '1111PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_seino', name: '西濃運輸', vehicle_type: 'flat_4t', max_capacity_kg: 4000 },
  { id: 'v_spare', name: '予備車', vehicle_type: 'other', max_capacity_kg: null },
  { id: 'v_rental', name: 'レンタカー', vehicle_type: 'rental', max_capacity_kg: null },
];

const INITIAL_ITEMS = MASTER_ITEMS_LIST.map((item, i) => ({
  id: `item_init_${i}`,
  name: item.name,
  kana: item.kana,
  requiredVehicle: '',
  estimatedDuration: 0
}));

// ==========================================
// 3. メインコンポEネンチE
// ==========================================
export default function App() {
  
  // --- State ---
  const initialState = storageService.loadState();
  const [drivers, setDrivers] = useState(initialState.drivers);
  const [jobs, setJobs] = useState(initialState.jobs);
  const [pendingJobs, setPendingJobs] = useState(initialState.pendingJobs); 
  const [splits, setSplits] = useState(initialState.splits);
  const [monthlySchedules, setMonthlySchedules] = useState(initialState.monthlySchedules || {});

  // 履歴管琁Etate
  const { history, recordHistory, undo, redo } = useHistory(
    { jobs, pendingJobs, splits, drivers, monthlySchedules },
    { setJobs, setPendingJobs, setSplits, setDrivers, setMonthlySchedules }
  );

  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // 編雁Eーダル用State
  const [editModal, setEditModal] = useState(null);
  
  // コース管理モーダル用State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // サイドバー用State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // マスタ管理モーダル用State
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // === マスタデータの読み込み ===
  const initialMaster = storageService.loadMasterData(INITIAL_WORKERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS);
  const [masterWorkers, setMasterWorkers] = useState(initialMaster.workers);
  const [masterVehicles, setMasterVehicles] = useState(initialMaster.vehicles);
  const [masterCustomers, setMasterCustomers] = useState(initialMaster.customers);
  const [masterItems, setMasterItems] = useState(initialMaster.items);
  const [systemSettings, setSystemSettings] = useState(initialMaster.systemSettings || { holidays: [] });

  // === ビューモード (dispatch | calendar) ===
  const [viewMode, setViewMode] = useState('dispatch');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // --- マスタCRUDハンドラ ---
  const handleSaveWorker = (workerData, isEdit) => {
    if (isEdit) {
      setMasterWorkers(prev => prev.map(w => w.id === workerData.id ? workerData : w));
    } else {
      setMasterWorkers(prev => [...prev, workerData]);
    }
  };
  const handleDeleteWorker = (id) => {
    setMasterWorkers(prev => prev.filter(w => w.id !== id));
  };
  const handleSaveVehicle = (vehicleData, isEdit) => {
    if (isEdit) {
      setMasterVehicles(prev => prev.map(v => v.id === vehicleData.id ? vehicleData : v));
    } else {
      setMasterVehicles(prev => [...prev, vehicleData]);
    }
  };
  const handleDeleteVehicle = (id) => {
    setMasterVehicles(prev => prev.filter(v => v.id !== id));
  };
  const handleSaveCustomer = (customerData) => {
    setMasterCustomers(prev => {
      const exists = prev.find(c => c.id === customerData.id);
      if (exists) {
        return prev.map(c => c.id === customerData.id ? customerData : c);
      }
      return [...prev, customerData];
    });
  };
  const handleDeleteCustomer = (id) => {
    setMasterCustomers(prev => prev.filter(c => c.id !== id));
  };
  const handleSaveItems = (newItems) => {
    setMasterItems(newItems);
  };
  const handleDeleteItem = (id) => {
    setMasterItems(prev => prev.filter(i => i.id !== id));
  };

  // ドラチE & リサイズ管琁E
  const [draggingJobId, setDraggingJobId] = useState(null);
  const [draggingSplitId, setDraggingSplitId] = useState(null);
  const [dragButton, setDragButton] = useState(null);
  const [dropPreview, setDropPreview] = useState(null);
  const [dropSplitPreview, setDropSplitPreview] = useState(null);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 });
  const [dragMousePos, setDragMousePos] = useState({ x: 0, y: 0 });
  
  const [resizingState, setResizingState] = useState(null);

  const driverColRefs = useRef({});

  // ----------------------------------------
  // コース管琁EジチE
  // ----------------------------------------
  const handleAddCourse = ({ course, name, currentVehicle, color }) => {
    recordHistory();
    const newId = `d_${Date.now()}`;
    const newDriver = {
      id: newId,
      course,
      name,
      currentVehicle,
      color,
      defaultSplit: null
    };
    setDrivers(prev => [...prev, newDriver]);
  };

  const handleDeleteCourse = (driverId) => {
    recordHistory();
    
    // 対象列にあるジョブを未配車リストへ
    const jobsToRescue = jobs.filter(j => j.driverId === driverId);
    if (jobsToRescue.length > 0) {
      setPendingJobs(prev => [...prev, ...jobsToRescue.map(j => ({
        ...j,
        id: `p_rescued_${j.id}_${Date.now()}`,
        preferredTime: j.startTime, // 允EE開始時間を希望時間に
        note: `(コース削除による返却)`,
      }))]);
    }
    
    // ジョブとスプリチEから対象ドライバEを削除
    setJobs(prev => prev.filter(j => j.driverId !== driverId));
    setSplits(prev => prev.filter(s => s.driverId !== driverId));
    
    // ドライバE本体を削除
    setDrivers(prev => prev.filter(d => d.id !== driverId));
  };

  // ----------------------------------------
  // 状態E自動保孁E
  // ----------------------------------------
  useEffect(() => {
    storageService.saveState({ drivers, jobs, pendingJobs, splits, monthlySchedules });
  }, [drivers, jobs, pendingJobs, splits, monthlySchedules]);

  // マスターデータの自動保存
  useEffect(() => {
    storageService.saveMasterData({ workers: masterWorkers, vehicles: masterVehicles, customers: masterCustomers, items: masterItems, systemSettings });
  }, [masterWorkers, masterVehicles, masterCustomers, masterItems, systemSettings]);

  // ----------------------------------------
  // Smart Coloring Logic
  // ----------------------------------------
  const jobColorMap = useMemo(() => {
    const map = {};
    const paletteLength = COLOR_PALETTE.length;
    const driverOrder = drivers.map(d => d.id);
    
    const sortedJobs = [...jobs].sort((a, b) => {
      const driverIndexA = driverOrder.indexOf(a.driverId);
      const driverIndexB = driverOrder.indexOf(b.driverId);
      if (driverIndexA !== driverIndexB) return driverIndexA - driverIndexB;
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    let globalColorIndex = 0;

    sortedJobs.forEach(job => {
      let candidateIndex = globalColorIndex;
      const avoidIndices = new Set();

      const currentJobStart = timeToMinutes(job.startTime);
      const prevJobInCol = sortedJobs
        .filter(j => j.driverId === job.driverId && timeToMinutes(j.startTime) < currentJobStart)
        .pop(); 

      if (prevJobInCol && map[prevJobInCol.id]) {
        const prevIdx = COLOR_PALETTE.indexOf(map[prevJobInCol.id]);
        if (prevIdx >= 0) avoidIndices.add(prevIdx);
      }

      const myDriverIdx = driverOrder.indexOf(job.driverId);
      if (myDriverIdx > 0) {
        const leftDriverId = driverOrder[myDriverIdx - 1];
        const currentJobEnd = currentJobStart + job.duration;
        const leftJobs = sortedJobs.filter(j => j.driverId === leftDriverId);
        
        leftJobs.forEach(leftJob => {
          const lStart = timeToMinutes(leftJob.startTime);
          const lEnd = lStart + leftJob.duration;
          if (currentJobStart < lEnd && currentJobEnd > lStart) {
             if (map[leftJob.id]) {
               const leftIdx = COLOR_PALETTE.indexOf(map[leftJob.id]);
               if (leftIdx >= 0) avoidIndices.add(leftIdx);
             }
          }
        });
      }

      let loopCount = 0;
      while (avoidIndices.has(candidateIndex) && loopCount < paletteLength) {
        candidateIndex = (candidateIndex + 1) % paletteLength;
        loopCount++;
      }

      map[job.id] = COLOR_PALETTE[candidateIndex];
      globalColorIndex = (candidateIndex + 1) % paletteLength;
    });

    return map;
  }, [jobs, drivers]);





  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (((e.ctrlKey || e.metaKey) && e.key === 'y') || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        redo();
        return;
      }
      if (editModal || selectedCell) return;
      if (!selectedJobId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteJob(selectedJobId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedJobId, jobs, editModal, selectedCell, undo, redo]); 

  // ----------------------------------------
  // アクション処琁E
  // ----------------------------------------
  const handleDeleteJob = (jobId) => {
    recordHistory(); 
    const targetJob = jobs.find(j => j.id === jobId);
    if (targetJob) {
      setPendingJobs(prev => [...prev, targetJob]);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      setSelectedJobId(null);
    }
  };

  const openHeaderEdit = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return;
    setEditModal({
      isOpen: true,
      type: 'header',
      targetId: driverId,
      initialDriverName: driver.name,
      initialVehicle: driver.currentVehicle
    });
  };

  const openSplitEdit = (e, driverId, time) => {
    e.stopPropagation(); 
    if (draggingSplitId) return;
    const split = splits.find(s => s.driverId === driverId && s.time === time);
    const driver = drivers.find(d => d.id === driverId);
    setEditModal({
      isOpen: true,
      type: 'split',
      targetId: driverId,
      time: time,
      initialDriverName: split ? split.driverName : (driver?.name || ''),
      initialVehicle: split ? split.vehicle : (driver?.currentVehicle || '')
    });
  };

  const handleSaveEdit = (newName, newVehicle) => {
    if (!editModal) return;
    recordHistory();
    if (editModal.type === 'header') {
      setDrivers(prev => prev.map(d => d.id === editModal.targetId ? { ...d, name: newName, currentVehicle: newVehicle } : d));
    } else if (editModal.type === 'split' && editModal.time) {
      setSplits(prev => {
        const idx = prev.findIndex(s => s.driverId === editModal.targetId && s.time === editModal.time);
        if (idx >= 0) {
          const newSplits = [...prev];
          newSplits[idx] = { ...newSplits[idx], driverName: newName, vehicle: newVehicle };
          return newSplits;
        } else {
          return [...prev, { id: `split_${editModal.targetId}_${Date.now()}`, driverId: editModal.targetId, time: editModal.time, driverName: newName, vehicle: newVehicle }];
        }
      });
    }
    setEditModal(null);
  };

  const handleDeleteSplit = () => {
    if (!editModal || editModal.type !== 'split' || !editModal.time) return;
    recordHistory();
    setSplits(prev => prev.filter(s => !(s.driverId === editModal.targetId && s.time === editModal.time)));
    setEditModal(null);
  };

  const handleContextMenu = (e, driverId, time) => {
    e.preventDefault();
    if (draggingJobId || draggingSplitId) return;
    recordHistory();
    setSplits(prev => {
        const existingIndex = prev.findIndex(s => s.driverId === driverId && s.time === time);
        if (existingIndex >= 0) {
            return prev.filter((_, i) => i !== existingIndex);
        } else {
            const driver = drivers.find(d => d.id === driverId);
            return [...prev, { id: `split_${driverId}_${Date.now()}`, driverId, time, driverName: driver?.name || '未定', vehicle: driver?.currentVehicle || '車両' }];
        }
    });
  };

  // ----------------------------------------
  // ドロチEE判定ロジチE
  // ----------------------------------------
  const calculateDropTarget = (currentX, currentY, targetJobId) => {
    const targetJob = jobs.find(j => j.id === targetJobId);
    if (!targetJob) return null;

    const moveYBlocks = Math.round(currentY / CELL_HEIGHT_PX);
    const moveYMinutes = moveYBlocks * 15;
    let newStartMin = timeToMinutes(targetJob.startTime) + moveYMinutes;
    newStartMin = Math.max(timeToMinutes('06:00'), Math.min(timeToMinutes('17:45'), newStartMin));
    const newStartTime = minutesToTime(newStartMin);

    let newDriverId = targetJob.driverId;
    Object.entries(driverColRefs.current).forEach(([dId, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (dragMousePos.x >= rect.left && dragMousePos.x <= rect.right) {
          newDriverId = dId;
        }
      }
    });

    let newDuration = targetJob.duration;
    let isOverlapError = false;

    const driverSplits = splits.filter(s => s.driverId === newDriverId);
    const splitAtStart = driverSplits.find(s => s.time === newStartTime);
    if (splitAtStart) isOverlapError = true;

    const otherJobs = jobs.filter(j => j.driverId === newDriverId && j.id !== targetJobId);
    const isStartOverlapping = otherJobs.some(other => {
      const s = timeToMinutes(other.startTime);
      const e = s + other.duration;
      return newStartMin >= s && newStartMin < e;
    });

    if (isStartOverlapping) {
      isOverlapError = true;
    } else {
      const tentativeEndMin = newStartMin + newDuration;
      let nearestObstacleStart = 99999; 
      const conflictingJob = otherJobs.find(other => {
        const s = timeToMinutes(other.startTime);
        return s >= newStartMin && s < tentativeEndMin;
      });
      if (conflictingJob) nearestObstacleStart = timeToMinutes(conflictingJob.startTime);

      const conflictingSplit = driverSplits.find(s => {
          const sMin = timeToMinutes(s.time);
          return sMin > newStartMin && sMin < tentativeEndMin;
      });
      if (conflictingSplit) {
          const sMin = timeToMinutes(conflictingSplit.time);
          if (sMin < nearestObstacleStart) nearestObstacleStart = sMin;
      }

      if (nearestObstacleStart !== 99999) {
          const availableDuration = nearestObstacleStart - newStartMin;
          if (availableDuration < 15) {
            isOverlapError = true;
            newDuration = 15; 
          } else {
            newDuration = availableDuration; 
          }
      } else if (dragButton === 2) {
          newDuration = 15;
      }
    }

    const driver = drivers.find(d => d.id === newDriverId);
    let currentVeh = driver?.currentVehicle;
    const sortedSplits = [...driverSplits].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    for (const split of sortedSplits) {
        if (timeToMinutes(split.time) <= newStartMin) currentVeh = split.vehicle;
        else break; 
    }

    let isVehicleError = false;
    if (targetJob.requiredVehicle && currentVeh && currentVeh !== targetJob.requiredVehicle) {
         isVehicleError = true;
    }

    return { driverId: newDriverId, startTime: newStartTime, duration: newDuration, isVehicleError, isOverlapError };
  };

  const calculateSplitDropTarget = (currentX, currentY, splitId) => {
    const targetSplit = splits.find(s => s.id === splitId);
    if (!targetSplit) return null;

    const moveYBlocks = Math.round(currentY / CELL_HEIGHT_PX);
    const moveYMinutes = moveYBlocks * 15;
    let newStartMin = timeToMinutes(targetSplit.time) + moveYMinutes;
    newStartMin = Math.max(timeToMinutes('06:00'), Math.min(timeToMinutes('17:45'), newStartMin));
    const newStartTime = minutesToTime(newStartMin);

    let newDriverId = targetSplit.driverId;
    Object.entries(driverColRefs.current).forEach(([dId, el]) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (dragMousePos.x >= rect.left && dragMousePos.x <= rect.right) newDriverId = dId;
      }
    });

    let isOverlapError = false;
    const jobsInCol = jobs.filter(j => j.driverId === newDriverId);
    const hasJobCollision = jobsInCol.some(j => {
        const s = timeToMinutes(j.startTime);
        const e = s + j.duration;
        return newStartMin >= s && newStartMin < e;
    });
    if (hasJobCollision) isOverlapError = true;

    const otherSplits = splits.filter(s => s.driverId === newDriverId && s.id !== splitId);
    const hasSplitCollision = otherSplits.some(s => s.time === newStartTime);
    if (hasSplitCollision) isOverlapError = true;

    return { driverId: newDriverId, time: newStartTime, isOverlapError };
  };

  // ----------------------------------------
  // マウスイベントハンドラ
  // ----------------------------------------
  useEffect(() => {
    const handleMouseMove = (e) => {
      setDragMousePos({ x: e.clientX, y: e.clientY });
      if (resizingState) {
        const deltaY = e.clientY - resizingState.startY;
        const deltaBlocks = Math.round(deltaY / CELL_HEIGHT_PX);
        const deltaMinutes = deltaBlocks * 15;
        setJobs(prev => prev.map(j => {
            if (j.id !== resizingState.id) return j;
            if (resizingState.direction === 'bottom') {
              const newDuration = Math.max(15, resizingState.originalDuration + deltaMinutes);
              return { ...j, duration: newDuration };
            } else {
              const originalStartMin = timeToMinutes(resizingState.originalStartTime);
              let newStartMin = originalStartMin + deltaMinutes;
              let newDuration = resizingState.originalDuration - deltaMinutes;
              if (newDuration < 15) {
                newDuration = 15;
                newStartMin = originalStartMin + (resizingState.originalDuration - 15);
              }
              return { ...j, startTime: minutesToTime(newStartMin), duration: newDuration };
            }
        }));
        return;
      }

      if (draggingJobId) {
        const currentX = e.clientX - dragOffset.x;
        const currentY = e.clientY - dragOffset.y;
        setDragCurrent({ x: currentX, y: currentY });
        setDropPreview(calculateDropTarget(currentX, currentY, draggingJobId));
      }

      if (draggingSplitId) {
        const currentX = e.clientX - dragOffset.x;
        const currentY = e.clientY - dragOffset.y;
        setDragCurrent({ x: currentX, y: currentY });
        setDropSplitPreview(calculateSplitDropTarget(currentX, currentY, draggingSplitId));
      }
    };

    const handleMouseUp = (e) => {
      if (resizingState) {
        recordHistory(); 
        setResizingState(null);
      }
      if (draggingJobId) {
        const preview = calculateDropTarget(e.clientX - dragOffset.x, e.clientY - dragOffset.y, draggingJobId);
        if (preview && !preview.isOverlapError) {
          recordHistory(); 
          setJobs(prev => prev.map(j => j.id === draggingJobId ? {
            ...j,
            startTime: preview.startTime,
            driverId: preview.driverId,
            duration: preview.duration,
            isVehicleError: preview.isVehicleError
          } : j));
        }
        setDraggingJobId(null);
        setDragButton(null);
        setDragCurrent({ x: 0, y: 0 });
        setDropPreview(null);
      }
      if (draggingSplitId) {
        const preview = calculateSplitDropTarget(e.clientX - dragOffset.x, e.clientY - dragOffset.y, draggingSplitId);
        if (preview && !preview.isOverlapError) {
            recordHistory();
            setSplits(prev => prev.map(s => s.id === draggingSplitId ? { ...s, driverId: preview.driverId, time: preview.time } : s));
        }
        setDraggingSplitId(null);
        setDragCurrent({ x: 0, y: 0 });
        setDropSplitPreview(null);
      }
    };

    if (resizingState || draggingJobId || draggingSplitId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingState, draggingJobId, draggingSplitId, dragOffset, jobs, splits, dragButton, dragMousePos, recordHistory]);

  const handleAddJob = (jobTemplate) => {
    if (!selectedCell) return;
    const split = splits.find(s => s.driverId === selectedCell.driverId && s.time === selectedCell.time);
    if (split) return;

    recordHistory(); 
    const existingJob = jobs.find(job => job.driverId === selectedCell.driverId && job.startTime === selectedCell.time);
    if (existingJob) {
        setPendingJobs(prev => [...prev, existingJob]);
        setJobs(prev => prev.filter(j => j.id !== existingJob.id));
    }

    const newStartMin = timeToMinutes(selectedCell.time);
    const driver = drivers.find(d => d.id === selectedCell.driverId);
    let currentVeh = driver?.currentVehicle;
    const driverSplits = splits.filter(s => s.driverId === selectedCell.driverId).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    for (const s of driverSplits) {
        if (timeToMinutes(s.time) <= newStartMin) currentVeh = s.vehicle;
        else break; 
    }

    let isVehicleError = jobTemplate.requiredVehicle && currentVeh && currentVeh !== jobTemplate.requiredVehicle;

    const newJob = {
      id: `new_${Date.now()}`,
      title: jobTemplate.title,
      driverId: selectedCell.driverId,
      startTime: selectedCell.time,
      duration: jobTemplate.duration,
      preferredTime: jobTemplate.preferredTime || null,
      requiredVehicle: jobTemplate.requiredVehicle,
      isVehicleError: isVehicleError,
      originalCustomerId: jobTemplate.originalCustomerId || jobTemplate.id 
    };
    
    if (existingJob) setJobs(prev => [...prev.filter(j => j.id !== existingJob.id), newJob]);
    else setJobs(prev => [...prev, newJob]);
    
    setPendingJobs(prev => prev.filter(j => j.id !== jobTemplate.id));
    setSelectedCell(null); 
  };

  const isCellOccupied = (driverId, time) => {
    const timeMin = timeToMinutes(time);
    return jobs.some(job => {
      if (job.id === draggingJobId || job.driverId !== driverId) return false;
      const startMin = timeToMinutes(job.startTime);
      const endMin = startMin + job.duration;
      return timeMin > startMin && timeMin < endMin;
    });
  };

  const renderJobHourLines = (job) => {
    const startMin = timeToMinutes(job.startTime);
    const endMin = startMin + job.duration;
    const lines = [];
    let nextHourMin = Math.ceil((startMin + 1) / 60) * 60;
    while (nextHourMin < endMin) {
        const offsetMin = nextHourMin - startMin;
        const topRem = (offsetMin / 15) * QUARTER_HEIGHT_REM;
        lines.push(
            <div key={nextHourMin} className="absolute border-t border-white z-20 pointer-events-none shadow-sm" style={{ top: `calc(${topRem}rem - 0.125rem - 1px)`, left: `calc(-0.25rem - 1px)`, width: `calc(100% + 0.5rem + 2px)` }} />
        );
        nextHourMin += 60;
    }
    return lines;
  };



  return (
    <div className="flex flex-col h-screen bg-white text-sm font-sans text-gray-800 select-none">
      
      {/* Header */}
      <Header 
        onUndo={undo} 
        onRedo={redo} 
        canUndo={history.past.length > 0} 
        canRedo={history.future.length > 0} 
        onOpenSidebar={() => setIsSidebarOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <CalendarView 
          monthlySchedules={monthlySchedules}
          setMonthlySchedules={setMonthlySchedules}
          masterCustomers={masterCustomers}
          systemSettings={systemSettings}
          setPendingJobs={setPendingJobs}
        />
      ) : (
        <div className="flex-1 overflow-auto relative bg-white" onClick={() => setSelectedJobId(null)}>
        <div className="min-w-max">
          {/* Sticky Header Row */}
          <div className="flex border-b border-white bg-black text-white sticky top-0 z-40 shadow-sm">
            <div className="w-16 flex-shrink-0 border-r border-white bg-gray-900 flex items-center justify-center font-bold sticky left-0 z-50">時間</div>
            <div className="flex">
              {drivers.map(driver => (
                <DriverColumnHeader key={driver.id} driver={driver} onEdit={openHeaderEdit} />
              ))}
            </div>
          </div>

          <div className="flex">
            {/* Time Axis */}
            <TimeAxis timeSlots={TIME_SLOTS} />

            {/* Grid Cells */}
            <div className="flex">
              {drivers.map((driver) => (
                <div key={driver.id} className="w-[180px] border-r border-gray-300 relative" ref={el => driverColRefs.current[driver.id] = el}>
                  {TIME_SLOTS.map((time) => {
                    const isOccupied = isCellOccupied(driver.id, time);
                    const job = jobs.find(j => j.driverId === driver.id && j.startTime === time);
                    const split = splits.find(s => s.driverId === driver.id && s.time === time); 
                    const isHour = time.endsWith('00');
                    const borderClass = isHour ? 'border-t border-t-orange-300 border-b border-b-gray-100' : 'border-b border-b-gray-100';
                    const isPreviewStart = dropPreview && dropPreview.driverId === driver.id && dropPreview.startTime === time;
                    const isSplitPreviewStart = dropSplitPreview && dropSplitPreview.driverId === driver.id && dropSplitPreview.time === time;

                    return (
                      <div key={time} className={`h-8 ${borderClass} relative`} onContextMenu={(e) => handleContextMenu(e, driver.id, time)}>
                        
                        <SplitLine 
                          split={split}
                          draggingSplitId={draggingSplitId}
                          setDraggingSplitId={setDraggingSplitId}
                          setDragOffset={setDragOffset}
                          openSplitEdit={openSplitEdit}
                          driverId={driver.id}
                          time={time}
                        />

                        {isSplitPreviewStart && (
                            <div className={`absolute inset-0 z-50 flex items-center justify-center text-xs font-bold border-2 ${dropSplitPreview.isOverlapError ? 'bg-red-600/80 border-red-800 text-white' : 'bg-black/50 border-black text-white'}`}>
                                {dropSplitPreview.isOverlapError ? <Ban size={14} /> : '移動E'}
                            </div>
                        )}

                        {isPreviewStart && (
                          <div className={`absolute left-0 right-0 z-30 border-2 rounded pointer-events-none flex flex-col p-1 shadow-sm transition-all duration-75 ${dropPreview.isOverlapError ? 'bg-red-200/90 border-red-600 z-50' : dropPreview.isVehicleError ? 'bg-red-50/90 border-red-400' : 'bg-emerald-50/90 border-emerald-400'}`} style={{ top: 0, height: `${(dropPreview.duration / 15) * QUARTER_HEIGHT_REM}rem` }}>
                             <div className="flex justify-between items-start">
                               <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${dropPreview.isOverlapError ? 'bg-red-600 text-white' : dropPreview.isVehicleError ? 'bg-red-100 text-red-700' : 'bg-white/80 text-emerald-800'}`}>
                                 {dropPreview.isOverlapError && <Ban size={10} />}
                                 {dropPreview.isOverlapError ? '移動不可' : `${dropPreview.startTime} (${dropPreview.duration}刁E`}
                               </div>
                               {!dropPreview.isOverlapError && dropPreview.isVehicleError && <AlertTriangle size={14} className="text-red-600 bg-white rounded-full shadow-sm" />}
                             </div>
                          </div>
                        )}

                        {job && (
                          <JobCard 
                            job={job}
                            time={time}
                            driverId={driver.id}
                            jobColorMap={jobColorMap}
                            draggingJobId={draggingJobId}
                            dragCurrent={dragCurrent}
                            selectedJobId={selectedJobId}
                            setSelectedJobId={setSelectedJobId}
                            setSelectedCell={setSelectedCell}
                            recordHistory={recordHistory}
                            setResizingState={setResizingState}
                            setDraggingJobId={setDraggingJobId}
                            setDragButton={setDragButton}
                            setDragOffset={setDragOffset}
                            setDragCurrent={setDragCurrent}
                            setDragMousePos={setDragMousePos}
                            renderJobHourLines={renderJobHourLines}
                          />
                        )}
                        
                        {!job && !isOccupied && !split && <div className="absolute inset-0 hover:bg-emerald-50 cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedCell({ driverId: driver.id, time }); }} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending List Modal */}
        <PendingJobsModal 
          selectedCell={selectedCell && !editModal ? selectedCell : null}
          pendingJobs={pendingJobs}
          driverName={selectedCell ? drivers.find(d => d.id === selectedCell.driverId)?.name : ''}
          onAddJob={handleAddJob}
          onClose={() => setSelectedCell(null)}
        />

        {/* Modals & Drawers */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)}
          onOpenCourseManagement={() => setIsCourseModalOpen(true)}
          onOpenWorkerManagement={() => setIsWorkerModalOpen(true)}
          onOpenVehicleManagement={() => setIsVehicleModalOpen(true)}
          onOpenCustomerManagement={() => setIsCustomerModalOpen(true)}
          onOpenItemManagement={() => setIsItemModalOpen(true)}
        />

        {isWorkerModalOpen && (
          <WorkerManagementModal 
            workers={masterWorkers}
            onSave={handleSaveWorker}
            onDelete={handleDeleteWorker}
            onClose={() => setIsWorkerModalOpen(false)}
          />
        )}

        {isVehicleModalOpen && (
          <VehicleManagementModal 
            vehicles={masterVehicles}
            onSave={handleSaveVehicle}
            onDelete={handleDeleteVehicle}
            onClose={() => setIsVehicleModalOpen(false)}
          />
        )}

        {isCourseModalOpen && (
          <CourseManagementModal 
            drivers={drivers} 
            masterWorkers={masterWorkers}
            masterVehicles={masterVehicles}
            onAddCourse={handleAddCourse}
            onDeleteCourse={handleDeleteCourse}
            onClose={() => setIsCourseModalOpen(false)} 
          />
        )}

        {editModal && (
          <EditModal 
            editModal={editModal}
            masterWorkers={masterWorkers}
            masterVehicles={masterVehicles}
            onSave={handleSaveEdit}
            onDelete={handleDeleteSplit}
            onClose={() => setEditModal(null)}
          />
        )}
      </div>
      )}
      
      {/* === 各種モーダル === */}
      {isItemModalOpen && (
        <ItemManagementModal
          items={masterItems}
          onSave={handleSaveItems}
          onDelete={handleDeleteItem}
          onClose={() => setIsItemModalOpen(false)}
        />
      )}
      {isCustomerModalOpen && (
        <CustomerManagementModal 
          customers={masterCustomers}
          masterVehicles={masterVehicles}
          masterItems={masterItems}
          onSave={handleSaveCustomer}
          onDelete={handleDeleteCustomer}
          onClose={() => setIsCustomerModalOpen(false)}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal 
          systemSettings={systemSettings}
          setSystemSettings={setSystemSettings}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
    </div>
  );
}
