import React from 'react';

export interface ErrorMessageProps {
  /** エラーメッセージ */
  message: string;
  /** タイトル（オプション） */
  title?: string;
  /** リトライボタンを表示 */
  showRetry?: boolean;
  /** リトライボタンのハンドラー */
  onRetry?: () => void;
  /** リトライボタンのラベル */
  retryLabel?: string;
  /** エラーの種類 */
  variant?: 'error' | 'warning' | 'info';
}

/**
 * エラーメッセージコンポーネント
 *
 * 使用例:
 * ```tsx
 * <ErrorMessage message="データの取得に失敗しました" />
 * <ErrorMessage
 *   title="エラー"
 *   message="接続できませんでした"
 *   showRetry
 *   onRetry={() => {}}
 * />
 * ```
 */
export function ErrorMessage({
  message,
  title,
  showRetry = false,
  onRetry,
  retryLabel = '再試行',
  variant = 'error',
}: ErrorMessageProps) {
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg p-4 animate-fadeIn`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0 animate-bounce-subtle">{styles.icon}</span>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                variant === 'error'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : variant === 'warning'
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * インラインエラーメッセージ（小さいサイズ）
 */
export function ErrorMessageInline({
  message,
  className = '',
}: {
  message: string;
  className?: string;
}) {
  return (
    <p className={`text-sm text-red-600 flex items-center gap-1 ${className}`} role="alert">
      <span>⚠️</span>
      <span>{message}</span>
    </p>
  );
}

/**
 * 空状態コンポーネント
 */
export function EmptyState({
  title = 'データがありません',
  message,
  icon = '📭',
  action,
}: {
  title?: string;
  message?: string;
  icon?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-8">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {message && <p className="text-gray-500 mb-6 max-w-md">{message}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
