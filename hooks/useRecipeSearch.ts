import { useState, useEffect, useCallback } from 'react';
import type { Recipe, ApiResponse } from '@/types';

/**
 * useRecipeSearch
 *
 * レシピ検索APIを呼び出すカスタムフック
 * キャッシュ機能により、同じ材料での検索結果を再利用できます
 *
 * @param ingredients - 検索する材料のリスト
 * @returns レシピ検索の状態とメソッド
 *
 * @example
 * ```tsx
 * const { recipes, isLoading, error, search, reset, isFromCache } = useRecipeSearch(['玉ねぎ', 'にんじん']);
 * ```
 */

export interface UseRecipeSearchReturn {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  search: (ingredients: string[], forceRefresh?: boolean) => Promise<void>;
  reset: () => void;
  isFromCache: boolean;
}

/**
 * 材料リストからキャッシュキーを生成
 * 材料をソートして順序に依存しないキーを作成
 */
function generateCacheKey(ingredients: string[]): string {
  const sortedIngredients = [...ingredients].sort().join(',');
  return `recipes-cache-${sortedIngredients}`;
}

/**
 * sessionStorageからキャッシュを取得
 */
function getCachedRecipes(ingredients: string[]): Recipe[] | null {
  try {
    const cacheKey = generateCacheKey(ingredients);
    const cached = sessionStorage.getItem(cacheKey);

    if (cached) {
      const recipes = JSON.parse(cached) as Recipe[];
      console.log('💾 キャッシュからレシピを読み込みました:', recipes.length, '件');
      return recipes;
    }
  } catch (error) {
    console.error('キャッシュの読み込みエラー:', error);
  }

  return null;
}

/**
 * sessionStorageにキャッシュを保存
 */
function setCachedRecipes(ingredients: string[], recipes: Recipe[]): void {
  try {
    const cacheKey = generateCacheKey(ingredients);
    sessionStorage.setItem(cacheKey, JSON.stringify(recipes));
    // レシピ詳細ページ用のキャッシュも更新
    sessionStorage.setItem('recipes', JSON.stringify(recipes));
    console.log('💾 キャッシュにレシピを保存しました:', recipes.length, '件');
  } catch (error) {
    console.error('キャッシュの保存エラー:', error);
  }
}

/**
 * キャッシュをクリア
 */
function clearCache(ingredients: string[]): void {
  try {
    const cacheKey = generateCacheKey(ingredients);
    sessionStorage.removeItem(cacheKey);
    console.log('🗑️ キャッシュをクリアしました');
  } catch (error) {
    console.error('キャッシュのクリアエラー:', error);
  }
}

export function useRecipeSearch(
  initialIngredients?: string[]
): UseRecipeSearchReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState<boolean>(false);

  /**
   * レシピを検索する
   * @param ingredients - 検索する材料のリスト
   * @param forceRefresh - trueの場合、キャッシュを無視して新規取得
   */
  const search = useCallback(async (ingredients: string[], forceRefresh = false) => {
    // 材料が空の場合はスキップ
    if (!ingredients || ingredients.length === 0) {
      setError('材料を入力してください');
      setRecipes([]);
      setIsFromCache(false);
      return;
    }

    // 強制再取得の場合はキャッシュをクリア
    if (forceRefresh) {
      clearCache(ingredients);
    }

    // キャッシュチェック
    if (!forceRefresh) {
      const cachedRecipes = getCachedRecipes(ingredients);
      if (cachedRecipes) {
        setRecipes(cachedRecipes);
        setError(null);
        setIsFromCache(true);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      console.log('🔍 レシピ検索中...', ingredients);

      const response = await fetch('/api/recipes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = (await response.json()) as ApiResponse<{
        recipes: Recipe[];
        total: number;
      }>;

      // エラーレスポンスの処理
      if (!response.ok || !data.success) {
        // 型ガード: successがfalseの場合はApiErrorResponse
        const errorMessage = !data.success
          ? data.error.message
          : 'レシピの検索に失敗しました';
        setError(errorMessage);
        setRecipes([]);
        console.error('❌ レシピ検索エラー:', errorMessage);
        return;
      }

      // 成功レスポンスの処理
      // 型ガード: successがtrueの場合はApiSuccessResponse
      if (data.data) {
        const fetchedRecipes = data.data.recipes;
        setRecipes(fetchedRecipes);
        setError(null);

        // キャッシュに保存
        setCachedRecipes(ingredients, fetchedRecipes);

        console.log(`✅ ${fetchedRecipes.length}件のレシピを取得しました`);
      } else {
        setError('レシピが見つかりませんでした');
        setRecipes([]);
      }
    } catch (err) {
      console.error('❌ ネットワークエラー:', err);
      setError(
        'ネットワークエラーが発生しました。インターネット接続を確認してください。'
      );
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 状態をリセットする
   */
  const reset = useCallback(() => {
    setRecipes([]);
    setIsLoading(false);
    setError(null);
    setIsFromCache(false);
  }, []);

  /**
   * 初期材料が指定されている場合は自動検索
   */
  useEffect(() => {
    if (initialIngredients && initialIngredients.length > 0) {
      search(initialIngredients);
    }
  }, [initialIngredients, search]);

  return {
    recipes,
    isLoading,
    error,
    search,
    reset,
    isFromCache,
  };
}
