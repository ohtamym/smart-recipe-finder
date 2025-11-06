'use client';

import Link from 'next/link';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { FavoriteButton } from '@/components/features/favorites';
import type { Recipe } from '@/types';

/**
 * RecipeCard
 *
 * レシピカードコンポーネント
 *
 * レシピの基本情報を表示し、クリックで詳細ページに遷移できるカード
 *
 * @param recipe - レシピオブジェクト
 *
 * @example
 * ```tsx
 * <RecipeCard recipe={recipe} />
 * ```
 */

export interface RecipeCardProps {
  recipe: Recipe;
}

// 難易度の日本語表示
const DIFFICULTY_LABEL: Record<Recipe['difficulty'], string> = {
  easy: '簡単',
  medium: '普通',
  hard: '難しい',
};

// 難易度の色
const DIFFICULTY_COLOR: Record<Recipe['difficulty'], string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
};

// ソースの日本語表示
const SOURCE_LABEL: Record<Recipe['source'], string> = {
  ai: 'AI生成',
  api: '外部API',
};

// ソースのアイコン色
const SOURCE_COLOR: Record<Recipe['source'], string> = {
  ai: 'text-purple-600 bg-purple-50',
  api: 'text-blue-600 bg-blue-50',
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const {
    id,
    title,
    description,
    cookTime,
    difficulty,
    servings,
    imageUrl,
    source,
  } = recipe;

  return (
    <Link href={`/recipes/${id}`} className="group block">
      <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        {/* レシピ画像 */}
        {imageUrl && (
          <div className="relative w-full h-40 sm:h-48 overflow-hidden rounded-t-lg">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            {/* ソースバッジ */}
            <div className="absolute top-2 right-2">
              <span
                className={`${SOURCE_COLOR[source]} px-2 py-1 rounded-full text-xs font-medium shadow-sm`}
              >
                {SOURCE_LABEL[source]}
              </span>
            </div>
          </div>
        )}

        {/* レシピ情報 */}
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {/* 説明 */}
          {description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-4">
              {description}
            </p>
          )}

          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-600 mb-4">
            {/* 調理時間 */}
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              <span>{cookTime}分</span>
            </div>

            {/* 人数 */}
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              <span>{servings}人分</span>
            </div>

            {/* 難易度 */}
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
              <span
                className={`${DIFFICULTY_COLOR[difficulty]} px-2 py-0.5 rounded-full text-xs font-medium`}
              >
                {DIFFICULTY_LABEL[difficulty]}
              </span>
            </div>
          </div>

          {/* お気に入りボタン */}
          <div className="mt-2">
            <FavoriteButton recipe={recipe} size="sm" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
