import { useState } from 'react';
import { Shield, Loader2, LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../../../../../../../../AuthAdapterPort';

export const ProfilePortal: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { status } = useAuth();

    React.useEffect(() => {
        // AuthProvider側で権限エラー等により未認証状態に戻された場合、ローディングを解除する
        if (status === 'UNAUTHENTICATED' || status === 'NOT_REGISTERED') {
            setIsLoading(false);
        }
    }, [status]);

    const displayError = error || (status === 'NOT_REGISTERED' ? 'スタッフ名簿に登録されていません。管理者に申請してください。' : null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

        if (authError) {
            setError('メールアドレスまたはパスワードが正しくありません。');
            setIsLoading(false);
        }
        // 成功時は AuthProvider の onAuthStateChange が SIGNED_IN を検知し自動遷移
    };

    return (
        <div className="tw-min-h-screen tw-bg-slate-950 tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-6 tw-text-slate-100">
            <div className="tw-w-full tw-max-w-sm">
                <div className="tw-bg-slate-900 tw-rounded-3xl tw-shadow-2xl tw-overflow-hidden tw-border tw-border-slate-800">
                    <div className="tw-p-8 tw-text-center tw-bg-slate-950 tw-border-b tw-border-white/5">
                        <div className="tw-w-14 tw-h-14 tw-bg-emerald-500/10 tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-text-emerald-500">
                            <Shield size={28} />
                        </div>
                        <h1 className="tw-text-2xl tw-font-black tw-tracking-tighter tw-mb-1">RePaper Route</h1>
                        <p className="tw-text-slate-500 tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-widest">
                            Sanctuary DXOS Portal Access
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="tw-p-6 tw-space-y-4">
                        <div className="tw-space-y-1">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">
                                メールアドレス
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                className="tw-w-full tw-px-4 tw-py-3 tw-bg-slate-800 tw-border tw-border-slate-700 tw-rounded-xl tw-text-sm tw-focus:ring-2 tw-focus:ring-emerald-500 tw-focus:border-transparent tw-outline-none tw-transition-all tw-text-white tw-placeholder-slate-600"
                                placeholder="staff@example.com"
                            />
                        </div>

                        <div className="tw-space-y-1">
                            <label className="tw-text-[11px] tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">
                                パスワード
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                className="tw-w-full tw-px-4 tw-py-3 tw-bg-slate-800 tw-border tw-border-slate-700 tw-rounded-xl tw-text-sm tw-focus:ring-2 tw-focus:ring-emerald-500 tw-focus:border-transparent tw-outline-none tw-transition-all tw-text-white tw-placeholder-slate-600"
                                placeholder="••••••••"
                            />
                        </div>

                        {displayError && (
                            <div className="tw-flex tw-items-center tw-gap-2 tw-p-3 tw-bg-rose-900/30 tw-border tw-border-rose-500/30 tw-rounded-xl tw-text-rose-400 tw-text-xs tw-animate-in tw-fade-in">
                                <AlertCircle size={14} className="tw-shrink-0" />
                                {displayError}
                            </div>
                        )}

                        <button
                            id="login-submit"
                            type="submit"
                            disabled={isLoading}
                            className="tw-w-full tw-h-12 tw-bg-emerald-600 tw-hover:bg-emerald-500 tw-disabled:bg-slate-700 tw-disabled:cursor-not-allowed tw-text-white tw-font-black tw-text-sm tw-rounded-xl tw-transition-all tw-flex tw-items-center tw-justify-center tw-gap-2 tw-shadow-lg tw-shadow-emerald-900/30 tw-active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="tw-animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    ログイン
                                </>
                            )}
                        </button>
                    </form>

                    <div className="tw-bg-slate-950 tw-p-4 tw-text-center tw-border-t tw-border-white/5">
                        <p className="tw-text-[10px] tw-text-slate-700 tw-font-bold tw-uppercase tw-tracking-[0.2em]">
                            Powered by TBNY DXOS Auth Layer
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePortal;
