/**
 * お気に入りボタンコンポーネント
 *
 * レシピをお気に入りに追加/削除するボタン
 * - 認証されていない場合はログインページにリダイレクト
 * - お気に入り状態に応じてボタンの表示を変更
 * - ローディング状態の表示
 */

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import type { Recipe } from '@/types/recipe';

/**
 * FavoriteButtonコンポーネントのプロパティ
 */
export interface FavoriteButtonProps {
  /** レシピオブジェクト */
  recipe: Recipe;
  /** ボタンのバリアント（デフォルト: 'outline'） */
  variant?: 'solid' | 'outline' | 'ghost';
  /** ボタンのサイズ（デフォルト: 'md'） */
  size?: 'sm' | 'md' | 'lg';
  /** 横幅いっぱいに表示するか（デフォルト: true） */
  fullWidth?: boolean;
  /** カスタムクラス名 */
  className?: string;
}

/**
 * お気に入りボタンコンポーネント
 *
 * @example
 * <FavoriteButton recipe={recipe} />
 *
 * @example
 * <FavoriteButton
 *   recipe={recipe}
 *   variant="ghost"
 *   size="sm"
 *   fullWidth={false}
 * />
 */
export function FavoriteButton({
  recipe,
  variant = 'outline',
  size = 'md',
  fullWidth = true,
  className = '',
}: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, isLoading } = useFavorites();
  const [isProcessing, setIsProcessing] = useState(false);

  // お気に入り状態を判定
  const favorited = isFavorite(recipe.title);

  /**
   * お気に入りボタンクリックハンドラー
   */
  const handleClick = async (e: React.MouseEvent) => {
    // イベントの伝播を停止（カード全体のクリックイベントと干渉しないように）
    e.stopPropagation();
    e.preventDefault();

    // 未認証の場合はログインページにリダイレクト
    if (!isAuthenticated) {
      // 現在のパスをリダイレクト先として渡す
      router.push(`/auth?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsProcessing(true);

    try {
      if (favorited) {
        // お気に入りから削除
        const success = await removeFavorite(recipe.title);
        if (!success) {
          console.error('お気に入り削除に失敗しました');
        }
      } else {
        // お気に入りに追加
        const success = await addFavorite(recipe);
        if (!success) {
          console.error('お気に入り追加に失敗しました');
        }
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // ボタンの表示テキストとアイコン
  const buttonText = favorited ? 'お気に入り済み' : 'お気に入りに追加';
  const buttonVariant = favorited ? 'solid' : variant;

  // ローディング中かどうか
  const loading = isLoading || isProcessing;

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      isLoading={loading}
      variant={buttonVariant}
      size={size}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      aria-label={buttonText}
      aria-pressed={favorited}
    >
      {!loading && (
        <span className="flex items-center justify-center whitespace-nowrap">
          <Heart
            className={`w-5 h-5 mr-2 ${
              favorited ? 'fill-current text-red-500' : ''
            }`}
            aria-hidden="true"
          />
          {buttonText}
        </span>
      )}
      {loading && (
        <span className="flex items-center justify-center whitespace-nowrap">
          <Heart
            className={`w-5 h-5 mr-2 ${
              favorited ? 'fill-current text-red-500' : ''
            }`}
            aria-hidden="true"
          />
          処理中...
        </span>
      )}
    </Button>
  );
}
