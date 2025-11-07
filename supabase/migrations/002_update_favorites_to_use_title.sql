-- ============================================================
-- Supabase Migration: favoritesテーブルをタイトルベースに変更
-- ============================================================
--
-- このマイグレーションは、お気に入りの判定をレシピIDからレシピタイトルに変更します。
-- 理由: Geminiが生成するレシピIDは重複する可能性があるため
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

-- 既存の制約を削除
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS unique_user_recipe;

-- recipe_idカラムをrecipe_titleにリネーム
ALTER TABLE favorites RENAME COLUMN recipe_id TO recipe_title;

-- 新しい制約を追加（ユーザー + レシピタイトルで一意）
ALTER TABLE favorites ADD CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_title);

-- ============================================================
-- 動作確認用サンプルクエリ（オプション）
-- ============================================================
--
-- テーブル構造を確認:
-- \d favorites
--
-- 制約を確認:
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'favorites'::regclass;
--
-- ============================================================
