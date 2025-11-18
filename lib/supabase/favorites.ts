/**
 * Supabase お気に入り機能ヘルパー関数
 *
 * favoritesテーブルのCRUD操作を提供
 * Row Level Security (RLS) により、ユーザーは自分のお気に入りのみアクセス可能
 */

import { supabase } from './client';
import type { Favorite, Recipe } from '@/types/recipe';

/**
 * お気に入り操作の結果型
 */
export interface FavoritesResult<T = Favorite[]> {
  data: T | null;
  error: string | null;
}

/**
 * お気に入り一覧を取得
 *
 * @returns お気に入りレシピのリスト（新しい順）
 *
 * @example
 * const { data, error } = await getFavorites();
 * if (!error && data) {
 *   console.log('お気に入り:', data);
 * }
 */
export async function getFavorites(): Promise<FavoritesResult<Favorite[]>> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('お気に入り取得エラー:', error);
      return {
        data: null,
        error: getErrorMessage(error),
      };
    }

    return {
      data: data as Favorite[],
      error: null,
    };
  } catch (err) {
    console.error('予期しないエラー:', err);
    return {
      data: null,
      error: '予期しないエラーが発生しました。',
    };
  }
}

/**
 * お気に入りIDから1件取得
 *
 * @param favoriteId - お気に入りID（UUID）
 * @returns お気に入りオブジェクト、見つからない場合はnull
 *
 * @example
 * const { data, error } = await getFavoriteById('favorite-uuid');
 * if (!error && data) {
 *   console.log('お気に入りレシピ:', data.recipe_data);
 * }
 */
export async function getFavoriteById(
  favoriteId: string
): Promise<FavoritesResult<Favorite | null>> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('id', favoriteId)
      .single();

    if (error) {
      // 該当データなしのエラーは正常な結果として扱う
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: null,
        };
      }

      console.error('お気に入り取得エラー:', error);
      return {
        data: null,
        error: getErrorMessage(error),
      };
    }

    return {
      data: data as Favorite,
      error: null,
    };
  } catch (err) {
    console.error('予期しないエラー:', err);
    return {
      data: null,
      error: '予期しないエラーが発生しました。',
    };
  }
}

/**
 * 特定のレシピがお気に入りに登録されているか確認
 *
 * @param recipeTitle - レシピタイトル
 * @returns お気に入り登録されている場合はFavoriteオブジェクト、されていない場合はnull
 *
 * @example
 * const { data, error } = await getFavoriteByRecipeTitle('カレーライス');
 * if (!error && data) {
 *   console.log('このレシピはお気に入りです');
 * }
 */
export async function getFavoriteByRecipeTitle(
  recipeTitle: string
): Promise<FavoritesResult<Favorite | null>> {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('recipe_title', recipeTitle)
      .single();

    if (error) {
      // 該当データなしのエラーは正常な結果として扱う
      if (error.code === 'PGRST116') {
        return {
          data: null,
          error: null,
        };
      }

      console.error('お気に入り確認エラー:', error);
      return {
        data: null,
        error: getErrorMessage(error),
      };
    }

    return {
      data: data as Favorite,
      error: null,
    };
  } catch (err) {
    console.error('予期しないエラー:', err);
    return {
      data: null,
      error: '予期しないエラーが発生しました。',
    };
  }
}

/**
 * レシピをお気に入りに追加
 *
 * @param recipe - 追加するレシピオブジェクト
 * @returns 追加されたFavoriteオブジェクト
 *
 * @example
 * const { data, error } = await addFavorite(recipe);
 * if (!error && data) {
 *   console.log('お気に入りに追加しました');
 * }
 */
export async function addFavorite(
  recipe: Recipe
): Promise<FavoritesResult<Favorite>> {
  try {
    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: 'ログインが必要です。',
      };
    }

    // お気に入りに追加
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        recipe_title: recipe.title,
        recipe_data: recipe,
        source: recipe.source,
      })
      .select()
      .single();

    if (error) {
      console.error('お気に入り追加エラー:', error);
      return {
        data: null,
        error: getErrorMessage(error),
      };
    }

    return {
      data: data as Favorite,
      error: null,
    };
  } catch (err) {
    console.error('予期しないエラー:', err);
    return {
      data: null,
      error: '予期しないエラーが発生しました。',
    };
  }
}

/**
 * お気に入りから削除（レシピタイトルで削除）
 *
 * @param recipeTitle - 削除するレシピのタイトル
 * @returns 削除が成功したかどうか
 *
 * @example
 * const { data, error } = await removeFavoriteByRecipeTitle('カレーライス');
 * if (!error) {
 *   console.log('お気に入りから削除しました');
 * }
 */
export async function removeFavoriteByRecipeTitle(
  recipeTitle: string
): Promise<FavoritesResult<boolean>> {
  try {
    // 現在のユーザーを取得
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: 'ログインが必要です。',
      };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('recipe_title', recipeTitle)
      .eq('user_id', user.id);

    if (error) {
      console.error('お気に入り削除エラー:', error);
      return {
        data: null,
        error: getErrorMessage(error),
      };
    }

    return {
      data: true,
      error: null,
    };
  } catch (err) {
    console.error('予期しないエラー:', err);
    return {
      data: null,
      error: '予期しないエラーが発生しました。',
    };
  }
}

/**
 * お気に入りから削除（お気に入りIDで削除）
 *
 * @param favoriteId - 削除するお気に入りのID（UUID）
 * @returns 削除が成功したかどうか
 *
 * @example
 * const { data, error } = await removeFavoriteById('favorite-uuid');
 * if (!error) {
 *   console.log('お気に入りから削除しました');
 * }
 */
export async function removeFavoriteById(
  favoriteId: string
): Promise<FavoritesResult<boolean>> {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favoriteId);

    if (error) {
      console.error('お気に入り削除エラー:', error);
      return {
        data: null,
        error: getErrorMessage(error),
      };
    }

    return {
      data: true,
      error: null,
    };
  } catch (err) {
    console.error('予期しないエラー:', err);
    return {
      data: null,
      error: '予期しないエラーが発生しました。',
    };
  }
}

/**
 * Supabaseエラーから日本語エラーメッセージを生成
 *
 * @param error - Supabaseエラーオブジェクト
 * @returns 日本語エラーメッセージ
 */
function getErrorMessage(error: any): string {
  const message = error.message || String(error);

  // 重複エラー（既にお気に入り登録済み）
  if (
    message.includes('duplicate key') ||
    message.includes('unique constraint')
  ) {
    return 'このレシピは既にお気に入りに登録されています。';
  }

  // 認証エラー
  if (
    message.includes('JWT') ||
    message.includes('authentication') ||
    message.includes('not authenticated')
  ) {
    return 'ログインが必要です。ログインしてから再度お試しください。';
  }

  // RLSエラー
  if (
    message.includes('row-level security') ||
    message.includes('policy') ||
    message.includes('permission denied')
  ) {
    return 'アクセス権限がありません。';
  }

  // ネットワークエラー
  if (message.includes('network') || message.includes('fetch')) {
    return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
  }

  // その他のエラー
  return 'エラーが発生しました。もう一度お試しください。';
}
