import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

interface GlobalErrorScreenProps {
  error: Error;
  onRetry: () => void;
}

const GlobalErrorScreen: React.FC<GlobalErrorScreenProps> = ({ error, onRetry }) => {
  return (
    <div className="tw-flex tw-items-center tw-justify-center tw-min-h-screen tw-bg-background-primary tw-text-text-primary tw-p-4">
      <div className="tw-text-center tw-max-w-md tw-p-8 tw-bg-background-secondary tw-rounded-lg tw-border tw-border-border-default tw-shadow-lg">
        <AlertTriangle className="tw-mx-auto tw-h-16 tw-w-16 tw-text-error" />
        <h1 className="tw-mt-6 tw-text-2xl tw-font-bold tw-text-text-primary">
          問題が発生しました
        </h1>
        <p className="tw-mt-2 tw-text-text-secondary">
          アプリケーションの読み込み中に予期せぬエラーが発生しました。
          ネットワーク接続を確認するか、しばらくしてからもう一度お試しください。
        </p>
        <details className="tw-mt-4 tw-text-left tw-bg-background-tertiary tw-p-2 tw-rounded-md tw-text-xs">
          <summary className="tw-cursor-pointer tw-text-text-secondary">エラー詳細</summary>
          <pre className="tw-mt-2 tw-whitespace-pre-wrap tw-break-all tw-text-error tw-font-mono">
            <code>{error.name}: {error.message}</code>
          </pre>
        </details>
        <Button onClick={onRetry} size="lg" className="tw-mt-8">
          再読み込み
        </Button>
      </div>
    </div>
  );
};

export default GlobalErrorScreen;
