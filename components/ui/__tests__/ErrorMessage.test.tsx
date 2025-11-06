import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage, ErrorMessageInline, EmptyState } from '../ErrorMessage';

describe('ErrorMessage', () => {
  it('エラーメッセージが表示される', () => {
    render(<ErrorMessage message="エラーが発生しました" />);
    expect(screen.getByText('エラーが発生しました')).toBeInTheDocument();
  });

  it('variantプロパティが適用される', () => {
    const { rerender, container } = render(<ErrorMessage message="エラー" variant="error" />);
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument();

    rerender(<ErrorMessage message="警告" variant="warning" />);
    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument();

    rerender(<ErrorMessage message="情報" variant="info" />);
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('リトライボタンが表示される', () => {
    render(<ErrorMessage message="エラー" showRetry onRetry={() => {}} />);
    expect(screen.getByText('再試行')).toBeInTheDocument();
  });

  it('リトライボタンクリックでonRetryが呼ばれる', async () => {
    const handleRetry = jest.fn();
    const user = userEvent.setup();

    render(<ErrorMessage message="エラー" showRetry onRetry={handleRetry} retryLabel="もう一度" />);
    await user.click(screen.getByText('もう一度'));

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

});


describe('ErrorMessageInline', () => {
  it('インラインエラーが表示される', () => {
    render(<ErrorMessageInline message="エラーメッセージ" />);
    expect(screen.getByText('エラーメッセージ')).toBeInTheDocument();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<ErrorMessageInline message="エラー" className="custom-inline" />);
    expect(container.querySelector('.custom-inline')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('空状態メッセージが表示される', () => {
    render(<EmptyState title="データがありません" />);
    expect(screen.getByText('データがありません')).toBeInTheDocument();
  });

  it('メッセージが表示される', () => {
    render(<EmptyState message="検索結果が見つかりませんでした" />);
    expect(screen.getByText('検索結果が見つかりませんでした')).toBeInTheDocument();
  });

  it('アクションボタンが表示される', () => {
    render(
      <EmptyState
        title="データがありません"
        action={<button>追加</button>}
      />
    );
    expect(screen.getByText('追加')).toBeInTheDocument();
  });

  it('アクションボタンクリックでonClickが呼ばれる', async () => {
    const handleAction = jest.fn();
    const user = userEvent.setup();

    render(
      <EmptyState
        title="データがありません"
        action={<button onClick={handleAction}>追加</button>}
      />
    );
    await user.click(screen.getByText('追加'));

    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
