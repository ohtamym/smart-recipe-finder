import { Instruction } from '@/types';

/**
 * 調理手順リストコンポーネント
 *
 * レシピの調理手順をステップバイステップで表示
 */

export interface InstructionListProps {
  /** 調理手順リスト */
  instructions: Instruction[];
}

export function InstructionList({ instructions }: InstructionListProps) {
  if (instructions.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">調理手順情報がありません</p>
    );
  }

  return (
    <ol className="space-y-4" role="list">
      {instructions.map((instruction) => (
        <li
          key={instruction.step}
          className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          {/* ステップ番号 */}
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center"
            aria-label={`ステップ ${instruction.step}`}
          >
            {instruction.step}
          </div>

          {/* 手順説明 */}
          <div className="flex-1 pt-1">
            <p className="text-gray-800 leading-relaxed">{instruction.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
