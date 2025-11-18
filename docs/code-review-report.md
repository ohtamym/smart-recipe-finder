# Next.js 14 ベストプラクティス レビューレポート

**プロジェクト**: スマートレシピファインダー
**レビュー日**: 2025年1月10日
**レビュー対象**: Next.js 14 ベストプラクティスとの整合性

---

## 📋 目次

1. [サマリー](#サマリー)
2. [重大な問題（優先度: 高）](#重大な問題優先度-高)
3. [重要な改善点（優先度: 中）](#重要な改善点優先度-中)
4. [推奨される最適化（優先度: 低）](#推奨される最適化優先度-低)
5. [良好な実装](#良好な実装)

---

## サマリー

### 全体評価

| カテゴリ | 評価 | コメント |
|---------|------|---------|
| App Router活用 | 🟡 良好 | ファイル構造は適切だが、特殊ファイルが不足 |
| Server Components | 🔴 要改善 | ほぼすべてのページがClient Component |
| Server Actions | 🔴 未実装 | Server Actionsが全く使用されていない |
| データフェッチング | 🔴 要改善 | クライアント側フェッチに依存、Next.jsキャッシング未使用 |
| セキュリティ | 🟡 要改善 | 基本的な検証はあるが、CSP/DAL/環境変数検証が不足 |
| パフォーマンス | 🟡 要改善 | コード分割やストリーミングSSRの活用が不足 |
| プロジェクト構造 | 🟢 良好 | 明確な構造で整理されている |

### 統計

- **重大な問題**: 8件
- **重要な改善点**: 10件
- **推奨される最適化**: 7件
- **良好な実装**: 6件

---

## 重大な問題（優先度: 高）

### 🔴 1. Client Componentsの過剰使用

**問題点**:
- すべてのページ（`recipes/page.tsx`, `recipes/[id]/page.tsx`, `favorites/page.tsx`, `auth/page.tsx`）が`'use client'`で実装されている
- Server Componentsのメリット（ゼロバンドルサイズ、直接データアクセス、SEO最適化）を活用できていない

**影響**:
- JavaScriptバンドルサイズの増加
- 初期ロード時間の増加
- サーバー側でのデータフェッチングの機会損失

**推奨対応**:
```typescript
// ❌ 現在の実装（app/page.tsx）
export default function Home() {
  return (
    <main>
      <RecipeSearchForm /> {/* Client Component */}
    </main>
  );
}

// ✅ 推奨実装（Server Componentとして維持）
// すでにServer Componentだが、他のページもこのパターンに従うべき
```

**参照**: ベストプラクティス p.104-221（Server ComponentsとClient Components）

---

### 🔴 2. Server Actionsの未使用

**問題点**:
- フォーム送信やデータ変更にServer Actionsを使用していない
- `/api/recipes/search`などのAPI Routeを経由している
- お気に入りの追加/削除もクライアント側からAPI呼び出し

**影響**:
- 不必要なAPI Route実装
- CSRF保護の実装負担
- プログレッシブエンハンスメントの欠如

**推奨対応**:
```typescript
// ❌ 現在の実装
// useRecipeSearch.ts: クライアント側からfetch('/api/recipes/search')

// ✅ 推奨実装
// actions/recipes.ts
'use server'

import { generateRecipes } from '@/lib/gemini'
import { searchRecipesByIngredients } from '@/lib/recipe-api'

export async function searchRecipes(formData: FormData) {
  const ingredients = formData.get('ingredients')?.toString().split(',') || []

  const [aiRecipes, apiRecipes] = await Promise.allSettled([
    generateRecipes(ingredients),
    searchRecipesByIngredients(ingredients),
  ])

  return {
    recipes: [
      ...(aiRecipes.status === 'fulfilled' ? aiRecipes.value : []),
      ...(apiRecipes.status === 'fulfilled' ? apiRecipes.value : []),
    ]
  }
}
```

**参照**: ベストプラクティス p.224-393（Server Actionsの実装）

---

### 🔴 3. 特殊ファイルの欠如

**問題点**:
- `error.tsx`, `loading.tsx`, `not-found.tsx`が実装されていない
- エラーハンドリングとローディング状態の管理がコンポーネント内に散在

**影響**:
- 一貫性のないエラーUI
- ローディング状態の重複実装
- ストリーミングSSRの機会損失

**推奨対応**:
```typescript
// app/error.tsx（作成）
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>再試行</button>
    </div>
  )
}

// app/loading.tsx（作成）
export default function Loading() {
  return <div>読み込み中...</div>
}

// app/not-found.tsx（作成）
export default function NotFound() {
  return <div>ページが見つかりません</div>
}
```

**参照**: ベストプラクティス p.55-62（特殊ファイル）

---

### 🔴 4. Next.jsキャッシング戦略の未使用

**問題点**:
- `sessionStorage`に手動でキャッシュを実装している（`useRecipeSearch.ts`）
- Next.jsの`fetch`キャッシング機能を活用していない
- `revalidate`, `revalidatePath`, `revalidateTag`を使用していない

**影響**:
- ビルド時最適化の欠如
- ISR（Incremental Static Regeneration）の恩恵を受けられない
- ブラウザリロード時にキャッシュが失われる

**推奨対応**:
```typescript
// ❌ 現在の実装
function getCachedRecipes(ingredients: string[]): Recipe[] | null {
  const cached = sessionStorage.getItem(cacheKey)
  // ...
}

// ✅ 推奨実装
// Server Componentでfetchを使用
async function getRecipes(ingredients: string[]) {
  const res = await fetch('https://api.example.com/recipes', {
    next: {
      revalidate: 3600, // 1時間ごとに再検証
      tags: ['recipes']  // タグベースの再検証
    }
  })
  return res.json()
}
```

**参照**: ベストプラクティス p.396-461（データフェッチングとキャッシング）

---

### 🔴 5. セキュリティヘッダーの未設定

**問題点**:
- CSP（Content Security Policy）ヘッダーが設定されていない
- セキュリティ関連のHTTPヘッダー（HSTS, X-Frame-Options等）が不足
- `middleware.ts`が存在しない

**影響**:
- XSS攻撃のリスク
- クリックジャッキングのリスク
- セキュリティ脆弱性

**推奨対応**:
```typescript
// middleware.ts（作成）
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  )
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}
```

**参照**: ベストプラクティス p.1029-1046（Content Security Policy）

---

### 🔴 6. Data Access Layer (DAL) の欠如

**問題点**:
- データベースアクセスが直接行われている
- 認証・認可チェックがコンポーネントレベルで実装されている（`favorites/page.tsx`の`useEffect`）
- セキュリティの一貫性が保証されていない

**影響**:
- 認証バイパスのリスク
- データアクセスロジックの重複
- テストの困難さ

**推奨対応**:
```typescript
// lib/dal.ts（作成）
'use server'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { verifySession } from './session'

export const getUser = cache(async () => {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')

  if (!session) return null

  return verifySession(session.value)
})

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

// Server Actionで使用
'use server'
export async function addFavorite(recipeData: Recipe) {
  const user = await requireAuth() // ✅ 認証を強制
  // お気に入り追加処理
}
```

**参照**: ベストプラクティス p.492-530, p.929-957（Data Access Layer）

---

### 🔴 7. 環境変数の検証不足

**問題点**:
- 環境変数の存在チェックのみで、型安全性やスキーマ検証がない
- Zodなどのバリデーションライブラリを使用していない

**影響**:
- ランタイムエラーのリスク
- 型安全性の欠如
- デバッグの困難さ

**推奨対応**:
```typescript
// lib/env.ts（作成）
import { z } from 'zod'

const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1),
  SPOONACULAR_API_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)

// 使用例
import { env } from '@/lib/env'
const apiKey = env.GEMINI_API_KEY // ✅ 型安全
```

**参照**: ベストプラクティス p.1000-1024（環境変数の管理）

---

### 🔴 8. 認証処理のクライアント側実装

**問題点**:
- 認証リダイレクトが`useEffect`でクライアント側で実装されている（`favorites/page.tsx:38-42`）
- サーバー側での認証ガードが不足

**影響**:
- 一瞬未認証コンテンツが表示される（フラッシュ）
- SEOへの悪影響
- セキュリティリスク（クライアント側で認証状態を判定）

**推奨対応**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')

  // 認証が必要なパス
  if (request.nextUrl.pathname.startsWith('/favorites')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth?redirect=/favorites', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/favorites/:path*']
}
```

**参照**: ベストプラクティス p.1032-1046（ミドルウェア）

---

## 重要な改善点（優先度: 中）

### 🟡 9. 動的メタデータの欠如

**問題点**:
- レシピ詳細ページで動的にメタデータを生成していない
- OGP（Open Graph Protocol）タグが設定されていない

**影響**:
- SEO最適化の機会損失
- ソーシャルメディア共有時の表示品質低下

**推奨対応**:
```typescript
// app/recipes/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id)

  return {
    title: `${recipe.title} | スマートレシピファインダー`,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [recipe.imageUrl],
    },
  }
}
```

**参照**: ベストプラクティス p.27（Metadata管理の改善）

---

### 🟡 10. 画像最適化の未確認

**問題点**:
- `next/image`コンポーネントの使用が確認できない
- 画像の遅延読み込みやレスポンシブ対応が不明

**影響**:
- LCP（Largest Contentful Paint）スコアの低下
- 不必要なデータ転送

**推奨対応**:
```typescript
import Image from 'next/image'

// ✅ next/imageを使用
<Image
  src={recipe.imageUrl}
  alt={recipe.title}
  width={800}
  height={600}
  priority={isAboveFold} // ファーストビューの画像にはpriorityを設定
/>
```

**参照**: ベストプラクティス p.669-799（画像最適化）

---

### 🟡 11. ストリーミングSSRの限定的使用

**問題点**:
- `Suspense`境界が`recipes/page.tsx`と`auth/page.tsx`のみ
- ページ全体のローディング状態しか管理していない

**影響**:
- 部分的なコンテンツ表示の機会損失
- TTFB（Time to First Byte）の遅延

**推奨対応**:
```typescript
// ✅ 粒度の細かいSuspense境界
export default function RecipesPage() {
  return (
    <div>
      <h1>レシピ一覧</h1>
      <Suspense fallback={<RecipeListSkeleton />}>
        <RecipeList />
      </Suspense>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations />
      </Suspense>
    </div>
  )
}
```

**参照**: ベストプラクティス p.600-627（ストリーミングSSR）

---

### 🟡 12. next.config.jsの最適化不足

**問題点**:
- 本番環境用の最適化設定が不足
- `swcMinify`が明示的に設定されていない
- セキュリティヘッダーが未設定

**影響**:
- ビルドサイズの増加
- セキュリティリスク

**推奨対応**:
```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true, // ✅ 追加

  images: {
    remotePatterns: [...],
    formats: ['image/avif', 'image/webp'], // ✅ 追加
  },

  // ✅ ヘッダー設定を追加
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}
```

**参照**: ベストプラクティス p.1065-1112（本番環境の設定）

---

### 🟡 13. コード分割の不足

**問題点**:
- `dynamic()`や`React.lazy`の使用が確認できない
- 大きなコンポーネントがバンドルに含まれる可能性

**影響**:
- 初期ロード時間の増加
- 不必要なJavaScriptの実行

**推奨対応**:
```typescript
import dynamic from 'next/dynamic'

// ✅ 重いコンポーネントを動的インポート
const RecipeChart = dynamic(() => import('@/components/RecipeChart'), {
  loading: () => <p>チャート読み込み中...</p>,
  ssr: false, // クライアント側のみで実行する場合
})
```

**参照**: ベストプラクティス p.535-565（コード分割と動的インポート）

---

### 🟡 14. API Routeの過剰使用

**問題点**:
- `/api/recipes/search`などのAPI Routeを経由している
- Server ComponentsやServer Actionsを使えば不要

**影響**:
- 不必要なネットワークホップ
- レスポンス時間の増加
- コードの複雑化

**推奨対応**:
```typescript
// ❌ 現在: Client Component → API Route → データソース
// ✅ 推奨: Server Component → データソース（直接）
// または: Client Component → Server Action → データソース
```

**参照**: ベストプラクティス p.224-393（Server Actions）

---

### 🟡 15. sessionStorageへの依存

**問題点**:
- レシピ詳細ページでsessionStorageからデータを取得している（`recipes/[id]/page.tsx:36`）
- サーバー側でのデータ再取得ができない

**影響**:
- SEO対策不足
- ブラウザリロード時のエラー
- プログレッシブエンハンスメントの欠如

**推奨対応**:
```typescript
// ✅ Server Componentで実装
export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipe = await getRecipeById(params.id) // サーバー側で取得

  return <RecipeDetail recipe={recipe} />
}
```

**参照**: ベストプラクティス p.104-221（Server Components）

---

### 🟡 16. useEffectでの検索実行

**問題点**:
- `recipes/page.tsx:40-44`で`useEffect`を使って検索を実行している
- クライアント側でのデータフェッチングパターン

**影響**:
- 初期表示の遅延
- ウォーターフォールリクエスト
- SEO対策不足

**推奨対応**:
```typescript
// ✅ Server Componentで実装
export default async function RecipesPage({
  searchParams
}: {
  searchParams: { ingredients: string }
}) {
  const ingredients = searchParams.ingredients.split(',')
  const recipes = await searchRecipes(ingredients)

  return <RecipeGrid recipes={recipes} />
}
```

**参照**: ベストプラクティス p.396-461（データフェッチング）

---

### 🟡 17. 認証状態管理の複雑さ

**問題点**:
- `AuthProvider`でReact Contextを使用しているが、Server Componentsでは使用できない
- クライアント側で認証状態を管理することによるフラッシュ問題

**影響**:
- パフォーマンスの低下
- SEO対策不足
- ユーザー体験の低下

**推奨対応**:
```typescript
// ✅ Server Componentで認証状態を取得
import { getUser } from '@/lib/dal'

export default async function FavoritesPage() {
  const user = await getUser()

  if (!user) {
    redirect('/auth?redirect=/favorites')
  }

  const favorites = await getFavorites(user.id)
  return <FavoritesList favorites={favorites} />
}
```

**参照**: ベストプラクティス p.492-530（Data Access Layer）

---

### 🟡 18. エラーログの不足

**問題点**:
- エラートラッキングサービス（Sentry等）との統合がない
- `console.error`のみでエラー管理

**影響**:
- 本番環境でのエラー検知の遅れ
- デバッグの困難さ

**推奨対応**:
```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({ error }: { error: Error }) {
  useEffect(() => {
    // ✅ エラーログサービスに送信
    // Sentry.captureException(error)
    console.error('Error:', error)
  }, [error])

  return <div>エラーが発生しました</div>
}
```

**参照**: ベストプラクティス p.1135-1161（監視とロギング）

---

## 推奨される最適化（優先度: 低）

### 🔵 19. Partial Prerenderingの未使用

**問題点**:
- Partial Prerendering（PPR）が有効化されていない
- 静的部分と動的部分の最適化ができていない

**影響**:
- パフォーマンス最適化の機会損失

**推奨対応**:
```javascript
// next.config.js
module.exports = {
  experimental: {
    ppr: true, // ✅ 追加
  },
}
```

**参照**: ベストプラクティス p.563-598（Partial Prerendering）

---

### 🔵 20. Route Groupsの未使用

**問題点**:
- Route Groupsを使った論理的なルートグループ化がない
- 認証が必要なページと不要なページが混在

**影響**:
- ディレクトリ構造の明確さが欠如

**推奨対応**:
```
app/
├── (public)/        # 認証不要
│   ├── page.tsx
│   └── recipes/
└── (protected)/     # 認証必要
    ├── favorites/
    └── profile/
```

**参照**: ベストプラクティス p.63-76（Route Groups）

---

### 🔵 21. generateStaticParamsの未使用

**問題点**:
- レシピ詳細ページで`generateStaticParams`を使用していない
- 動的ルートのビルド時生成ができていない

**影響**:
- 頻繁にアクセスされるページの初期表示速度

**推奨対応**:
```typescript
// app/recipes/[id]/page.tsx
export async function generateStaticParams() {
  const popularRecipes = await getPopularRecipes()
  return popularRecipes.map((recipe) => ({
    id: recipe.id,
  }))
}
```

**参照**: ベストプラクティス p.1117-1131（キャッシング戦略）

---

### 🔵 22. Prefetchの最適化

**問題点**:
- Linkコンポーネントのprefetch制御がない
- すべてのリンクがデフォルトでプリフェッチされる

**影響**:
- 不必要なプリフェッチによる帯域幅の浪費

**推奨対応**:
```typescript
// 動的コンテンツにはprefetch={false}
<Link href="/recipes" prefetch={false}>
  レシピ一覧
</Link>
```

**参照**: ベストプラクティス p.629-648（Prefetching）

---

### 🔵 23. バンドルアナライザーの未使用

**問題点**:
- バンドルサイズの分析ツールが設定されていない
- 肥大化したバンドルの検知ができない

**影響**:
- パフォーマンス劣化の検知遅れ

**推奨対応**:
```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ...
})
```

**参照**: ベストプラクティス p.650-665（バンドルサイズ最適化）

---

### 🔵 24. パフォーマンス監視の未設定

**問題点**:
- Vercel AnalyticsやSpeed Insightsの統合がない
- Core Web Vitalsの監視ができていない

**影響**:
- パフォーマンス劣化の検知遅れ

**推奨対応**:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

**参照**: ベストプラクティス p.1163-1185（パフォーマンス監視）

---

### 🔵 25. React.memoの使用機会

**問題点**:
- 重いコンポーネントの再レンダリング最適化がない
- `React.memo`, `useMemo`, `useCallback`の使用が確認できない

**影響**:
- 不必要な再レンダリングによるパフォーマンス低下

**推奨対応**:
```typescript
// ✅ 重いコンポーネントをメモ化
export const RecipeCard = React.memo(function RecipeCard({ recipe }: Props) {
  // ...
})
```

**参照**: ベストプラクティス（パフォーマンス考慮事項）

---

## 良好な実装

### ✅ 1. プロジェクト構造

**良い点**:
- `app/`, `components/`, `lib/`, `hooks/`の明確な分離
- `components/features/`による機能別整理
- barrel exports (`index.ts`) の適切な使用

**該当箇所**: プロジェクト全体のディレクトリ構造

---

### ✅ 2. TypeScript型定義

**良い点**:
- 適切な型定義（`Recipe`, `Ingredient`, `Instruction`等）
- インターフェースの明確な定義

**該当箇所**: `types/`ディレクトリ

---

### ✅ 3. API Routeの入力検証

**良い点**:
- リクエストボディのバリデーション関数実装
- エラーメッセージの日本語化
- 適切なHTTPステータスコード

**該当箇所**: `app/api/recipes/search/route.ts:32-91`

---

### ✅ 4. 並列データフェッチング

**良い点**:
- `Promise.allSettled`で並列リクエスト実装
- 片方が失敗しても結果をマージして返却

**該当箇所**: `app/api/recipes/search/route.ts:136-139`

---

### ✅ 5. アクセシビリティ配慮

**良い点**:
- スキップリンクの実装
- ARIA属性の使用（`aria-label`, `aria-expanded`等）
- セマンティックHTML

**該当箇所**:
- `app/layout.tsx:23-28`（スキップリンク）
- `components/layout/Header.tsx:129`（aria-label）

---

### ✅ 6. エラーハンドリング

**良い点**:
- Gemini APIのエラーメッセージ日本語化
- Supabase認証エラーの適切な変換
- try-catchによる適切なエラーキャッチ

**該当箇所**:
- `lib/gemini/client.ts:151-166`
- `components/providers/AuthProvider.tsx:244-270`

---

## 改善の優先順位

### フェーズ1: 重大な問題の対応（1-2週間）
1. Server Actionsの実装
2. 特殊ファイル（error.tsx, loading.tsx, not-found.tsx）の作成
3. Data Access Layer (DAL) の実装
4. middleware.tsによる認証ガードの実装

### フェーズ2: 重要な改善（1-2週間）
5. Server Componentsへの移行（段階的）
6. Next.jsキャッシング戦略の適用
7. 動的メタデータの実装
8. セキュリティヘッダーの設定

### フェーズ3: 最適化（1週間）
9. コード分割の実装
10. Streaming SSRの強化
11. 画像最適化の確認と改善
12. パフォーマンス監視の設定

---

## 参考リソース

- [Next.js 14 ベストプラクティス](./nextjs-14-best-practices.md)
- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [セキュリティガイド](https://nextjs.org/blog/security-nextjs-server-components-actions)

---

**レポート作成者**: Claude Code
**次回レビュー予定**: 改善実装後
