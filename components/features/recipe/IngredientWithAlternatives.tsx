'use client';

import { useState } from 'react';
import { Ingredient } from '@/types';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Button, Loading, ErrorMessage } from '@/components/ui';
import type { ApiResponse } from '@/types';

/**
 * 代替材料提案付き材料コンポーネント
 *
 * 追加で必要な材料に対して、代替材料を提案する機能を提供
 */

export interface IngredientWithAlternativesProps {
  /** 材料 */
  ingredient: Ingredient;
  /** レシピのタイトル（コンテキスト用） */
  recipeTitle: string;
  /** インデックス（キー用） */
  index: number;
}

export function IngredientWithAlternatives({
  ingredient,
  recipeTitle,
  index,
}: IngredientWithAlternativesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  /**
   * 代替材料を取得
   */
  const fetchAlternatives = async () => {
    if (hasFetched) {
      // 既に取得済みの場合は再取得しない
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recipes/alternatives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredient: ingredient.name,
          recipeContext: recipeTitle,
        }),
      });

      const data = (await response.json()) as ApiResponse<{
        ingredient: string;
        alternatives: string[];
        recipeContext?: string;
      }>;

      if (!response.ok || !data.success) {
        const errorMessage = !data.success
          ? data.error.message
          : '代替材料の取得に失敗しました';
        setError(errorMessage);
        return;
      }

      if (data.data) {
        setAlternatives(data.data.alternatives);
        setHasFetched(true);
      }
    } catch (err) {
      console.error('代替材料取得エラー:', err);
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * トグルハンドラー
   */
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    // 開く場合で、まだ取得していない場合は取得
    if (newIsOpen && !hasFetched) {
      fetchAlternatives();
    }
  };

  return (
    <li
      key={`unavailable-${index}`}
      className="flex flex-col gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200"
    >
      {/* 材料名と分量 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className="font-medium text-gray-900">{ingredient.name}</span>
          {ingredient.amount && (
            <span className="ml-2 text-sm text-gray-600">（{ingredient.amount}）</span>
          )}
        </div>

        {/* 代替材料提案ボタン */}
        <Button
          onClick={handleToggle}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-sm text-orange-700 hover:text-orange-900"
        >
          <Lightbulb className="w-4 h-4" />
          <span>代替材料</span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* 代替材料の表示エリア */}
      {isOpen && (
        <div className="mt-2 pl-2 border-l-2 border-orange-300">
          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600 py-2">
              <Loading size="sm" />
              <span>代替材料を探しています...</span>
            </div>
          )}

          {/* エラー状態 */}
          {error && !isLoading && (
            <ErrorMessage
              message={error}
              onRetry={fetchAlternatives}
              retryLabel="再試行"
            />
          )}

          {/* 代替材料リスト */}
          {!isLoading && !error && alternatives.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                代わりに使える材料:
              </p>
              <ul className="space-y-1.5" role="list">
                {alternatives.map((alt, altIndex) => (
                  <li
                    key={`alt-${index}-${altIndex}`}
                    className="text-sm text-gray-800 flex items-start gap-2"
                  >
                    <span className="text-orange-600 font-medium">•</span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 代替材料が見つからない場合 */}
          {!isLoading && !error && hasFetched && alternatives.length === 0 && (
            <p className="text-sm text-gray-600 py-2">
              代替材料が見つかりませんでした
            </p>
          )}
        </div>
      )}
    </li>
  );
}
