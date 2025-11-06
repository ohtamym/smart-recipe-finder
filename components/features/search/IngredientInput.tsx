'use client';

import { useState } from 'react';
import { Input } from '@/components/ui';
import { Button } from '@/components/ui';
import { IngredientTag } from './IngredientTag';
import { useIngredients } from '@/hooks/useIngredients';

/**
 * 材料入力コンポーネント
 *
 * - 材料の追加・削除
 * - バリデーション
 * - エラーメッセージ表示
 */

export interface IngredientInputProps {
  /** 材料リストが変更されたときのコールバック */
  onIngredientsChange?: (ingredients: string[]) => void;
}

export function IngredientInput({ onIngredientsChange }: IngredientInputProps) {
  const [inputValue, setInputValue] = useState('');
  const {
    ingredients,
    addIngredient,
    removeIngredient,
    clearIngredients,
    error,
    clearError,
  } = useIngredients();

  // 材料リストが変更されたら親コンポーネントに通知
  const handleIngredientsChange = (newIngredients: string[]) => {
    if (onIngredientsChange) {
      onIngredientsChange(newIngredients);
    }
  };

  const handleAdd = () => {
    const success = addIngredient(inputValue);
    if (success) {
      setInputValue('');
      handleIngredientsChange([...ingredients, inputValue.trim()]);
    }
  };

  const handleRemove = (ingredient: string) => {
    removeIngredient(ingredient);
    const newIngredients = ingredients.filter((item) => item !== ingredient);
    handleIngredientsChange(newIngredients);
  };

  const handleClear = () => {
    clearIngredients();
    setInputValue('');
    handleIngredientsChange([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // 入力中はエラーをクリア
    if (error) {
      clearError();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 材料入力フィールド */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="材料を入力（例: 玉ねぎ、にんじん）"
            error={error || undefined}
            aria-label="材料を入力"
          />
        </div>
        <Button
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          aria-label="材料を追加"
        >
          追加
        </Button>
      </div>

      {/* 追加された材料リスト */}
      {ingredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              追加された材料（{ingredients.length}個）
            </p>
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors focus:outline-none focus:underline"
              aria-label="すべての材料をクリア"
            >
              すべてクリア
            </button>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="list"
            aria-label="追加された材料リスト"
          >
            {ingredients.map((ingredient) => (
              <IngredientTag
                key={ingredient}
                ingredient={ingredient}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}

      {/* ヘルプテキスト */}
      {ingredients.length === 0 && !error && (
        <p className="text-sm text-gray-500">
          材料を追加してレシピを検索しましょう。Enterキーでも追加できます。
        </p>
      )}
    </div>
  );
}
