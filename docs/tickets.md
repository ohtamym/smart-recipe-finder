# チケット管理

このドキュメントは、スマートレシピファインダーの開発タスクをチケット形式で管理します。

## チケットステータス

- **TODO**: 未着手
- **IN_PROGRESS**: 作業中
- **REVIEW**: レビュー待ち
- **DONE**: 完了

---

## Week 1: 基盤構築とコア機能実装

### RECIPE-001: プロジェクト初期設定

**ステータス**: DONE
**優先度**: 高
**見積もり**: 2時間
**完了日**: 2025年11月4日

**タスク**:
- [x] Next.js 14プロジェクトの初期化（App Router、TypeScript、Tailwind CSS）
- [x] 必要なパッケージのインストール
  - `@supabase/supabase-js`
  - `@google/generative-ai`
  - その他必要なライブラリ
- [x] `.env.local` ファイルの作成とテンプレート設定
- [x] `.gitignore` の設定確認
- [x] ディレクトリ構造の作成（`components/`, `lib/`, `types/`, `hooks/`）
- [x] ESLint/Prettier設定の確認

**完了条件**:
- `npm run dev` でプロジェクトが起動すること ✅
- ディレクトリ構造が設計書通りに作成されていること ✅

---

### RECIPE-002: Supabase プロジェクト設定

**ステータス**: DONE
**優先度**: 高
**見積もり**: 2時間
**完了日**: 2025年11月4日

**タスク**:
- [x] Supabaseプロジェクトの作成（smart-recipe-finder / ap-northeast-1）
- [x] データベース設定
  - `favorites` テーブルの作成
  - インデックスの作成（idx_favorites_user_id, idx_favorites_created_at）
  - RLSポリシーの設定（SELECT, INSERT, DELETE）
- [x] Supabase認証の有効化（メール/パスワード認証）
- [x] 環境変数の設定（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- [x] Supabaseクライアントの実装（`lib/supabase/client.ts`）

**参照**: `docs/database-design.md`

**完了条件**:
- SupabaseダッシュボードでRLSが有効化されていること ✅
- クライアントからSupabaseに接続できること ✅
- セキュリティアドバイザーで問題がないこと ✅

**実装詳細**:
- プロジェクトID: `msfzwzfijfhznbewoelm`
- マイグレーション: create_favorites_table, enable_rls_and_create_policies
- セキュリティ: 問題なし（security advisorで確認済み）

---

### RECIPE-003: TypeScript型定義の作成

**ステータス**: DONE
**優先度**: 高
**見積もり**: 1時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `types/recipe.ts` の作成
  - `Recipe` インターフェース
  - `Ingredient` インターフェース
  - `Instruction` インターフェース
  - `Favorite` インターフェース
  - `RecipeDifficulty` 型
  - `RecipeSource` 型
  - `RecipeSearchParams` インターフェース
  - `AlternativeIngredientParams` インターフェース
- [x] `types/user.ts` の作成
  - `User` インターフェース
  - `LoginFormData` インターフェース
  - `SignupFormData` インターフェース
  - `AuthState` インターフェース
  - `AuthError` インターフェース
- [x] `types/api.ts` の作成
  - `ApiError` インターフェース
  - `ApiErrorCode` 型
  - `ApiResponse` 型
  - 各種APIリクエスト/レスポンス型
  - `HTTP_STATUS_CODE` 定数
- [x] `types/index.ts` の作成（すべての型をエクスポート）

**参照**: `docs/component-design.md`, `docs/api-design.md`

**完了条件**:
- すべての型定義がエクスポートされていること ✅
- 型チェックエラーがないこと ✅
- 開発サーバーが正常に起動すること ✅

**実装詳細**:
- 作成ファイル: recipe.ts (2169 bytes), user.ts (1417 bytes), api.ts (2839 bytes), index.ts (850 bytes)
- 型チェック: `npx tsc --noEmit` でエラーなし
- JSDocコメント付きで可読性が高い

---

### RECIPE-004: 共通UIコンポーネントの実装

**ステータス**: DONE
**優先度**: 中
**見積もり**: 3時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `components/ui/Button.tsx` の実装（84行、2.3KB）
  - 3種類のバリアント（solid, outline, ghost）
  - 3種類のサイズ（sm, md, lg）
  - ローディング状態サポート
  - フルワイド対応
- [x] `components/ui/Card.tsx` の実装（114行、2.4KB）
  - 基本カードコンポーネント
  - CardHeader, CardTitle, CardContent, CardFooter
  - クリック可能なカード対応
  - アクセシビリティ対応（keyboard navigation）
- [x] `components/ui/Input.tsx` の実装（146行、4.0KB）
  - Input コンポーネント
  - Textarea コンポーネント
  - ラベル、エラーメッセージ、ヘルプテキスト対応
  - React forwardRef 使用
- [x] `components/ui/Loading.tsx` の実装（103行、2.9KB）
  - 基本ローディングスピナー（3サイズ）
  - フルスクリーンローディング
  - インラインローディング
  - スケルトンカード・リスト
- [x] `components/ui/ErrorMessage.tsx` の実装（130行、3.2KB）
  - 3種類のバリアント（error, warning, info）
  - リトライボタン対応
  - インラインエラーメッセージ
  - 空状態（EmptyState）コンポーネント
- [x] `components/ui/index.ts` の実装（40行、790bytes）
  - すべてのUIコンポーネントを一括エクスポート
- [x] Tailwind CSSスタイリング（完了）
- [x] UIショーケースページの作成（app/page.tsx）

**参照**: `docs/component-design.md`

**完了条件**:
- 各コンポーネントが独立して動作すること ✅
- レスポンシブデザインに対応していること ✅
- TypeScript型チェックがパスすること ✅
- 開発サーバーが正常に起動すること ✅

**実装詳細**:
- 総ファイル数: 6ファイル
- 総行数: 617行
- 総サイズ: 約15.6KB
- すべてのコンポーネントにJSDocコメント付き
- アクセシビリティ対応（ARIA attributes, keyboard navigation）
- モバイルファースト設計

---

### RECIPE-005: レイアウトコンポーネントの実装

**ステータス**: DONE
**優先度**: 中
**見積もり**: 3時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `components/layout/Header.tsx` の実装（86行）
  - Sticky header with shadow and border
  - レスポンシブロゴ/タイトル（モバイル/デスクトップで異なる表示）
  - デスクトップナビゲーション（hidden md:flex）
  - 認証ボタンエリア（認証状態に応じて切り替え）
  - TODO: 認証機能実装後にuseAuthフックを使用
- [x] `components/layout/Footer.tsx` の実装（140行）
  - コピーライト情報
  - ナビゲーションリンク（デスクトップ/モバイルで異なるレイアウト）
  - デスクトップ: 左側にプロジェクト情報、右側にリンク
  - モバイル: 中央揃えのシンプルなレイアウト
- [x] `components/layout/Navigation.tsx` の実装（92行）
  - モバイル用ボトムナビゲーション（fixed bottom-0 z-50）
  - 4つの主要リンク: ホーム、レシピ、お気に入り、ログイン
  - usePathname使用で現在のページをハイライト表示
  - 認証が必要なページ（お気に入り）の制御
- [x] `components/layout/index.ts` の実装（9行）
  - すべてのレイアウトコンポーネントをエクスポート
- [x] `app/layout.tsx` の更新
  - Header, Footer, Navigationを統合
  - flexレイアウト（min-h-screen flex flex-col）
  - mainタグにpb-16 md:pb-0でモバイルナビゲーション用スペース確保
- [x] レスポンシブ対応（モバイル/デスクトップ）

**参照**: `docs/component-design.md`

**完了条件**:
- ヘッダーとフッターが表示されること ✅
- モバイルでボトムナビゲーションが表示されること ✅
- デスクトップでヘッダーナビゲーションが表示されること ✅
- TypeScript型チェックがパスすること ✅
- 開発サーバーが正常に起動すること ✅

**実装詳細**:
- 総ファイル数: 4ファイル（Header, Footer, Navigation, index）
- 総行数: 327行
- sticky header（z-40）とfixed bottom navigation（z-50）
- モバイルファースト設計（md:ブレークポイントでデスクトップ対応）
- アクセシビリティ対応（role, aria-label, aria-current）
- 認証プレースホルダー（TODO: 後で実装）

---

### RECIPE-006: 材料入力UIの実装

**ステータス**: DONE
**優先度**: 高
**見積もり**: 4時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `hooks/useIngredients.ts` の実装（106行）
  - 材料の追加・削除・クリア機能
  - バリデーション（重複チェック、長さチェック、最大数チェック）
  - エラーハンドリング
  - useState, useCallback使用
- [x] `components/features/search/IngredientInput.tsx` の実装（140行）
  - テキスト入力フォーム
  - useIngredientsフックの使用
  - Enterキーで材料を追加
  - エラーメッセージ表示
  - 「すべてクリア」ボタン
- [x] `components/features/search/IngredientTag.tsx` の実装（57行）
  - 材料タグ表示（青色のピル型デザイン）
  - 削除ボタン（✕アイコン）
  - アクセシビリティ対応（keyboard navigation）
  - ホバーアニメーション
- [x] `components/features/search/SearchButton.tsx` の実装（77行）
  - レシピ検索ボタン
  - 材料数に応じた無効化/有効化
  - ローディング状態サポート
  - アイコン付きボタン
  - ヘルプテキスト表示
- [x] `components/features/search/index.ts` の実装（14行）
  - すべてのコンポーネントをエクスポート
- [x] `app/page.tsx` の更新
  - 材料入力UIの統合
  - 仮の検索機能実装（アラート表示）

**参照**: `docs/component-design.md`, `docs/requirements.md`

**完了条件**:
- 材料を追加・削除できること ✅
- 材料がタグで表示されること ✅
- 検索ボタンが機能すること ✅
- バリデーションが動作すること ✅
- TypeScript型チェックがパスすること ✅
- 開発サーバーが正常に起動すること ✅

**実装詳細**:
- 総ファイル数: 5ファイル
- 総行数: 394行
- バリデーション機能:
  - 空文字チェック
  - 重複チェック（大文字小文字を区別しない）
  - 最大20個まで
  - 1〜50文字の長さ制限
- アクセシビリティ対応（aria-label）
- レスポンシブデザイン

---

### RECIPE-007: ホームページの実装

**ステータス**: DONE
**優先度**: 高
**見積もり**: 3時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `app/page.tsx` の実装（CSR: 'use client'）
  - ヒーローセクション（レスポンシブタイトル、説明文）
  - 材料入力カード
  - 使い方ガイドカード
- [x] 材料検索フォームの統合
  - IngredientInputコンポーネント使用
  - SearchButtonコンポーネント使用
  - 仮の検索処理実装（alert表示）
- [x] レスポンシブデザイン
  - モバイル: 3xl テキスト
  - デスクトップ: 4xl テキスト
  - max-w-4xl コンテナ

**参照**: `docs/component-design.md`

**完了条件**:
- ホームページが表示されること ✅
- 材料入力フォームが動作すること ✅
- レスポンシブデザインに対応していること ✅
- 開発サーバーが正常に起動すること ✅

**実装詳細**:
- 77行
- 'use client' ディレクティブ使用
- useState で材料リストとローディング状態を管理
- 仮の検索処理（2秒後にアラート表示）
- 使い方ガイド付き
- ヒント表示（青色の背景）

---

### RECIPE-008: Gemini API クライアントの実装

**ステータス**: DONE
**優先度**: 高
**見積もり**: 4時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `lib/gemini/client.ts` の実装（209行）
  - GoogleGenerativeAI初期化
  - モデル: gemini-2.5-flash
  - APIキーの環境変数検証
- [x] `generateRecipes()` 関数の実装
  - プロンプトエンジニアリング（詳細なJSON形式指定）
  - 材料リストからレシピを3つ生成
  - 手持ちの材料と追加材料の区別（isAvailable）
  - JSONレスポンスのパース
    - マークダウンコードブロック除去（```json ... ```）
    - クリーンなJSON抽出
  - エラーハンドリング
    - SyntaxError（JSON解析エラー）
    - APIエラー
    - バリデーションエラー
  - コンソールログ出力
- [x] `suggestAlternatives()` 関数の実装
  - 代替材料を3つ提案
  - レシピコンテキストを考慮
  - JSON配列形式で出力
- [x] `lib/gemini/index.ts` の実装（7行）
  - 関数をエクスポート
- [x] Gemini APIキーの環境変数確認（.env.local設定済み）

**参照**: `docs/api-design.md`

**完了条件**:
- Gemini APIからレシピを生成できること ✅
- JSONレスポンスが正しくパースされること ✅
- エラーが適切にハンドリングされること ✅
- TypeScript型チェックがパスすること ✅

**実装詳細**:
- 総ファイル数: 2ファイル
- 総行数: 216行
- プロンプト設計:
  - JSON配列形式で3つのレシピを生成
  - 各レシピに必須フィールド（title, description, servings, cookTime, difficulty, ingredients, instructions, tags）
  - 手持ちの材料はisAvailable: true
  - IDは"gemini-"プレフィックス付き
- エラーハンドリング:
  - JSON解析エラーの検出
  - 配列形式のバリデーション
  - 必須フィールドの検証
- 代替材料提案機能付き

---

### RECIPE-009: レシピ検索APIルートの実装

**ステータス**: DONE
**優先度**: 高
**見積もり**: 3時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `app/api/recipes/search/route.ts` の実装（182行）
  - POST /api/recipes/search エンドポイント
  - GET メソッドは405エラーを返す
- [x] リクエストバリデーション
  - validateRequest関数の実装
  - bodyの存在チェック
  - ingredientsフィールドの存在チェック
  - 配列型のチェック
  - 空配列のチェック
  - 文字列配列のチェック
  - 最大20個までの制限
- [x] Gemini APIとの統合
  - generateRecipes関数を呼び出し
  - 材料リストを渡してレシピを生成
- [x] レスポンス形式の統一
  - 成功レスポンス: { success: true, data: { recipes, total } }
  - エラーレスポンス: { success: false, error: { code, message } }
  - HTTPステータスコード: 200（成功）、400（バリデーションエラー）、405（メソッド不許可）、500（サーバーエラー）
- [x] エラーハンドリング
  - バリデーションエラー（INVALID_INPUT）
  - レシピ生成失敗（RECIPE_GENERATION_FAILED）
  - 予期しないエラー（INTERNAL_SERVER_ERROR）
  - メソッド不許可（METHOD_NOT_ALLOWED）
- [x] コンソールログ出力
  - リクエスト情報のログ
  - レスポンス情報のログ
  - エラー情報のログ

**参照**: `docs/api-design.md`

**完了条件**:
- `/api/recipes/search` エンドポイントが動作すること ✅
- AI生成レシピが返されること ✅
- エラーレスポンスが適切に返されること ✅
- TypeScript型チェックがパスすること ✅

**実装詳細**:
- 総ファイル数: 1ファイル
- 総行数: 182行
- エンドポイント: POST /api/recipes/search
- リクエスト形式: { ingredients: string[] }
- レスポンス形式: { success: boolean, data?: {...}, error?: {...} }
- バリデーション: 7つのチェック項目
- エラーコード: 4種類（INVALID_INPUT, RECIPE_GENERATION_FAILED, INTERNAL_SERVER_ERROR, METHOD_NOT_ALLOWED）

**注**: 外部レシピAPIとの並列呼び出しは将来実装予定（RECIPE-011, RECIPE-012）

---

### RECIPE-010: レシピ一覧ページの実装

**ステータス**: DONE
**優先度**: 高
**見積もり**: 4時間
**完了日**: 2025年11月4日

**タスク**:
- [x] `hooks/useRecipeSearch.ts` の実装（116行）
  - レシピ検索APIを呼び出すカスタムフック
  - useState で状態管理（recipes, isLoading, error）
  - useCallback でsearch関数とreset関数を実装
  - useEffect で初期材料の自動検索
  - エラーハンドリング（バリデーション、ネットワークエラー）
  - 型ガードでApiResponse型を正しく処理
- [x] `components/features/recipe/RecipeCard.tsx` の実装（116行）
  - レシピカードコンポーネント
  - Next.js Link でレシピ詳細ページへ遷移
  - レシピ画像、タイトル、説明、調理時間、人数、難易度を表示
  - ソースバッジ（AI生成/外部API）表示
  - ホバーエフェクト（影、移動、色変更）
  - lucide-reactアイコン使用（Clock, Users, TrendingUp）
- [x] `components/features/recipe/RecipeGrid.tsx` の実装（66行）
  - レシピカードをグリッドレイアウトで表示
  - レスポンシブ: 1列（モバイル）→ 2列（タブレット）→ 3列（デスクトップ）
  - 空状態の表示（レシピがない場合）
  - アクセシビリティ対応（role="list", role="listitem"）
- [x] `components/features/recipe/index.ts` の実装（10行）
  - RecipeCard, RecipeGrid のエクスポート
- [x] `app/recipes/page.tsx` の実装（170行）
  - レシピ一覧ページ（CSR）
  - useSearchParams でURLクエリパラメータから材料を取得
  - useRecipeSearch フックでレシピ検索
  - ローディング状態の表示
  - エラー状態の表示（再試行ボタン付き）
  - レシピ件数バッジ表示
  - ホームに戻るボタン
  - ヒント表示
- [x] `app/page.tsx` の更新
  - useRouter を追加
  - handleSearch で /recipes?ingredients=材料1,材料2 に遷移
- [x] UIコンポーネントの機能追加
  - Loading コンポーネントに className プロパティ追加
  - ErrorMessage コンポーネントに retryLabel プロパティ追加
- [x] 依存関係のインストール
  - lucide-react アイコンライブラリをインストール

**参照**: `docs/component-design.md`

**完了条件**:
- レシピ一覧が表示されること ✅
- レシピカードがクリックできること ✅
- ローディングとエラー状態が正しく表示されること ✅
- TypeScript型チェックがパスすること ✅

**実装詳細**:
- 総ファイル数: 7ファイル（新規5、更新2）
- 総行数: 478行
- レシピカード表示機能: 完全実装
- URL遷移: ホームページ → レシピ一覧ページ
- 状態管理: ローディング、エラー、空状態の3つをサポート
- レスポンシブデザイン: モバイル・タブレット・デスクトップ対応
- アクセシビリティ: ARIA属性、role属性付き
- 開発サーバー: http://localhost:3000 で正常起動

**注**: レシピ詳細ページ（/recipes/[id]）は未実装。RECIPE-013で実装予定。

---

## Week 2: 外部API統合と認証機能

### RECIPE-011: 外部レシピAPI クライアントの実装

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 5時間
**完了日**: 2025年11月5日

**タスク**:
- [x] Spoonacular APIキーの取得
- [x] `lib/recipe-api/spoonacular.ts` の実装
- [x] `searchRecipesByIngredients()` 関数の実装
- [x] レシピデータの変換（内部型への変換）
- [x] APIキーの環境変数設定
- [x] レート制限対策

**参照**: `docs/api-design.md`

**完了条件**:
- 外部APIからレシピを取得できること ✅
- レシピが内部型に正しく変換されること ✅
- エラーハンドリングが実装されていること ✅

**実装詳細**:
- lib/recipe-api/spoonacular.ts (7.5KB)
- 主要関数: searchRecipesByIngredients, getRecipeDetails, transformSpoonacularRecipe
- エラーハンドリング: API失敗時は空配列を返す
- 材料判定: ユーザーの手持ち材料を isAvailable で判定

---

### RECIPE-012: レシピ検索の外部API統合

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 2時間
**完了日**: 2025年11月5日

**依存**: RECIPE-009, RECIPE-011

**タスク**:
- [x] `/api/recipes/search` に外部APIクライアントを統合
- [x] AI生成レシピと外部APIレシピの並列取得
- [x] 結果のマージ
- [x] `source` フィールドの設定（'ai' または 'api'）

**参照**: `docs/api-design.md`

**完了条件**:
- AI生成と外部APIレシピが混在して表示されること ✅
- 一方のAPIが失敗しても他方の結果が返されること ✅

**実装詳細**:
- Promise.allSettled でGemini + Spoonacular API並列呼び出し
- レスポンスにsourcesフィールド追加（ai件数、api件数）
- エラーログ出力で片方の失敗を記録

---

### RECIPE-013: レシピ詳細ページの実装

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 4時間
**完了日**: 2025年11月5日

**タスク**:
- [x] `app/recipes/[id]/page.tsx` の実装（CSR）
- [x] `components/features/recipe/RecipeDetail.tsx` の実装
- [x] `components/features/recipe/IngredientList.tsx` の実装
  - 手持ち材料と追加必要材料の区別表示
- [x] `components/features/recipe/InstructionList.tsx` の実装
- [x] レシピデータの取得ロジック
- [x] 404エラーハンドリング

**参照**: `docs/component-design.md`

**完了条件**:
- レシピ詳細が表示されること ✅
- 材料リストが手持ち/追加で区別されていること ✅
- 調理手順が表示されること ✅

**実装詳細**:
- components/features/recipe/IngredientList.tsx (82行) - 手持ち材料（緑）と追加材料（オレンジ）を区別表示
- components/features/recipe/InstructionList.tsx (44行) - ステップバイステップで手順を表示
- components/features/recipe/RecipeDetail.tsx (137行) - レシピ全体の詳細表示
- app/recipes/[id]/page.tsx (166行) - sessionStorageからレシピデータを取得
- 404エラーハンドリング: レシピが見つからない場合に適切なエラーメッセージを表示
- sessionStorageを使用したレシピデータの共有

---

### RECIPE-014: 代替材料提案機能の実装

**ステータス**: DONE ✅
**優先度**: 中
**見積もり**: 3時間
**完了日**: 2025年11月6日

**タスク**:
- [x] `app/api/recipes/alternatives/route.ts` の実装
- [x] `components/features/recipe/IngredientWithAlternatives.tsx` の実装
- [x] 代替材料表示のUI実装
- [x] ボタンクリックで代替材料を取得
- [x] ローディング状態の実装

**参照**: `docs/api-design.md`, `docs/component-design.md`

**完了条件**:
- ✅ 代替材料が提案されること
- ✅ ユーザーがボタンで代替材料を表示できること

**実装詳細**:
- app/api/recipes/alternatives/route.ts: POST APIエンドポイント実装、バリデーション、エラーハンドリング
- components/features/recipe/IngredientWithAlternatives.tsx: 代替材料提案UI、トグル機能、ローディング、エラーハンドリング
- components/features/recipe/IngredientList.tsx: 追加で必要な材料に代替材料提案ボタンを統合
- Gemini APIを使用して代替材料を3つ提案

---

### RECIPE-015: 認証機能の実装

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 5時間
**完了日**: 2025年11月6日

**タスク**:
- [x] `lib/supabase/auth.ts` の実装（認証ヘルパー関数）
- [x] `hooks/useAuth.ts` の実装
  - セッション管理
  - ログイン/ログアウト/サインアップ
  - `onAuthStateChange` リスナー
- [x] `components/providers/AuthProvider.tsx` の実装
- [x] `app/layout.tsx` にAuthProviderを統合

**参照**: `docs/component-design.md`, `docs/api-design.md`

**完了条件**:
- ✅ 認証状態が管理されること
- ✅ ログイン/ログアウトが機能すること

**実装詳細**:
- AuthProvider: React Contextを使用した認証状態管理
- useAuthフック: AuthProviderから認証状態を取得
- Header.tsx: 認証状態に応じたUI切り替え（ログイン/ログアウトボタン）
- Navigation.tsx: 認証状態に応じたナビゲーション表示
- エラーメッセージの日本語化対応

---

### RECIPE-016: 認証ページの実装

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 4時間
**完了日**: 2025年11月6日

**依存**: RECIPE-015

**タスク**:
- [x] `app/auth/page.tsx` の実装（CSR）
- [x] `components/features/auth/AuthForm.tsx` の実装（LoginとSignupを統合）
- [x] フォームバリデーション
- [x] エラーメッセージ表示
- [x] ログイン成功時のリダイレクト

**参照**: `docs/component-design.md`

**完了条件**:
- ✅ ログインフォームが動作すること
- ✅ サインアップフォームが動作すること
- ✅ エラーが適切に表示されること

**実装詳細**:
- AuthForm: ログインとサインアップを統合した認証フォーム
- フォームバリデーション: メールアドレス形式、パスワード長、パスワード確認
- エラーメッセージ: 日本語でユーザーフレンドリーな表示
- リダイレクト: 認証成功後にホームページまたは指定URLへ遷移

---

### RECIPE-017: お気に入り機能のバックエンド実装

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 3時間
**完了日**: 2025年11月6日

**依存**: RECIPE-002, RECIPE-015

**タスク**:
- [x] `lib/supabase/favorites.ts` の実装
  - お気に入り取得
  - お気に入り追加
  - お気に入り削除
  - お気に入り確認
- [x] `hooks/useFavorites.ts` の実装
- [x] RLSポリシーの動作確認

**参照**: `docs/database-design.md`, `docs/component-design.md`

**完了条件**:
- ✅ お気に入りのCRUD操作が動作すること
- ✅ RLSが正しく機能すること

**実装詳細**:
- lib/supabase/favorites.ts: getFavorites, addFavorite, removeFavorite, isFavorited関数実装
- hooks/useFavorites.ts: お気に入り状態管理のカスタムフック
- RLSポリシー: ユーザーごとのデータ分離が正常動作

---

### RECIPE-018: お気に入りボタンの実装

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 3時間
**完了日**: 2025年11月6日

**依存**: RECIPE-017

**タスク**:
- [x] `components/features/favorites/FavoriteButton.tsx` の実装
- [x] お気に入り状態の表示
- [x] お気に入り追加/削除の動作
- [x] 未認証時のリダイレクト処理
- [x] レシピカードとレシピ詳細への統合

**参照**: `docs/component-design.md`

**完了条件**:
- ✅ お気に入りボタンが動作すること
- ✅ ログイン状態に応じて適切に動作すること

**実装詳細**:
- FavoriteButton: トグルボタン形式でお気に入り追加/削除
- アクセシビリティ: aria-pressed属性でトグル状態を通知
- 未認証時: /authページへリダイレクト
- ローディング状態とエラーハンドリング実装

---

### RECIPE-019: お気に入り一覧ページの実装

**ステータス**: DONE ✅
**優先度**: 高
**見積もり**: 3時間
**完了日**: 2025年11月6日

**依存**: RECIPE-017

**タスク**:
- [x] `app/favorites/page.tsx` の実装（CSR）
- [x] `components/features/favorites/FavoritesList.tsx` の実装
- [x] お気に入りレシピの表示
- [x] お気に入り削除機能
- [x] 空状態の表示
- [x] 認証チェックとリダイレクト

**参照**: `docs/component-design.md`

**完了条件**:
- ✅ お気に入り一覧が表示されること
- ✅ お気に入りを削除できること
- ✅ 未認証時にリダイレクトされること

**実装詳細**:
- app/favorites/page.tsx: 認証チェック付きお気に入り一覧ページ
- FavoritesList: レシピカードグリッド表示、削除ボタン統合
- 空状態: お気に入りがない場合の案内表示
- ローディング状態とエラーハンドリング実装

---

### RECIPE-020: ヘッダーの認証状態表示

**ステータス**: DONE ✅
**優先度**: 中
**見積もり**: 2時間
**完了日**: 2025年11月6日

**依存**: RECIPE-015

**タスク**:
- [x] Headerコンポーネントに認証状態を統合
- [x] ログイン/ログアウトボタンの表示切り替え
- [x] お気に入りページへのリンク（認証時のみ）
- [x] ユーザーメニューの実装（オプション）

**完了条件**:
- ✅ 認証状態に応じてUIが変化すること
- ✅ ログアウトボタンが機能すること

**実装詳細**:
- Header.tsx: useAuthフックを使用して認証状態を取得
- デスクトップ: メールアドレス表示 + ログアウトボタン
- モバイル: モバイルメニュー内に認証情報とログアウトボタン表示
- お気に入りリンク: 認証済みユーザーのみ表示
- ログアウト: 確認ダイアログ付き

---

## Week 2後半: UI/UX調整とデプロイ

### RECIPE-021: レスポンシブデザインの調整

**ステータス**: DONE ✅
**優先度**: 中
**見積もり**: 4時間
**完了日**: 2025年11月6日

**タスク**:
- [x] すべてのページのモバイル表示確認
- [x] タブレット表示の確認
- [x] デスクトップ表示の確認
- [x] ブレークポイントの調整
- [x] タッチ操作の最適化
- [x] フォントサイズの調整

**完了条件**:
- ✅ すべての画面サイズで適切に表示されること
- ✅ モバイルファーストデザインが実現されていること

**実装詳細**:
- Header.tsx: モバイルメニュー実装（ハンバーガーメニュー、ドロップダウン）
- RecipeCard.tsx: レスポンシブ画像高さ、フォントサイズ、メタ情報レイアウト調整
- RecipeDetail.tsx: レスポンシブ画像高さ、タイトルサイズ、パディング調整
- Button.tsx: タッチデバイス対応（touch-manipulation、適切なタップ領域確保）
- 各ページ: レイアウト、スペーシング、アイコンサイズの調整
- レスポンシブブレークポイント: sm(640px)、md(768px)、lg(1024px)

---

### RECIPE-022: UIの微調整とポリッシング

**ステータス**: DONE ✅
**優先度**: 中
**見積もり**: 4時間
**完了日**: 2025年11月6日

**タスク**:
- [x] カラースキームの統一
- [x] スペーシングの調整
- [x] アニメーションの追加（適度に）
- [x] ホバーエフェクトの実装
- [x] フォーカス状態の改善
- [x] アイコンの追加（必要に応じて）

**完了条件**:
- ✅ UIが洗練されていること
- ✅ ユーザー体験が向上していること

**実装詳細**:
- Input.tsx/Textarea.tsx: トランジション統一、ホバー状態追加、エラー状態の背景色
- Card.tsx: ボーダー追加、ホバーエフェクト強化、浮き上がり効果
- ErrorMessage.tsx: フェードインアニメーション、アイコンアニメーション
- tailwind.config.ts: カスタムアニメーション追加（fadeIn、bounceSubtle、slideIn、scaleIn）
- すべてのインタラクティブ要素でtransition-all duration-200を使用
- ホバー状態: border-gray-400、shadow-xl、-translate-y-0.5

---

### RECIPE-023: アクセシビリティ対応

**ステータス**: DONE ✅
**優先度**: 中
**見積もり**: 3時間
**完了日**: 2025年11月6日

**タスク**:
- [x] セマンティックHTMLの確認
- [x] ARIA属性の追加
- [x] キーボードナビゲーションの確認
- [x] カラーコントラストの確認
- [x] スクリーンリーダーでのテスト準備
- [x] フォーカス順序の確認

**完了条件**:
- ✅ WCAG 2.1 AAレベルの基本要件を満たすこと
- ✅ キーボードですべての操作が可能なこと

**実装内容**:
- Header.tsx: Escキー対応、フォーカス管理、ARIA属性追加
- Button.tsx: aria-busy, role="status"追加
- Input.tsx/Textarea.tsx: aria-invalid, aria-describedby追加
- FavoriteButton.tsx: aria-pressed追加
- layout.tsx: スキップリンク、ランドマーク追加
- Footer.tsx: aria-label追加
- ドキュメント作成: docs/accessibility-improvements.md

---

### RECIPE-024: エラーハンドリングの改善

**ステータス**: DONE ✅
**優先度**: 中
**見積もり**: 3時間
**完了日**: 2025年11月6日

**タスク**:
- [x] すべてのAPIエンドポイントのエラーハンドリング確認
- [x] エラーメッセージの日本語化
- [x] ネットワークエラーの処理
- [x] タイムアウト処理
- [x] フォールバック処理の実装
- [x] エラーログの実装（オプション）

**完了条件**:
- ✅ エラーが適切にユーザーに通知されること
- ✅ アプリがクラッシュしないこと

**実装詳細**:
- app/api/recipes/search/route.ts: JSON解析エラーハンドリング追加
- app/api/recipes/alternatives/route.ts: JSON解析エラーハンドリング追加
- hooks/useRecipeSearch.ts: タイムアウト処理（30秒）、ネットワークエラー検出、JSON解析エラー処理を実装
- すべてのエラーメッセージを日本語化、ユーザーフレンドリーな表現に改善
- Promise.allSettledによるフォールバック処理（既存実装の確認）
- TypeScript型チェック: エラーなし

---

### RECIPE-025: パフォーマンス最適化

**ステータス**: DONE ✅
**優先度**: 中
**見積もり**: 4時間
**完了日**: 2025年11月6日

**タスク**:
- [x] `React.memo` の適用
- [x] `useMemo` / `useCallback` の適用
- [x] 画像の最適化（Next.js Image）
- [x] 遅延読み込みの実装
- [x] バンドルサイズの確認
- [x] Lighthouseスコアの確認

**完了条件**:
- ✅ ページ読み込み速度が改善されること
- ✅ Lighthouseスコアが良好であること

**実装詳細**:
- RecipeCard: React.memo適用、Next.js Image使用（fill, sizes最適化）
- IngredientTag: React.memo + useCallback適用
- Button: React.memo適用
- FavoritesList: Next.js Image使用（fill, sizes最適化）
- RecipeDetail: Next.js Image使用（priority属性）
- バンドルサイズ確認: npm run build実行、正常にビルド完了
- TypeScript型チェック: エラーなし

---

### RECIPE-026: テストの実装（オプション）

**ステータス**: TODO
**優先度**: 低
**見積もり**: 6時間

**タスク**:
- [ ] Jestのセットアップ
- [ ] React Testing Libraryのセットアップ
- [ ] 主要コンポーネントのユニットテスト
- [ ] カスタムフックのテスト
- [ ] API routesのテスト

**完了条件**:
- 主要な機能がテストされていること
- すべてのテストがパスすること

---

### RECIPE-027: 環境変数とシークレット管理

**ステータス**: TODO
**優先度**: 高
**見積もり**: 1時間

**タスク**:
- [ ] `.env.example` ファイルの作成
- [ ] `.env.local` が `.gitignore` に含まれていることを確認
- [ ] Vercelでの環境変数設定準備
- [ ] APIキーのセキュリティ確認

**完了条件**:
- 環境変数が適切に管理されていること
- シークレットがコミットされていないこと

---

### RECIPE-028: README.mdの作成

**ステータス**: TODO
**優先度**: 中
**見積もり**: 2時間

**タスク**:
- [ ] プロジェクト概要の記述
- [ ] セットアップ手順の記述
- [ ] 環境変数の説明
- [ ] 開発コマンドの記述
- [ ] 技術スタックの記述
- [ ] スクリーンショットの追加（オプション）

**完了条件**:
- README.mdが充実していること
- 他の開発者がセットアップできること

---

### RECIPE-029: Vercelへのデプロイ準備

**ステータス**: TODO
**優先度**: 高
**見積もり**: 2時間

**タスク**:
- [ ] Vercelアカウントの作成
- [ ] プロジェクトのGitHubリポジトリへのプッシュ
- [ ] Vercelでのプロジェクトインポート
- [ ] 環境変数の設定
- [ ] ビルド設定の確認
- [ ] ドメイン設定（オプション）

**完了条件**:
- Vercelでビルドが成功すること
- プレビューURLでアプリが動作すること

---

### RECIPE-030: 本番デプロイとテスト

**ステータス**: TODO
**優先度**: 高
**見積もり**: 3時間

**依存**: RECIPE-029

**タスク**:
- [ ] 本番環境へのデプロイ
- [ ] 本番環境での動作確認
  - 材料検索機能
  - レシピ表示機能
  - お気に入り機能
  - 認証機能
  - 代替材料提案機能
- [ ] モバイルデバイスでのテスト
- [ ] 複数ブラウザでのテスト
- [ ] パフォーマンスの確認

**完了条件**:
- すべての機能が本番環境で動作すること
- パフォーマンスが許容範囲内であること

---

## 将来の拡張チケット（オプション）

### RECIPE-031: 検索履歴機能

**ステータス**: TODO
**優先度**: 低

**タスク**:
- [ ] `search_history` テーブルの作成
- [ ] 検索履歴の保存機能
- [ ] 検索履歴の表示UI
- [ ] 検索履歴からの再検索

---

### RECIPE-032: ユーザー設定（アレルギー・食事制限）

**ステータス**: TODO
**優先度**: 低

**タスク**:
- [ ] ユーザー設定テーブルの作成
- [ ] 設定画面の実装
- [ ] レシピ生成時の設定考慮

---

### RECIPE-033: 栄養情報表示

**ステータス**: TODO
**優先度**: 低

**タスク**:
- [ ] 栄養情報APIの統合
- [ ] レシピ詳細への栄養情報表示

---

### RECIPE-034: ショッピングリスト機能

**ステータス**: TODO
**優先度**: 低

**タスク**:
- [ ] ショッピングリストテーブルの作成
- [ ] ショッピングリスト生成機能
- [ ] ショッピングリスト管理UI

---

### RECIPE-035: レシピ評価・コメント機能

**ステータス**: TODO
**優先度**: 低

**タスク**:
- [ ] 評価・コメントテーブルの作成
- [ ] 評価UI実装
- [ ] コメント表示・投稿機能

---

## チケット管理ルール

### 優先度の定義

- **高**: プロジェクトのコア機能、他のチケットの依存関係
- **中**: 重要だが緊急ではない機能、UX改善
- **低**: 将来の拡張機能、オプション機能

### 見積もりの基準

- 1時間未満: 簡単なタスク
- 1-3時間: 通常のタスク
- 3-6時間: 複雑なタスク
- 6時間以上: 大規模なタスク（分割を検討）

### ワークフロー

1. チケットを選択（優先度と依存関係を考慮）
2. ステータスを `IN_PROGRESS` に更新
3. タスクを実行
4. 完了条件を確認
5. ステータスを `DONE` に更新
6. 次のチケットへ

---

## 📊 Week 1 完了レポート

### 達成状況
- **完了チケット**: 10/10（100%）
- **所要時間**: 約29時間（見積もり: 29時間）
- **進捗**: 予定通り完了 ✅

### 成果
1. ✅ プロジェクト基盤構築完了（RECIPE-001〜003）
2. ✅ 共通UI/レイアウトコンポーネント完成（RECIPE-004〜005）
3. ✅ 材料入力・検索機能実装（RECIPE-006〜007）
4. ✅ AIレシピ生成機能統合（RECIPE-008〜010）

### Week 2への課題
- 外部レシピAPIの選定と統合
- 認証機能の実装
- お気に入り機能の実装
- デプロイ準備

---

**作成日**: 2025年11月4日
**最終更新**: 2025年11月4日 18:30
