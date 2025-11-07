# API設計書

## 1. 概要

本ドキュメントは、スマートレシピファインダーで使用する各種APIの設計、エンドポイント、リクエスト/レスポンス形式を詳細に記述します。

### 1.1 使用API一覧
1. **Gemini API** - AIレシピ生成、代替材料提案
2. **外部レシピAPI** - 既存レシピデータベース検索
3. **Supabase API** - 認証、お気に入り管理
4. **Next.js API Routes** - バックエンドロジック

---

## 2. Gemini API

### 2.1 概要
- **Provider**: Google
- **Model**: gemini-2.5-flash
- **用途**: レシピ生成、代替材料提案
- **認証**: API Key
- **料金**: 無料枠利用

### 2.2 環境変数
```env
GEMINI_API_KEY=your_gemini_api_key
```

### 2.3 クライアント実装

**ファイル**: `lib/gemini/client.ts`

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateRecipes(ingredients: string[]): Promise<Recipe[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
あなたはプロの料理人です。以下の材料を使って、3つのレシピを提案してください。

【利用可能な材料】
${ingredients.join(', ')}

【出力形式】
以下のJSON形式で出力してください。必ず配列で3つのレシピを返してください。

[
  {
    "title": "レシピ名",
    "description": "レシピの簡単な説明",
    "servings": 人数（数値）,
    "cookTime": 調理時間（分、数値）,
    "difficulty": "easy" | "medium" | "hard",
    "ingredients": [
      {
        "name": "材料名",
        "amount": "分量",
        "isAvailable": true（利用可能な材料の場合）または false（追加で必要な材料の場合）
      }
    ],
    "instructions": [
      {
        "step": 手順番号（数値）,
        "description": "手順の説明"
      }
    ],
    "tags": ["タグ1", "タグ2"]
  }
]

【注意事項】
- 利用可能な材料を最大限活用してください
- 追加で必要な材料は最小限にしてください
- 料理初心者でも作れるレシピを優先してください
- 各レシピの調理時間は60分以内にしてください
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSONを抽出（```json ... ```の場合に対応）
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    const recipes = JSON.parse(jsonMatch[0]);
    
    // レシピにIDとソースを追加
    return recipes.map((recipe: any, index: number) => ({
      ...recipe,
      id: `ai-${Date.now()}-${index}`,
      source: 'ai' as const,
    }));
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('レシピの生成に失敗しました');
  }
}

export async function suggestAlternativeIngredients(
  ingredient: string,
  recipeContext: string
): Promise<string[]> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
あなたは料理の専門家です。以下の材料の代替案を3つ提案してください。

【元の材料】
${ingredient}

【レシピのコンテキスト】
${recipeContext}

【出力形式】
JSON配列形式で代替材料のみを返してください。説明は不要です。
例: ["代替材料1", "代替材料2", "代替材料3"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('代替材料の提案に失敗しました');
  }
}
```

### 2.4 レート制限
- **無料枠**: 15 RPM (Requests Per Minute)
- **対策**: リクエスト間隔の制御、エラーハンドリング

---

## 3. 外部レシピAPI

### 3.1 Spoonacular API

- **URL**: https://spoonacular.com/food-api
- **無料枠**: 150リクエスト/日
- **日本語対応**: 限定的（翻訳が必要な場合あり）
- **特徴**: 豊富なレシピDB、栄養情報あり、材料検索対応

### 3.2 実装例

**ファイル**: `lib/recipe-api/spoonacular.ts`

#### 環境変数
```env
SPOONACULAR_API_KEY=your_spoonacular_api_key
```

#### クライアント実装
```typescript
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

export async function searchRecipesByIngredients(
  ingredients: string[]
): Promise<Recipe[]> {
  const params = new URLSearchParams({
    apiKey: process.env.SPOONACULAR_API_KEY!,
    ingredients: ingredients.join(','),
    number: '5',
    ranking: '2', // 利用可能な材料を最大化
    ignorePantry: 'false',
  });

  try {
    const response = await fetch(
      `${SPOONACULAR_BASE_URL}/findByIngredients?${params}`
    );

    if (!response.ok) {
      throw new Error(`Spoonacular API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // 詳細情報を取得
    const detailedRecipes = await Promise.all(
      data.map((recipe: any) => getRecipeDetails(recipe.id))
    );

    return detailedRecipes.map(transformSpoonacularRecipe);
  } catch (error) {
    console.error('Spoonacular API Error:', error);
    return []; // エラー時は空配列を返す
  }
}

async function getRecipeDetails(recipeId: number) {
  const params = new URLSearchParams({
    apiKey: process.env.SPOONACULAR_API_KEY!,
  });

  const response = await fetch(
    `${SPOONACULAR_BASE_URL}/${recipeId}/information?${params}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch recipe details: ${response.status}`);
  }

  return response.json();
}

function transformSpoonacularRecipe(spoonacularRecipe: any): Recipe {
  return {
    id: `api-spoonacular-${spoonacularRecipe.id}`,
    title: spoonacularRecipe.title,
    description: spoonacularRecipe.summary?.replace(/<[^>]*>/g, ''), // HTMLタグ除去
    servings: spoonacularRecipe.servings,
    cookTime: spoonacularRecipe.readyInMinutes,
    difficulty: estimateDifficulty(spoonacularRecipe.readyInMinutes),
    ingredients: spoonacularRecipe.extendedIngredients.map((ing: any) => ({
      name: ing.name,
      amount: `${ing.amount} ${ing.unit}`,
      isAvailable: false, // APIでは判定できないのでfalse
    })),
    instructions: parseInstructions(spoonacularRecipe.analyzedInstructions),
    imageUrl: spoonacularRecipe.image,
    tags: spoonacularRecipe.dishTypes || [],
    source: 'api' as const,
  };
}

function estimateDifficulty(cookTime: number): 'easy' | 'medium' | 'hard' {
  if (cookTime <= 20) return 'easy';
  if (cookTime <= 45) return 'medium';
  return 'hard';
}

function parseInstructions(analyzedInstructions: any[]): Instruction[] {
  if (!analyzedInstructions || analyzedInstructions.length === 0) {
    return [];
  }

  const steps = analyzedInstructions[0].steps || [];
  return steps.map((step: any) => ({
    step: step.number,
    description: step.step,
  }));
}
```

---

## 4. Next.js API Routes

### 4.1 エンドポイント一覧

| エンドポイント | メソッド | 説明 |
|--------------|---------|------|
| `/api/recipes/search` | POST | レシピ検索 |
| `/api/recipes/[id]` | GET | レシピ詳細取得 |
| `/api/recipes/alternatives` | POST | 代替材料提案 |
| `/api/favorites` | GET | お気に入り一覧取得 |
| `/api/favorites` | POST | お気に入り追加 |
| `/api/favorites/[id]` | DELETE | お気に入り削除 |

### 4.2 `/api/recipes/search` - レシピ検索

**ファイル**: `app/api/recipes/search/route.ts`

#### リクエスト
```typescript
POST /api/recipes/search
Content-Type: application/json

{
  "ingredients": ["トマト", "玉ねぎ", "にんにく"]
}
```

#### レスポンス（成功）
```typescript
200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "recipes": [
      {
        "id": "ai-1234567890-0",
        "title": "トマトパスタ",
        "description": "シンプルで美味しいトマトパスタ",
        "servings": 2,
        "cookTime": 20,
        "difficulty": "easy",
        "ingredients": [
          {
            "name": "トマト",
            "amount": "2個",
            "isAvailable": true
          },
          {
            "name": "パスタ",
            "amount": "200g",
            "isAvailable": false
          }
        ],
        "instructions": [
          {
            "step": 1,
            "description": "トマトを角切りにする"
          },
          {
            "step": 2,
            "description": "パスタを茹でる"
          }
        ],
        "imageUrl": null,
        "tags": ["イタリアン", "パスタ"],
        "source": "ai"
      }
    ],
    "count": 8
  }
}
```

#### レスポンス（エラー）
```typescript
400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "message": "材料を指定してください",
    "code": "INVALID_INPUT"
  }
}
```

#### 実装
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { generateRecipes } from '@/lib/gemini/client';
import { searchRecipesByIngredients } from '@/lib/recipe-api/spoonacular';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    // バリデーション
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '材料を指定してください',
            code: 'INVALID_INPUT',
          },
        },
        { status: 400 }
      );
    }

    // AI生成レシピと外部APIレシピを並行取得
    const [aiRecipes, apiRecipes] = await Promise.allSettled([
      generateRecipes(ingredients),
      searchRecipesByIngredients(ingredients),
    ]);

    const recipes = [
      ...(aiRecipes.status === 'fulfilled' ? aiRecipes.value : []),
      ...(apiRecipes.status === 'fulfilled' ? apiRecipes.value : []),
    ];

    return NextResponse.json({
      success: true,
      data: {
        recipes,
        count: recipes.length,
      },
    });
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'レシピの検索に失敗しました',
          code: 'SEARCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
```

---

### 4.3 `/api/recipes/alternatives` - 代替材料提案

**ファイル**: `app/api/recipes/alternatives/route.ts`

#### リクエスト
```typescript
POST /api/recipes/alternatives
Content-Type: application/json

{
  "ingredient": "生クリーム",
  "recipeContext": "カルボナーラを作る際に使用"
}
```

#### レスポンス
```typescript
200 OK
Content-Type: application/json

{
  "success": true,
  "data": {
    "alternatives": [
      "牛乳とバター",
      "豆乳",
      "ヨーグルト"
    ]
  }
}
```

#### 実装
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { suggestAlternativeIngredients } from '@/lib/gemini/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredient, recipeContext } = body;

    if (!ingredient) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: '材料を指定してください',
            code: 'INVALID_INPUT',
          },
        },
        { status: 400 }
      );
    }

    const alternatives = await suggestAlternativeIngredients(
      ingredient,
      recipeContext || ''
    );

    return NextResponse.json({
      success: true,
      data: {
        alternatives,
      },
    });
  } catch (error) {
    console.error('Alternatives API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: '代替材料の提案に失敗しました',
          code: 'ALTERNATIVES_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
```

---

## 5. Supabase API

### 5.1 認証API

Supabase Authを使用するため、独自のAPI Routeは不要。
クライアントサイドで直接Supabaseクライアントを使用。

#### ログイン
```typescript
import { supabase } from '@/lib/supabase/client';

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

#### サインアップ
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

#### ログアウト
```typescript
const { error } = await supabase.auth.signOut();
```

#### セッション確認
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

---

### 5.2 お気に入りAPI

#### お気に入り一覧取得
```typescript
const { data, error } = await supabase
  .from('favorites')
  .select('*')
  .order('created_at', { ascending: false });
```

#### お気に入り追加
```typescript
const { data, error } = await supabase
  .from('favorites')
  .insert({
    user_id: userId,
    recipe_title: recipeTitle,
    recipe_data: recipeData,
    source: 'ai',
  });
```

#### お気に入り削除
```typescript
const { error } = await supabase
  .from('favorites')
  .delete()
  .eq('id', favoriteId);
```

#### 特定レシピがお気に入りか確認
```typescript
const { data, error } = await supabase
  .from('favorites')
  .select('id')
  .eq('recipe_title', recipeTitle)
  .single();

const isFavorite = !!data;
```

**注意**: v1.1からお気に入りの識別子を`recipe_id`から`recipe_title`に変更しました。理由は、AI生成レシピのIDは任意に付与されるため重複する可能性があるためです。

---

## 6. エラーハンドリング

### 6.1 エラーコード一覧

| コード | 説明 | HTTPステータス |
|-------|------|---------------|
| `INVALID_INPUT` | 入力パラメータが不正 | 400 |
| `UNAUTHORIZED` | 認証エラー | 401 |
| `FORBIDDEN` | アクセス権限なし | 403 |
| `NOT_FOUND` | リソースが見つからない | 404 |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 | 429 |
| `SEARCH_ERROR` | 検索エラー | 500 |
| `API_ERROR` | 外部API呼び出しエラー | 500 |
| `DATABASE_ERROR` | データベースエラー | 500 |
| `INTERNAL_ERROR` | 内部サーバーエラー | 500 |

### 6.2 エラーレスポンス形式

```typescript
{
  "success": false,
  "error": {
    "message": "エラーメッセージ",
    "code": "ERROR_CODE",
    "details": {} // オプション：詳細情報
  }
}
```

---

## 7. レート制限

### 7.1 外部API
- **Gemini API**: 15 RPM (Requests Per Minute)
- **Spoonacular**: 150リクエスト/日

### 7.2 対策
- リクエスト間隔の制御
- キャッシング（Redis等、将来実装）
- エラー時のリトライロジック
- フォールバック処理（一方のAPIが失敗しても続行）

---

## 8. セキュリティ

### 8.1 APIキーの管理
- 環境変数で管理
- `.env.local`ファイルに保存（Gitにコミットしない）
- Vercelの環境変数設定を使用

### 8.2 認証
- Supabase RLSでデータアクセス制御
- Next.js API RoutesでJWT検証（必要に応じて）

### 8.3 入力検証
- すべてのAPI Routeで入力バリデーション実施
- Zod等のバリデーションライブラリ使用推奨

---

## 9. パフォーマンス最適化

### 9.1 キャッシング
- Next.js Route Handlerのキャッシング機能活用
- 同じ材料での検索結果を一時キャッシュ

### 9.2 並行処理
- `Promise.allSettled`で複数API呼び出しを並行実行
- 一方が失敗しても他方の結果を返す

### 9.3 タイムアウト設定
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒

try {
  const response = await fetch(url, { signal: controller.signal });
  // ...
} finally {
  clearTimeout(timeoutId);
}
```

---

## 10. テスト

### 10.1 APIテストツール
- Postman
- curl
- Next.js開発環境での動作確認

### 10.2 テストケース例

#### レシピ検索API
```bash
# 正常系
curl -X POST http://localhost:3000/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["トマト", "玉ねぎ"]}'

# 異常系（材料なし）
curl -X POST http://localhost:3000/api/recipes/search \
  -H "Content-Type: application/json" \
  -d '{"ingredients": []}'
```

---

## 11. 環境変数まとめ

```env
# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Spoonacular API
SPOONACULAR_API_KEY=your_spoonacular_api_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 12. 将来の拡張

### 12.1 追加予定API
- 画像認識API（冷蔵庫の写真から材料を検出）
- 栄養情報API（カロリー計算）
- ショッピングAPI（材料の価格情報）

### 12.2 機能改善
- レシピのキャッシング機能
- ユーザーの検索履歴分析
- パーソナライズされたレシピ推薦

---

**作成日**: 2025年11月1日  
**最終更新**: 2025年11月1日  
**バージョン**: 1.0
