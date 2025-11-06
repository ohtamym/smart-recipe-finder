'use client';

import { RecipeCard } from './RecipeCard';
import type { Recipe } from '@/types';

/**
 * RecipeGrid
 *
 * レシピカードをグリッドレイアウトで表示するコンポーネント
 *
 * @param recipes - レシピの配列
 * @param emptyMessage - レシピがない場合のメッセージ（オプション）
 *
 * @example
 * ```tsx
 * <RecipeGrid
 *   recipes={recipes}
 *   emptyMessage="レシピが見つかりませんでした"
 * />
 * ```
 */

export interface RecipeGridProps {
  recipes: Recipe[];
  emptyMessage?: string;
}

export function RecipeGrid({
  recipes,
  emptyMessage = 'レシピが見つかりませんでした',
}: RecipeGridProps) {
  // レシピがない場合
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">🍳</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-600 text-sm">
            別の材料を試してみてください。
          </p>
        </div>
      </div>
    );
  }

  // レシピがある場合はグリッド表示
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="list"
      aria-label="レシピ一覧"
    >
      {recipes.map((recipe) => (
        <div key={recipe.id} role="listitem">
          <RecipeCard recipe={recipe} />
        </div>
      ))}
    </div>
  );
}
