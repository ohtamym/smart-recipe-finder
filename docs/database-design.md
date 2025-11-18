# データベース詳細設計書

## 1. 概要

本ドキュメントは、スマートレシピファインダーで使用するSupabase(PostgreSQL)のデータベース設計を詳細に記述します。

## 2. データベース構成

### 2.1 使用技術
- **DBMS**: PostgreSQL (Supabase)
- **認証**: Supabase Auth
- **セキュリティ**: Row Level Security (RLS)

### 2.2 テーブル一覧
1. `users` - ユーザー情報（Supabase Auth管理）
2. `favorites` - お気に入りレシピ
3. `search_history` - 検索履歴（オプション/将来拡張用）

---

## 3. テーブル定義

### 3.1 users テーブル

**説明**: ユーザーの基本情報（Supabase Authによって自動管理）

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY | ユーザーID（Supabase Auth自動生成） |
| email | VARCHAR | UNIQUE, NOT NULL | メールアドレス |
| encrypted_password | VARCHAR | NOT NULL | 暗号化パスワード |
| email_confirmed_at | TIMESTAMP | NULL | メール確認日時 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**注意**: このテーブルはSupabase Authが管理するため、直接操作は不要

---

### 3.2 favorites テーブル

**説明**: ユーザーがお気に入り登録したレシピ情報

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | お気に入りID |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) | ユーザーID |
| recipe_title | VARCHAR(255) | NOT NULL | レシピタイトル |
| recipe_data | JSONB | NOT NULL | レシピ詳細データ（JSON形式） |
| source | VARCHAR(50) | NOT NULL | レシピソース（'ai' or 'api'） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 登録日時 |

**インデックス**:
- `idx_favorites_user_id` ON `user_id`
- `idx_favorites_created_at` ON `created_at DESC`
- `unique_user_recipe` UNIQUE ON (`user_id`, `recipe_title`)

**設計上の注意**:
- お気に入りの判定にはレシピタイトルを使用します（v1.1から変更）
- お気に入り詳細ページのルーティングには一意なお気に入りID（`favorites.id`のUUID）を使用します（v1.2から追加）
- 理由: AI生成レシピのIDは任意に付与されるため重複する可能性があるため
- 同一ユーザーが同じタイトルのレシピを複数回お気に入り登録できないよう制約を設定
- お気に入りページからの詳細表示は `/favorites/[お気に入りID]` でアクセス

**外部キー制約**:
```sql
FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE
```

#### 3.2.1 recipe_data JSONB構造

```json
{
  "title": "string - レシピ名",
  "description": "string - レシピ説明（オプション）",
  "servings": "number - 何人分",
  "cookTime": "number - 調理時間（分）",
  "difficulty": "string - 難易度（easy/medium/hard）",
  "ingredients": [
    {
      "name": "string - 材料名",
      "amount": "string - 分量",
      "isAvailable": "boolean - 手持ち材料かどうか"
    }
  ],
  "instructions": [
    {
      "step": "number - 手順番号",
      "description": "string - 手順説明"
    }
  ],
  "imageUrl": "string - 画像URL（オプション）",
  "tags": ["string"] - タグ配列（オプション）
}
```

---

### 3.3 search_history テーブル（将来拡張用）

**説明**: ユーザーの検索履歴（オプション機能）

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | 検索履歴ID |
| user_id | UUID | NOT NULL, FOREIGN KEY (users.id) | ユーザーID |
| ingredients | TEXT[] | NOT NULL | 検索した材料配列 |
| search_date | TIMESTAMP | NOT NULL, DEFAULT NOW() | 検索日時 |

**インデックス**:
- `idx_search_history_user_id` ON `user_id`
- `idx_search_history_date` ON `search_date DESC`

**外部キー制約**:
```sql
FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE
```

---

## 4. Row Level Security (RLS) ポリシー

### 4.1 favorites テーブルのRLSポリシー

#### ポリシー1: SELECT（自分のお気に入りのみ閲覧可能）
```sql
CREATE POLICY "Users can view their own favorites"
ON favorites
FOR SELECT
USING (auth.uid() = user_id);
```

#### ポリシー2: INSERT（自分のお気に入りのみ追加可能）
```sql
CREATE POLICY "Users can insert their own favorites"
ON favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

#### ポリシー3: DELETE（自分のお気に入りのみ削除可能）
```sql
CREATE POLICY "Users can delete their own favorites"
ON favorites
FOR DELETE
USING (auth.uid() = user_id);
```

#### RLS有効化
```sql
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
```

---

### 4.2 search_history テーブルのRLSポリシー（将来拡張用）

```sql
CREATE POLICY "Users can view their own search history"
ON search_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
ON search_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
```

---

## 5. データベースセットアップSQL

### 5.1 テーブル作成SQL

```sql
-- UUID拡張を有効化（既に有効な場合がある）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- favoritesテーブル作成
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_title VARCHAR(255) NOT NULL,
  recipe_data JSONB NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('ai', 'api')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  -- 同じユーザーが同じタイトルのレシピを複数回お気に入りできないように
  CONSTRAINT unique_user_recipe UNIQUE (user_id, recipe_title)
);

-- インデックス作成
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);

-- RLS有効化
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can view their own favorites"
ON favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
ON favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON favorites
FOR DELETE
USING (auth.uid() = user_id);
```

### 5.2 search_historyテーブル作成SQL（オプション）

```sql
-- search_historyテーブル作成
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredients TEXT[] NOT NULL,
  search_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- インデックス作成
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_date ON search_history(search_date DESC);

-- RLS有効化
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can view their own search history"
ON search_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search history"
ON search_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 6. データ操作例

### 6.1 お気に入り追加

```sql
INSERT INTO favorites (user_id, recipe_title, recipe_data, source)
VALUES (
  'user-uuid-here',
  'トマトパスタ',
  '{
    "title": "トマトパスタ",
    "servings": 2,
    "cookTime": 20,
    "difficulty": "easy",
    "ingredients": [
      {"name": "パスタ", "amount": "200g", "isAvailable": true},
      {"name": "トマト缶", "amount": "1缶", "isAvailable": true},
      {"name": "にんにく", "amount": "1片", "isAvailable": false}
    ],
    "instructions": [
      {"step": 1, "description": "パスタを茹でる"},
      {"step": 2, "description": "にんにくを炒める"},
      {"step": 3, "description": "トマト缶を加えて煮込む"}
    ]
  }'::jsonb,
  'ai'
);
```

### 6.2 お気に入り一覧取得

```sql
SELECT
  id,
  recipe_title,
  recipe_data->>'title' as title,
  recipe_data->>'difficulty' as difficulty,
  source,
  created_at
FROM favorites
WHERE user_id = 'user-uuid-here'
ORDER BY created_at DESC;
```

### 6.3 特定レシピの詳細取得

```sql
SELECT
  id,
  recipe_data
FROM favorites
WHERE user_id = 'user-uuid-here'
  AND recipe_title = 'トマトパスタ';
```

### 6.4 お気に入り削除

```sql
DELETE FROM favorites
WHERE user_id = 'user-uuid-here' 
  AND id = 'favorite-uuid-here';
```

### 6.5 JSONBクエリ例（材料で検索）

```sql
-- 特定の材料を含むレシピを検索
SELECT 
  recipe_data->>'title' as title,
  recipe_data->'ingredients' as ingredients
FROM favorites
WHERE user_id = 'user-uuid-here'
  AND recipe_data @> '{"ingredients": [{"name": "トマト"}]}'::jsonb;
```

---

## 7. パフォーマンス最適化

### 7.1 インデックス戦略
- `user_id`にインデックスを作成し、ユーザーごとのクエリを高速化
- `created_at`に降順インデックスを作成し、最新のお気に入りを素早く取得
- `UNIQUE`制約により、重複データの防止とクエリの最適化

### 7.2 JSONB活用
- PostgreSQLのJSONB型を使用し、柔軟なスキーマ管理
- GINインデックスをJSONBカラムに作成可能（必要に応じて）

```sql
-- JSONBカラムへのGINインデックス（オプション）
CREATE INDEX idx_favorites_recipe_data ON favorites USING GIN (recipe_data);
```

---

## 8. バックアップとメンテナンス

### 8.1 バックアップ戦略
- Supabaseの自動バックアップ機能を利用
- 定期的なデータエクスポート（手動）

### 8.2 データ保持ポリシー
- ユーザー削除時、関連するお気に入りデータは`ON DELETE CASCADE`により自動削除
- 検索履歴は定期的にクリーンアップ（例: 6ヶ月以上前のデータを削除）

---

## 9. 将来の拡張性

### 9.1 追加予定機能とテーブル

#### レシピ評価テーブル
```sql
CREATE TABLE recipe_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_title VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

#### ショッピングリストテーブル
```sql
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

---

## 10. セキュリティ考慮事項

### 10.1 データアクセス制御
- すべてのテーブルでRLSを有効化
- ユーザーは自分のデータのみアクセス可能
- サーバーサイドでの二重チェック実装推奨

### 10.2 データ検証
- アプリケーション層でのバリデーション
- CHECK制約によるデータベースレベルの検証
- JSONB構造の妥当性チェック

### 10.3 機密情報の取り扱い
- パスワードはSupabase Authで自動暗号化
- 環境変数での接続情報管理
- APIキーの安全な保管

---

**作成日**: 2025年11月1日
**最終更新**: 2025年11月18日
**バージョン**: 1.2

## 変更履歴

### v1.2 (2025年11月18日)
- お気に入り詳細ページのルーティングに一意なお気に入りID（UUID）を使用するように追加
- お気に入りページからの詳細表示を `/favorites/[お気に入りID]` に変更
- 理由: AI生成レシピのIDの重複問題を回避し、sessionStorageへの依存を解消

### v1.1 (2025年11月7日)
- お気に入りの識別子を`recipe_id`から`recipe_title`に変更
- 理由: AI生成レシピのIDは任意に付与されるため重複する可能性があるため
- 関連するSQL例とテーブル定義を更新

### v1.0 (2025年11月1日)
- 初版作成
