import { NextRequest, NextResponse } from 'next/server';
import { suggestAlternatives } from '@/lib/gemini';

/**
 * 代替材料提案APIエンドポイント
 *
 * POST /api/recipes/alternatives
 *
 * リクエストボディ:
 * {
 *   "ingredient": "玉ねぎ",
 *   "recipeContext": "カレー" (オプション)
 * }
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "data": {
 *     "ingredient": "玉ねぎ",
 *     "alternatives": ["長ネギ", "エシャロット", "ニラ"]
 *   }
 * }
 */

// リクエストボディの型定義
interface AlternativesRequest {
  ingredient: string;
  recipeContext?: string;
}

// リクエストバリデーション
function validateRequest(body: any): {
  isValid: boolean;
  error?: string;
  data?: AlternativesRequest;
} {
  // bodyが存在するか
  if (!body) {
    return {
      isValid: false,
      error: 'リクエストボディが必要です',
    };
  }

  // ingredientフィールドが存在するか
  if (!body.ingredient) {
    return {
      isValid: false,
      error: 'ingredientフィールドが必要です',
    };
  }

  // ingredientが文字列か
  if (typeof body.ingredient !== 'string') {
    return {
      isValid: false,
      error: 'ingredientは文字列である必要があります',
    };
  }

  // ingredientが空でないか
  if (body.ingredient.trim().length === 0) {
    return {
      isValid: false,
      error: '材料を指定してください',
    };
  }

  // recipeContextが指定されている場合は文字列かチェック
  if (body.recipeContext && typeof body.recipeContext !== 'string') {
    return {
      isValid: false,
      error: 'recipeContextは文字列である必要があります',
    };
  }

  return {
    isValid: true,
    data: {
      ingredient: body.ingredient,
      recipeContext: body.recipeContext,
    },
  };
}

/**
 * POST /api/recipes/alternatives
 * 材料の代替案を提案
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'リクエストボディが正しいJSON形式ではありません',
          },
        },
        { status: 400 }
      );
    }

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

    const { ingredient, recipeContext } = validation.data!;

    console.log(
      `🔄 代替材料提案リクエスト: ${ingredient}${recipeContext ? ` (${recipeContext})` : ''}`
    );

    // Gemini APIを使用して代替材料を提案
    const alternatives = await suggestAlternatives(ingredient, recipeContext);

    console.log(`✅ ${ingredient}の代替材料を${alternatives.length}件提案`);

    // 成功レスポンス
    return NextResponse.json(
      {
        success: true,
        data: {
          ingredient,
          alternatives,
          recipeContext,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ 代替材料提案エラー:', error);

    // エラーの種類に応じたレスポンス
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALTERNATIVE_SUGGESTION_FAILED',
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
          message: '代替材料の提案に失敗しました。もう一度お試しください。',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/recipes/alternatives
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
