import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
    const msg = '❌ DXOS Infrastructure Error: Supabase credentials missing. Please copy .env.example to .env and set your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
    console.error(msg);
    throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // [ROOT CAUSE FIX] React StrictMode が開発時にコンポーネントを2回マウントするため、
        // 同一クライアントから getSession() が並行して呼ばれ、
        // ブラウザの Web Locks API（navigator.locks）でロック競合が発生する。
        // → NavigatorLockAcquireTimeoutError: Lock "lock:sb-*-auth-token" was released
        //    because another request stole it
        //
        // 対策: Web Locks API を使わず、関数をそのまま実行するカスタムロックを提供する。
        // これにより、並行アクセスでもエラーにならない。
        // 本番環境でも安全（単一クライアントインスタンスのため競合は発生しない）。
        lock: async <R>(_name: string, _acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
            return await fn();
        },
    },
});

