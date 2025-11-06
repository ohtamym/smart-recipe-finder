import { renderHook, act } from '@testing-library/react';
import { useIngredients } from '../useIngredients';

describe('useIngredients', () => {
  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useIngredients());

    expect(result.current.ingredients).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('材料を追加できる', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('玉ねぎ');
    });

    expect(result.current.ingredients).toEqual(['玉ねぎ']);
    expect(result.current.error).toBeNull();
  });

  it('複数の材料を追加できる', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('玉ねぎ');
      result.current.addIngredient('にんじん');
      result.current.addIngredient('じゃがいも');
    });

    expect(result.current.ingredients).toEqual(['玉ねぎ', 'にんじん', 'じゃがいも']);
  });

  it('空文字の材料は追加できない', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('');
    });

    expect(result.current.ingredients).toEqual([]);
    expect(result.current.error).toBe('材料名を入力してください');
  });

  it('空白のみの材料は追加できない', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('   ');
    });

    expect(result.current.ingredients).toEqual([]);
    expect(result.current.error).toBe('材料名を入力してください');
  });

  it('重複する材料は追加できない', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('玉ねぎ');
    });

    act(() => {
      result.current.addIngredient('玉ねぎ');
    });

    expect(result.current.ingredients).toEqual(['玉ねぎ']);
    expect(result.current.error).toBe('この材料は既に追加されています');
  });


  it('20個を超える材料は追加できない', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      for (let i = 1; i <= 20; i++) {
        result.current.addIngredient(`材料${i}`);
      }
    });

    expect(result.current.ingredients).toHaveLength(20);

    act(() => {
      result.current.addIngredient('材料21');
    });

    expect(result.current.ingredients).toHaveLength(20);
    expect(result.current.error).toBe('材料は最大20個まで追加できます');
  });

  it('材料を削除できる', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('玉ねぎ');
      result.current.addIngredient('にんじん');
      result.current.addIngredient('じゃがいも');
    });

    act(() => {
      result.current.removeIngredient('にんじん');
    });

    expect(result.current.ingredients).toEqual(['玉ねぎ', 'じゃがいも']);
  });

  it('存在しない材料を削除しても エラーにならない', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('玉ねぎ');
    });

    act(() => {
      result.current.removeIngredient('にんじん');
    });

    expect(result.current.ingredients).toEqual(['玉ねぎ']);
  });

  it('すべての材料をクリアできる', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('玉ねぎ');
      result.current.addIngredient('にんじん');
      result.current.addIngredient('じゃがいも');
    });

    act(() => {
      result.current.clearIngredients();
    });

    expect(result.current.ingredients).toEqual([]);
  });

  it('エラーメッセージがクリアされる', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('');
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.addIngredient('玉ねぎ');
    });

    expect(result.current.error).toBeNull();
  });

  it('前後の空白が削除される', () => {
    const { result } = renderHook(() => useIngredients());

    act(() => {
      result.current.addIngredient('  玉ねぎ  ');
    });

    expect(result.current.ingredients).toEqual(['玉ねぎ']);
  });
});
