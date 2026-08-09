import { Calendar, Undo2, Redo2, Menu, LayoutGrid, Settings } from 'lucide-react';

export default function Header({ 
  onUndo, onRedo, canUndo, canRedo, onOpenSidebar, 
  viewMode, setViewMode, onOpenSettings 
}) {
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

        <div className="bg-gray-700 px-3 py-1 rounded flex items-center gap-2 text-sm hidden sm:flex">
          <Calendar size={14} />
          <span>2025年 1月 24日 (金)</span>
        </div>
        <button className="bg-emerald-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-emerald-700 transition">保存する</button>
      </div>
    </header>
  );
}
