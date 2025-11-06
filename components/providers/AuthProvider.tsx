'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  signUp as supabaseSignUp,
  signIn as supabaseSignIn,
  signOut as supabaseSignOut,
  getCurrentUser,
  onAuthStateChange,
} from '@/lib/supabase';

/**
 * 認証コンテキストの型定義
 */
export interface AuthContextType {
  /** 現在のユーザー情報（未ログインの場合はnull） */
  user: User | null;
  /** セッション情報 */
  session: Session | null;
  /** 認証状態の読み込み中かどうか */
  isLoading: boolean;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** サインアップ */
  signUp: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  /** ログイン */
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  /** ログアウト */
  signOut: () => Promise<{
    success: boolean;
    error?: string;
  }>;
}

/**
 * 認証コンテキスト
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider
 *
 * 認証状態を管理し、子コンポーネントに提供するプロバイダー
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * 初期化: 現在のユーザーを取得
   */
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('認証初期化エラー:', error);
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 認証状態変更のリスナーを設定
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authUser, authSession) => {
      setUser(authUser);
      setSession(authSession);
      setIsLoading(false);
    });

    // クリーンアップ
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * サインアップ
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await supabaseSignUp(email, password);

        if (result.error) {
          return {
            success: false,
            error: getErrorMessage(result.error),
          };
        }

        return { success: true };
      } catch (error) {
        console.error('サインアップエラー:', error);
        return {
          success: false,
          error: 'サインアップに失敗しました。もう一度お試しください。',
        };
      }
    },
    []
  );

  /**
   * ログイン
   */
  const signIn = useCallback(
    async (
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const result = await supabaseSignIn(email, password);

        if (result.error) {
          return {
            success: false,
            error: getErrorMessage(result.error),
          };
        }

        return { success: true };
      } catch (error) {
        console.error('ログインエラー:', error);
        return {
          success: false,
          error: 'ログインに失敗しました。もう一度お試しください。',
        };
      }
    },
    []
  );

  /**
   * ログアウト
   */
  const signOut = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const error = await supabaseSignOut();

      if (error) {
        return {
          success: false,
          error: getErrorMessage(error),
        };
      }

      setUser(null);
      setSession(null);

      return { success: true };
    } catch (error) {
      console.error('ログアウトエラー:', error);
      return {
        success: false,
        error: 'ログアウトに失敗しました。もう一度お試しください。',
      };
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth フック
 *
 * 認証コンテキストから認証状態を取得
 *
 * @throws AuthProviderでラップされていない場合はエラー
 *
 * @example
 * ```tsx
 * const { user, isLoading, signIn, signOut } = useAuth();
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Supabaseのエラーメッセージを日本語に変換
 */
function getErrorMessage(error: any): string {
  const message = error?.message || '';

  // よくあるエラーメッセージを日本語に変換
  if (message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。';
  }

  if (message.includes('User already registered')) {
    return 'このメールアドレスは既に登録されています。';
  }

  if (message.includes('Email not confirmed')) {
    return 'メールアドレスが確認されていません。確認メールをご確認ください。';
  }

  if (message.includes('Password should be at least')) {
    return 'パスワードは6文字以上である必要があります。';
  }

  if (message.includes('Unable to validate email address')) {
    return '有効なメールアドレスを入力してください。';
  }

  // その他のエラー
  return message || '予期しないエラーが発生しました。';
}
