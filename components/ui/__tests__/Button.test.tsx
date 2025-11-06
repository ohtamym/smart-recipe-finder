import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('レンダリングされる', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByText('クリック')).toBeInTheDocument();
  });

  it('クリックイベントが機能する', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>クリック</Button>);
    await user.click(screen.getByText('クリック'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('variantプロパティが適用される', () => {
    const { rerender } = render(<Button variant="solid">Solid</Button>);
    expect(screen.getByText('Solid')).toHaveClass('bg-blue-600');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toHaveClass('border-2');

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost')).toHaveClass('text-blue-600');
  });

  it('sizeプロパティが適用される', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('text-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText('Medium')).toHaveClass('text-base');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('text-lg');
  });

  it('isLoadingプロパティが機能する', () => {
    render(<Button isLoading>送信</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('送信')).toBeInTheDocument();
  });

  it('disabledプロパティが機能する', () => {
    render(<Button disabled>無効</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('fullWidthプロパティが機能する', () => {
    render(<Button fullWidth>フルワイド</Button>);
    expect(screen.getByText('フルワイド')).toHaveClass('w-full');
  });

  it('カスタムclassNameが適用される', () => {
    render(<Button className="custom-class">カスタム</Button>);
    expect(screen.getByText('カスタム')).toHaveClass('custom-class');
  });
});
