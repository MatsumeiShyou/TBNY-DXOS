
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
import { useDataStore } from './hooks/useDataStore';

import Header from './components/Header';
import TimeAxis from './components/TimeAxis';
import DriverColumnHeader from './components/DriverColumnHeader';
import EditModal from './components/EditModal';
import PendingJobsDock from './components/PendingJobsDock';
import JobCard from './components/JobCard';
import SplitLine from './components/SplitLine';
import CourseManagementModal from './components/CourseManagementModal';
import WorkerManagementModal from './components/WorkerManagementModal';
import VehicleManagementModal from './components/VehicleManagementModal';
import CustomerManagementModal from './components/CustomerManagementModal';
import CustomerScheduleGridModal from './components/CustomerScheduleGridModal';
import ItemManagementModal from './components/ItemManagementModal';
import TemplateModal from './components/TemplateModal';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';

// ==========================================
// 3. メインコンポEネンチE
// ==========================================
export default function App() {
  
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());

  // プレビューモード用State
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  const [originalBoardState, setOriginalBoardState] = useState(null);

  const storeDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const store = useDataStore(storeDateStr, !!previewingTemplate);
  const {
    isLoaded,
    masterWorkers,
    masterVehicles,
    masterCustomers,
    masterItems,
    drivers,
    jobs,
    pendingJobs,
    splits,
    monthlyExceptions,
    saveCustomer,
    saveBulkCustomers,
    deleteCustomer,
    saveWorker,
    deleteWorker,
    saveVehicle,
    deleteVehicle,
    saveItems,
    deleteItem,
    setJobs,
    setPendingJobs,
    setSplits,
    setDrivers,
    setMonthlyExceptions,
    history,
    recordHistory,
    undo,
    redo,
    clearHistory,
    addSpotJob,
    deleteJobFromCalendar,
    moveSpotJob
  } = store;

  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // 編集モーダル用State
  const [editModal, setEditModal] = useState(null);
  
  // コース管理モーダル用State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // サイドバー用State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // マスタ管理モーダル用State
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalInitialData, setCustomerModalInitialData] = useState(null);
  const [isCustomerGridModalOpen, setIsCustomerGridModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  
  // テンプレートモーダル用State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // === プレビューアクション ===
  const startPreview = (templateData) => {
    // 現在の本番状態を退避
    setOriginalBoardState({
      jobs: [...jobs],
      pendingJobs: [...pendingJobs],
      splits: [...splits],
      drivers: [...drivers]
    });
    // テンプレートデータを展開
    setJobs(templateData.state.jobs || []);
    setPendingJobs(templateData.state.pendingJobs || []);
    setSplits(templateData.state.splits || []);
    setDrivers(templateData.state.drivers || drivers); // ドライバーがない場合は既存を利用
    
    // 履歴クリアとプレビュー開始
    clearHistory();
    setPreviewingTemplate({ id: templateData.id, name: templateData.name });
    setIsTemplateModalOpen(false);
    setViewMode('dispatch'); // 強制的に配車盤ビューへ
  };

  const cancelPreview = () => {
    if (originalBoardState) {
      setJobs(originalBoardState.jobs);
      setPendingJobs(originalBoardState.pendingJobs);
      setSplits(originalBoardState.splits);
      setDrivers(originalBoardState.drivers);
    }
    setPreviewingTemplate(null);
    setOriginalBoardState(null);
    clearHistory(); // プレビュー中の履歴を破棄
  };

  const applyPreview = () => {
    // そのまま本番として確定（プレビュー状態の解除）
    // ※未登録案件のIDや顧客情報をどうするかは今後の課題だが、とりあえずUI上は確定できる。
    setPreviewingTemplate(null);
    setOriginalBoardState(null);
    clearHistory();
  };

  const savePreviewToTemplate = async () => {
    if (!previewingTemplate) return;
    const { storageService } = await import('./services/storageService');
    
    const updatedTemplate = {
      id: previewingTemplate.id,
      name: previewingTemplate.name,
      state: {
        jobs,
        pendingJobs,
        splits,
        drivers
      }
    };
    
    await storageService.saveTemplate(updatedTemplate);
    alert(`テンプレート「${previewingTemplate.name}」を上書き保存しました。`);
    // プレビューは継続するか終わるか？ ここではプレビューモードを維持する
  };

  const handleDoubleClickJob = (job, cellInfo) => {
    if (job.isUnregistered) {
      // 未登録データの場合は、新規顧客登録モーダルを開き、初期値を渡す
      const titleWithoutWarning = job.title ? job.title.replace('⚠️未登録 ', '') : '';
      setCustomerModalInitialData({
        name: titleWithoutWarning,
        defaultDuration: job.duration,
        preferredTime: job.preferredTime || '',
        note: `※テンプレートから展開された未登録案件（元のID: ${job.originalCustomerId}）\n${job.description || ''}`
      });
      setIsCustomerModalOpen(true);
    } else {
      // 通常の動作
      if (cellInfo && cellInfo.driverId) {
        setSelectedCell({ driverId: cellInfo.driverId, time: cellInfo.time });
      }
    }
  };


  // === ビューモード (dispatch | calendar) ===
  const [viewMode, setViewMode] = useState('dispatch');
  // --- マスタCRUDハンドラ ---
  const handleSaveWorker = saveWorker;
  const handleDeleteWorker = deleteWorker;
  const handleSaveVehicle = saveVehicle;
  const handleDeleteVehicle = deleteVehicle;
  const handleSaveCustomer = saveCustomer;
  const handleSaveBulkCustomers = saveBulkCustomers;
  const handleDeleteCustomer = deleteCustomer;
  const handleSaveItems = saveItems;
  const handleDeleteItem = deleteItem;

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
  // 状態の自動保存 (useDataStore内で処理)
  // ----------------------------------------
  
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

  const handleDropPendingJob = (e, targetDriverId, targetTime) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('application/json');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.type !== 'PENDING_JOB' || !data.job) return;
      handleAddJobDirect(data.job, targetDriverId, targetTime);
    } catch {
      // ignore invalid data
    }
  };

  const handleAddJobDirect = (jobTemplate, targetDriverId, targetTime) => {
    const split = splits.find(s => s.driverId === targetDriverId && s.time === targetTime);
    if (split) return;

    recordHistory(); 
    const existingJob = jobs.find(job => job.driverId === targetDriverId && job.startTime === targetTime);
    if (existingJob) {
        setPendingJobs(prev => [...prev, existingJob]);
        setJobs(prev => prev.filter(j => j.id !== existingJob.id));
    }

    const newStartMin = timeToMinutes(targetTime);
    const driver = drivers.find(d => d.id === targetDriverId);
    let currentVeh = driver?.currentVehicle;
    const driverSplits = splits.filter(s => s.driverId === targetDriverId).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    for (const s of driverSplits) {
        if (timeToMinutes(s.time) <= newStartMin) currentVeh = s.vehicle;
        else break; 
    }

    let isVehicleError = jobTemplate.requiredVehicle && currentVeh && currentVeh !== jobTemplate.requiredVehicle;

    const newJob = {
      id: jobTemplate.id || `new_${Date.now()}`,
      title: jobTemplate.title,
      driverId: targetDriverId,
      startTime: targetTime,
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

  const displayPendingJobs = useMemo(() => {
    if (previewingTemplate && originalBoardState) {
      const realSpotPending = originalBoardState.pendingJobs.filter(j => j.jobType === 'spot' || j.isSpot);
      const realSpotPlaced = originalBoardState.jobs.filter(j => j.jobType === 'spot' || j.isSpot);
      const allRealSpotJobs = [...realSpotPending, ...realSpotPlaced].map(j => ({ 
         ...j, 
         isReadOnly: true,
         title: `[本日のスポット] ${j.title}`,
         note: (j.note ? j.note + '\n' : '') + '※テンプレートには配置できません'
      }));
      return [...pendingJobs, ...allRealSpotJobs];
    }
    return pendingJobs;
  }, [previewingTemplate, originalBoardState, pendingJobs]);

  return (
    <div className={`flex flex-col h-screen ${previewingTemplate ? 'bg-purple-50 border-4 border-purple-500' : 'bg-white'} text-sm font-sans text-gray-800 select-none transition-colors duration-300`}>
      
      {/* Header */}
      <Header 
        onUndo={undo} 
        onRedo={redo} 
        canUndo={history.past.length > 0} 
        canRedo={history.future.length > 0} 
        onOpenSidebar={() => setIsSidebarOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        onChangeDate={setCurrentDate}
        onSave={() => alert('保存しました')}
        isPreviewMode={!!previewingTemplate}
      />

      {/* プレビュー用アクションバー */}
      {previewingTemplate && (
        <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between shadow-md z-50 relative">
          <div className="flex items-center gap-2 font-bold text-lg">
            <span>⚠️</span>
            <span>【プレビュー・編集モード】 {previewingTemplate.name}</span>
            <span className="text-xs font-normal ml-2 bg-purple-800 px-2 py-1 rounded">※本番データにはまだ影響しません</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={applyPreview}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-white font-bold rounded shadow transition-colors"
            >
              この状態で本番へ適用
            </button>
            <button 
              onClick={savePreviewToTemplate}
              className="px-4 py-1.5 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded shadow transition-colors"
            >
              テンプレート上書き保存
            </button>
            <button 
              onClick={cancelPreview}
              className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded shadow transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {viewMode === 'calendar' ? (
        <CalendarView 
          monthlyExceptions={monthlyExceptions}
          masterCustomers={masterCustomers}
          onChangeDate={setCurrentDate}
          setViewMode={setViewMode}
          addSpotJob={addSpotJob}
          deleteJobFromCalendar={deleteJobFromCalendar}
          moveSpotJob={moveSpotJob}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
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
                            onDoubleClickJob={handleDoubleClickJob}
                          />
                        )}
                        
                        {!job && !isOccupied && !split && (
                          <div 
                            className={`absolute inset-0 cursor-pointer transition-colors ${
                              selectedCell?.driverId === driver.id && selectedCell?.time === time
                                ? 'bg-blue-50/50 border-2 border-blue-500 z-10 shadow-inner'
                                : 'hover:border hover:border-emerald-300 hover:bg-emerald-50'
                            }`} 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDropPendingJob(e, driver.id, time)}
                            onClick={(e) => { e.stopPropagation(); setSelectedCell({ driverId: driver.id, time }); }} 
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* Sidebar */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onOpenCourseManagement={() => setIsCourseModalOpen(true)}
          onOpenWorkerManagement={() => setIsWorkerModalOpen(true)}
          onOpenVehicleManagement={() => setIsVehicleModalOpen(true)}
          onOpenCustomerManagement={() => setIsCustomerModalOpen(true)}
          onOpenItemManagement={() => setIsItemModalOpen(true)}
          onOpenTemplateModal={() => setIsTemplateModalOpen(true)}
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

      <PendingJobsDock 
        pendingJobs={displayPendingJobs} 
        selectedCell={selectedCell}
        onAddJob={handleAddJobDirect}
      />
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
            initialData={customerModalInitialData}
            onSave={(newCustomer) => {
              handleSaveCustomer(newCustomer);
              // ここでjobのoriginalCustomerIdを置き換える等も可能だが、
              // ID自動生成等の兼ね合いもあるため、まずは登録完了してプレビューを適用後に
              // 正規のマスタからアサインし直す運用でもよい。
            }}
            onDelete={handleDeleteCustomer}
            onClose={() => {
              setIsCustomerModalOpen(false);
              setCustomerModalInitialData(null);
            }}
            onOpenGridMode={() => {
              setIsCustomerModalOpen(false);
              setCustomerModalInitialData(null);
              setIsCustomerGridModalOpen(true);
            }}
          />
        )}
      {isCustomerGridModalOpen && (
        <CustomerScheduleGridModal
          customers={masterCustomers}
          onSave={(updated) => {
            handleSaveBulkCustomers(updated);
            setIsCustomerGridModalOpen(false);
          }}
          onClose={() => setIsCustomerGridModalOpen(false)}
        />
      )}
      {isTemplateModalOpen && (
        <TemplateModal 
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onPreviewTemplate={startPreview}
          currentData={{ jobs, pendingJobs, drivers, splits }}
          masterCustomers={masterCustomers}
        />
      )}
    </div>
  );
}
