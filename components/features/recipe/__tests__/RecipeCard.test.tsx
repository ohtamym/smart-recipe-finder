import { render, screen } from '@testing-library/react';
import { RecipeCard } from '../RecipeCard';
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
  title: 'テストレシピ',
  description: 'テスト用のレシピです',
  servings: 2,
  cookTime: 30,
  difficulty: 'easy',
  ingredients: [
    { name: '玉ねぎ', amount: '1個', isAvailable: true },
    { name: 'にんじん', amount: '1本', isAvailable: false },
  ],
  instructions: [
    { step: 1, description: '玉ねぎを切る' },
    { step: 2, description: 'にんじんを切る' },
  ],
  imageUrl: 'https://example.com/image.jpg',
  tags: ['和食', '簡単'],
  source: 'ai',
};

describe('RecipeCard', () => {
  it('レシピカードがレンダリングされる', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('テストレシピ')).toBeInTheDocument();
  });

  it('レシピの説明が表示される', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('テスト用のレシピです')).toBeInTheDocument();
  });

  it('調理時間が表示される', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('30分')).toBeInTheDocument();
  });

  it('人数が表示される', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('2人分')).toBeInTheDocument();
  });

  it('難易度が表示される', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('簡単')).toBeInTheDocument();
  });

  it('ソースバッジが表示される', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('AI生成')).toBeInTheDocument();
  });

  it('外部APIソースのレシピが表示される', () => {
    const apiRecipe = { ...mockRecipe, source: 'api' as const };
    render(<RecipeCard recipe={apiRecipe} />);
    expect(screen.getByText('外部API')).toBeInTheDocument();
  });

  it('難易度mediumのレシピが表示される', () => {
    const mediumRecipe = { ...mockRecipe, difficulty: 'medium' as const };
    render(<RecipeCard recipe={mediumRecipe} />);
    expect(screen.getByText('普通')).toBeInTheDocument();
  });

  it('難易度hardのレシピが表示される', () => {
    const hardRecipe = { ...mockRecipe, difficulty: 'hard' as const };
    render(<RecipeCard recipe={hardRecipe} />);
    expect(screen.getByText('難しい')).toBeInTheDocument();
  });

  it('画像のあるレシピが表示される', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    const image = screen.getByAltText('テストレシピ');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', mockRecipe.imageUrl);
  });

  it('説明のないレシピが表示される', () => {
    const noDescRecipe = { ...mockRecipe, description: undefined };
    render(<RecipeCard recipe={noDescRecipe} />);
    expect(screen.getByText('テストレシピ')).toBeInTheDocument();
    expect(screen.queryByText('テスト用のレシピです')).not.toBeInTheDocument();
  });
});
