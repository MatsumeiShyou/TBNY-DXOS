import { Calendar, Undo2, Redo2, Menu, LayoutGrid, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Header({ 
  onUndo, onRedo, canUndo, canRedo, onOpenSidebar, 
  viewMode, setViewMode, onOpenSettings,
  currentDate, onChangeDate, onSave
}) {
  
  // 日付操作ハンドラ
  const handlePrevDay = () => {
    if (!currentDate || !onChangeDate) return;
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onChangeDate(d);
  };

  const handleNextDay = () => {
    if (!currentDate || !onChangeDate) return;
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onChangeDate(d);
  };

  const handleDateChange = (e) => {
    if (!onChangeDate) return;
    onChangeDate(new Date(e.target.value));
  };

  // 表示用のフォーマット文字列 (YYYY-MM-DD)
  const dateStr = currentDate ? 
    `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}` 
    : '';

  return (
    <header className="bg-gray-900 text-white p-2 flex justify-between items-center shadow-md z-50 relative shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenSidebar}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="メニューを開く"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-lg hidden sm:block">回収シフト管理</h1>
        </div>
        
        {/* ビュー切り替え */}
        <div className="flex bg-gray-800 rounded p-1">
          <button 
            onClick={() => setViewMode?.('dispatch')}
            className={`px-3 py-1 flex items-center gap-1 rounded text-sm font-bold transition-colors ${viewMode === 'dispatch' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          >
            <LayoutGrid size={16} /> <span className="hidden sm:inline">配車盤</span>
          </button>
          <button 
            onClick={() => setViewMode?.('calendar')}
            className={`px-3 py-1 flex items-center gap-1 rounded text-sm font-bold transition-colors ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
          >
            <Calendar size={16} /> <span className="hidden sm:inline">カレンダー</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-1">
          <button onClick={onUndo} disabled={!canUndo} className={`p-1.5 rounded transition ${!canUndo ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`} title="元に戻す (Ctrl+Z)"><Undo2 size={18} /></button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-1.5 rounded transition ${!canRedo ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`} title="やり直し (Ctrl+Y)"><Redo2 size={18} /></button>
        </div>
        
        <button 
          onClick={onOpenSettings}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-300 hover:text-white"
          title="システム休業日設定"
        >
          <Settings size={18} />
        </button>

        {/* 日付切り替えUI */}
        <div className="bg-gray-700 rounded flex items-center text-sm hidden sm:flex border border-gray-600 overflow-hidden">
          <button 
            onClick={handlePrevDay} 
            className="p-1.5 hover:bg-gray-600 transition text-gray-300 hover:text-white"
            title="前日へ"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="relative px-2 py-1 flex items-center gap-2 hover:bg-gray-600 transition cursor-pointer">
            <Calendar size={14} />
            <input 
              type="date" 
              value={dateStr}
              onChange={handleDateChange}
              className="bg-transparent text-white font-bold outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <button 
            onClick={handleNextDay} 
            className="p-1.5 hover:bg-gray-600 transition text-gray-300 hover:text-white border-l border-gray-600"
            title="翌日へ"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <button 
          onClick={onSave}
          className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
        >
          保存する
        </button>
      </div>
    </header>
  );
}
