# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## 重要: 日本語で返答してください

**このプロジェクトでは、すべてのやり取りを日本語で行ってください。**
- ユーザーへの説明やメッセージは日本語で記述すること
- コードコメントは英語でも可
- 変数名・関数名は英語で記述すること

## プロジェクト概要

**スマートレシピファインダー** - 手持ちの材料からレシピを検索できるNext.js 14アプリケーション。AI (Google Gemini 2.5 Flash) でレシピを生成し、既存のレシピAPIと組み合わせて表示します。

**開発期間**: 2週間
**言語**: TypeScript + 日本語UI

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド/BaaS**: Supabase (PostgreSQL, Auth)
- **AI**: Google Gemini 2.5 Flash API
- **レシピAPI**: Spoonacular API
- **デプロイ**: Vercel

## 開発コマンド

現時点ではpackage.jsonがまだ存在しないため、プロジェクト初期化後に以下のコマンドが使用できます:

```bash
# Next.jsプロジェクトの初期化（実施予定）
npx create-next-app@latest . --typescript --tailwind --app --no-src

# 開発サーバー起動
npm run dev

# 本番用ビルド
npm run build

# 本番ビルドをローカルで実行
npm start

# Linting実行
npm run lint
```

## 必要な環境変数

`.env.local` ファイルを作成し、以下を設定:

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Spoonacular API
SPOONACULAR_API_KEY=your_spoonacular_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## プロジェクトアーキテクチャ

### ディレクトリ構成

```
app/                          # Next.js App Routerページ
├── layout.tsx               # ルートレイアウト（SSR）
├── page.tsx                 # ホームページ（材料検索）（SSR）
├── recipes/
│   ├── page.tsx            # レシピ一覧（検索結果）（CSR）
│   └── [id]/page.tsx       # レシピ詳細（CSR）
├── favorites/page.tsx      # お気に入り一覧（CSR、認証必須）
└── auth/page.tsx           # ログイン/サインアップ（CSR）

components/
├── layout/                  # Header, Footer, Navigation
├── features/                # 機能別コンポーネント
│   ├── search/             # 材料入力、タグ、検索ボタン
│   ├── recipe/             # レシピカード、詳細、材料リスト
│   ├── favorites/          # お気に入りボタン、お気に入りリスト
│   └── auth/               # ログイン/サインアップフォーム
├── ui/                     # 共通UIコンポーネント（Button、Cardなど）
└── providers/              # React Contextプロバイダー

lib/
├── supabase/               # Supabaseクライアント、認証、お気に入り操作
├── gemini/                 # Gemini APIクライアント（レシピ生成用）
├── recipe-api/             # 外部レシピAPIクライアント（Spoonacular/楽天）
└── utils/                  # ユーティリティ、バリデーター、パーサー

types/                      # TypeScript型定義
└── recipe.ts              # Recipe、Ingredient、Instruction型

hooks/                      # カスタムReactフック
├── useAuth.ts             # 認証状態管理
├── useFavorites.ts        # お気に入りCRUD操作
├── useRecipeSearch.ts     # レシピ検索（AI + 外部API）
└── useIngredients.ts      # 材料入力管理
```

### レンダリング戦略

- **SSR**: ホームページ（`/`）- SEO対策と高速な初期表示のため
- **CSR**: その他すべてのページ（レシピ一覧、詳細、お気に入り、認証）- 動的なユーザー固有コンテンツのため
- **SSG**: このプロジェクトでは未使用

### コアデータフロー

1. **レシピ検索**:
   - ユーザーがホームページで材料を入力
   - クエリパラメータ付きで `/recipes` に遷移
   - Gemini API（AI生成）と外部レシピAPIの**両方から並列で**レシピを取得
   - 混在した結果を区別なく表示
   - 各レシピには手持ち材料と追加で必要な材料を表示

2. **AIレシピ生成**:
   - Gemini APIが検索ごとに3つのレシピを生成
   - プロンプトには利用可能な材料とJSON出力の指示を含む
   - レスポンスをパースして構造化されたレシピデータを抽出
   - レシピには `source: 'ai'` のマークを付与

3. **外部レシピAPI**:
   - Spoonacularまたは楽天APIから既存レシピを取得
   - 結果を内部のRecipe型に変換
   - レシピには `source: 'api'` のマークを付与

4. **お気に入り**:
   - 認証済みユーザーがレシピをお気に入り登録可能
   - レシピデータ全体をSupabaseにJSONBとして保存
   - お気に入りの判定にはレシピタイトルを使用（AI生成IDは重複の可能性があるため）
   - Row Level Security (RLS) により、ユーザーは自分のお気に入りのみアクセス可能

## データベーススキーマ（Supabase）

### favoritesテーブル

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_title VARCHAR(255) NOT NULL,
  recipe_data JSONB NOT NULL,  -- レシピオブジェクト全体
  source VARCHAR(50) NOT NULL CHECK (source IN ('ai', 'api')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_title)
);

-- インデックス
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);
```

**注意**: お気に入りの判定にはレシピタイトルを使用します（v1.1から変更）。理由は、AI生成レシピのIDは任意に付与されるため重複する可能性があるためです。

### RLSポリシー

すべてのテーブルでRow Level Securityを使用:
- ユーザーは自分のデータのみSELECT、INSERT、DELETE可能
- `auth.uid() = user_id` ポリシーで強制

## 主要なTypeScript型定義

```typescript
interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  cookTime: number;              // 調理時間（分）
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: Instruction[];
  imageUrl?: string;
  tags?: string[];
  source: 'ai' | 'api';         // AI生成または外部API
}

interface Ingredient {
  name: string;
  amount: string;
  isAvailable: boolean;          // ユーザーが持っている材料かどうか
}

interface Instruction {
  step: number;
  description: string;
}
```

## APIルート

### POST /api/recipes/search
- リクエスト: `{ ingredients: string[] }`
- `Promise.allSettled` を使用してGemini + 外部APIから並列でレシピを取得
- 一方が失敗しても結果をマージして返す

### POST /api/recipes/alternatives
- リクエスト: `{ ingredient: string, recipeContext: string }`
- Gemini APIを使用して3つの代替材料を提案

## 重要な実装ノート

### Gemini API統合

- モデル: `gemini-2.5-flash`
- プロンプトエンジニアリング: 特定の構造でJSON配列出力をリクエスト
- レスポンスのパース: 必要に応じてマークダウンコードブロックからJSONを抽出
- エラーハンドリング: AI生成が失敗した場合のグレースフルな縮退

### 並列API呼び出し

AI生成と外部APIレシピは常に並列で取得すること:

```typescript
const [aiRecipes, apiRecipes] = await Promise.allSettled([
  generateRecipes(ingredients),
  searchRecipesByIngredients(ingredients),
]);
```

### 認証フロー

- Supabase Authがすべての認証を処理
- クライアントサイドの認証状態は `useAuth` フックで管理
- `onAuthStateChange` リスナーでセッション管理
- `/favorites` から未認証ユーザーをリダイレクト

### モバイルファーストデザイン

- デフォルト: モバイルレイアウト
- モバイル用ボトムナビゲーション（`< md` ブレークポイント）
- デスクトップ用ヘッダーナビゲーション（`>= md` ブレークポイント）
- Tailwindブレークポイント: sm=640px, md=768px, lg=1024px, xl=1280px

## 将来の拡張

要件には記載されているが初期スコープには含まれない機能:
- ユーザー設定（アレルギー、食事制限）
- 栄養情報の表示
- ショッピングリストの自動生成
- レシピの評価・コメント機能
- 調理履歴の記録
- 検索履歴（`search_history` テーブルスキーマは定義済みだが未実装）

## パフォーマンス考慮事項

- 最適化には `React.memo`、`useMemo`、`useCallback` を使用
- 画像の遅延読み込み
- ルートベースのコード分割（App Routerで自動）
- データキャッシングにSWRまたはReact Queryの使用を検討（将来）

## セキュリティ

- すべてのAPIキーは環境変数で管理、コミットしない
- Supabase RLSがすべてのユーザーデータを保護
- すべてのAPIルートで入力バリデーション実施
- スキーマ検証にZodを使用（推奨）

## 日本語言語コンテキスト

UI全体が日本語です。生成する際:
- レシピのタイトル、説明、手順は日本語で記述
- エラーメッセージは日本語
- UIラベルとボタンは日本語
- 変数名とコードコメントは英語でも可
