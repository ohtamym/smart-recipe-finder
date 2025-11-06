import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RecipeSearchForm } from '@/components/features/search';

/**
 * ホームページ（材料入力・検索）
 *
 * サーバーサイドレンダリング（SSR）で高速な初期表示とSEO対策を実現
 * インタラクティブな部分はRecipeSearchFormクライアントコンポーネントで処理
 */
export default function Home() {
  return (
    <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          手持ちの材料からレシピを探そう
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600">
          冷蔵庫にある材料を入力するだけで、最適なレシピをAIが提案します
        </p>
      </div>

      {/* 材料入力・検索フォーム（クライアントコンポーネント） */}
      <RecipeSearchForm />

      {/* 使い方ガイド（静的コンテンツ） */}
      <Card>
        <CardHeader>
          <CardTitle>使い方</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>冷蔵庫にある材料を入力してください</li>
            <li>複数の材料を追加できます（最大20個）</li>
            <li>「レシピを検索」ボタンをクリックすると、AIが最適なレシピを提案します</li>
            <li>既存のレシピAPIからもレシピを検索します</li>
          </ol>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ヒント:</strong> 「玉ねぎ」「にんじん」「じゃがいも」など、具体的な材料名を入力してください。
              Enterキーを押すだけで材料を追加できます。
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
