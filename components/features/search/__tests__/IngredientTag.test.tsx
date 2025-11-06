import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IngredientTag } from '../IngredientTag';

describe('IngredientTag', () => {
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    mockOnRemove.mockClear();
  });

  it('材料名が表示される', () => {
    render(<IngredientTag ingredient="玉ねぎ" onRemove={mockOnRemove} />);
    expect(screen.getByText('玉ねぎ')).toBeInTheDocument();
  });

  it('削除ボタンクリックで onRemove が呼ばれる', async () => {
    const user = userEvent.setup();
    render(<IngredientTag ingredient="にんじん" onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /削除/i });
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith('にんじん');
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('Enterキーで削除が実行される', async () => {
    const user = userEvent.setup();
    render(<IngredientTag ingredient="じゃがいも" onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /削除/i });
    removeButton.focus();
    await user.keyboard('{Enter}');

    expect(mockOnRemove).toHaveBeenCalledWith('じゃがいも');
  });

  it('Spaceキーで削除が実行される', async () => {
    const user = userEvent.setup();
    render(<IngredientTag ingredient="トマト" onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /削除/i });
    removeButton.focus();
    await user.keyboard(' ');

    expect(mockOnRemove).toHaveBeenCalledWith('トマト');
  });

  it('削除ボタンにaria-labelが設定されている', () => {
    render(<IngredientTag ingredient="キャベツ" onRemove={mockOnRemove} />);

    const removeButton = screen.getByRole('button', { name: /削除/i });
    expect(removeButton).toHaveAttribute('aria-label');
  });
});
