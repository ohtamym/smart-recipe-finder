# Next.js 14 ベストプラクティス

## 目次

1. [概要](#概要)
2. [App Routerの活用](#app-routerの活用)
3. [Server ComponentsとClient Components](#server-componentsとclient-components)
4. [Server Actionsの実装](#server-actionsの実装)
5. [データフェッチングとキャッシング](#データフェッチングとキャッシング)
6. [パフォーマンス最適化](#パフォーマンス最適化)
7. [画像最適化](#画像最適化)
8. [プロジェクト構造](#プロジェクト構造)
9. [セキュリティ](#セキュリティ)
10. [デプロイと運用](#デプロイと運用)

---

## 概要

Next.js 14は2023年10月にリリースされ、以下の主要な機能強化が行われました。

### 主な新機能

- **Turbopack**: 開発サーバーの起動が最大53%高速化、Fast Refreshによるコード更新が最大95%高速化
- **Server Actions（安定版）**: API Routeを手動で作成せずに、サーバー側の処理を直接コンポーネントから実行可能
- **Partial Prerendering（プレビュー）**: 静的コンテンツと動的コンテンツを組み合わせた最適化
- **Metadata管理の改善**: ブロッキングメタデータと非ブロッキングメタデータの分離

---

## App Routerの活用

Next.js 14では、App Routerがデフォルトの推奨ルーティング方式です。

### 基本原則

#### 1. ファイルベースルーティング

```
app/
├── layout.tsx          # ルートレイアウト
├── page.tsx            # ホームページ
├── dashboard/
│   ├── layout.tsx      # ダッシュボード用レイアウト
│   ├── page.tsx        # /dashboard
│   └── settings/
│       └── page.tsx    # /dashboard/settings
└── blog/
    ├── layout.tsx
    ├── page.tsx        # /blog
    └── [slug]/
        └── page.tsx    # /blog/[slug]
```

#### 2. 特殊ファイル

- `layout.tsx`: 共通レイアウト（状態が保持される）
- `page.tsx`: ページコンテンツ
- `loading.tsx`: ローディング状態
- `error.tsx`: エラーハンドリング
- `not-found.tsx`: 404ページ

#### 3. Route Groups

関連するルートを論理的にグループ化（URLには影響しない）：

```
app/
├── (marketing)/
│   ├── about/
│   └── contact/
└── (shop)/
    ├── products/
    └── cart/
```

### ベストプラクティス

✅ **推奨される実装**

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <nav>{/* ナビゲーション */}</nav>
      <main>{children}</main>
    </div>
  )
}
```

❌ **避けるべき実装**

- Pages Routerとの混在（段階的移行以外）
- 過度にネストされた深いディレクトリ構造

---

## Server ComponentsとClient Components

Next.js 14では、React Server Components（RSC）がデフォルトです。

### Server Components（デフォルト）

サーバー側でのみ実行され、クライアントにJavaScriptを送信しません。

#### 使用すべき場合

- データフェッチング
- バックエンドリソースへの直接アクセス
- 機密情報の保持（APIキー、トークンなど）
- サーバー依存の大きなライブラリの使用

#### 実装例

```typescript
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'force-cache', // SSG
  })
  return res.json()
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <div>
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

### Client Components

`'use client'`ディレクティブで明示的に宣言します。

#### 使用すべき場合

- インタラクティブ性（イベントハンドラー）
- Reactのフック（useState, useEffect等）
- ブラウザAPI（localStorage, window等）
- カスタムフック

#### 実装例

```typescript
// components/SearchBar.tsx
'use client'

import { useState } from 'react'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  
  const handleSearch = () => {
    // 検索処理
  }
  
  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>検索</button>
    </div>
  )
}
```

### ベストプラクティス

✅ **推奨パターン**

1. **可能な限りServer Componentsを使用**
2. **Client Componentsはツリーの葉（リーフノード）に配置**
3. **Server ComponentsからClient ComponentsへのPropsは直列化可能な値のみ**

```typescript
// ✅ 良い例: Client Componentを最小限に
// app/dashboard/page.tsx (Server Component)
import InteractiveChart from './InteractiveChart' // Client Component

export default async function Dashboard() {
  const data = await fetchData() // サーバー側で実行
  
  return (
    <div>
      <h1>ダッシュボード</h1>
      <InteractiveChart data={data} /> {/* データを渡す */}
    </div>
  )
}
```

❌ **避けるべきパターン**

```typescript
// ❌ 悪い例: 不必要にClient Componentを使用
'use client'

export default function Page() {
  // インタラクションがないのにClient Component
  return <div>静的コンテンツ</div>
}
```

---

## Server Actionsの実装

Server Actionsは、サーバー側で実行される非同期関数で、フォーム送信やデータ変更を簡潔に処理できます。

### 基本的な使い方

#### 1. インライン定義（Server Componentのみ）

```typescript
// app/todos/page.tsx
export default function TodoPage() {
  async function createTodo(formData: FormData) {
    'use server'
    
    const title = formData.get('title')
    // データベースに保存
    await db.todos.create({ title })
    
    // キャッシュの再検証
    revalidatePath('/todos')
  }
  
  return (
    <form action={createTodo}>
      <input type="text" name="title" required />
      <button type="submit">追加</button>
    </form>
  )
}
```

#### 2. 別ファイルでの定義

```typescript
// app/actions/todos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function createTodo(formData: FormData) {
  const title = formData.get('title') as string
  
  // バリデーション
  if (!title || title.length < 3) {
    throw new Error('タイトルは3文字以上必要です')
  }
  
  // データベース処理
  await db.todos.create({ title })
  
  // キャッシュ再検証
  revalidatePath('/todos')
}

export async function deleteTodo(id: string) {
  await db.todos.delete(id)
  revalidatePath('/todos')
}
```

#### 3. Client Componentでの使用

```typescript
// components/TodoForm.tsx
'use client'

import { createTodo } from '@/app/actions/todos'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '送信中...' : '追加'}
    </button>
  )
}

export default function TodoForm() {
  return (
    <form action={createTodo}>
      <input type="text" name="title" required />
      <SubmitButton />
    </form>
  )
}
```

### ベストプラクティス

✅ **推奨される実装**

1. **入力値の検証を必ず実行**

```typescript
'use server'

import { z } from 'zod'

const todoSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().optional(),
})

export async function createTodo(formData: FormData) {
  // バリデーション
  const validated = todoSchema.parse({
    title: formData.get('title'),
    description: formData.get('description'),
  })
  
  // 処理
  await db.todos.create(validated)
}
```

2. **認証・認可の確認**

```typescript
'use server'

import { auth } from '@/lib/auth'

export async function updatePost(id: string, data: FormData) {
  const session = await auth()
  
  if (!session?.user) {
    throw new Error('認証が必要です')
  }
  
  // ユーザー権限の確認
  const post = await db.posts.findUnique({ where: { id } })
  if (post.authorId !== session.user.id) {
    throw new Error('権限がありません')
  }
  
  // 更新処理
  await db.posts.update({ where: { id }, data })
  revalidatePath(`/posts/${id}`)
}
```

3. **適切なキャッシュ再検証**

```typescript
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  const post = await db.posts.create(formData)
  
  // 特定のパスを再検証
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)
  
  // タグベースの再検証
  revalidateTag('posts')
}
```

❌ **避けるべきパターン**

- 検証なしのデータベース操作
- 認証チェックの省略
- 大量のデータをServer Actionに渡す
- エラーハンドリングの欠如

---

## データフェッチングとキャッシング

Next.js 14では、拡張されたfetch APIとキャッシング戦略が利用できます。

### キャッシング戦略

#### 1. 静的生成（SSG）

```typescript
// デフォルト: 無期限にキャッシュ
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // デフォルト
  })
  return res.json()
}
```

#### 2. インクリメンタル静的再生成（ISR）

```typescript
// 60秒ごとに再検証
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 },
  })
  return res.json()
}
```

#### 3. 動的レンダリング（SSR）

```typescript
// リクエストごとに新しいデータを取得
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    cache: 'no-store',
  })
  return res.json()
}
```

#### 4. タグベースの再検証

```typescript
// データフェッチ
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] },
  })
  return res.json()
}

// Server Actionでの再検証
'use server'

import { revalidateTag } from 'next/cache'

export async function updatePost() {
  // 投稿を更新
  await db.posts.update(...)
  
  // 'posts'タグでキャッシュされたデータを再検証
  revalidateTag('posts')
}
```

### 並列データフェッチング

```typescript
// ✅ 推奨: Promise.allで並列実行
export default async function Page() {
  const [posts, users, comments] = await Promise.all([
    getPosts(),
    getUsers(),
    getComments(),
  ])
  
  return (
    <div>
      <Posts data={posts} />
      <Users data={users} />
      <Comments data={comments} />
    </div>
  )
}

// ❌ 非推奨: 順次実行（遅い）
export default async function Page() {
  const posts = await getPosts()
  const users = await getUsers() // postsの完了を待つ
  const comments = await getComments() // usersの完了を待つ
  // ...
}
```

### Data Access Layer（DAL）

セキュリティのため、データアクセスを集中管理します。

```typescript
// lib/dal.ts
'use server'

import { cookies } from 'next/headers'
import { db } from './db'
import { verifySession } from './session'

export async function getUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  
  if (!session) return null
  
  const verified = await verifySession(session.value)
  if (!verified) return null
  
  return db.users.findUnique({
    where: { id: verified.userId },
    select: { id: true, name: true, email: true }, // 必要なフィールドのみ
  })
}

export async function getUserPosts(userId: string) {
  const user = await getUser()
  
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }
  
  return db.posts.findMany({
    where: { authorId: userId },
  })
}
```

---

## パフォーマンス最適化

### 1. コード分割と動的インポート

#### React.lazyとSuspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// 重いコンポーネントを動的にインポート
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <p>チャート読み込み中...</p>,
  ssr: false, // CSRのみ（必要に応じて）
})

export default function Dashboard() {
  return (
    <div>
      <h1>ダッシュボード</h1>
      <Suspense fallback={<div>読み込み中...</div>}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}
```

### 2. Partial Prerendering

静的コンテンツと動的コンテンツを組み合わせます。

```typescript
// next.config.js
module.exports = {
  experimental: {
    ppr: true, // Partial Prerenderingを有効化
  },
}
```

```typescript
// app/product/[id]/page.tsx
import { Suspense } from 'react'

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* 静的シェル */}
      <h1>商品詳細</h1>
      <ProductInfo id={params.id} />
      
      {/* 動的コンテンツ */}
      <Suspense fallback={<div>レビュー読み込み中...</div>}>
        <ProductReviews id={params.id} />
      </Suspense>
      
      <Suspense fallback={<div>推奨商品読み込み中...</div>}>
        <RecommendedProducts id={params.id} />
      </Suspense>
    </div>
  )
}
```

### 3. ストリーミングSSR

```typescript
// app/posts/page.tsx
import { Suspense } from 'react'

async function PostList() {
  const posts = await getPosts() // 時間がかかる処理
  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}

export default function PostsPage() {
  return (
    <div>
      <h1>投稿一覧</h1>
      <Suspense fallback={<div>投稿を読み込み中...</div>}>
        <PostList />
      </Suspense>
    </div>
  )
}
```

### 4. Prefetchingとプリロード

```typescript
// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <nav>
      {/* デフォルトでプリフェッチ */}
      <Link href="/about">About</Link>
      
      {/* プリフェッチを無効化 */}
      <Link href="/dynamic" prefetch={false}>
        Dynamic Page
      </Link>
    </nav>
  )
}
```

### 5. バンドルサイズ最適化

```typescript
// 大きなライブラリを動的インポート
import dynamic from 'next/dynamic'

const Markdown = dynamic(() => import('react-markdown'), {
  ssr: true,
})

// 名前付きエクスポートの場合
const DatePicker = dynamic(
  () => import('react-datepicker').then((mod) => mod.DatePicker),
  { ssr: false }
)
```

---

## 画像最適化

Next.js 14のImageコンポーネントは自動最適化機能を提供します。

### 基本的な使い方

```typescript
import Image from 'next/image'

export default function Hero() {
  return (
    <div>
      {/* ローカル画像 */}
      <Image
        src="/images/hero.jpg"
        alt="ヒーロー画像"
        width={1200}
        height={600}
        priority // LCP要素に使用
      />
      
      {/* リモート画像 */}
      <Image
        src="https://example.com/image.jpg"
        alt="リモート画像"
        width={800}
        height={400}
        quality={85} // デフォルトは75
      />
    </div>
  )
}
```

### next.config.jsでの設定

```javascript
// next.config.js
module.exports = {
  images: {
    // リモート画像のドメインを指定
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    // 画像形式の設定
    formats: ['image/avif', 'image/webp'],
    // デバイスサイズの設定
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // 画像サイズの設定
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // キャッシュTTL（秒）
    minimumCacheTTL: 60,
  },
}
```

### レスポンシブ画像

```typescript
import Image from 'next/image'

export default function ResponsiveImage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '400px' }}>
      <Image
        src="/images/hero.jpg"
        alt="レスポンシブ画像"
        fill
        style={{ objectFit: 'cover' }}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}
```

### ベストプラクティス

✅ **推奨事項**

1. **LCP要素にpriorityを設定**

```typescript
<Image
  src="/hero.jpg"
  alt="ヒーロー"
  width={1200}
  height={600}
  priority // ファーストビューの画像
/>
```

2. **適切なサイズを指定**

```typescript
// ✅ 良い例
<Image src="/image.jpg" width={800} height={600} alt="..." />

// ❌ 悪い例: サイズ指定なし（CLSの原因）
<Image src="/image.jpg" alt="..." />
```

3. **altテキストを必ず設定**

```typescript
<Image
  src="/product.jpg"
  width={400}
  height={300}
  alt="商品名 - 商品の詳細な説明"
/>
```

4. **ローカル画像は静的インポート**

```typescript
import heroImage from '@/public/images/hero.jpg'

<Image
  src={heroImage}
  alt="ヒーロー"
  priority
  placeholder="blur" // 自動ブラープレースホルダー
/>
```

---

## プロジェクト構造

スケーラブルで保守性の高いプロジェクト構造を構築します。

### 推奨ディレクトリ構造

```
my-nextjs-app/
├── app/                        # App Router
│   ├── (auth)/                 # Route Group: 認証関連
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/            # Route Group: ダッシュボード
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/
│   ├── api/                    # API Routes
│   │   └── webhooks/
│   ├── layout.tsx              # ルートレイアウト
│   ├── page.tsx                # ホームページ
│   └── globals.css
├── components/                 # 再利用可能なコンポーネント
│   ├── ui/                     # UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── forms/                  # フォームコンポーネント
│   └── layout/                 # レイアウトコンポーネント
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/                        # ユーティリティ関数
│   ├── db.ts                   # データベース接続
│   ├── dal.ts                  # Data Access Layer
│   ├── auth.ts                 # 認証ロジック
│   └── utils.ts                # ヘルパー関数
├── actions/                    # Server Actions
│   ├── posts.ts
│   └── users.ts
├── hooks/                      # カスタムフック
│   ├── useAuth.ts
│   └── useLocalStorage.ts
├── types/                      # TypeScript型定義
│   ├── index.ts
│   └── api.ts
├── public/                     # 静的ファイル
│   ├── images/
│   └── fonts/
├── styles/                     # グローバルスタイル
├── middleware.ts               # ミドルウェア
├── next.config.js              # Next.js設定
├── tsconfig.json               # TypeScript設定
└── package.json
```

### コンポーネントの整理

#### 1. 再利用可能なUIコンポーネント

```typescript
// components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

#### 2. 機能特化コンポーネント

```typescript
// components/forms/LoginForm.tsx
'use client'

import { login } from '@/actions/auth'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  return (
    <form action={login}>
      <input type="email" name="email" required />
      <input type="password" name="password" required />
      <Button type="submit">ログイン</Button>
    </form>
  )
}
```

### ベストプラクティス

✅ **推奨事項**

1. **関心の分離**: コンポーネント、ロジック、スタイルを明確に分離
2. **コロケーション**: 関連ファイルを近くに配置
3. **名前付け規則**: 一貫した命名規則を使用
4. **barrel exports**: `index.ts`でエクスポートを集約

```typescript
// components/ui/index.ts
export { Button } from './Button'
export { Input } from './Input'
export { Card } from './Card'

// 使用側
import { Button, Input, Card } from '@/components/ui'
```

---

## セキュリティ

Next.js 14アプリケーションのセキュリティベストプラクティス。

### 1. Data Access Layer（DAL）

データベースアクセスを集中管理し、認証・認可を徹底します。

```typescript
// lib/dal.ts
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
```

### 2. Server Actionsのセキュリティ

```typescript
// actions/posts.ts
'use server'

import { z } from 'zod'
import { requireAuth } from '@/lib/dal'
import { db } from '@/lib/db'

const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(10),
})

export async function createPost(formData: FormData) {
  // 1. 認証チェック
  const user = await requireAuth()
  
  // 2. 入力検証
  const validated = postSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
  })
  
  // 3. データベース操作
  const post = await db.posts.create({
    data: {
      ...validated,
      authorId: user.id,
    },
  })
  
  // 4. 必要な情報のみ返す
  return {
    id: post.id,
    title: post.title,
  }
}
```

### 3. 環境変数の管理

```typescript
// lib/env.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  API_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
```

```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
API_KEY="api-key"

# クライアント側で利用する環境変数
NEXT_PUBLIC_API_URL="https://api.example.com"
```

### 4. CSRF保護

Server Actionsは自動的にCSRF保護が適用されます（OriginヘッダーとHostヘッダーの比較）。

### 5. Content Security Policy（CSP）

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  )
  
  return response
}
```

### セキュリティチェックリスト

- [ ] すべてのServer Actionsで認証・認可を確認
- [ ] 入力値の検証を実装（Zodなどを使用）
- [ ] 環境変数を適切に管理
- [ ] Data Access Layerを実装
- [ ] CSPヘッダーを設定
- [ ] 機密情報をクライアントに送信しない
- [ ] レート制限を実装
- [ ] HTTPSを強制

---

## デプロイと運用

### 1. 本番環境の設定

#### next.config.js

```javascript
// next.config.js
module.exports = {
  // 本番ビルドの最適化
  reactStrictMode: true,
  swcMinify: true,
  
  // 画像最適化
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // ヘッダー設定
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
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}
```

### 2. キャッシング戦略

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600 // 1時間ごとに再検証

export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)
  return <article>{/* ... */}</article>
}
```

### 3. 監視とロギング

```typescript
// app/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // エラーログサービスに送信
    console.error('Error:', error)
    // 例: Sentry.captureException(error)
  }, [error])
  
  return (
    <div>
      <h2>エラーが発生しました</h2>
      <button onClick={reset}>再試行</button>
    </div>
  )
}
```

### 4. パフォーマンス監視

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

### デプロイチェックリスト

- [ ] 環境変数が正しく設定されている
- [ ] ビルドエラーがない（`npm run build`）
- [ ] TypeScriptのエラーがない
- [ ] Lighthouseスコアを確認
- [ ] セキュリティヘッダーが設定されている
- [ ] エラートラッキングが設定されている
- [ ] パフォーマンス監視が設定されている
- [ ] バックアップ戦略が確立されている

---

## まとめ

Next.js 14のベストプラクティスの要点：

### 開発原則

1. **Server Componentsファースト**: デフォルトでServer Componentsを使用し、必要な場合のみClient Componentsを使用
2. **Progressive Enhancement**: JavaScriptなしでも基本機能が動作するように設計
3. **パフォーマンス最優先**: 画像最適化、コード分割、キャッシング戦略を適切に実装
4. **セキュリティ重視**: 認証・認可、入力検証、Data Access Layerを必ず実装
5. **スケーラビリティ**: 明確なプロジェクト構造と関心の分離を維持

### 主要機能の活用

- **App Router**: ファイルベースルーティングとネストされたレイアウトを活用
- **Server Actions**: フォーム処理とデータ変更を簡潔に実装
- **Streaming & Suspense**: ローディング状態を改善し、UXを向上
- **Image最適化**: next/imageコンポーネントで自動最適化
- **Turbopack**: 開発体験を大幅に高速化

### 継続的改善

- Lighthouseスコアを定期的に確認
- Core Web Vitalsを監視
- ユーザーフィードバックを収集
- 最新のNext.jsバージョンにアップデート
- コミュニティのベストプラクティスを学習

---

## 参考リソース

- [Next.js 公式ドキュメント](https://nextjs.org/docs)
- [Next.js 14 リリースノート](https://nextjs.org/blog/next-14)
- [React Server Components](https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023#react-server-components)
- [Server Actions ドキュメント](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Next.js セキュリティガイド](https://nextjs.org/blog/security-nextjs-server-components-actions)

---

**最終更新**: 2024年11月10日
**Next.jsバージョン**: 14.x
