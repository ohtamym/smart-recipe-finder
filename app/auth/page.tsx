'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/components/features/auth';
import { Loading } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

/**
 * 認証ページ
 *
 * ログインとサインアップを提供するページ
 * クエリパラメータ:
 * - mode: 'login' | 'signup' (初期表示モード)
 * - redirect: リダイレクト先パス（認証成功後）
 *
 * @example
 * URL: /auth?mode=signup&redirect=/favorites
 */

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, signIn, signUp } = useAuth();

  // クエリパラメータから初期モードとリダイレクト先を取得
  const mode = (searchParams.get('mode') as 'login' | 'signup') || 'login';
  const redirectTo = searchParams.get('redirect') || '/';

  // 既に認証済みの場合はリダイレクト
  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  // ローディング中
  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loading size="lg" className="mb-4" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  // 既に認証済みの場合は何も表示しない（リダイレクト処理中）
  if (user) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AuthForm
          initialMode={mode}
          redirectTo={redirectTo}
          onSignIn={signIn}
          onSignUp={signUp}
        />

        {/* ヘルプテキスト */}
        <div className="mt-8 max-w-md">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 アカウントについて
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>・お気に入り機能を使うにはアカウントが必要です</li>
              <li>・アカウント作成後、確認メールが送信されます</li>
              <li>・パスワードは6文字以上で設定してください</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loading size="lg" className="mb-4" />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </main>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
