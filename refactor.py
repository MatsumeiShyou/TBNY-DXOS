import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace block 1
code = code.replace(
    "import { generateDailySchedule } from './utils/calendarUtils';\nimport { useHistory } from './hooks/useHistory';",
    "import { useDataStore } from './hooks/useDataStore';"
)

# Replace block 2
code = code.replace(
    "import { storageService } from './services/storageService';",
    ""
)

# Replace block 3
target_state = """export default function App() {
  
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());

  // 初期ロード用（遅延初期化で毎レンダーの localStorage アクセスを回避）
  const [drivers, setDrivers] = useState(() => storageService.loadState().drivers);
  const [jobs, setJobs] = useState(() => storageService.loadState().jobs);
  const [pendingJobs, setPendingJobs] = useState(() => storageService.loadState().pendingJobs);
  const [splits, setSplits] = useState(() => storageService.loadState().splits);
  const [monthlySchedules, setMonthlySchedules] = useState(() => storageService.loadState().monthlySchedules || {});

  // 履歴管琁Etate
  const { history, recordHistory, undo, redo, clearHistory } = useHistory(
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

  // === マスタデータの読み込み（遅延初期化）===
  const [masterWorkers, setMasterWorkers] = useState(() => storageService.loadMasterData(INITIAL_WORKERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS).workers);
  const [masterVehicles, setMasterVehicles] = useState(() => storageService.loadMasterData(INITIAL_WORKERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS).vehicles);
  const [masterCustomers, setMasterCustomers] = useState(() => storageService.loadMasterData(INITIAL_WORKERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS).customers);
  const [masterItems, setMasterItems] = useState(() => storageService.loadMasterData(INITIAL_WORKERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS).items);
  const [systemSettings, setSystemSettings] = useState(() => storageService.loadMasterData(INITIAL_WORKERS, INITIAL_VEHICLES, CUSTOMERS, INITIAL_ITEMS).systemSettings || { holidays: [] });
  const [loadedDateStr, setLoadedDateStr] = useState(null);

  // === 日別データのバックグラウンドロード＆生成 ===
  useEffect(() => {
    if (!masterCustomers || masterCustomers.length === 0) return;

    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const dailyState = storageService.loadDailyState(dateStr, masterCustomers);

    if (dailyState) {
      setDrivers(dailyState.drivers || INITIAL_DRIVERS);
      setJobs(dailyState.jobs || []);
      setPendingJobs(dailyState.pendingJobs || []);
      setSplits(dailyState.splits || []);
    } else {
      // 保存データがない日付：デフォルトドライバー構成 + 空の配車盤 + スケジュール生成
      const newDailyJobs = generateDailySchedule(dateStr, masterCustomers);
      setDrivers(INITIAL_DRIVERS);
      setJobs([]);
      setPendingJobs(newDailyJobs);
      setSplits([]);
    }
    
    setLoadedDateStr(dateStr);
    clearHistory?.();
  }, [currentDate, masterCustomers, clearHistory]);"""

replacement_state = """export default function App() {
  
  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());

  const storeDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const store = useDataStore(storeDateStr);
  const {
    isLoaded,
    masterWorkers,
    masterVehicles,
    masterCustomers,
    masterItems,
    systemSettings,
    drivers,
    jobs,
    pendingJobs,
    splits,
    monthlySchedules,
    saveCustomer,
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
    setMonthlySchedules,
    setSystemSettings,
    history,
    recordHistory,
    undo,
    redo,
    clearHistory
  } = store;

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
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);"""

code = code.replace(target_state, replacement_state)

# Replace block 4
target_handlers = """  // --- マスタCRUDハンドラ ---
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
  };"""

replacement_handlers = """  // --- マスタCRUDハンドラ ---
  const handleSaveWorker = saveWorker;
  const handleDeleteWorker = deleteWorker;
  const handleSaveVehicle = saveVehicle;
  const handleDeleteVehicle = deleteVehicle;
  const handleSaveCustomer = saveCustomer;
  const handleDeleteCustomer = deleteCustomer;
  const handleSaveItems = saveItems;
  const handleDeleteItem = deleteItem;"""

code = code.replace(target_handlers, replacement_handlers)

# Replace block 5
target_saves = """  // ----------------------------------------
  // 状態の自動保存
  // ----------------------------------------
  useEffect(() => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    
    // データが未ロード、あるいは日付切り替え中の場合は上書き保存を防ぐ
    if (loadedDateStr !== dateStr) return;

    storageService.saveDailyState(dateStr, { drivers, jobs, pendingJobs, splits });
    storageService.saveState({ drivers, jobs, pendingJobs, splits, monthlySchedules }); // 下位互換
  }, [drivers, jobs, pendingJobs, splits, monthlySchedules, currentDate, loadedDateStr]);

  // マスターデータの自動保存
  useEffect(() => {
    storageService.saveMasterData({ workers: masterWorkers, vehicles: masterVehicles, customers: masterCustomers, items: masterItems, systemSettings });
  }, [masterWorkers, masterVehicles, masterCustomers, masterItems, systemSettings]);"""

replacement_saves = """  // ----------------------------------------
  // 状態の自動保存 (useDataStore内で処理)
  // ----------------------------------------"""
  
code = code.replace(target_saves, replacement_saves)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
