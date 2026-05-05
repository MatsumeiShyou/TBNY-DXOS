import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary v1.0 - 構造的防護壁
 * 
 * 特定のコンポーネントまたはモジュールで発生した致命的エラーを捕捉し、
 * システム全体のホワイトアウト（全機能停止）を防止する。
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[ERROR_BOUNDARY] ${this.props.name || 'Component'} crash:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="tw-min-h-[400px] tw-w-full tw-flex tw-items-center tw-justify-center tw-p-8 tw-bg-slate-50 tw-rounded-2xl tw-border-2 tw-border-dashed tw-border-slate-200">
          <div className="tw-max-w-md tw-text-center tw-space-y-6">
            <div className="tw-inline-flex tw-p-4 tw-bg-rose-100 tw-text-rose-600 tw-rounded-full tw-animate-pulse">
              <AlertTriangle size={48} />
            </div>
            
            <div className="tw-space-y-2">
              <h2 className="tw-text-2xl tw-font-black tw-text-slate-900 tw-tracking-tight">
                モジュールの実行に失敗しました
              </h2>
              <p className="tw-text-sm tw-text-slate-500 tw-font-medium tw-leading-relaxed">
                申し訳ありません。要求された機能（{this.props.name || '不明なモジュール'}）の読み込み中に予期しないエラーが発生しました。
              </p>
            </div>

            {this.state.error && (
              <div className="tw-p-3 tw-bg-slate-900 tw-rounded-lg tw-text-left">
                <p className="tw-text-[10px] tw-font-mono tw-text-emerald-400 tw-opacity-80 tw-mb-1 tw-uppercase">Error Trace</p>
                <p className="tw-text-[11px] tw-font-mono tw-text-slate-300 tw-break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="tw-flex tw-flex-col tw-gap-3">
              <button
                onClick={this.handleReset}
                className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-slate-900 tw-text-white tw-rounded-xl tw-font-bold tw-text-sm tw-hover:bg-slate-800 tw-transition-all tw-shadow-lg tw-shadow-black/10 tw-active:scale-95"
              >
                <RefreshCw size={18} />
                再読み込みして復旧
              </button>
              
              <button
                onClick={this.handleHome}
                className="tw-w-full tw-flex tw-items-center tw-justify-center tw-gap-2 tw-px-6 tw-py-3 tw-bg-white tw-text-slate-600 tw-border tw-border-slate-200 tw-rounded-xl tw-font-bold tw-text-sm tw-hover:bg-slate-50 tw-transition-all"
              >
                <Home size={18} />
                ダッシュボードへ戻る
              </button>
            </div>
            
            <p className="tw-text-[10px] tw-text-slate-400 tw-font-bold tw-uppercase tw-tracking-widest">
              TBNY DXOS Sanctuary Guard v1.0
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
