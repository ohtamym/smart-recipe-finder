'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User } from 'lucide-react';
import { Button, Input, ErrorMessage, Loading } from '@/components/ui';

/**
 * 認証フォームコンポーネント
 *
 * ログインとサインアップを切り替え可能な統合フォーム
 */

export interface AuthFormProps {
  /** 初期モード（'login' または 'signup'） */
  initialMode?: 'login' | 'signup';
  /** 認証成功後のリダイレクト先 */
  redirectTo?: string;
  /** サインアップ関数 */
  onSignUp: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  /** ログイン関数 */
  onSignIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
}

export function AuthForm({
  initialMode = 'login',
  redirectTo = '/',
  onSignUp,
  onSignIn,
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フォームのバリデーション
  const validateForm = (): string | null => {
    // メールアドレスの検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return '有効なメールアドレスを入力してください。';
    }

    // パスワードの検証
    if (!password || password.length < 6) {
      return 'パスワードは6文字以上である必要があります。';
    }

    // サインアップ時の確認パスワード検証
    if (mode === 'signup' && password !== confirmPassword) {
      return 'パスワードが一致しません。';
    }

    return null;
  };

  // フォーム送信ハンドラー
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // バリデーション
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (mode === 'signup') {
        result = await onSignUp(email, password);
        if (result.success) {
          setSuccessMessage(
            'アカウントが作成されました。確認メールをご確認ください。'
          );
          // 2秒後にログインモードに切り替え
          setTimeout(() => {
            setMode('login');
            setSuccessMessage(null);
          }, 2000);
        }
      } else {
        result = await onSignIn(email, password);
        if (result.success) {
          setSuccessMessage('ログインしました。リダイレクト中...');
          // ログイン成功後、指定ページにリダイレクト
          setTimeout(() => {
            router.push(redirectTo);
          }, 500);
        }
      }

      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      console.error('認証エラー:', err);
      setError('予期しないエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  // モード切り替えハンドラー
  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccessMessage(null);
    setPassword('');
    setConfirmPassword('');
  };

  const isSignUpMode = mode === 'signup';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 md:p-8">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUpMode ? 'アカウント作成' : 'ログイン'}
          </h1>
          <p className="text-sm text-gray-600">
            {isSignUpMode
              ? 'お気に入り機能を使うにはアカウントが必要です'
              : 'アカウントにログインしてください'}
          </p>
        </div>

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* メールアドレス */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* パスワード */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* パスワード確認（サインアップ時のみ） */}
          {isSignUpMode && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                パスワード（確認）
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="パスワードを再入力"
                  className="pl-10"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <Button
            type="submit"
            variant="solid"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loading size="sm" />
                <span>処理中...</span>
              </div>
            ) : isSignUpMode ? (
              'アカウントを作成'
            ) : (
              'ログイン'
            )}
          </Button>
        </form>

        {/* モード切り替え */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignUpMode ? (
              <>
                すでにアカウントをお持ちですか？{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isLoading}
                >
                  ログイン
                </button>
              </>
            ) : (
              <>
                アカウントをお持ちでない方は{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                  disabled={isLoading}
                >
                  新規登録
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
