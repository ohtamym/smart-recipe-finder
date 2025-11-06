'use client';

import { useState, useCallback } from 'react';

/**
 * 材料入力管理カスタムフック
 *
 * 材料リストの追加・削除・バリデーションを管理
 */

interface UseIngredientsReturn {
  ingredients: string[];
  addIngredient: (ingredient: string) => boolean;
  removeIngredient: (ingredient: string) => void;
  clearIngredients: () => void;
  error: string | null;
  clearError: () => void;
}

const MAX_INGREDIENTS = 20;
const MIN_INGREDIENT_LENGTH = 1;
const MAX_INGREDIENT_LENGTH = 50;

export function useIngredients(): UseIngredientsReturn {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * 材料を追加
   * @param ingredient 追加する材料名
   * @returns 追加が成功したかどうか
   */
  const addIngredient = useCallback(
    (ingredient: string): boolean => {
      // 前後の空白を削除
      const trimmed = ingredient.trim();

      // バリデーション: 空文字チェック
      if (trimmed.length < MIN_INGREDIENT_LENGTH) {
        setError('材料名を入力してください');
        return false;
      }

      // バリデーション: 長さチェック
      if (trimmed.length > MAX_INGREDIENT_LENGTH) {
        setError(`材料名は${MAX_INGREDIENT_LENGTH}文字以内で入力してください`);
        return false;
      }

      // バリデーション: 重複チェック（大文字小文字を区別しない）
      const isDuplicate = ingredients.some(
        (item) => item.toLowerCase() === trimmed.toLowerCase()
      );

      if (isDuplicate) {
        setError('この材料は既に追加されています');
        return false;
      }

      // バリデーション: 最大数チェック
      if (ingredients.length >= MAX_INGREDIENTS) {
        setError(`材料は最大${MAX_INGREDIENTS}個まで追加できます`);
        return false;
      }

      // 材料を追加
      setIngredients((prev) => [...prev, trimmed]);
      setError(null);
      return true;
    },
    [ingredients]
  );

  /**
   * 材料を削除
   * @param ingredient 削除する材料名
   */
  const removeIngredient = useCallback((ingredient: string) => {
    setIngredients((prev) => prev.filter((item) => item !== ingredient));
    setError(null);
  }, []);

  /**
   * すべての材料をクリア
   */
  const clearIngredients = useCallback(() => {
    setIngredients([]);
    setError(null);
  }, []);

  /**
   * エラーをクリア
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    ingredients,
    addIngredient,
    removeIngredient,
    clearIngredients,
    error,
    clearError,
  };
}
