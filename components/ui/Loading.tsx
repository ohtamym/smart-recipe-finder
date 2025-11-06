import React from 'react';

export interface LoadingProps {
  /** ローディングメッセージ */
  message?: string;
  /** サイズ */
  size?: 'sm' | 'md' | 'lg';
  /** フルスクリーン表示 */
  fullScreen?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * ローディングスピナーコンポーネント
 *
 * 使用例:
 * ```tsx
 * <Loading />
 * <Loading message="読み込み中..." />
 * <Loading size="lg" fullScreen />
 * ```
 */
export function Loading({ message, size = 'md', fullScreen = false, className = '' }: LoadingProps) {
  const sizeStyles = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeStyles[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        />
      </div>
      {message && <p className="text-gray-600 text-sm md:text-base">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      {spinner}
    </div>
  );
}

/**
 * インラインローディングスピナー（小さいサイズ）
 */
export function LoadingInline({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block ${className}`}>
      <div className="h-4 w-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

/**
 * スケルトンローディング（カード用）
 */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 animate-pulse">
      <div className="h-48 bg-gray-200 rounded mb-4" />
      <div className="h-6 bg-gray-200 rounded mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="flex gap-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  );
}

/**
 * スケルトンローディング（リスト用）
 */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
