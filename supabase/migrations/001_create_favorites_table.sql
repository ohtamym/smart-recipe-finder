-- ============================================================
-- Supabase Migration: favoritesテーブル作成
-- ============================================================
--
-- このSQLスクリプトをSupabase管理コンソールのSQL Editorで実行してください。
--
-- 実行手順:
-- 1. Supabase管理コンソール (https://app.supabase.com) にログイン
-- 2. プロジェクトを選択
-- 3. 左サイドバーから「SQL Editor」を選択
-- 4. 「New Query」をクリック
-- 5. このファイルの内容をコピー&ペースト
-- 6. 「Run」をクリックして実行
--
-- ============================================================

-- UUID拡張を有効化（既に有効な場合がある）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- favoritesテーブル作成
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id VARCHAR(255) NOT NULL,
  recipe_data JSONB NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('ai', 'api')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- 同じユーザーが同じレシピを複数回お気に入りできないように
  CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_id)
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Row Level Security (RLS) を有効化
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: SELECTポリシー（ユーザーは自分のお気に入りのみ閲覧可能）
CREATE POLICY "Users can view their own favorites"
ON favorites
FOR SELECT
USING (auth.uid() = user_id);

-- RLSポリシー: INSERTポリシー（ユーザーは自分のお気に入りのみ追加可能）
CREATE POLICY "Users can insert their own favorites"
ON favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLSポリシー: DELETEポリシー（ユーザーは自分のお気に入りのみ削除可能）
CREATE POLICY "Users can delete their own favorites"
ON favorites
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================
-- 動作確認用サンプルクエリ（オプション）
-- ============================================================
--
-- テーブルが正しく作成されたか確認:
-- SELECT * FROM favorites;
--
-- RLSポリシーが有効化されているか確認:
-- SELECT tablename, policyname FROM pg_policies WHERE tablename = 'favorites';
--
-- ============================================================
