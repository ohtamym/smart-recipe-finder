/**
 * API型定義
 *
 * Next.js API Routesのリクエスト・レスポンス型を定義
 */

import { Recipe } from './recipe';

/**
 * APIエラーコード
 */
export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SEARCH_ERROR'
  | 'API_ERROR'
  | 'DATABASE_ERROR'
  | 'ALTERNATIVES_ERROR'
  | 'INTERNAL_ERROR';

/**
 * APIエラー
 */
export interface ApiError {
  /** エラーメッセージ */
  message: string;
  /** エラーコード */
  code: ApiErrorCode;
  /** 詳細情報（オプション） */
  details?: Record<string, any>;
}

/**
 * API成功レスポンス（ジェネリック型）
 */
export interface ApiSuccessResponse<T = any> {
  /** 成功フラグ */
  success: true;
  /** レスポンスデータ */
  data: T;
}

/**
 * APIエラーレスポンス
 */
export interface ApiErrorResponse {
  /** 成功フラグ */
  success: false;
  /** エラー情報 */
  error: ApiError;
}

/**
 * APIレスポンス（成功またはエラー）
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * レシピ検索APIリクエスト（POST /api/recipes/search）
 */
export interface RecipeSearchRequest {
  /** 検索する材料のリスト */
  ingredients: string[];
}

/**
 * レシピ検索APIレスポンスデータ
 */
export interface RecipeSearchResponseData {
  /** 検索結果のレシピリスト */
  recipes: Recipe[];
  /** 結果件数 */
  count: number;
}

/**
 * レシピ検索APIレスポンス
 */
export type RecipeSearchResponse = ApiResponse<RecipeSearchResponseData>;

/**
 * 代替材料提案APIリクエスト（POST /api/recipes/alternatives）
 */
export interface AlternativeIngredientsRequest {
  /** 元の材料 */
  ingredient: string;
  /** レシピのコンテキスト（オプション） */
  recipeContext?: string;
}

/**
 * 代替材料提案APIレスポンスデータ
 */
export interface AlternativeIngredientsResponseData {
  /** 代替材料のリスト */
  alternatives: string[];
}

/**
 * 代替材料提案APIレスポンス
 */
export type AlternativeIngredientsResponse = ApiResponse<AlternativeIngredientsResponseData>;

/**
 * レシピ詳細取得APIレスポンスデータ
 */
export interface RecipeDetailResponseData {
  /** レシピ情報 */
  recipe: Recipe;
}

/**
 * レシピ詳細取得APIレスポンス
 */
export type RecipeDetailResponse = ApiResponse<RecipeDetailResponseData>;

/**
 * HTTPステータスコードマッピング
 */
export const HTTP_STATUS_CODE: Record<ApiErrorCode, number> = {
  INVALID_INPUT: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMIT_EXCEEDED: 429,
  SEARCH_ERROR: 500,
  API_ERROR: 500,
  DATABASE_ERROR: 500,
  ALTERNATIVES_ERROR: 500,
  INTERNAL_ERROR: 500,
};
