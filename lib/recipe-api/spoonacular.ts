/**
 * Spoonacular API Client
 *
 * 外部レシピAPI（Spoonacular）からレシピデータを取得するクライアント
 * 無料枠: 150リクエスト/日
 */

import { Recipe, Ingredient, Instruction, RecipeDifficulty } from '@/types/recipe';
import {
  translateIngredientsToEnglish,
  translateRecipeToJapanese,
} from '@/lib/gemini';

// Spoonacular APIのベースURL
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

/**
 * 環境変数からAPIキーを取得
 */
function getApiKey(): string {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey) {
    throw new Error('SPOONACULAR_API_KEY is not defined in environment variables');
  }
  return apiKey;
}

/**
 * 材料リストからレシピを検索
 *
 * @param ingredients - 検索する材料のリスト（日本語または英語）
 * @returns レシピの配列（最大5件、日本語に翻訳済み）
 */
export async function searchRecipesByIngredients(
  ingredients: string[]
): Promise<Recipe[]> {
  if (!ingredients || ingredients.length === 0) {
    console.warn('Spoonacular API: No ingredients provided');
    return [];
  }

  try {
    const apiKey = getApiKey();

    // 材料を英語に翻訳
    console.log(`[Spoonacular API] Translating ingredients to English: ${ingredients.join(', ')}`);
    let englishIngredients: string[];
    try {
      englishIngredients = await translateIngredientsToEnglish(ingredients);
      console.log(`[Spoonacular API] Translated to: ${englishIngredients.join(', ')}`);
    } catch (error) {
      console.warn('[Spoonacular API] Translation failed, using original ingredients:', error);
      englishIngredients = ingredients; // 翻訳に失敗した場合は元の材料を使用
    }

    // クエリパラメータの構築
    const params = new URLSearchParams({
      apiKey,
      ingredients: englishIngredients.join(','),
      number: '5', // 最大5件取得
      ranking: '2', // 利用可能な材料を最大化
      ignorePantry: 'false',
    });

    console.log(`[Spoonacular API] Searching recipes with ingredients: ${englishIngredients.join(', ')}`);

    // 材料検索APIを呼び出し
    const searchResponse = await fetch(
      `${SPOONACULAR_BASE_URL}/findByIngredients?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`Spoonacular API Error: ${searchResponse.status} ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();

    if (!Array.isArray(searchData) || searchData.length === 0) {
      console.log('[Spoonacular API] No recipes found');
      return [];
    }

    console.log(`[Spoonacular API] Found ${searchData.length} recipes`);

    // 各レシピの詳細情報を並行取得
    const detailedRecipes = await Promise.allSettled(
      searchData.map((recipe: any) => getRecipeDetails(recipe.id))
    );

    // 成功したレシピのみを抽出して変換
    const recipes = detailedRecipes
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => transformSpoonacularRecipe(result.value, ingredients));

    console.log(`[Spoonacular API] Successfully transformed ${recipes.length} recipes`);

    // レシピを日本語に翻訳
    console.log('[Spoonacular API] Translating recipes to Japanese...');
    const translatedRecipes = await Promise.allSettled(
      recipes.map(recipe => translateRecipeToJapanese(recipe))
    );

    const japaneseRecipes = translatedRecipes
      .filter((result): result is PromiseFulfilledResult<Recipe> => result.status === 'fulfilled')
      .map(result => result.value);

    console.log(`[Spoonacular API] Successfully translated ${japaneseRecipes.length} recipes to Japanese`);

    return japaneseRecipes;
  } catch (error) {
    console.error('[Spoonacular API] Error searching recipes:', error);
    // エラーが発生しても空配列を返す（フォールバック）
    return [];
  }
}

/**
 * レシピIDから詳細情報を取得
 *
 * @param recipeId - SpoonacularのレシピID
 * @returns レシピの詳細データ
 */
async function getRecipeDetails(recipeId: number): Promise<any> {
  try {
    const apiKey = getApiKey();

    const params = new URLSearchParams({
      apiKey,
    });

    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/${recipeId}/information?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch recipe details: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[Spoonacular API] Error fetching recipe ${recipeId}:`, error);
    throw error;
  }
}

/**
 * Spoonacular APIのレスポンスを内部のRecipe型に変換
 *
 * @param spoonacularRecipe - Spoonacular APIのレシピデータ
 * @param userIngredients - ユーザーが入力した材料リスト
 * @returns 変換されたRecipeオブジェクト
 */
function transformSpoonacularRecipe(
  spoonacularRecipe: any,
  userIngredients: string[]
): Recipe {
  // ユーザーが持っている材料のリスト（小文字で比較）
  const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase());

  // 材料リストの変換
  const ingredients: Ingredient[] = (spoonacularRecipe.extendedIngredients || []).map((ing: any) => {
    const ingredientName = ing.name || ing.original || '';
    const isAvailable = userIngredientsLower.some(userIng =>
      ingredientName.toLowerCase().includes(userIng) ||
      userIng.includes(ingredientName.toLowerCase())
    );

    return {
      name: ingredientName,
      amount: formatAmount(ing.amount, ing.unit),
      isAvailable,
    };
  });

  // 手順の変換
  const instructions = parseInstructions(spoonacularRecipe.analyzedInstructions);

  // 難易度の推定
  const difficulty = estimateDifficulty(spoonacularRecipe.readyInMinutes || 30);

  // HTMLタグを除去した説明文
  const description = spoonacularRecipe.summary
    ? stripHtmlTags(spoonacularRecipe.summary)
    : undefined;

  return {
    id: `api-spoonacular-${spoonacularRecipe.id}`,
    title: spoonacularRecipe.title || 'Untitled Recipe',
    description,
    servings: spoonacularRecipe.servings || 2,
    cookTime: spoonacularRecipe.readyInMinutes || 30,
    difficulty,
    ingredients,
    instructions,
    imageUrl: spoonacularRecipe.image || undefined,
    tags: spoonacularRecipe.dishTypes || [],
    source: 'api',
  };
}

/**
 * 分量と単位をフォーマット
 *
 * @param amount - 分量
 * @param unit - 単位
 * @returns フォーマットされた文字列
 */
function formatAmount(amount: number | undefined, unit: string | undefined): string {
  if (!amount && !unit) return '';
  if (!amount) return unit || '';
  if (!unit) return amount.toString();

  // 小数点以下を適切に丸める
  const formattedAmount = amount % 1 === 0
    ? amount.toString()
    : amount.toFixed(2).replace(/\.?0+$/, '');

  return `${formattedAmount} ${unit}`;
}

/**
 * HTMLタグを除去
 *
 * @param html - HTML文字列
 * @returns タグが除去されたテキスト
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // HTMLタグを削除
    .replace(/&nbsp;/g, ' ') // &nbsp;をスペースに変換
    .replace(/&amp;/g, '&')  // &amp;を&に変換
    .replace(/&lt;/g, '<')   // &lt;を<に変換
    .replace(/&gt;/g, '>')   // &gt;を>に変換
    .replace(/&quot;/g, '"') // &quot;を"に変換
    .trim();
}

/**
 * 調理時間から難易度を推定
 *
 * @param cookTime - 調理時間（分）
 * @returns 難易度
 */
function estimateDifficulty(cookTime: number): RecipeDifficulty {
  if (cookTime <= 20) return 'easy';
  if (cookTime <= 45) return 'medium';
  return 'hard';
}

/**
 * Spoonacularの手順データをパース
 *
 * @param analyzedInstructions - Spoonacularの手順データ
 * @returns パースされた手順の配列
 */
function parseInstructions(analyzedInstructions: any[]): Instruction[] {
  if (!analyzedInstructions || analyzedInstructions.length === 0) {
    return [];
  }

  const steps = analyzedInstructions[0]?.steps || [];

  return steps.map((step: any) => ({
    step: step.number || 0,
    description: step.step || '',
  }));
}

/**
 * APIのレート制限を確認
 * （将来的な拡張用：現在は実装なし）
 */
export function checkRateLimit(): void {
  // レート制限チェックのロジック（将来実装）
  // 150リクエスト/日の制限を考慮
}
