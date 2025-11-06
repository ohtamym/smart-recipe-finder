import React from "react";

export interface CardProps {
  /** カードの内容 */
  children: React.ReactNode;
  /** 追加のCSSクラス */
  className?: string;
  /** クリック可能かどうか */
  clickable?: boolean;
  /** クリック時のハンドラー */
  onClick?: () => void;
  /** パディングを無効化 */
  noPadding?: boolean;
}

/**
 * 汎用カードコンポーネント
 *
 * 使用例:
 * ```tsx
 * <Card>コンテンツ</Card>
 * <Card clickable onClick={() => {}}>クリック可能なカード</Card>
 * ```
 */
export function Card({
  children,
  className = "",
  clickable = false,
  onClick,
  noPadding = false,
}: CardProps) {
  const baseStyles = "bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-200";
  const paddingStyles = noPadding ? "" : "p-4";
  const clickableStyles = clickable
    ? "cursor-pointer hover:shadow-xl hover:border-gray-200 hover:-translate-y-0.5"
    : "";

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (clickable && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  // clickableがtrueの場合のみイベントハンドラーを設定
  const eventHandlers = clickable
    ? {
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        role: "button" as const,
        tabIndex: 0,
      }
    : {};

  return (
    <div
      className={`${baseStyles} ${paddingStyles} ${clickableStyles} ${className}`}
      {...eventHandlers}
    >
      {children}
    </div>
  );
}

/**
 * カードヘッダーコンポーネント
 */
export function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

/**
 * カードタイトルコンポーネント
 */
export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

/**
 * カードコンテンツコンポーネント
 */
export function CardContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/**
 * カードフッターコンポーネント
 */
export function CardFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
}
