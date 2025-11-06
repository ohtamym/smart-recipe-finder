'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { IngredientInput } from './IngredientInput';
import { SearchButton } from './SearchButton';

/**
 * レシピ検索フォームコンポーネント（クライアントコンポーネント）
 *
 * 材料入力と検索機能を提供
 */
export function RecipeSearchForm() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (ingredients.length === 0) {
      return;
    }

    console.log('レシピを検索:', ingredients);
    setIsSearching(true);

    // レシピ一覧ページに遷移
    const queryString = ingredients.join(',');
    router.push(`/recipes?ingredients=${encodeURIComponent(queryString)}`);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>材料を入力</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <IngredientInput onIngredientsChange={setIngredients} />
        <SearchButton
          ingredientsCount={ingredients.length}
          onClick={handleSearch}
          isLoading={isSearching}
        />
      </CardContent>
    </Card>
  );
}
