import {
    LayoutDashboard, Truck, Users, Settings,
    MapPin, Box, Shield, Activity, LogOut
} from 'lucide-react';
import { useAuth } from '../AuthAdapterPort';

interface SidebarProps {
    activeView: string;
    onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
    const { staff, logout } = useAuth();

    // 物理権限に基づく表示制御 (F-SSOT)
    const canManageMaster = staff?.permissions?.can_manage_master ?? false;

    const menuGroups = [
        {
            title: "業務メニュー",
            items: [
                { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
                { id: 'board', label: '配車盤', icon: Truck, highlight: true },
            ]
        },
        ...(canManageMaster ? [
            {
                title: "マスタ管理",
                items: [
                    { id: 'master_drivers', label: 'ドライバー', icon: Users },
                    { id: 'master_vehicles', label: '車両', icon: Truck },
                    { id: 'master_points', label: '回収先', icon: MapPin },
                    { id: 'master_items', label: '品目', icon: Box },
                ]
            },
            {
                title: "システム設定",
                items: [
                    { id: 'sdr', label: 'SDR監査ログ', icon: Activity },
                    { id: 'users', label: 'ユーザー管理', icon: Shield },
                    { id: 'settings', label: '設定', icon: Settings },
                ]
            }
        ] : [])
    ];

    return (
        <aside className="tw-w-[260px] tw-flex tw-flex-col tw-h-full tw-bg-slate-900 tw-text-slate-300 tw-border-r tw-border-slate-800 tw-z-50">
            {/* Logo Area */}
            <div
                className="tw-h-20 tw-flex tw-items-center tw-px-6 tw-border-b tw-border-slate-800 tw-bg-slate-950/50 tw-cursor-pointer tw-hover:bg-slate-900 tw-transition-colors"
                onClick={() => onViewChange('board')}
            >
                <div className="tw-mr-3">
                    <img
                        src="/logo.png"
                        alt="Logo"
                        className="tw-h-8 tw-w-auto tw-invert tw-opacity-80"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>
                <div>
                    <h1 className="tw-text-2xl tw-font-black tw-tracking-tighter tw-text-white tw-leading-none">
                        <span className="tw-text-emerald-600">R</span>epaper <span className="tw-text-emerald-600">R</span>oute
                    </h1>
                </div>
            </div>

            {/* Navigation */}
            <nav className="tw-flex-1 tw-overflow-y-auto tw-py-6 tw-space-y-8">
                {menuGroups.map((group, gIdx) => (
                    <div key={gIdx} className="tw-px-4">
                        <h3 className="tw-px-4 tw-text-[9px] tw-font-black tw-tracking-[0.2em] tw-mb-4 tw-text-slate-600 tw-uppercase tw-font-mono">
                            {group.title}
                        </h3>
                        <div className="tw-space-y-1">
                            {group.items.map(item => {
                                const isActive = activeView === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onViewChange(item.id)}
                                        className={`
                                            group w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative
                                            ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                            }
                                        `}
                                    >
                                        {isActive && (
                                            <div className="tw-absolute tw-left-0 tw-top-1/2 tw--translate-y-1/2 tw-w-1 tw-h-6 tw-bg-white tw-rounded-r tw-shadow-[0_0_8px_white]" />
                                        )}

                                        <item.icon
                                            size={16}
                                            className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
                                        />
                                        <span className="tw-tracking-tight">{item.label}</span>

                                        {item.highlight && (
                                            <span className="tw-ml-auto tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-emerald-500 tw-shadow-[0_0_8px_rgba(16,185,129,0.8)] tw-animate-pulse" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ユーザープロフィール（簡易表示） */}
            <div className="tw-p-4 tw-border-t tw-border-slate-800 tw-bg-slate-950/20">
                <div className="tw-flex tw-items-center tw-gap-3 tw-px-2">
                    <div className="tw-w-8 tw-h-8 tw-rounded-xl tw-bg-slate-800 tw-border tw-border-slate-700 tw-flex tw-items-center tw-justify-center tw-text-[10px] tw-font-black tw-text-blue-400 tw-shadow-inner">
                        {staff?.name?.substring(0, 1) || 'U'}
                    </div>
                    <div className="tw-flex-1 tw-min-w-0">
                        <p className="tw-text-[10px] tw-font-black tw-truncate tw-text-slate-200 tw-uppercase tw-tracking-tight">{staff?.name || '不明'}</p>
                        <p className="tw-text-[8px] tw-text-slate-500 tw-uppercase tw-tracking-widest tw-font-mono tw-font-bold tw-leading-none tw-mt-0.5">{staff?.role || 'ゲスト'}</p>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="tw-p-2 tw-text-slate-500 tw-hover:text-rose-500 tw-hover:bg-rose-500/10 tw-rounded-xl tw-transition-all"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
};
