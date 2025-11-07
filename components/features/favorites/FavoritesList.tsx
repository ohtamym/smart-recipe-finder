/**
 * お気に入りリストコンポーネント
 *
 * お気に入りレシピの一覧を表示し、各レシピカードに削除ボタンを提供
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Clock, Users, TrendingUp } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { Favorite } from '@/types/recipe';

/**
 * FavoritesListコンポーネントのプロパティ
 */
export interface FavoritesListProps {
  /** お気に入りレシピのリスト */
  favorites: Favorite[];
  /** お気に入り削除時のコールバック */
  onRemove: (recipeTitle: string) => Promise<boolean>;
}

// 難易度の日本語表示
const DIFFICULTY_LABEL: Record<string, string> = {
  easy: '簡単',
  medium: '普通',
  hard: '難しい',
};

// 難易度の色
const DIFFICULTY_COLOR: Record<string, string> = {
  easy: 'text-green-600 bg-green-50',
  medium: 'text-yellow-600 bg-yellow-50',
  hard: 'text-red-600 bg-red-50',
};

// ソースの日本語表示
const SOURCE_LABEL: Record<string, string> = {
  ai: 'AI生成',
  api: '外部API',
};

// ソースのアイコン色
const SOURCE_COLOR: Record<string, string> = {
  ai: 'text-purple-600 bg-purple-50',
  api: 'text-blue-600 bg-blue-50',
};

/**
 * お気に入りリストコンポーネント
 *
 * @example
 * <FavoritesList
 *   favorites={favorites}
 *   onRemove={handleRemove}
 * />
 */
export function FavoritesList({ favorites, onRemove }: FavoritesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * レシピカードクリックハンドラー
   * sessionStorageにレシピデータを保存して、レシピ詳細ページで使用できるようにする
   */
  const handleRecipeClick = () => {
    try {
      // お気に入りからレシピデータを抽出
      const recipes = favorites.map((fav) => fav.recipe_data);
      // sessionStorageに保存（レシピ詳細ページで使用）
      sessionStorage.setItem('recipes', JSON.stringify(recipes));
    } catch (error) {
      console.error('sessionStorageへの保存エラー:', error);
    }
  };

  /**
   * 削除ボタンクリックハンドラー
   */
  const handleRemove = async (
    e: React.MouseEvent,
    recipeTitle: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // 確認ダイアログ
    const confirmed = window.confirm(
      `「${recipeTitle}」をお気に入りから削除しますか？`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(recipeTitle);

    try {
      const success = await onRemove(recipeTitle);
      if (!success) {
        alert('お気に入りの削除に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      console.error('お気に入り削除エラー:', error);
      alert('エラーが発生しました。もう一度お試しください。');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((favorite) => {
        const recipe = favorite.recipe_data;
        const isDeleting = deletingId === recipe.title;

        return (
          <Link
            key={favorite.id}
            href={`/recipes/${recipe.id}`}
            onClick={handleRecipeClick}
            className="group block"
          >
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer relative">
              {/* 削除ボタン */}
              <div className="absolute top-2 right-2 z-10">
                <Button
                  onClick={(e) => handleRemove(e, recipe.title)}
                  disabled={isDeleting}
                  variant="ghost"
                  size="sm"
                  className="bg-white/90 hover:bg-red-50 hover:text-red-600 shadow-sm"
                  aria-label="お気に入りから削除"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* レシピ画像 */}
              {recipe.imageUrl && (
                <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-gray-100">
                  <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  {/* ソースバッジ */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`${
                        SOURCE_COLOR[recipe.source]
                      } px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      {SOURCE_LABEL[recipe.source]}
                    </span>
                  </div>
                </div>
              )}

              {/* レシピ情報 */}
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {recipe.title}
                  </CardTitle>
                </div>
              </CardHeader>

              <CardContent>
                {/* 説明 */}
                {recipe.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {recipe.description}
                  </p>
                )}

                {/* メタ情報 */}
                <div className="flex items-center justify-between gap-4 text-sm text-gray-600">
                  {/* 調理時間 */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    <span>{recipe.cookTime}分</span>
                  </div>

                  {/* 人数 */}
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    <span>{recipe.servings}人分</span>
                  </div>

                  {/* 難易度 */}
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" aria-hidden="true" />
                    <span
                      className={`${
                        DIFFICULTY_COLOR[recipe.difficulty]
                      } px-2 py-0.5 rounded-full text-xs font-medium`}
                    >
                      {DIFFICULTY_LABEL[recipe.difficulty]}
                    </span>
                  </div>
                </div>

                {/* 登録日 */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    登録日: {new Date(favorite.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
