'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '@/components/ui';
import { RecipeDetail } from '@/components/features/recipe';
import type { Recipe } from '@/types';

/**
 * レシピ詳細ページ
 *
 * URLパラメータからレシピIDを取得し、sessionStorageからレシピデータを取得して表示します。
 *
 * @example
 * URL: /recipes/gemini-1234567890
 */

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // レシピIDを取得
  const recipeId = params.id as string;

  // sessionStorageからレシピを取得
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      // sessionStorageからレシピリストを取得
      const recipesJson = sessionStorage.getItem('recipes');

      if (!recipesJson) {
        setError('レシピデータが見つかりませんでした。検索結果から再度お試しください。');
        setIsLoading(false);
        return;
      }

      // JSON パース
      const recipes: Recipe[] = JSON.parse(recipesJson);

      // IDに一致するレシピを検索
      const foundRecipe = recipes.find((r) => r.id === recipeId);

      if (!foundRecipe) {
        setError('指定されたレシピが見つかりませんでした。');
        setIsLoading(false);
        return;
      }

      setRecipe(foundRecipe);
      setIsLoading(false);
    } catch (err) {
      console.error('レシピデータの取得エラー:', err);
      setError('レシピデータの読み込みに失敗しました。');
      setIsLoading(false);
    }
  }, [recipeId]);

  // レシピ一覧に戻る
  const handleBackToList = () => {
    router.back();
  };

  // ホームに戻る
  const handleBackToHome = () => {
    router.push('/');
  };

  // ローディング状態
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loading size="lg" className="mb-4" />
          <p className="text-gray-600">レシピを読み込んでいます...</p>
        </div>
      </main>
    );
  }

  // エラー状態
  if (error || !recipe) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="mb-6 text-6xl">😕</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              レシピが見つかりません
            </h1>
            <ErrorMessage
              message={error || 'レシピが見つかりませんでした'}
              variant="error"
            />
            <div className="mt-6 flex gap-3 justify-center">
              <Button
                onClick={handleBackToList}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                検索結果に戻る
              </Button>
              <Button
                onClick={handleBackToHome}
                variant="solid"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                ホームに戻る
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // レシピ表示
  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ナビゲーション */}
      <div className="mb-6">
        <Button
          onClick={handleBackToList}
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          検索結果に戻る
        </Button>
      </div>

      {/* レシピ詳細 */}
      <RecipeDetail recipe={recipe} />

      {/* ホームに戻るボタン（下部） */}
      <div className="mt-12 text-center">
        <Button
          onClick={handleBackToHome}
          variant="outline"
          size="lg"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          別の材料で検索する
        </Button>
      </div>
    </main>
  );
}
