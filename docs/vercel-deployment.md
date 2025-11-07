# Vercel デプロイガイド

## 概要

このドキュメントは、スマートレシピファインダーをVercelにデプロイするための手順とベストプラクティスを説明します。

---

## 前提条件

- Gitリポジトリにコードがプッシュされていること（GitHub/GitLab/Bitbucket）
- Vercelアカウントを持っていること（https://vercel.com/signup）
- 必要なAPIキーとサービスアカウントを取得していること

---

## 必要な環境変数

Vercelダッシュボードで以下の環境変数を設定する必要があります：

### 1. Gemini API

**変数名**: `GEMINI_API_KEY`
**取得方法**: https://ai.google.dev/
**用途**: AIレシピ生成

```
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Spoonacular API

**変数名**: `SPOONACULAR_API_KEY`
**取得方法**: https://spoonacular.com/food-api
**用途**: 既存レシピ検索

```
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

### 3. Supabase

**変数名**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**取得方法**: https://supabase.com/
**用途**: 認証とデータベース

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**注意**: `NEXT_PUBLIC_` プレフィックスの付いた変数はクライアントサイドでも使用できます。

---

## デプロイ手順

### ステップ1: Vercelにログイン

1. https://vercel.com/ にアクセス
2. GitHubアカウントでログイン（推奨）

### ステップ2: 新規プロジェクトのインポート

1. Vercelダッシュボードで「New Project」をクリック
2. リポジトリを選択
3. 「Import」をクリック

### ステップ3: ビルド設定の確認

Vercelは自動的にNext.jsプロジェクトを検出します。デフォルト設定で問題ありません：

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### ステップ4: 環境変数の設定

1. 「Environment Variables」セクションを展開
2. 上記の必要な環境変数を1つずつ追加：
   - Variable Name（例: `GEMINI_API_KEY`）
   - Value（実際のAPIキー）
   - Environment: `Production`, `Preview`, `Development` を選択
3. 「Add」をクリック

**推奨設定**:
- Production: 本番環境用の値
- Preview: 本番と同じ値（またはテスト用の値）
- Development: ローカル開発と同じ値

### ステップ5: デプロイの実行

1. 「Deploy」ボタンをクリック
2. ビルドログを確認
3. デプロイ完了後、URLが生成されます

---

## 環境変数設定のベストプラクティス

### セキュリティ

1. **APIキーは絶対にGitにコミットしない**
   - `.env.local` は `.gitignore` に含まれていることを確認
   - `.env.example` のみコミット

2. **NEXT_PUBLIC_ プレフィックスの使用に注意**
   - このプレフィックスの付いた変数はクライアントサイドで公開されます
   - 機密情報（サービスキーなど）には使用しないこと

3. **環境ごとに異なる値を設定**
   - 開発環境: テスト用APIキー
   - 本番環境: 本番用APIキー

### 管理

1. **環境変数の更新**
   - Vercelダッシュボードから更新可能
   - 更新後は再デプロイが必要

2. **環境変数のバックアップ**
   - 定期的に環境変数をバックアップ
   - パスワードマネージャーでの管理を推奨

---

## トラブルシューティング

### ビルドエラー

**問題**: 環境変数が見つからない
**解決策**: Vercelダッシュボードで環境変数が正しく設定されているか確認

**問題**: ビルドが失敗する
**解決策**:
1. ローカルで `npm run build` が成功することを確認
2. Vercelのビルドログを確認
3. Node.jsのバージョンを確認（`.nvmrc` または `package.json` の `engines` フィールド）

### 実行時エラー

**問題**: APIキーが無効
**解決策**:
1. 環境変数の値が正しいか確認
2. APIキーの有効期限を確認
3. APIキーの権限を確認

**問題**: Supabaseに接続できない
**解決策**:
1. Supabase URLとAnon Keyが正しいか確認
2. SupabaseのRLSポリシーが正しく設定されているか確認
3. Supabaseプロジェクトが一時停止していないか確認

---

## デプロイ後の確認項目

### 機能テスト

- [ ] ホームページが表示される
- [ ] レシピ検索が動作する
- [ ] AI生成レシピが表示される
- [ ] 外部APIレシピが表示される
- [ ] ログイン/サインアップが動作する
- [ ] お気に入り機能が動作する

### パフォーマンステスト

- [ ] ページ読み込み速度を確認（Lighthouse）
- [ ] API応答時間を確認
- [ ] 画像の最適化を確認

### セキュリティチェック

- [ ] 環境変数がクライアントに漏れていないか確認（ブラウザのDevToolsでチェック）
- [ ] HTTPSが有効になっているか確認
- [ ] CSPヘッダーが適切に設定されているか確認

---

## 継続的デプロイ（CI/CD）

Vercelは自動的にGitリポジトリと連携し、以下の機能を提供します：

### 自動デプロイ

- **main/masterブランチ**: 本番環境に自動デプロイ
- **その他のブランチ**: プレビュー環境に自動デプロイ

### プレビューデプロイ

- プルリクエストごとに一意のプレビューURLが生成されます
- レビュー担当者が実際の動作を確認できます

### ロールバック

- Vercelダッシュボードから過去のデプロイに簡単にロールバックできます

---

## カスタムドメインの設定

### ステップ1: ドメインの追加

1. Vercelダッシュボードで「Domains」タブを開く
2. カスタムドメインを入力
3. 「Add」をクリック

### ステップ2: DNSの設定

1. ドメインレジストラ（お名前.com、ムームードメインなど）でDNS設定
2. Vercelが提供するAレコードまたはCNAMEレコードを追加
3. DNS伝播を待つ（最大48時間）

### ステップ3: SSL証明書の設定

- Vercelが自動的にSSL証明書を発行します（Let's Encrypt）
- 証明書は自動更新されます

---

## モニタリングとログ

### Vercel Analytics

- リアルタイムの訪問者数
- ページビュー
- パフォーマンスメトリクス

### ログの確認

1. Vercelダッシュボードで「Deployments」タブを開く
2. デプロイを選択
3. 「Functions」タブでサーバーレス関数のログを確認

---

## コスト管理

### Vercel料金プラン

- **Hobby（無料）**: 個人プロジェクト向け
  - 100GB帯域幅/月
  - サーバーレス関数実行時間: 100時間/月

- **Pro（$20/月）**: 商用プロジェクト向け
  - 1TB帯域幅/月
  - サーバーレス関数実行時間: 1000時間/月

### 外部APIコスト

- **Gemini API**: 無料枠あり
- **Spoonacular API**: 無料枠（150リクエスト/日）
- **Supabase**: 無料枠（500MB Database、2GB Bandwidth/月）

---

## 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Next.js デプロイガイド](https://nextjs.org/docs/deployment)
- [Vercel環境変数ガイド](https://vercel.com/docs/concepts/projects/environment-variables)

---

**作成日**: 2025年11月7日
**バージョン**: 1.0
