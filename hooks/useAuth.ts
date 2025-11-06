'use client';

/**
 * useAuth
 *
 * 認証状態を管理するカスタムフック
 * AuthProviderからre-exportしています
 *
 * @returns 認証状態とメソッド
 *
 * @example
 * ```tsx
 * const { user, isLoading, signIn, signUp, signOut } = useAuth();
 *
 * if (isLoading) return <Loading />;
 * if (!user) return <LoginForm onSignIn={signIn} />;
 * return <Dashboard user={user} onSignOut={signOut} />;
 * ```
 */

// AuthProviderからuseAuthとAuthContextTypeをre-export
export { useAuth, type AuthContextType as UseAuthReturn } from '@/components/providers/AuthProvider';
