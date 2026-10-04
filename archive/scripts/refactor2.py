import re
import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. State block replacement
pattern_state = re.compile(
    r"// --- State ---.*?// === ビューモード \(dispatch \| calendar\) ===",
    re.DOTALL
)

replacement_state = """// --- State ---
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
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // === ビューモード (dispatch | calendar) ==="""

code = re.sub(pattern_state, replacement_state, code)

# 2. Handlers replacement
pattern_handlers = re.compile(
    r"// --- マスタCRUDハンドラ ---.*?// ドラチE & リサイズ管琁E",
    re.DOTALL
)

replacement_handlers = """// --- マスタCRUDハンドラ ---
  const handleSaveWorker = saveWorker;
  const handleDeleteWorker = deleteWorker;
  const handleSaveVehicle = saveVehicle;
  const handleDeleteVehicle = deleteVehicle;
  const handleSaveCustomer = saveCustomer;
  const handleDeleteCustomer = deleteCustomer;
  const handleSaveItems = saveItems;
  const handleDeleteItem = deleteItem;

  // ドラチE & リサイズ管琁E"""

code = re.sub(pattern_handlers, replacement_handlers, code)


# 3. Saves replacement
pattern_saves = re.compile(
    r"// ----------------------------------------\n\s*// 状態の自動保存.*?// ----------------------------------------\n\s*// Smart Coloring Logic",
    re.DOTALL
)

replacement_saves = """// ----------------------------------------
  // 状態の自動保存 (useDataStore内で処理)
  // ----------------------------------------
  
  // ----------------------------------------
  // Smart Coloring Logic"""

code = re.sub(pattern_saves, replacement_saves, code)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
