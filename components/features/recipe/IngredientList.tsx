import { Ingredient } from '@/types';
import { Check, X } from 'lucide-react';
import { IngredientWithAlternatives } from './IngredientWithAlternatives';

/**
 * 材料リストコンポーネント
 *
 * 手持ち材料と追加必要材料を区別して表示
 */

export interface IngredientListProps {
  /** 材料リスト */
  ingredients: Ingredient[];
  /** レシピのタイトル（代替材料提案のコンテキスト用） */
  recipeTitle?: string;
}

export function IngredientList({ ingredients, recipeTitle }: IngredientListProps) {
  // 手持ち材料と追加必要材料に分ける
  const availableIngredients = ingredients.filter((ing) => ing.isAvailable);
  const unavailableIngredients = ingredients.filter((ing) => !ing.isAvailable);

  return (
    <div className="space-y-6">
      {/* 手持ち材料 */}
      {availableIngredients.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            手持ちの材料（{availableIngredients.length}個）
          </h3>
          <ul className="space-y-2" role="list">
            {availableIngredients.map((ingredient, index) => (
              <li
                key={`available-${index}`}
                className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{ingredient.name}</span>
                  {ingredient.amount && (
                    <span className="ml-2 text-sm text-gray-600">（{ingredient.amount}）</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 追加で必要な材料 */}
      {unavailableIngredients.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <X className="w-5 h-5 text-orange-600" />
            追加で必要な材料（{unavailableIngredients.length}個）
          </h3>
          <ul className="space-y-2" role="list">
            {unavailableIngredients.map((ingredient, index) => (
              <IngredientWithAlternatives
                key={`unavailable-${index}`}
                ingredient={ingredient}
                recipeTitle={recipeTitle || 'このレシピ'}
                index={index}
              />
            ))}
          </ul>
        </div>
      )}

      {/* 材料が空の場合 */}
      {ingredients.length === 0 && (
        <p className="text-gray-500 text-center py-8">材料情報がありません</p>
      )}
    </div>
  );
}
