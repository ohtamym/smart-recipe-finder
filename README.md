# スマートレシピファインダー (Smart Recipe Finder)

手持ちの材料からレシピを検索できるNext.js 14アプリケーション。AIでレシピを生成し、既存のレシピAPIと組み合わせて表示します。

## 📋 プロダクト概要

**スマートレシピファインダー**は、冷蔵庫にある材料を入力するだけで、最適なレシピを提案するWebアプリケーションです。

### 主な機能

- 🔍 **材料検索**: 手持ちの材料からレシピを検索
- 🤖 **AI生成レシピ**: Google Gemini 2.5 FlashでオリジナルレシピをAI生成
- 📚 **外部APIレシピ**: Spoonacular APIから既存レシピを取得
- 📖 **レシピ詳細**: 材料リスト、調理手順、調理時間などを表示
- ✅ **材料区別**: 手持ち材料と追加必要材料を色分けして表示
- ⭐ **お気に入り機能**: レシピをお気に入りに保存・管理（要ログイン）
- 🔐 **認証機能**: Supabase Authによるログイン・サインアップ
- 📱 **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応

### 技術スタック

- **フロントエンド**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **バックエンド/BaaS**: Supabase (PostgreSQL, Auth)
- **AI**: Google Gemini 2.5 Flash API
- **レシピAPI**: Spoonacular API
- **デプロイ**: Vercel（予定）

## 🚀 開発サーバーの起動

### 前提条件

- Node.js 18.17以上
- npm または yarn

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Spoonacular API
SPOONACULAR_API_KEY=your_spoonacular_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### APIキーの取得方法

<details>
<summary>Gemini APIキーの取得</summary>

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」をクリック
4. 新しいプロジェクトを作成または既存のプロジェクトを選択
5. 生成されたAPIキーをコピーして `.env.local` の `GEMINI_API_KEY` に設定

**注意**: Gemini APIは無料枠があります。詳細は[料金ページ](https://ai.google.dev/pricing)をご確認ください。
</details>

<details>
<summary>Spoonacular APIキーの取得</summary>

1. [Spoonacular](https://spoonacular.com/food-api) にアクセス
2. 「Start Now」をクリックしてアカウント作成
3. 無料プランを選択（1日150リクエストまで）
4. ダッシュボードからAPIキーをコピー
5. `.env.local` の `SPOONACULAR_API_KEY` に設定

**注意**: 無料プランは1日150リクエストに制限されています。詳細は[料金ページ](https://spoonacular.com/food-api/pricing)をご確認ください。
</details>

<details>
<summary>Supabaseプロジェクトのセットアップ</summary>

1. [Supabase](https://supabase.com/) にアクセスしてアカウント作成
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - API Keys の `anon/public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. データベーステーブルの作成：
   - SQLエディタで以下のSQLを実行：

```sql
-- favoritesテーブルの作成
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_title VARCHAR(255) NOT NULL,
  recipe_data JSONB NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('ai', 'api')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_title)
);

-- インデックスの作成
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- RLSポリシーの有効化
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のお気に入りのみアクセス可能
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
```

5. 認証設定：
   - Authentication → Settings
   - Email Auth を有効化（デフォルトで有効）
   - 必要に応じてメール確認を無効化（開発環境のみ）
</details>

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

> **Note**: ポート3000が使用中の場合、自動的に3001などの別ポートが使用されます。

## 📁 プロジェクト構造

```
smart-recipe-finder/
├── app/                    # Next.js App Router ページ
│   ├── page.tsx           # ホームページ（SSR）
│   ├── recipes/           # レシピ関連ページ
│   └── api/               # APIルート
├── components/            # Reactコンポーネント
│   ├── features/         # 機能別コンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── ui/               # 共通UIコンポーネント
├── hooks/                # カスタムReactフック
├── lib/                  # ライブラリ・ユーティリティ
│   ├── gemini/          # Gemini APIクライアント
│   ├── recipe-api/      # 外部レシピAPIクライアント
│   └── supabase/        # Supabaseクライアント
└── types/               # TypeScript型定義
```

## 📝 その他のコマンド

```bash
# 本番用ビルド
npm run build

# 本番ビルドをローカルで実行
npm start

# Linting実行
npm run lint

# TypeScript型チェック
npx tsc --noEmit

# テスト実行
npm test

# テストをウォッチモードで実行
npm test -- --watch

# カバレッジレポート付きでテスト実行
npm run test:coverage
```

### テストについて

このプロジェクトでは、Jest と React Testing Library を使用してテストを実装しています。

- **ユニットテスト**: コンポーネント、hooks、ユーティリティ関数のテスト
- **統合テスト**: API ルートのテスト
- **カバレッジ目標**: 主要機能で80%以上

テストファイルは各ソースファイルと同じディレクトリに配置され、`.test.ts` または `.test.tsx` の拡張子を持ちます。

## 🔧 トラブルシューティング

### 環境変数が読み込まれない

- `.env.local` ファイルがプロジェクトのルートディレクトリにあることを確認
- 開発サーバーを再起動（`Ctrl+C` で停止後、`npm run dev` で再起動）
- ファイル名が `.env.local` であることを確認（`.env` ではない）

### "Invalid API Key" エラー

- 各APIキーが正しくコピーされていることを確認
- APIキーに余分なスペースや改行が含まれていないか確認
- Gemini API / Spoonacular API / Supabase のダッシュボードでAPIキーが有効であることを確認

### Supabase接続エラー

- `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しく設定されているか確認
- Supabaseプロジェクトが一時停止されていないか確認（無料プランは非アクティブ時に自動停止）
- ブラウザのコンソールでエラーメッセージを確認

### お気に入り機能が動作しない

- Supabaseにログインしているか確認
- Supabaseで `favorites` テーブルが作成されているか確認
- RLSポリシーが正しく設定されているか確認（上記のSQLを参照）
- ブラウザの開発者ツールでネットワークエラーを確認

### ビルドエラー

```bash
# node_modules を削除して再インストール
rm -rf node_modules
npm install

# Next.jsのキャッシュをクリア
rm -rf .next

# 再度ビルド
npm run build
```

### ポート3000が使用中

```bash
# 使用中のポートを確認して終了
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

または、別のポートで起動:

```bash
PORT=3001 npm run dev
```

### テストが失敗する

- すべての依存関係がインストールされているか確認: `npm install`
- Jest設定ファイル (`jest.config.js`) が存在するか確認
- テスト用の環境変数が設定されているか確認

## 🔗 関連リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [Spoonacular API](https://spoonacular.com/food-api)

## 📄 ライセンス

This project is licensed under the MIT License.

---

**開発期間**: 2週間
**言語**: TypeScript + 日本語UI
