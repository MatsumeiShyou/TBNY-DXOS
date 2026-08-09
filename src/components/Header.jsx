import { Calendar, Undo2, Redo2, Menu } from 'lucide-react';

export default function Header({ onUndo, onRedo, canUndo, canRedo, onOpenSidebar }) {
  return (
    <header className="bg-gray-900 text-white p-2 flex justify-between items-center shadow-md z-50 relative">
      <div className="flex items-center gap-2">
        <button 
          onClick={onOpenSidebar}
          className="p-1 hover:bg-gray-700 rounded transition-colors"
          title="メニューを開く"
        >
          <Menu size={20} />
        </button>
        <h1 className="font-bold text-lg">回収シフト管理</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-1 mr-4">
          <button onClick={onUndo} disabled={!canUndo} className={`p-1.5 rounded transition ${!canUndo ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`} title="元に戻す (Ctrl+Z)"><Undo2 size={18} /></button>
          <button onClick={onRedo} disabled={!canRedo} className={`p-1.5 rounded transition ${!canRedo ? 'text-gray-600' : 'text-white hover:bg-gray-700'}`} title="やり直し (Ctrl+Y)"><Redo2 size={18} /></button>
        </div>
        <div className="bg-gray-700 px-3 py-1 rounded flex items-center gap-2">
          <Calendar size={16} />
          <span>2025年 1月 24日 (金)</span>
        </div>
        <button className="bg-blue-600 text-white px-3 py-1 rounded font-bold hover:bg-blue-700 transition">保存する</button>
      </div>
    </header>
  );
}
