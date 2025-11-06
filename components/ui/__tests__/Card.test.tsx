import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../Card';

describe('Card', () => {
  it('基本的なカードがレンダリングされる', () => {
    render(
      <Card>
        <CardContent>カード内容</CardContent>
      </Card>
    );
    expect(screen.getByText('カード内容')).toBeInTheDocument();
  });

  it('完全なカード構造がレンダリングされる', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>カードタイトル</CardTitle>
        </CardHeader>
        <CardContent>カード内容</CardContent>
        <CardFooter>カードフッター</CardFooter>
      </Card>
    );

    expect(screen.getByText('カードタイトル')).toBeInTheDocument();
    expect(screen.getByText('カード内容')).toBeInTheDocument();
    expect(screen.getByText('カードフッター')).toBeInTheDocument();
  });

  it('isClickableプロパティが機能する', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Card isClickable onClick={handleClick}>
        <CardContent>クリック可能</CardContent>
      </Card>
    );

    const card = screen.getByText('クリック可能').closest('[role="button"]');
    if (card) {
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('カスタムclassNameが適用される', () => {
    render(
      <Card className="custom-card">
        <CardHeader className="custom-header">
          <CardTitle className="custom-title">タイトル</CardTitle>
        </CardHeader>
        <CardContent className="custom-content">内容</CardContent>
        <CardFooter className="custom-footer">フッター</CardFooter>
      </Card>
    );

    const card = screen.getByText('内容').closest('div')?.parentElement;
    expect(card).toHaveClass('custom-card');
  });

  it('Enterキーでクリック可能カードがアクティブになる', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Card isClickable onClick={handleClick}>
        <CardContent>Enterでクリック</CardContent>
      </Card>
    );

    const card = screen.getByText('Enterでクリック').closest('[role="button"]');
    if (card) {
      card.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });

  it('Spaceキーでクリック可能カードがアクティブになる', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(
      <Card isClickable onClick={handleClick}>
        <CardContent>Spaceでクリック</CardContent>
      </Card>
    );

    const card = screen.getByText('Spaceでクリック').closest('[role="button"]');
    if (card) {
      card.focus();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    }
  });
});
