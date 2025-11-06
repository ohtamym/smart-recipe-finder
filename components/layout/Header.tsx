"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { Button } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

/**
 * ヘッダーコンポーネント
 *
 * - ロゴ/タイトル
 * - ナビゲーションリンク（デスクトップ/モバイル対応）
 * - 認証状態に応じたUI切り替え
 * - モバイルメニュー
 */
export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Escキーでモバイルメニューを閉じる
   */
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        closeMobileMenu();
        // フォーカスをメニューボタンに戻す
        menuButtonRef.current?.focus();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isMobileMenuOpen]);

  /**
   * メニュー外クリックで閉じる
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  /**
   * ログアウトハンドラー
   */
  const handleSignOut = async () => {
    if (isLoggingOut) return;

    const confirmed = window.confirm("ログアウトしますか？");
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      // ログアウト成功後はホームページにリダイレクト
      window.location.href = "/";
    } catch (error) {
      console.error("ログアウトエラー:", error);
      alert("ログアウトに失敗しました。もう一度お試しください。");
    } finally {
      setIsLoggingOut(false);
    }
  };

  /**
   * モバイルメニュートグル
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /**
   * モバイルメニューを閉じる
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ/タイトル */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            onClick={closeMobileMenu}
          >
            <span className="text-2xl">🍳</span>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 hidden sm:block">
              スマートレシピファインダー
            </h1>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 sm:hidden">
              レシピ検索
            </h1>
          </Link>

          {/* デスクトップナビゲーション */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="メインナビゲーション"
          >
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              ホーム
            </Link>
            {isAuthenticated && (
              <Link
                href="/favorites"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                <Heart className="w-4 h-4" />
                お気に入り
              </Link>
            )}
          </nav>

          {/* デスクトップ認証ボタン */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                  <UserIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 max-w-[150px] truncate">
                    {user?.email}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    "処理中..."
                  ) : (
                    <span className="flex items-center whitespace-nowrap">
                      <LogOut className="w-4 h-4 mr-1" />
                      ログアウト
                    </span>
                  )}
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button size="sm">ログイン</Button>
              </Link>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <button
            ref={menuButtonRef}
            onClick={toggleMobileMenu}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            aria-label={
              isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            id="mobile-menu"
            className="md:hidden border-t border-gray-200 py-4 space-y-4"
          >
            {/* ナビゲーションリンク */}
            <nav
              className="flex flex-col space-y-2"
              aria-label="モバイルナビゲーション"
            >
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium rounded-lg"
              >
                ホーム
              </Link>
              {isAuthenticated && (
                <Link
                  href="/favorites"
                  onClick={closeMobileMenu}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors font-medium rounded-lg flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  お気に入り
                </Link>
              )}
            </nav>

            {/* 認証セクション */}
            <div className="px-4 pt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <UserIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 truncate">
                      {user?.email}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    fullWidth
                  >
                    {isLoggingOut ? (
                      "処理中..."
                    ) : (
                      <span className="flex items-center justify-center whitespace-nowrap">
                        <LogOut className="w-4 h-4 mr-2" />
                        ログアウト
                      </span>
                    )}
                  </Button>
                </div>
              ) : (
                <Link href="/auth" onClick={closeMobileMenu}>
                  <Button size="md" fullWidth>
                    ログイン
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
