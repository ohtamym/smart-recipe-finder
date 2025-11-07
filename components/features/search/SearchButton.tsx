'use client';

import { Button } from '@/components/ui';

/**
 * レシピ検索ボタンコンポーネント
 *
 * - 材料からレシピを検索
 * - 材料が1個以上追加されていないと無効化
 * - ローディング状態のサポート
 */

export interface SearchButtonProps {
  /** 材料の数 */
  ingredientsCount: number;
  /** クリックハンドラー */
  onClick: () => void;
  /** ローディング状態 */
  isLoading?: boolean;
  /** 無効化状態（オプション） */
  disabled?: boolean;
}

export function SearchButton({
  ingredientsCount,
  onClick,
  isLoading = false,
  disabled = false,
}: SearchButtonProps) {
  const isDisabled = disabled || ingredientsCount === 0 || isLoading;

  return (
    <div className="w-full">
      <Button
        onClick={onClick}
        disabled={isDisabled}
        isLoading={isLoading}
        fullWidth
        size="lg"
        aria-label={
          ingredientsCount === 0
            ? '材料を追加してください'
            : `${ingredientsCount}個の材料からレシピを検索`
        }
      >
        <span className="flex items-center justify-center gap-2 whitespace-nowrap">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          {isLoading ? 'レシピを検索中...' : 'レシピを検索'}
        </span>
      </Button>

      {/* ヘルプテキスト */}
      {ingredientsCount > 0 && !isLoading && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          {ingredientsCount}個の材料から最適なレシピを提案します
        </p>
      )}

      {ingredientsCount === 0 && !isLoading && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          材料を追加してから検索してください
        </p>
      )}
    </div>
  );
}
