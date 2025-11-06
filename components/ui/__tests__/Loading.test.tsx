import { render, screen } from '@testing-library/react';
import { Loading } from '../Loading';

describe('Loading', () => {
  it('基本的なローディングスピナーがレンダリングされる', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('messageプロパティが表示される', () => {
    render(<Loading message="読み込み中..." />);
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('sizeプロパティが適用される', () => {
    const { container, rerender } = render(<Loading size="sm" />);
    let spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-6');

    rerender(<Loading size="md" />);
    spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-12');

    rerender(<Loading size="lg" />);
    spinner = container.querySelector('.animate-spin');
    expect(spinner).toHaveClass('h-16');
  });

  it('fullScreenプロパティが機能する', () => {
    const { container } = render(<Loading fullScreen message="読み込み中" />);
    const fullScreenDiv = container.querySelector('.fixed.inset-0');
    expect(fullScreenDiv).toBeInTheDocument();
  });

  it('カスタムclassNameが適用される', () => {
    const { container } = render(<Loading className="custom-loading" />);
    const loadingDiv = container.querySelector('.custom-loading');
    expect(loadingDiv).toBeInTheDocument();
  });
});
