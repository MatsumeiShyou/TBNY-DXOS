import React from 'react';
import { Calendar, Undo2, Redo2, Menu, LayoutGrid, ChevronLeft, ChevronRight, Copy } from 'lucide-react';

interface HeaderProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenSidebar?: () => void;
  viewMode?: 'dispatch' | 'calendar';
  setViewMode?: (mode: 'dispatch' | 'calendar') => void;
  currentDate?: Date | null;
  onChangeDate?: (date: Date) => void;
  onSave?: () => void;
  isPreviewMode?: boolean;
  onOpenTemplateModal?: () => void;
}

export default function Header({ 
  onUndo, onRedo, canUndo, canRedo, onOpenSidebar, 
  viewMode, setViewMode,
  currentDate, onChangeDate, onSave,
  isPreviewMode, onOpenTemplateModal
}: HeaderProps) {
  
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            className={`p-1 rounded transition-colors ${viewMode === 'calendar' || isPreviewMode ? 'invisible' : 'hover:bg-gray-700'}`}
            title="メニューを開く"
            disabled={viewMode === 'calendar' || isPreviewMode}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-bold text-lg hidden sm:block">回収シフト管理</h1>
        </div>
        
        {/* ビュー切り替え */}
        {!isPreviewMode && (
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
              <Calendar size={16} /> <span className="hidden sm:inline">予定</span>
            </button>
          </div>
        )}
      </div>

      <div className={`flex items-center gap-4 transition-opacity duration-200 ${viewMode === 'calendar' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* テンプレート管理ボタン */}
        {!isPreviewMode && (
          <button
            onClick={onOpenTemplateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded shadow-sm transition-colors text-sm font-bold"
            title="テンプレートを開く"
          >
            <Copy size={16} />
            <span className="hidden sm:inline">テンプレート</span>
          </button>
        )}

        <div className="flex gap-1">
          <button onClick={onUndo} disabled={!canUndo || isPreviewMode} className={`p-1.5 rounded transition ${!canUndo || isPreviewMode ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`} title={isPreviewMode ? 'プレビュー中は無効' : '元に戻す (Ctrl+Z)'}><Undo2 size={18} /></button>
          <button onClick={onRedo} disabled={!canRedo || isPreviewMode} className={`p-1.5 rounded transition ${!canRedo || isPreviewMode ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`} title={isPreviewMode ? 'プレビュー中は無効' : 'やり直し (Ctrl+Y)'}><Redo2 size={18} /></button>
        </div>
        
        {/* 日付切り替えUI */}
        {!isPreviewMode && (
          <div className="bg-gray-700 rounded flex items-center text-sm hidden sm:flex border border-gray-600 overflow-hidden">
            <button 
              onClick={handlePrevDay} 
              className="p-1.5 hover:bg-gray-600 transition text-gray-300 hover:text-white"
              title="前日へ"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="relative px-2 py-1 flex items-center gap-2 hover:bg-gray-600 transition cursor-pointer">
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
        )}

        {!isPreviewMode && (
          <div className="flex gap-2">
            <button 
              onClick={onSave}
              className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-emerald-700 transition shadow-sm"
            >
              保存する
            </button>
            <button 
              onClick={() => {
                import('../lib/supabase').then(({ supabase }) => {
                  supabase.auth.signOut();
                });
              }}
              className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded text-sm font-bold hover:bg-gray-600 hover:text-white transition shadow-sm border border-gray-600"
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
