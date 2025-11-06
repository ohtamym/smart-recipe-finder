'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, RefreshCw, Database } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '@/components/ui';
import { RecipeGrid } from '@/components/features/recipe';
import { useRecipeSearch } from '@/hooks/useRecipeSearch';

/**
 * レシピ一覧ページ
 *
 * URLクエリパラメータから材料を取得し、レシピを検索して表示します。
 *
 * @example
 * URL: /recipes?ingredients=玉ねぎ,にんじん,じゃがいも
 */

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [ingredients, setIngredients] = useState<string[]>([]);

  // クエリパラメータから材料を取得
  useEffect(() => {
    const ingredientsParam = searchParams.get('ingredients');
    if (ingredientsParam) {
      const ingredientsList = ingredientsParam
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);
      setIngredients(ingredientsList);
    }
  }, [searchParams]);

  // レシピ検索フック
  const { recipes, isLoading, error, search, isFromCache } = useRecipeSearch();

  // 材料が変更されたら検索を実行
  useEffect(() => {
    if (ingredients.length > 0) {
      search(ingredients);
    }
  }, [ingredients, search]);

  // ホームに戻る
  const handleBackToHome = () => {
    router.push('/');
  };

  // 再生成ボタン
  const handleRefresh = () => {
    if (ingredients.length > 0) {
      search(ingredients, true); // forceRefresh = true
    }
  };

  // 材料が指定されていない場合
  if (ingredients.length === 0 && !isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="mb-6 text-6xl">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              材料が指定されていません
            </h1>
            <p className="text-gray-600 mb-8">
              ホームページから材料を入力してレシピを検索してください。
            </p>
            <Button
              onClick={handleBackToHome}
              variant="solid"
              size="lg"
              className="inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              ホームに戻る
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      {/* ヘッダー */}
      <div className="mb-6 sm:mb-8">
        <Button
          onClick={handleBackToHome}
          variant="ghost"
          size="sm"
          className="mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          材料を変更する
        </Button>

        <div className="space-y-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              レシピ検索結果
            </h1>
            <div className="flex items-start gap-2 text-gray-600 mb-3">
              <Search className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm break-words">
                検索材料: {ingredients.join(', ')}
              </span>
            </div>

            {/* レシピ件数とキャッシュインジケーター */}
            {!isLoading && !error && recipes.length > 0 && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
                  {recipes.length}件のレシピ
                </div>
                {isFromCache && (
                  <div className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-full text-xs sm:text-sm">
                    <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>キャッシュ</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 再生成ボタン */}
          {!isLoading && !error && recipes.length > 0 && (
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="md"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              新しいレシピを探す
            </Button>
          )}
        </div>
      </div>

      {/* ローディング状態 */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loading size="lg" className="mb-4" />
          <p className="text-gray-600">
            AIがレシピを生成しています...
            <br />
            <span className="text-sm text-gray-500">
              少々お待ちください（最大30秒）
            </span>
          </p>
        </div>
      )}

      {/* エラー状態 */}
      {error && !isLoading && (
        <div className="mb-8">
          <ErrorMessage
            message={error}
            onRetry={() => search(ingredients)}
            retryLabel="再試行"
          />
        </div>
      )}

      {/* レシピ一覧 */}
      {!isLoading && !error && (
        <RecipeGrid
          recipes={recipes}
          emptyMessage="レシピが見つかりませんでした"
        />
      )}

      {/* ヒント */}
      {!isLoading && !error && recipes.length > 0 && (
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 ヒント
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>・レシピカードをクリックすると詳細が表示されます</li>
            <li>
              ・手持ちの材料で作れるレシピと、追加材料が必要なレシピが混在しています
            </li>
            <li>・AIが生成したレシピには「AI生成」バッジが表示されます</li>
          </ul>
        </div>
      )}
    </main>
  );
}
