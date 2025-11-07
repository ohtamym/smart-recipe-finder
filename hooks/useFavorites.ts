/**
 * お気に入り機能のカスタムフック
 *
 * お気に入りレシピの管理（取得、追加、削除、確認）を提供
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getFavorites,
  addFavorite as addFavoriteAPI,
  removeFavoriteByRecipeTitle,
} from '@/lib/supabase';
import { useAuth } from './useAuth';
import type { Favorite, Recipe } from '@/types/recipe';

/**
 * useFavoritesフックの戻り値型
 */
export interface UseFavoritesReturn {
  /** お気に入りレシピのリスト */
  favorites: Favorite[];
  /** ローディング状態 */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** お気に入りを追加する関数 */
  addFavorite: (recipe: Recipe) => Promise<boolean>;
  /** お気に入りを削除する関数（レシピタイトルで削除） */
  removeFavorite: (recipeTitle: string) => Promise<boolean>;
  /** 特定のレシピがお気に入りかどうか確認 */
  isFavorite: (recipeTitle: string) => boolean;
  /** お気に入り一覧を再取得 */
  refresh: () => Promise<void>;
}

/**
 * お気に入り機能のカスタムフック
 *
 * 認証されたユーザーのお気に入りレシピを管理します。
 * ユーザーがログインしている場合、自動的にお気に入りを取得します。
 *
 * @returns お気に入り操作のための関数と状態
 *
 * @example
 * const { favorites, isLoading, addFavorite, removeFavorite, isFavorite } = useFavorites();
 *
 * // お気に入り追加
 * const handleAddFavorite = async () => {
 *   const success = await addFavorite(recipe);
 *   if (success) {
 *     console.log('お気に入りに追加しました');
 *   }
 * };
 *
 * // お気に入り削除
 * const handleRemoveFavorite = async () => {
 *   const success = await removeFavorite(recipe.title);
 *   if (success) {
 *     console.log('お気に入りから削除しました');
 *   }
 * };
 *
 * // お気に入り確認
 * const isRecipeFavorite = isFavorite(recipe.title);
 */
export function useFavorites(): UseFavoritesReturn {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * お気に入り一覧を取得
   */
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await getFavorites();

      if (fetchError) {
        setError(fetchError);
        setFavorites([]);
      } else if (data) {
        setFavorites(data);
      }
    } catch (err) {
      console.error('お気に入り取得エラー:', err);
      setError('お気に入りの取得に失敗しました。');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * ユーザーが変更されたときにお気に入りを再取得
   */
  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites, user]);

  /**
   * お気に入りを追加
   *
   * @param recipe - 追加するレシピ
   * @returns 成功した場合true、失敗した場合false
   */
  const addFavorite = useCallback(
    async (recipe: Recipe): Promise<boolean> => {
      if (!isAuthenticated) {
        setError('ログインが必要です。');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: addError } = await addFavoriteAPI(recipe);

        if (addError) {
          setError(addError);
          return false;
        }

        if (data) {
          // お気に入りリストに追加（先頭に挿入）
          setFavorites((prev) => [data, ...prev]);
          return true;
        }

        return false;
      } catch (err) {
        console.error('お気に入り追加エラー:', err);
        setError('お気に入りの追加に失敗しました。');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * お気に入りを削除
   *
   * @param recipeTitle - 削除するレシピのタイトル
   * @returns 成功した場合true、失敗した場合false
   */
  const removeFavorite = useCallback(
    async (recipeTitle: string): Promise<boolean> => {
      if (!isAuthenticated) {
        setError('ログインが必要です。');
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { error: removeError } = await removeFavoriteByRecipeTitle(recipeTitle);

        if (removeError) {
          setError(removeError);
          return false;
        }

        // お気に入りリストから削除
        setFavorites((prev) =>
          prev.filter((fav) => fav.recipe_title !== recipeTitle)
        );
        return true;
      } catch (err) {
        console.error('お気に入り削除エラー:', err);
        setError('お気に入りの削除に失敗しました。');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  /**
   * 特定のレシピがお気に入りかどうか確認
   *
   * @param recipeTitle - 確認するレシピのタイトル
   * @returns お気に入りの場合true、そうでない場合false
   */
  const isFavorite = useCallback(
    (recipeTitle: string): boolean => {
      return favorites.some((fav) => fav.recipe_title === recipeTitle);
    },
    [favorites]
  );

  /**
   * お気に入り一覧を再取得
   */
  const refresh = useCallback(async () => {
    await fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    isLoading,
    error,
    addFavorite,
    removeFavorite,
    isFavorite,
    refresh,
  };
}
