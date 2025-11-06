import { supabase } from './client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Supabase認証ヘルパー関数
 *
 * メールアドレス/パスワードでのユーザー認証を提供
 */

/**
 * 認証結果の型定義
 */
export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * 新規ユーザー登録
 *
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns 認証結果
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ サインアップエラー:', error);
      return {
        user: null,
        session: null,
        error,
      };
    }

    console.log('✅ サインアップ成功:', data.user?.email);

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    console.error('❌ サインアップ例外:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * ログイン
 *
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns 認証結果
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ ログインエラー:', error);
      return {
        user: null,
        session: null,
        error,
      };
    }

    console.log('✅ ログイン成功:', data.user?.email);

    return {
      user: data.user,
      session: data.session,
      error: null,
    };
  } catch (error) {
    console.error('❌ ログイン例外:', error);
    return {
      user: null,
      session: null,
      error: error as AuthError,
    };
  }
}

/**
 * ログアウト
 *
 * @returns エラー情報（成功時はnull）
 */
export async function signOut(): Promise<AuthError | null> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ ログアウトエラー:', error);
      return error;
    }

    console.log('✅ ログアウト成功');
    return null;
  } catch (error) {
    console.error('❌ ログアウト例外:', error);
    return error as AuthError;
  }
}

/**
 * 現在のセッションを取得
 *
 * @returns セッション情報
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ セッション取得エラー:', error);
      return null;
    }

    return data.session;
  } catch (error) {
    console.error('❌ セッション取得例外:', error);
    return null;
  }
}

/**
 * 現在のユーザー情報を取得
 *
 * @returns ユーザー情報
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('❌ ユーザー取得エラー:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('❌ ユーザー取得例外:', error);
    return null;
  }
}

/**
 * 認証状態変更のリスナーを設定
 *
 * @param callback - 認証状態が変更されたときに呼ばれるコールバック
 * @returns リスナーを解除するための関数
 */
export function onAuthStateChange(
  callback: (user: User | null, session: Session | null) => void
): () => void {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });

  // リスナーを解除する関数を返す
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * パスワードリセットメールを送信
 *
 * @param email - メールアドレス
 * @returns エラー情報（成功時はnull）
 */
export async function resetPassword(email: string): Promise<AuthError | null> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('❌ パスワードリセットエラー:', error);
      return error;
    }

    console.log('✅ パスワードリセットメール送信成功:', email);
    return null;
  } catch (error) {
    console.error('❌ パスワードリセット例外:', error);
    return error as AuthError;
  }
}
