import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, Textarea } from '../Input';

describe('Input', () => {
  it('基本的なinputがレンダリングされる', () => {
    render(<Input placeholder="入力してください" />);
    expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<Input label="名前" />);
    expect(screen.getByText('名前')).toBeInTheDocument();
  });

  it('エラーメッセージが表示される', () => {
    render(<Input error="エラーが発生しました" />);
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('ヘルプテキストが表示される', () => {
    render(<Input helperText="ヘルプテキスト" />);
    expect(screen.getByText('ヘルプテキスト')).toBeInTheDocument();
  });


  it('入力値が変更される', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'テスト');

    expect(input).toHaveValue('テスト');
  });

  it('disabledプロパティが機能する', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('エラー時にaria-invalidが設定される', () => {
    render(<Input error="エラー" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('Textarea', () => {
  it('基本的なtextareaがレンダリングされる', () => {
    render(<Textarea placeholder="入力してください" />);
    expect(screen.getByPlaceholderText('入力してください')).toBeInTheDocument();
  });

  it('ラベルが表示される', () => {
    render(<Textarea label="説明" />);
    expect(screen.getByText('説明')).toBeInTheDocument();
  });

  it('エラーメッセージが表示される', () => {
    render(<Textarea error="エラーが発生しました" />);
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('入力値が変更される', async () => {
    const user = userEvent.setup();
    render(<Textarea />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'テストテキスト');

    expect(textarea).toHaveValue('テストテキスト');
  });

  it('disabledプロパティが機能する', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });
});
