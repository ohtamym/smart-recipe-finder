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
```

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
