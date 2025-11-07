/**
 * お気に入り一覧ページ
 *
 * ユーザーがお気に入り登録したレシピの一覧を表示
 * - 認証が必要（未認証の場合はログインページにリダイレクト）
 * - お気に入りレシピの表示
 * - お気に入り削除機能
 * - 空状態の表示
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Plus } from 'lucide-react';
import { Loading, Button } from '@/components/ui';
import { FavoritesList } from '@/components/features/favorites';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';

/**
 * お気に入り一覧ページコンポーネント
 *
 * @example
 * URL: /favorites
 */
export default function FavoritesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    favorites,
    isLoading: favoritesLoading,
    error,
    removeFavorite,
  } = useFavorites();

  // 認証チェック：未認証の場合はログインページにリダイレクト
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth?redirect=/favorites');
    }
  }, [authLoading, isAuthenticated, router]);

  // ローディング中の表示
  if (authLoading || !user) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loading size="lg" className="mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  // エラー表示
  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-2">エラーが発生しました</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
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
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-current" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              お気に入りレシピ
            </h1>
          </div>
          <div className="text-xs sm:text-sm text-gray-600">
            {favorites.length > 0 && (
              <span>{favorites.length}件のレシピ</span>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      {favoritesLoading ? (
        // ローディング状態
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <Loading size="lg" className="mb-4" />
          <p className="text-gray-600">お気に入りを読み込み中...</p>
        </div>
      ) : favorites.length === 0 ? (
        // 空状態
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="bg-gray-50 rounded-full p-8 mb-6">
            <Heart className="w-16 h-16 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            お気に入りレシピがありません
          </h2>
          <p className="text-gray-600 mb-8 max-w-md">
            レシピページでハートボタンを押すと、お気に入りに追加できます。
            <br />
            お気に入りのレシピを保存して、いつでも簡単にアクセスできるようにしましょう。
          </p>
          <Button
            onClick={() => router.push('/')}
            variant="solid"
            size="lg"
          >
            <span className="flex items-center justify-center whitespace-nowrap">
              <Plus className="w-5 h-5 mr-2 flex-shrink-0" />
              レシピを探す
            </span>
          </Button>
        </div>
      ) : (
        // お気に入りリスト
        <FavoritesList favorites={favorites} onRemove={removeFavorite} />
      )}
    </main>
  );
}
