import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IngredientInput } from '../IngredientInput';

describe('IngredientInput', () => {
  it('初期状態が正しくレンダリングされる', () => {
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');

    expect(screen.getByText('追加')).toBeInTheDocument();
    expect(screen.getByText('材料を追加してレシピを検索しましょう。Enterキーでも追加できます。')).toBeInTheDocument();
  });

  it('追加ボタンが初期状態では無効化されている', () => {
    render(<IngredientInput />);
    const addButton = screen.getByRole('button', { name: '材料を追加' });
    expect(addButton).toBeDisabled();
  });

  it('入力すると追加ボタンが有効化される', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');
    const addButton = screen.getByRole('button', { name: '材料を追加' });

    await user.type(input, '玉ねぎ');
    expect(addButton).not.toBeDisabled();
  });

  it('追加ボタンクリックで材料が追加される', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');
    const addButton = screen.getByRole('button', { name: '材料を追加' });

    await user.type(input, '玉ねぎ');
    await user.click(addButton);

    expect(screen.getByText('玉ねぎ')).toBeInTheDocument();
    expect(screen.getByText('追加された材料（1個）')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('Enterキーで材料が追加される', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');

    await user.type(input, '玉ねぎ{Enter}');

    expect(screen.getByText('玉ねぎ')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('複数の材料を追加できる', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');

    await user.type(input, '玉ねぎ{Enter}');
    await user.type(input, 'にんじん{Enter}');
    await user.type(input, 'じゃがいも{Enter}');

    expect(screen.getByText('玉ねぎ')).toBeInTheDocument();
    expect(screen.getByText('にんじん')).toBeInTheDocument();
    expect(screen.getByText('じゃがいも')).toBeInTheDocument();
    expect(screen.getByText('追加された材料（3個）')).toBeInTheDocument();
  });

  it('材料の削除ができる', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');

    await user.type(input, '玉ねぎ{Enter}');
    await user.type(input, 'にんじん{Enter}');

    const deleteButtons = screen.getAllByRole('button', { name: /削除/ });
    await user.click(deleteButtons[0]);

    expect(screen.queryByText('玉ねぎ')).not.toBeInTheDocument();
    expect(screen.getByText('にんじん')).toBeInTheDocument();
    expect(screen.getByText('追加された材料（1個）')).toBeInTheDocument();
  });

  it('すべてクリアで全材料が削除される', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');

    await user.type(input, '玉ねぎ{Enter}');
    await user.type(input, 'にんじん{Enter}');

    const clearButton = screen.getByRole('button', { name: 'すべての材料をクリア' });
    await user.click(clearButton);

    expect(screen.queryByText('玉ねぎ')).not.toBeInTheDocument();
    expect(screen.queryByText('にんじん')).not.toBeInTheDocument();
    expect(screen.queryByText('追加された材料')).not.toBeInTheDocument();
  });

  it('空文字は追加できずエラーが表示される', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');

    await user.type(input, '   {Enter}');

    expect(screen.getByText('材料名を入力してください')).toBeInTheDocument();
  });

  it('onIngredientsChangeコールバックが呼ばれる', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(<IngredientInput onIngredientsChange={handleChange} />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');

    await user.type(input, '玉ねぎ{Enter}');

    expect(handleChange).toHaveBeenCalledWith(['玉ねぎ']);
  });

  it('材料追加後にヘルプテキストが非表示になる', async () => {
    const user = userEvent.setup();
    render(<IngredientInput />);

    const input = screen.getByPlaceholderText('材料を入力（例: 玉ねぎ、にんじん）');

    await user.type(input, '玉ねぎ{Enter}');

    expect(screen.queryByText('材料を追加してレシピを検索しましょう。Enterキーでも追加できます。')).not.toBeInTheDocument();
  });
});
