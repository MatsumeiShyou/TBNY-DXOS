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
  { id: 'c1', name: '富士ロジ長沼', kana: 'ふじろじながぬま', area: '厚木', defaultDuration: 45, visits: [{ label: '午前便', preferredTime: '9:00' }, { label: '午後便', preferredTime: '13:00' }] },
  { id: 'c2', name: 'ESPOT(スポット)', kana: 'えすぽっと', area: '伊勢原', defaultDuration: 30, visits: [{ label: '回収', note: '要電話' }] },
  { id: 'c3', name: 'リバークレイン', kana: 'りばーくれいん', area: '横浜', defaultDuration: 45, visits: [{ label: '回収', preferredTime: '9:00', note: '9時以降' }] },
  { id: 'c4', name: 'ユニマット', kana: 'ゆにまっと', area: '厚木', defaultDuration: 15, visits: [{ label: '回収' }] },
  { id: 'c5', name: '特別工場A', kana: 'とくべつこうじょうえー', area: '海老名', defaultDuration: 60, requiredVehicle: '2025PK', visits: [{ label: '指定車限定', preferredTime: '9:00', note: '車両注意' }] },
  { id: 'c99', name: '富士電線', kana: 'ふじでんせん', area: '厚木', defaultDuration: 30, visits: [] },
  { id: 'c98', name: '厚木事業所', kana: 'あつぎじぎょうしょ', area: '厚木', defaultDuration: 60, visits: [] },
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
