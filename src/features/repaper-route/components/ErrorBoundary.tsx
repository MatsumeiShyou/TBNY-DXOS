import { Component, type ErrorInfo, type ReactNode } from 'react';

import { AlertOctagon, RefreshCcw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary:${this.props.name || 'Global'}]`, error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="tw-min-h-screen tw-bg-slate-50 tw-flex tw-items-center tw-justify-center tw-p-6 tw-font-sans">
                    <div className="tw-max-w-md tw-w-full tw-bg-white tw-rounded-xl tw-shadow-2xl tw-border tw-border-red-100 tw-overflow-hidden">
                        <div className="tw-bg-red-600 tw-px-6 tw-py-4 tw-flex tw-items-center tw-gap-3 tw-text-white">
                            <AlertOctagon size={24} />
                            <h2 className="tw-text-lg tw-font-bold">システムエラーが発生しました</h2>
                        </div>

                        <div className="tw-p-6">
                            <p className="tw-text-slate-600 tw-mb-6 tw-text-sm tw-leading-relaxed">
                                アプリケーションの実行中に予期せぬエラーが発生しました。
                                {this.state.error?.message && (
                                    <span className="tw-block tw-mt-2 tw-font-mono tw-text-red-500 tw-bg-red-50 tw-p-2 tw-rounded tw-text-xs tw-break-all">
                                        Detail: {this.state.error.message}
                                    </span>
                                )}
                            </p>

                            <div className="tw-flex tw-flex-col tw-gap-3">
                                <button
                                    onClick={this.handleReload}
                                    className="tw-w-full tw-bg-slate-800 tw-hover:bg-slate-900 tw-text-white tw-font-bold tw-py-2.5 tw-px-4 tw-rounded-lg tw-transition-all tw-flex tw-items-center tw-justify-center tw-gap-2 tw-shadow-md"
                                >
                                    <RefreshCcw size={18} />
                                    ページを再読み込み
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="tw-w-full tw-bg-white tw-hover:bg-slate-50 tw-text-slate-700 tw-border tw-border-slate-200 tw-font-bold tw-py-2.5 tw-px-4 tw-rounded-lg tw-transition-all tw-flex tw-items-center tw-justify-center tw-gap-2"
                                >
                                    <Home size={18} />
                                    トップに戻る
                                </button>
                            </div>

                            {import.meta.env.NODE_ENV === 'development' && this.state.errorInfo && (
                                <details className="tw-mt-8">
                                    <summary className="tw-text-xs tw-text-slate-400 tw-cursor-pointer tw-hover:text-slate-600">
                                        Stack Trace (Dev only)
                                    </summary>
                                    <pre className="tw-mt-2 tw-p-3 tw-bg-slate-900 tw-text-slate-300 tw-text-[10px] tw-rounded tw-overflow-auto tw-max-h-40 tw-leading-tight tw-font-mono">
                                        {this.state.error?.stack}
                                        {"\n\nComponent Stack:\n"}
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
