'use client';

import Link from 'next/link';

/**
 * フッターコンポーネント
 *
 * - コピーライト情報
 * - ナビゲーションリンク
 * - レスポンシブ対応（モバイル/デスクトップ）
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        {/* デスクトップレイアウト */}
        <div className="hidden md:flex md:justify-between md:items-start">
          {/* 左側: プロジェクト情報 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍳</span>
              <h2 className="text-lg font-bold text-gray-900">
                スマートレシピファインダー
              </h2>
            </div>
            <p className="text-sm text-gray-600 max-w-md">
              手持ちの材料から最適なレシピを見つけよう
            </p>
          </div>

          {/* 右側: ナビゲーションリンク */}
          <nav className="flex gap-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                ページ
              </h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link
                    href="/recipes"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    レシピ検索
                  </Link>
                </li>
                <li>
                  <Link
                    href="/favorites"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    お気に入り
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                アカウント
              </h3>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/auth"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    ログイン / 新規登録
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* モバイルレイアウト */}
        <div className="md:hidden flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍳</span>
              <h2 className="text-lg font-bold text-gray-900">
                スマートレシピファインダー
              </h2>
            </div>
            <p className="text-sm text-gray-600 text-center">
              手持ちの材料から最適なレシピを見つけよう
            </p>
          </div>

          {/* モバイルナビゲーション */}
          <nav className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              ホーム
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/recipes"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              レシピ検索
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/favorites"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              お気に入り
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/auth"
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              ログイン
            </Link>
          </nav>
        </div>

        {/* コピーライト（共通） */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">
            &copy; {currentYear} スマートレシピファインダー. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
