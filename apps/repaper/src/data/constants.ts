// ==========================================
// データ定義 (UI用定数・初期状態)
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

export const INITIAL_DRIVERS = [
  { id: 'd1', name: '', currentVehicle: '', color: 'bg-blue-50 border-blue-200', defaultSplit: null, course: 'A' },
  { id: 'd2', name: '', currentVehicle: '', color: 'bg-green-50 border-green-200', defaultSplit: null, course: 'B' },
  { id: 'd3', name: '', currentVehicle: '', color: 'bg-purple-50 border-purple-200', defaultSplit: null, course: 'C' },
  { id: 'd4', name: '', currentVehicle: '', color: 'bg-orange-50 border-orange-200', defaultSplit: null, course: 'D' },
];

export const TIME_SLOTS: string[] = [];
for (let h = 6; h < 18; h++) {
  ['00', '15', '30', '45'].forEach(m => {
    TIME_SLOTS.push(`${h}:${m}`);
  });
}

// レイアウト定数
export const QUARTER_HEIGHT_REM = 2;
export const PIXELS_PER_REM = 16;
export const CELL_HEIGHT_PX = QUARTER_HEIGHT_REM * PIXELS_PER_REM;
