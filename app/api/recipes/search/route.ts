import { NextRequest, NextResponse } from 'next/server';
import { generateRecipes } from '@/lib/gemini';
import { searchRecipesByIngredients } from '@/lib/recipe-api';
import type { Recipe } from '@/types';

/**
 * レシピ検索APIエンドポイント
 *
 * POST /api/recipes/search
 *
 * リクエストボディ:
 * {
 *   "ingredients": ["玉ねぎ", "にんじん", "じゃがいも"]
 * }
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "data": {
 *     "recipes": [...],
 *     "total": 3
 *   }
 * }
 */

// リクエストボディの型定義
interface SearchRequest {
  ingredients: string[];
}

// リクエストバリデーション
function validateRequest(body: any): {
  isValid: boolean;
  error?: string;
  data?: SearchRequest;
} {
  // bodyが存在するか
  if (!body) {
    return {
      isValid: false,
      error: 'リクエストボディが必要です',
    };
  }

  // ingredientsフィールドが存在するか
  if (!body.ingredients) {
    return {
      isValid: false,
      error: 'ingredientsフィールドが必要です',
    };
  }

  // ingredientsが配列か
  if (!Array.isArray(body.ingredients)) {
    return {
      isValid: false,
      error: 'ingredientsは配列である必要があります',
    };
  }

  // ingredientsが空でないか
  if (body.ingredients.length === 0) {
    return {
      isValid: false,
      error: '材料を少なくとも1つ指定してください',
    };
  }

  // ingredientsが文字列の配列か
  if (!body.ingredients.every((item: any) => typeof item === 'string')) {
    return {
      isValid: false,
      error: 'すべての材料は文字列である必要があります',
    };
  }

  // ingredientsの最大数チェック
  if (body.ingredients.length > 20) {
    return {
      isValid: false,
      error: '材料は最大20個までです',
    };
  }

  return {
    isValid: true,
    data: {
      ingredients: body.ingredients,
    },
  };
}

/**
 * POST /api/recipes/search
 * 材料からレシピを検索
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();

    // バリデーション
    const validation = validateRequest(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.error,
          },
        },
        { status: 400 }
      );
    }

    const { ingredients } = validation.data!;

    console.log(`🔍 レシピ検索リクエスト: ${ingredients.join(', ')}`);

    // AI生成レシピと外部APIレシピを並列取得
    const [aiResult, apiResult] = await Promise.allSettled([
      generateRecipes(ingredients),
      searchRecipesByIngredients(ingredients),
    ]);

    // 成功したレシピを抽出
    const aiRecipes = aiResult.status === 'fulfilled' ? aiResult.value : [];
    const apiRecipes = apiResult.status === 'fulfilled' ? apiResult.value : [];

    // 結果をマージ
    const recipes = [...aiRecipes, ...apiRecipes];

    // ログ出力
    console.log(`✅ AI生成: ${aiRecipes.length}件, 外部API: ${apiRecipes.length}件`);
    console.log(`✅ 合計 ${recipes.length}件のレシピを返却`);

    // エラーログ（片方が失敗した場合）
    if (aiResult.status === 'rejected') {
      console.warn('⚠️ AI生成レシピの取得に失敗:', aiResult.reason);
    }
    if (apiResult.status === 'rejected') {
      console.warn('⚠️ 外部APIレシピの取得に失敗:', apiResult.reason);
    }

    // 成功レスポンス
    return NextResponse.json(
      {
        success: true,
        data: {
          recipes,
          total: recipes.length,
          sources: {
            ai: aiRecipes.length,
            api: apiRecipes.length,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ レシピ検索エラー:', error);

    // エラーの種類に応じたレスポンス
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RECIPE_GENERATION_FAILED',
            message: error.message,
          },
        },
        { status: 500 }
      );
    }

    // 予期しないエラー
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'レシピの検索に失敗しました。もう一度お試しください。',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recipes/search
 * GETメソッドは許可しない
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'このエンドポイントはPOSTメソッドのみサポートしています',
      },
    },
    { status: 405 }
  );
}
