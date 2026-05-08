import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    TrendingUp, 
    Truck, 
    Users, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    ArrowUpRight,
    Database
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../../shared/lib/supabase/client';

// 型定義
interface DashboardStats {
    totalJobs: number;
    completedJobs: number;
    activeDrivers: number;
    activeVehicles: number;
    progressPercent: number;
    recentLogs: any[];
}

export const DashboardView = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalJobs: 0,
        completedJobs: 0,
        activeDrivers: 0,
        activeVehicles: 0,
        progressPercent: 0,
        recentLogs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            // 1 & 2. データの並列取得 (Waterfall解消)
            const [routeResult, logResult] = await Promise.all([
                supabase
                    .from('routes')
                    .select('jobs, drivers')
                    .eq('date', today)
                    .single(),
                supabase
                    .from('event_logs')
                    .select('*, actor:staffs(name)')
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            const { data: routeData, error: routeError } = routeResult;
            const { data: logs, error: logError } = logResult;

            if (routeError && routeError.code !== 'PGRST116') throw routeError;
            if (logError) throw logError;

            // 集計ロジック
            let total = 0;
            let completed = 0;
            let driversCount = 0;

            if (routeData) {
                const jobs = (routeData.jobs as any[]) || [];
                total = jobs.length;
                completed = jobs.filter(j => j.status === 'COMPLETED' || j.is_completed).length;
                
                const drivers = (routeData.drivers as any[]) || [];
                driversCount = drivers.length;
            }

            // 車両数はマスタから簡易取得（本日はモック的に 8 とする）
            setStats({
                totalJobs: total,
                completedJobs: completed,
                activeDrivers: driversCount,
                activeVehicles: Math.min(driversCount, 8),
                progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
                recentLogs: logs || []
            });

        } catch (err) {
            console.error('Dashboard Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
    };

    if (loading) {
        return (
            <div className="tw-p-10 tw-flex tw-items-center tw-justify-center tw-h-full">
                <div className="tw-animate-pulse tw-flex tw-flex-col tw-items-center tw-gap-4">
                    <div className="tw-w-12 tw-h-12 tw-bg-blue-100 tw-rounded-full tw-flex tw-items-center tw-justify-center">
                        <LayoutDashboard className="tw-text-blue-500 tw-animate-spin" />
                    </div>
                    <p className="tw-text-slate-400 tw-text-sm tw-font-bold">インテリジェンス・データを収集中...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            className="tw-p-8 tw-bg-slate-50 tw-dark:bg-slate-950 tw-h-full tw-overflow-auto tw-scrollbar-thin"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between tw-mb-8">
                <div>
                    <h2 className="tw-text-3xl tw-font-black tw-text-slate-800 tw-dark:text-white tw-flex tw-items-center tw-gap-3">
                        <TrendingUp className="tw-text-blue-600" />
                        業務ダッシュボード
                    </h2>
                    <p className="tw-text-slate-500 tw-mt-1 tw-font-medium">
                        本日 ({new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}) の運行概要
                    </p>
                </div>
                <button 
                    onClick={fetchDashboardData}
                    className="tw-px-4 tw-py-2 tw-bg-white tw-dark:bg-slate-900 tw-border tw-border-slate-200 tw-dark:border-slate-800 tw-rounded-xl tw-text-sm tw-font-bold tw-text-slate-600 tw-shadow-sm tw-hover:bg-slate-50 tw-transition-all"
                >
                    最新データに更新
                </button>
            </div>

            {/* KPI Cards */}
            <div className="tw-grid tw-grid-cols-1 tw-md:grid-cols-2 tw-lg:grid-cols-4 tw-gap-6 tw-mb-8">
                <KPICard 
                    title="配車進捗" 
                    value={`${stats.progressPercent}%`} 
                    subValue={`${stats.completedJobs} / ${stats.totalJobs} 件`}
                    icon={<CheckCircle2 size={24} />}
                    color="tw-bg-emerald-500"
                    trend="+5%"
                />
                <KPICard 
                    title="稼働ドライバー" 
                    value={`${stats.activeDrivers}`} 
                    subValue="名"
                    icon={<Users size={24} />}
                    color="tw-bg-blue-500"
                />
                <KPICard 
                    title="稼働車両" 
                    value={`${stats.activeVehicles}`} 
                    subValue="台"
                    icon={<Truck size={24} />}
                    color="tw-bg-violet-500"
                />
                <KPICard 
                    title="予測遅延" 
                    value="0" 
                    subValue="件"
                    icon={<Clock size={24} />}
                    color="tw-bg-amber-500"
                    isAlert={false}
                />
            </div>

            <div className="tw-grid tw-grid-cols-1 tw-lg:grid-cols-3 tw-gap-8">
                {/* Progress Chart Placeholder */}
                <motion.div 
                    variants={itemVariants}
                    className="tw-lg:col-span-2 tw-bg-white tw-dark:bg-slate-900 tw-rounded-3xl tw-p-8 tw-shadow-sm tw-border tw-border-slate-100 tw-dark:border-slate-800"
                >
                    <h3 className="tw-text-lg tw-font-black tw-text-slate-800 tw-dark:text-white tw-mb-6 tw-flex tw-items-center tw-gap-2">
                        <TrendingUp size={20} className="tw-text-blue-500" />
                        時間別回収進捗
                    </h3>
                    <div className="tw-h-64 tw-w-full tw-bg-slate-50 tw-dark:bg-slate-800/50 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-relative tw-overflow-hidden">
                        {/* モックグラフ */}
                        <div className="tw-absolute tw-bottom-0 tw-left-0 tw-right-0 tw-h-32 tw-bg-gradient-to-t tw-from-blue-500/10 tw-to-transparent"></div>
                        <p className="tw-text-slate-400 tw-text-sm tw-font-bold tw-z-10">
                            グラフデータを解析中...
                        </p>
                    </div>
                    
                    <div className="tw-mt-8 tw-grid tw-grid-cols-3 tw-gap-4">
                        <div className="tw-p-4 tw-bg-slate-50 tw-dark:bg-slate-800/30 tw-rounded-2xl">
                            <p className="tw-text-[10px] tw-font-black tw-text-slate-400 tw-uppercase">午前回収</p>
                            <p className="tw-text-xl tw-font-black tw-text-slate-800 tw-dark:text-white">82%</p>
                        </div>
                        <div className="tw-p-4 tw-bg-slate-50 tw-dark:bg-slate-800/30 tw-rounded-2xl">
                            <p className="tw-text-[10px] tw-font-black tw-text-slate-400 tw-uppercase">午後回収</p>
                            <p className="tw-text-xl tw-font-black tw-text-slate-800 tw-dark:text-white">14%</p>
                        </div>
                        <div className="tw-p-4 tw-bg-blue-50 tw-dark:bg-blue-900/20 tw-rounded-2xl tw-border tw-border-blue-100 tw-dark:border-blue-900/30">
                            <p className="tw-text-[10px] tw-font-black tw-text-blue-400 tw-uppercase">総合達成率</p>
                            <p className="tw-text-xl tw-font-black tw-text-blue-600 dark:tw-text-blue-400">{stats.progressPercent}%</p>
                        </div>
                    </div>
                </motion.div>

                {/* Recent SDR Feed */}
                <motion.div 
                    variants={itemVariants}
                    className="tw-bg-white tw-dark:bg-slate-900 tw-rounded-3xl tw-p-8 tw-shadow-sm tw-border tw-border-slate-100 tw-dark:border-slate-800"
                >
                    <h3 className="tw-text-lg tw-font-black tw-text-slate-800 tw-dark:text-white tw-mb-6 tw-flex tw-items-center tw-gap-2">
                        <Database size={20} className="tw-text-blue-500" />
                        最新の業務判断 (SDR)
                    </h3>
                    
                    <div className="tw-space-y-6">
                        {stats.recentLogs.map((log, i) => (
                            <div key={log.id} className="tw-flex tw-gap-4">
                                <div className="tw-relative">
                                    <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-slate-100 tw-dark:bg-slate-800 tw-flex tw-items-center tw-justify-center tw-text-slate-500">
                                        <Users size={14} />
                                    </div>
                                    {i !== stats.recentLogs.length - 1 && (
                                        <div className="tw-absolute tw-top-8 tw-bottom-[-24px] tw-left-1/2 tw-w-0.5 tw-bg-slate-100 tw-dark:bg-slate-800"></div>
                                    )}
                                </div>
                                <div className="tw-flex-1">
                                    <div className="tw-flex tw-items-center tw-justify-between tw-mb-1">
                                        <p className="tw-text-xs tw-font-black tw-text-slate-800 tw-dark:text-white">{log.actor?.name || 'システム'}</p>
                                        <span className="tw-text-[10px] tw-text-slate-400">{new Date(log.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="tw-text-[10px] tw-text-blue-600 tw-dark:text-blue-400 tw-font-black tw-uppercase tw-mb-1">{log.decision_code}</p>
                                    <p className="tw-text-xs tw-text-slate-500 tw-line-clamp-2">
                                        {log.reason_note || '理由未記入'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="tw-w-full tw-mt-8 tw-py-3 tw-bg-slate-50 tw-dark:bg-slate-800 tw-rounded-xl tw-text-xs tw-font-black tw-text-slate-500 tw-hover:bg-slate-100 tw-transition-all">
                        すべての証跡を表示
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

const KPICard = ({ title, value, subValue, icon, color, trend, isAlert }: any) => (
    <motion.div 
        whileHover={{ y: -4 }}
        className="tw-bg-white tw-dark:bg-slate-900 tw-rounded-3xl tw-p-6 tw-shadow-sm tw-border tw-border-slate-100 tw-dark:border-slate-800 tw-relative tw-overflow-hidden"
    >
        <div className={`tw-absolute tw-top-0 tw-right-0 tw-w-24 tw-h-24 tw-opacity-[0.03] tw-translate-x-8 tw--translate-y-8 tw-rotate-12`}>
            {icon}
        </div>
        
        <div className="tw-flex tw-items-center tw-gap-3 tw-mb-4">
            <div className={`tw-w-10 tw-h-10 tw-rounded-xl ${color} tw-text-white tw-flex tw-items-center tw-justify-center tw-shadow-lg tw-shadow-blue-500/10`}>
                {icon}
            </div>
            <p className="tw-text-xs tw-font-black tw-text-slate-400 tw-uppercase tw-tracking-widest">{title}</p>
        </div>
        
        <div className="tw-flex tw-items-baseline tw-gap-2">
            <span className="tw-text-3xl tw-font-black tw-text-slate-800 tw-dark:text-white">{value}</span>
            <span className="tw-text-xs tw-font-bold tw-text-slate-400">{subValue}</span>
        </div>

        {trend && (
            <div className="tw-mt-3 tw-flex tw-items-center tw-gap-1">
                <ArrowUpRight size={14} className="tw-text-emerald-500" />
                <span className="tw-text-[10px] tw-font-black tw-text-emerald-500">{trend} vs 昨日</span>
            </div>
        )}

        {isAlert && (
            <div className="tw-mt-3 tw-flex tw-items-center tw-gap-1">
                <AlertCircle size={14} className="tw-text-rose-500" />
                <span className="tw-text-[10px] tw-font-black tw-text-rose-500">アクションが必要です</span>
            </div>
        )}
    </motion.div>
);
