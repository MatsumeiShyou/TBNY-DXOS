// ==========================================
// データ定義 (マスタ & モック)
// ==========================================

// カラーパレット定義 (18色)
export const COLOR_PALETTE = [
  { name: 'Red',     bg: 'bg-red-100',     border: 'border-red-300',     text: 'text-red-900' },
  { name: 'Orange',  bg: 'bg-orange-100',  border: 'border-orange-300',  text: 'text-orange-900' },
  { name: 'Amber',   bg: 'bg-amber-100',   border: 'border-amber-300',   text: 'text-amber-900' },
  { name: 'Yellow',  bg: 'bg-yellow-100',  border: 'border-yellow-300',  text: 'text-yellow-900' },
  { name: 'Lime',    bg: 'bg-lime-100',    border: 'border-lime-300',    text: 'text-lime-900' },
  { name: 'Green',   bg: 'bg-green-100',   border: 'border-green-300',   text: 'text-green-900' },
  { name: 'Emerald', bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900' },
  { name: 'Teal',    bg: 'bg-teal-100',    border: 'border-teal-300',    text: 'text-teal-900' },
  { name: 'Cyan',    bg: 'bg-cyan-100',    border: 'border-cyan-300',    text: 'text-cyan-900' },
  { name: 'Sky',     bg: 'bg-sky-100',     border: 'border-sky-300',     text: 'text-sky-900' },
  { name: 'Blue',    bg: 'bg-blue-100',    border: 'border-blue-300',    text: 'text-blue-900' },
  { name: 'Indigo',  bg: 'bg-indigo-100',  border: 'border-indigo-300',  text: 'text-indigo-900' },
  { name: 'Violet',  bg: 'bg-violet-100',  border: 'border-violet-300',  text: 'text-violet-900' },
  { name: 'Purple',  bg: 'bg-purple-100',  border: 'border-purple-300',  text: 'text-purple-900' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', text: 'text-fuchsia-900' },
  { name: 'Pink',    bg: 'bg-pink-100',    border: 'border-pink-300',    text: 'text-pink-900' },
  { name: 'Rose',    bg: 'bg-rose-100',    border: 'border-rose-300',    text: 'text-rose-900' },
  { name: 'Slate',   bg: 'bg-slate-100',   border: 'border-slate-300',   text: 'text-slate-900' },
];

export const MASTER_DRIVERS_LIST = ['畑澤', '菊地', '万里', '片山', '大貴', '鈴木', '佐藤', '田中'];
export const MASTER_VEHICLES_LIST = ['2025PK', '2267PK', '2618PK', '5122PK', '1111PK', '西濃運輸', '予備車', 'レンタカー'];

export const CUSTOMERS = [
  { 
    id: 'c1_am', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: '富士ロジ長沼 午前便', kana: 'ふじろじながぬま ごぜんびん', area: '厚木', address: '',
    jobType: 'regular',
    scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    holidayCollection: false,
    defaultDuration: 45, requiredVehicle: '',
    items: [], note: '', isInvalid: false,
    preferredTime: '9:00'
  },
  { 
    id: 'c1_pm', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: '富士ロジ長沼 午後便', kana: 'ふじろじながぬま ごごびん', area: '厚木', address: '',
    jobType: 'regular',
    scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    holidayCollection: false,
    defaultDuration: 45, requiredVehicle: '',
    items: [], note: '', isInvalid: false,
    preferredTime: '13:00'
  },
  { 
    id: 'c2', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: 'ESPOT(スポット)', kana: 'えすぽっと', area: '伊勢原', address: '',
    jobType: 'spot',
    scheduleRules: {},
    holidayCollection: false,
    defaultDuration: 30, requiredVehicle: '',
    items: [], note: '要電話', isInvalid: false
  },
  { 
    id: 'c3', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: 'リバークレイン', kana: 'りばーくれいん', area: '横浜', address: '',
    jobType: 'regular',
    scheduleRules: { mon: ['every'], tue: [], wed: ['every'], thu: [], fri: ['every'], sat: [], sun: [] },
    holidayCollection: true,
    defaultDuration: 45, requiredVehicle: '',
    items: [], note: '9時以降', isInvalid: false,
    preferredTime: '9:00'
  },
  { 
    id: 'c4', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: 'ユニマット', kana: 'ゆにまっと', area: '厚木', address: '',
    jobType: 'regular',
    scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    holidayCollection: false,
    defaultDuration: 15, requiredVehicle: '',
    items: [], note: '', isInvalid: false
  },
  { 
    id: 'c5', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: '特別工場A', kana: 'とくべつこうじょうえー', area: '海老名', address: '',
    jobType: 'regular',
    scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    holidayCollection: false,
    defaultDuration: 60, requiredVehicle: '2025PK',
    items: [], note: '車両注意', isInvalid: false,
    preferredTime: '9:00'
  },
  { 
    id: 'c99', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: '富士電線', kana: 'ふじでんせん', area: '厚木', address: '',
    jobType: 'regular',
    scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    holidayCollection: false,
    defaultDuration: 30, requiredVehicle: '',
    items: [], note: '', isInvalid: false
  },
  { 
    id: 'c98', 
    payeeCode: '', payeeName: '', supplierCode: '', supplierName: '',
    name: '厚木事業所', kana: 'あつぎじぎょうしょ', area: '厚木', address: '',
    jobType: 'regular',
    scheduleRules: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
    holidayCollection: false,
    defaultDuration: 60, requiredVehicle: '',
    items: [], note: '', isInvalid: false
  }
];

export const INITIAL_DRIVERS = [
  { id: 'd1', name: '畑澤', currentVehicle: '2025PK', color: 'bg-blue-50 border-blue-200', defaultSplit: null, course: 'A' },
  { id: 'd2', name: '菊地', currentVehicle: '2267PK', color: 'bg-green-50 border-green-200', defaultSplit: null, course: 'B' },
  { id: 'd3', name: '万里', currentVehicle: '2618PK', color: 'bg-purple-50 border-purple-200', defaultSplit: { time: '13:00', driverName: '大貴', vehicle: '西濃運輸' }, course: 'C' },
  { id: 'd4', name: '片山', currentVehicle: '5122PK', color: 'bg-orange-50 border-orange-200', defaultSplit: { time: '13:00', driverName: '片山', vehicle: '1111PK' }, course: 'D' },
];

export const TIME_SLOTS = [];
for (let h = 6; h < 18; h++) {
  ['00', '15', '30', '45'].forEach(m => {
    TIME_SLOTS.push(`${h}:${m}`);
  });
}

export const INITIAL_JOBS = [
  { id: 'j1', title: '富士電線', driverId: 'd1', startTime: '6:30', duration: 30, originalCustomerId: 'c99' },
  { id: 'j2', title: '厚木事業所', driverId: 'd2', startTime: '7:00', duration: 60, originalCustomerId: 'c98' },
];

// レイアウト定数
export const QUARTER_HEIGHT_REM = 2;
export const PIXELS_PER_REM = 16;
export const CELL_HEIGHT_PX = QUARTER_HEIGHT_REM * PIXELS_PER_REM;
