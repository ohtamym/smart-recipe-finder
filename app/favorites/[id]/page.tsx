'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '@/components/ui';
import { RecipeDetail } from '@/components/features/recipe';
import { getFavoriteById } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Recipe, Favorite } from '@/types';

/**
 * お気に入り詳細ページ
 *
 * URLパラメータからお気に入りIDを取得し、Supabaseからお気に入りデータを取得して表示します。
 *
 * @example
 * URL: /favorites/12345678-abcd-1234-abcd-123456789012
 */

export default function FavoriteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [favorite, setFavorite] = useState<Favorite | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // お気に入りIDを取得
  const favoriteId = params.id as string;

  // お気に入りデータを取得
  useEffect(() => {
    const fetchFavorite = async () => {
      // 認証が完了していない場合は待機
      if (authLoading) {
        return;
      }

      // 未認証の場合はログインページにリダイレクト
      if (!isAuthenticated) {
        router.push('/auth?redirect=/favorites');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Supabaseからお気に入りを取得
        const { data, error: fetchError } = await getFavoriteById(favoriteId);

        if (fetchError) {
          setError(fetchError);
          setIsLoading(false);
          return;
        }

        if (!data) {
          setError('指定されたお気に入りが見つかりませんでした。');
          setIsLoading(false);
          return;
        }

        setFavorite(data);
        setRecipe(data.recipe_data);
        setIsLoading(false);
      } catch (err) {
        console.error('お気に入り取得エラー:', err);
        setError('お気に入りの読み込みに失敗しました。');
        setIsLoading(false);
      }
    };

    fetchFavorite();
  }, [favoriteId, authLoading, isAuthenticated, router]);

  // お気に入り一覧に戻る
  const handleBackToFavorites = () => {
    router.push('/favorites');
  };

  // ホームに戻る
  const handleBackToHome = () => {
    router.push('/');
  };

  // ローディング状態
  if (authLoading || isLoading) {
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
                onClick={handleBackToFavorites}
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                お気に入り一覧に戻る
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
          onClick={handleBackToFavorites}
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          お気に入り一覧に戻る
        </Button>
      </div>

      {/* お気に入り情報 */}
      {favorite && (
        <div className="mb-4 text-sm text-gray-500">
          お気に入り登録日: {new Date(favorite.created_at).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      )}

      {/* レシピ詳細 */}
      <RecipeDetail recipe={recipe} />

      {/* ホームに戻るボタン（下部） */}
      <div className="mt-12 text-center">
        <Button
          onClick={handleBackToFavorites}
          variant="outline"
          size="lg"
          className="inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          お気に入り一覧に戻る
        </Button>
      </div>
    </main>
  );
}
