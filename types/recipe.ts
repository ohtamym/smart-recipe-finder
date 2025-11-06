/**
 * レシピ型定義
 */

// 難易度の定義
export type RecipeDifficulty = 'easy' | 'medium' | 'hard';

// レシピのソース（AI生成 or 外部API）
export type RecipeSource = 'ai' | 'api';

/**
 * 材料インターフェース
 */
export interface Ingredient {
  /** 材料名 */
  name: string;
  /** 分量 */
  amount: string;
  /** ユーザーが手持ちの材料かどうか */
  isAvailable: boolean;
}

/**
 * 調理手順インターフェース
 */
export interface Instruction {
  /** 手順番号 */
  step: number;
  /** 手順の説明 */
  description: string;
}

/**
 * レシピインターフェース
 */
export interface Recipe {
  /** レシピID（AI生成の場合: ai-{timestamp}-{index}, 外部APIの場合: api-{source}-{id}） */
  id: string;
  /** レシピ名 */
  title: string;
  /** レシピの説明（オプション） */
  description?: string;
  /** 何人分 */
  servings: number;
  /** 調理時間（分） */
  cookTime: number;
  /** 難易度 */
  difficulty: RecipeDifficulty;
  /** 材料リスト */
  ingredients: Ingredient[];
  /** 調理手順リスト */
  instructions: Instruction[];
  /** 画像URL（オプション） */
  imageUrl?: string;
  /** タグ（オプション） */
  tags?: string[];
  /** レシピのソース */
  source: RecipeSource;
}

/**
 * お気に入りインターフェース（Supabaseのfavoritesテーブルに対応）
 */
export interface Favorite {
  /** お気に入りID（UUID） */
  id: string;
  /** ユーザーID（UUID） */
  user_id: string;
  /** レシピID */
  recipe_id: string;
  /** レシピデータ全体（JSONB） */
  recipe_data: Recipe;
  /** レシピのソース */
  source: RecipeSource;
  /** 登録日時（ISO 8601形式） */
  created_at: string;
}

/**
 * レシピ検索パラメータ
 */
export interface RecipeSearchParams {
  /** 検索する材料のリスト */
  ingredients: string[];
}

/**
 * 代替材料提案パラメータ
 */
export interface AlternativeIngredientParams {
  /** 元の材料 */
  ingredient: string;
  /** レシピのコンテキスト（オプション） */
  recipeContext?: string;
}
