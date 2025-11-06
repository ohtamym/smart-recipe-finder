import { render, screen } from '@testing-library/react';
import { RecipeGrid } from '../RecipeGrid';
import type { Recipe } from '@/types';

// useAuthフックをモック
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  }),
}));

// useFavoritesフックをモック
jest.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    favorites: [],
    isLoading: false,
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
    isFavorite: jest.fn(() => false),
  }),
}));

const mockRecipe: Recipe = {
  id: 'test-recipe-1',
  title: 'テストレシピ1',
  description: 'テスト用のレシピです',
  servings: 2,
  cookTime: 30,
  difficulty: 'easy',
  ingredients: [
    { name: '玉ねぎ', amount: '1個', isAvailable: true },
  ],
  instructions: [
    { step: 1, description: '玉ねぎを切る' },
  ],
  imageUrl: 'https://example.com/image1.jpg',
  tags: ['和食'],
  source: 'ai',
};

const mockRecipe2: Recipe = {
  ...mockRecipe,
  id: 'test-recipe-2',
  title: 'テストレシピ2',
  imageUrl: 'https://example.com/image2.jpg',
};

describe('RecipeGrid', () => {
  it('レシピがない場合、空状態メッセージが表示される', () => {
    render(<RecipeGrid recipes={[]} />);
    expect(screen.getByText('レシピが見つかりませんでした')).toBeInTheDocument();
    expect(screen.getByText('別の材料を試してみてください。')).toBeInTheDocument();
  });

  it('カスタム空メッセージが表示される', () => {
    render(<RecipeGrid recipes={[]} emptyMessage="検索結果がありません" />);
    expect(screen.getByText('検索結果がありません')).toBeInTheDocument();
  });

  it('レシピがある場合、グリッドが表示される', () => {
    render(<RecipeGrid recipes={[mockRecipe]} />);
    expect(screen.getByRole('list', { name: 'レシピ一覧' })).toBeInTheDocument();
    expect(screen.queryByText('レシピが見つかりませんでした')).not.toBeInTheDocument();
  });

  it('単一のレシピカードが表示される', () => {
    render(<RecipeGrid recipes={[mockRecipe]} />);
    expect(screen.getByText('テストレシピ1')).toBeInTheDocument();
  });

  it('複数のレシピカードが表示される', () => {
    render(<RecipeGrid recipes={[mockRecipe, mockRecipe2]} />);
    expect(screen.getByText('テストレシピ1')).toBeInTheDocument();
    expect(screen.getByText('テストレシピ2')).toBeInTheDocument();
  });

  it('各レシピカードがlistitem roleを持つ', () => {
    render(<RecipeGrid recipes={[mockRecipe, mockRecipe2]} />);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });
});
