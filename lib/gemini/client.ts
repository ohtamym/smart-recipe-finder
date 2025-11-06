import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Recipe } from '@/types';

/**
 * Gemini API クライアント
 *
 * Google Gemini 2.5 Flash を使用してレシピを生成
 */

// APIキーの検証
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY が設定されていません');
}

// Gemini APIクライアントの初期化
const genAI = new GoogleGenerativeAI(apiKey);

// モデルの設定
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
});

/**
 * レシピ生成のプロンプトを構築
 * @param ingredients 材料のリスト
 * @returns プロンプト文字列
 */
function buildRecipePrompt(ingredients: string[]): string {
  const ingredientList = ingredients.join(', ');

  return `あなたは料理の専門家です。以下の材料を使用したレシピを3つ提案してください。

材料: ${ingredientList}

以下の条件を守ってください：
1. 提案するレシピは3つ
2. 各レシピには以下の情報を含める：
   - タイトル（日本語）
   - 説明（簡潔な説明、1〜2文）
   - 人数（servings）
   - 調理時間（cookTime、分単位）
   - 難易度（difficulty: "easy", "medium", "hard"のいずれか）
   - 材料リスト（ingredients）。各材料には以下を含める：
     - 材料名（name）
     - 分量（amount）
     - 手持ちの材料かどうか（isAvailable: true/false）
   - 手順（instructions）。各手順には以下を含める：
     - ステップ番号（step）
     - 説明（description）
   - タグ（tags）: 料理のカテゴリやキーワード（例: 和食、中華、簡単、時短など）

3. 必ずJSON配列形式で出力してください。以下のフォーマットに従ってください：

[
  {
    "id": "gemini-<ランダムなID>",
    "title": "レシピタイトル",
    "description": "レシピの説明",
    "servings": 2,
    "cookTime": 30,
    "difficulty": "easy",
    "ingredients": [
      {
        "name": "材料名",
        "amount": "分量",
        "isAvailable": true
      }
    ],
    "instructions": [
      {
        "step": 1,
        "description": "手順の説明"
      }
    ],
    "imageUrl": "",
    "tags": ["タグ1", "タグ2"],
    "source": "ai"
  }
]

4. 手持ちの材料（${ingredientList}）は isAvailable: true に設定してください
5. 追加で必要な材料がある場合は isAvailable: false に設定してください
6. idは "gemini-" で始まる一意のIDを生成してください（例: "gemini-recipe-1"）
7. JSONのみを出力し、他の説明文は含めないでください`;
}

/**
 * JSON文字列からマークダウンコードブロックを除去
 * @param text レスポンステキスト
 * @returns クリーンなJSON文字列
 */
function cleanJsonResponse(text: string): string {
  // マークダウンコードブロック（```json ... ``` や ``` ... ```）を除去
  let cleaned = text.trim();

  // ```json で始まる場合
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  }
  // ``` で始まる場合
  else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  return cleaned.trim();
}

/**
 * 材料からレシピを生成
 * @param ingredients 材料のリスト
 * @returns 生成されたレシピのリスト
 */
export async function generateRecipes(
  ingredients: string[]
): Promise<Recipe[]> {
  try {
    // バリデーション
    if (!ingredients || ingredients.length === 0) {
      throw new Error('材料を少なくとも1つ指定してください');
    }

    // プロンプトを構築
    const prompt = buildRecipePrompt(ingredients);

    // Gemini APIを呼び出し
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONをパース
    const cleanedText = cleanJsonResponse(text);
    const recipes = JSON.parse(cleanedText) as Recipe[];

    // バリデーション: 配列であることを確認
    if (!Array.isArray(recipes)) {
      throw new Error('レシピの形式が不正です（配列ではありません）');
    }

    // バリデーション: 各レシピの必須フィールドをチェック
    recipes.forEach((recipe, index) => {
      if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
        throw new Error(
          `レシピ ${index + 1} に必須フィールドが不足しています`
        );
      }
    });

    console.log(`✅ Gemini APIから${recipes.length}件のレシピを生成しました`);
    return recipes;
  } catch (error) {
    console.error('❌ Gemini APIエラー:', error);

    // エラーの種類に応じたメッセージ
    if (error instanceof SyntaxError) {
      throw new Error(
        'レシピの生成に失敗しました（JSON解析エラー）。もう一度お試しください。'
      );
    }

    if (error instanceof Error) {
      throw new Error(`レシピの生成に失敗しました: ${error.message}`);
    }

    throw new Error('レシピの生成に失敗しました。もう一度お試しください。');
  }
}

/**
 * 代替材料を提案
 * @param ingredient 元の材料
 * @param recipeContext レシピのコンテキスト（料理名など）
 * @returns 代替材料のリスト
 */
export async function suggestAlternatives(
  ingredient: string,
  recipeContext?: string
): Promise<string[]> {
  try {
    const prompt = `あなたは料理の専門家です。以下の材料の代替材料を3つ提案してください。

元の材料: ${ingredient}
${recipeContext ? `料理: ${recipeContext}` : ''}

以下の条件を守ってください：
1. 代替材料は3つ
2. 味や食感が似ている材料を提案
3. 入手しやすい材料を優先
4. JSON配列形式で出力してください：["代替材料1", "代替材料2", "代替材料3"]
5. JSONのみを出力し、他の説明文は含めないでください`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = cleanJsonResponse(text);
    const alternatives = JSON.parse(cleanedText) as string[];

    if (!Array.isArray(alternatives)) {
      throw new Error('代替材料の形式が不正です');
    }

    console.log(`✅ ${ingredient}の代替材料を${alternatives.length}件提案しました`);
    return alternatives;
  } catch (error) {
    console.error('❌ 代替材料提案エラー:', error);
    throw new Error('代替材料の提案に失敗しました。もう一度お試しください。');
  }
}

/**
 * 日本語の材料名を英語に翻訳
 * @param ingredients 日本語の材料名のリスト
 * @returns 英語の材料名のリスト
 */
export async function translateIngredientsToEnglish(
  ingredients: string[]
): Promise<string[]> {
  try {
    const prompt = `以下の日本語の食材名を英語に翻訳してください。

食材名（日本語）: ${ingredients.join(', ')}

以下の条件を守ってください：
1. 各食材名を正確に英語に翻訳
2. 料理で使用される一般的な英語名を使用
3. JSON配列形式で出力してください：["ingredient1", "ingredient2", ...]
4. 元の順序を保つ
5. JSONのみを出力し、他の説明文は含めないでください

例：
入力: ["玉ねぎ", "にんじん", "じゃがいも"]
出力: ["onion", "carrot", "potato"]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = cleanJsonResponse(text);
    const translatedIngredients = JSON.parse(cleanedText) as string[];

    if (!Array.isArray(translatedIngredients)) {
      throw new Error('翻訳結果の形式が不正です');
    }

    if (translatedIngredients.length !== ingredients.length) {
      throw new Error('翻訳結果の数が一致しません');
    }

    console.log(`✅ ${ingredients.length}件の材料名を英語に翻訳しました`);
    return translatedIngredients;
  } catch (error) {
    console.error('❌ 材料名翻訳エラー:', error);
    throw new Error('材料名の翻訳に失敗しました。もう一度お試しください。');
  }
}

/**
 * レシピ情報を日本語に翻訳
 * @param recipe 英語のレシピ情報
 * @returns 日本語に翻訳されたレシピ情報
 */
export async function translateRecipeToJapanese(
  recipe: Recipe
): Promise<Recipe> {
  try {
    const prompt = `以下の英語のレシピ情報を日本語に翻訳してください。

レシピJSON:
${JSON.stringify(recipe, null, 2)}

以下の条件を守ってください：
1. title, description, ingredients[].name, ingredients[].amount, instructions[].description を日本語に翻訳
2. その他のフィールド（id, servings, cookTime, difficulty, source など）は元のまま維持
3. JSON形式で出力してください
4. JSONのみを出力し、他の説明文は含めないでください

翻訳のポイント：
- 材料名は日本語の一般的な名称を使用（例: onion → 玉ねぎ）
- 分量の単位も日本語に翻訳（例: 1 cup → 1カップ、2 tablespoons → 大さじ2）
- 手順は自然な日本語に翻訳`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = cleanJsonResponse(text);
    const translatedRecipe = JSON.parse(cleanedText) as Recipe;

    console.log(`✅ レシピ「${recipe.title}」を日本語に翻訳しました`);
    return translatedRecipe;
  } catch (error) {
    console.error('❌ レシピ翻訳エラー:', error);
    throw new Error('レシピの翻訳に失敗しました。もう一度お試しください。');
  }
}
