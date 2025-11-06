'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * モバイル用ボトムナビゲーション
 *
 * - 画面下部に固定表示
 * - モバイルのみ表示（< md ブレークポイント）
 * - 4つの主要リンク: ホーム、レシピ検索、お気に入り、アカウント
 * - 現在のページをハイライト表示
 */
export function Navigation() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navItems = [
    {
      href: '/',
      label: 'ホーム',
      icon: '🏠',
      active: pathname === '/',
    },
    {
      href: '/recipes',
      label: 'レシピ',
      icon: '🔍',
      active: pathname === '/recipes' || pathname?.startsWith('/recipes/'),
    },
    {
      href: '/favorites',
      label: 'お気に入り',
      icon: '❤️',
      active: pathname === '/favorites',
      requireAuth: true,
    },
    {
      href: isAuthenticated ? '/account' : '/auth',
      label: isAuthenticated ? 'アカウント' : 'ログイン',
      icon: isAuthenticated ? '👤' : '🔐',
      active: pathname === '/account' || pathname === '/auth',
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      role="navigation"
      aria-label="モバイルナビゲーション"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // お気に入りは認証必須
          if (item.requireAuth && !isAuthenticated) {
            return (
              <Link
                key={item.href}
                href="/auth"
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-gray-400 transition-colors"
                aria-label={`${item.label}（要ログイン）`}
              >
                <span className="text-xl opacity-50">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                item.active
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
              aria-label={item.label}
              aria-current={item.active ? 'page' : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
