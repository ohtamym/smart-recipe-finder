'use client';

import { Recipe } from '@/types';
import { Clock, Users, TrendingUp } from 'lucide-react';
import { IngredientList } from './IngredientList';
import { InstructionList } from './InstructionList';
import { FavoriteButton } from '@/components/features/favorites';
import Image from 'next/image';

/**
 * レシピ詳細コンポーネント
 *
 * レシピの全詳細情報を表示
 */

export interface RecipeDetailProps {
  /** レシピデータ */
  recipe: Recipe;
}

const difficultyLabels = {
  easy: '簡単',
  medium: '普通',
  hard: '難しい',
};

const difficultyColors = {
  easy: 'text-green-700 bg-green-100',
  medium: 'text-yellow-700 bg-yellow-100',
  hard: 'text-red-700 bg-red-100',
};

const sourceLabels = {
  ai: 'AI生成',
  api: '外部API',
};

const sourceColors = {
  ai: 'text-purple-700 bg-purple-100',
  api: 'text-blue-700 bg-blue-100',
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <div className="space-y-6">
      {/* ヘッダーセクション */}
      <div className="space-y-4">
        {/* レシピ画像 */}
        {recipe.imageUrl && (
          <div className="relative w-full h-56 sm:h-64 md:h-96 rounded-lg overflow-hidden bg-gray-200">
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* タイトルとバッジ */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            {recipe.title}
          </h1>

          {/* バッジ */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                difficultyColors[recipe.difficulty]
              }`}
            >
              {difficultyLabels[recipe.difficulty]}
            </span>
            <span
              className={`px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                sourceColors[recipe.source]
              }`}
            >
              {sourceLabels[recipe.source]}
            </span>
          </div>
        </div>

        {/* 説明 */}
        {recipe.description && (
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            {recipe.description}
          </p>
        )}

        {/* メタ情報 */}
        <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>{recipe.cookTime}分</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>{recipe.servings}人分</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
            <span>{difficultyLabels[recipe.difficulty]}</span>
          </div>
        </div>

        {/* お気に入りボタン */}
        <div className="max-w-full sm:max-w-md">
          <FavoriteButton recipe={recipe} />
        </div>

        {/* タグ */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 材料セクション */}
      <section className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">材料</h2>
        <IngredientList ingredients={recipe.ingredients} recipeTitle={recipe.title} />
      </section>

      {/* 調理手順セクション */}
      <section className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">作り方</h2>
        <InstructionList instructions={recipe.instructions} />
      </section>
    </div>
  );
}
