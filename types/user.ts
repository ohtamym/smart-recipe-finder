/**
 * ユーザー型定義
 *
 * Supabase Authを使用するため、基本的なユーザー情報のみを定義
 */

/**
 * ユーザーインターフェース（Supabase Authのユーザー情報に対応）
 */
export interface User {
  /** ユーザーID（UUID） */
  id: string;
  /** メールアドレス */
  email: string;
  /** メール確認日時（ISO 8601形式、オプション） */
  email_confirmed_at?: string;
  /** 作成日時（ISO 8601形式） */
  created_at: string;
  /** 更新日時（ISO 8601形式） */
  updated_at: string;
}

/**
 * ログインフォームデータ
 */
export interface LoginFormData {
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
}

/**
 * サインアップフォームデータ
 */
export interface SignupFormData {
  /** メールアドレス */
  email: string;
  /** パスワード */
  password: string;
  /** パスワード確認（フロントエンドバリデーション用） */
  passwordConfirm: string;
}

/**
 * 認証状態
 */
export interface AuthState {
  /** ユーザー情報（ログインしていない場合はnull） */
  user: User | null;
  /** ローディング状態 */
  loading: boolean;
}

/**
 * 認証エラー
 */
export interface AuthError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード（オプション） */
  code?: string;
}
