# テスト戦略ドキュメント

**プロジェクト**: スマートレシピファインダー
**作成日**: 2025年11月6日
**テストフレームワーク**: Jest + React Testing Library + Cypress (E2E)

---

## 📋 テスト戦略の概要

このプロジェクトでは、**テストピラミッド**アプローチを採用し、3層のテスト戦略を実装します。

```
        /\
       /  \    E2Eテスト (少数・重要フロー)
      /____\
     /      \  統合テスト (中程度・機能単位)
    /________\
   /          \ 単体テスト (多数・コンポーネント/関数単位)
  /__________\
```

**カバレッジ目標**:
- 単体テスト: 15%以上（重要なコンポーネント・フック）✅ **達成: 15.35%**
- 統合テスト: 主要な機能フロー
- E2Eテスト: クリティカルなユーザーフロー

---

## 🧪 1. 単体テスト (Unit Tests)

### 対象範囲
純粋な関数、ロジック、UIコンポーネント（外部依存なし）

### 実装済み

#### UIコンポーネント (`components/ui/`)
| コンポーネント | テストファイル | カバレッジ | 優先度 |
|--------------|-------------|----------|--------|
| Button | `__tests__/Button.test.tsx` | 100% | 高 |
| Card | `__tests__/Card.test.tsx` | 70% | 高 |
| Input/Textarea | `__tests__/Input.test.tsx` | 100% | 高 |
| Loading | `__tests__/Loading.test.tsx` | 50% | 中 |

**テスト内容**:
- プロパティの動作確認（variant、size、disabled等）
- ユーザーインタラクション（クリック、入力、キーボード操作）
- アクセシビリティ（aria属性、role属性）
- 条件付きレンダリング

#### フィーチャーコンポーネント (`components/features/`)
| コンポーネント | テストファイル | カバレッジ | 優先度 |
|--------------|-------------|----------|--------|
| IngredientTag | `search/__tests__/IngredientTag.test.tsx` | 100% | 高 |
| IngredientInput | `search/__tests__/IngredientInput.test.tsx` | 96.9% | 高 |
| RecipeCard | `recipe/__tests__/RecipeCard.test.tsx` | 100% | 高 |
| RecipeGrid | `recipe/__tests__/RecipeGrid.test.tsx` | 100% | 高 |
| ErrorMessage | `ui/__tests__/ErrorMessage.test.tsx` | 100% | 高 |

**テスト内容**:
- 削除機能の動作確認
- キーボードナビゲーション
- コールバック関数の呼び出し確認
- 材料の追加・削除・クリア
- エラー表示とバリデーション
- レシピカード表示
- グリッドレイアウト
- 空状態の表示

#### カスタムフック (`hooks/`)
| フック | テストファイル | カバレッジ | 優先度 |
|--------|-------------|----------|--------|
| useIngredients | `__tests__/useIngredients.test.ts` | 92% | 高 |

**テスト内容**:
- 材料の追加・削除・クリア
- バリデーション（重複チェック、最大数チェック、長さチェック）
- エラーメッセージの表示

### 今後の拡張候補

#### UIコンポーネント
- `IngredientList`: 材料リスト表示
- `RecipeDetail`: レシピ詳細表示

#### カスタムフック
- `useAuth`: 認証状態管理（Supabaseモック必須）
- `useFavorites`: お気に入りCRUD操作（Supabaseモック必須）
- `useRecipeSearch`: レシピ検索（APIモック必須）

**単体テストで避けるべきもの**:
- 外部API呼び出しを含むコンポーネント（統合テストで実施）
- ルーティングを含むページコンポーネント（統合/E2Eで実施）
- Next.js特有の機能（Image、Link、dynamic等）を多用するコンポーネント

**Note**: 上記のフックやコンポーネントは、外部依存が多いため、統合テストやE2Eテストでカバーする方が効果的です。

---

## 🔗 2. 統合テスト (Integration Tests)

### 対象範囲
複数のコンポーネント・モジュールの連携、APIモックを使用した機能単位のテスト

### 実装推奨

#### API統合 (`app/api/`)
| エンドポイント | テストファイル | テスト内容 | 優先度 |
|--------------|-------------|----------|--------|
| POST /api/recipes/search | `app/api/recipes/search/route.test.ts` | リクエストバリデーション、Gemini/Spoonacular APIモック、レスポンス形式 | 高 |
| POST /api/recipes/alternatives | `app/api/recipes/alternatives/route.test.ts` | リクエストバリデーション、Gemini APIモック、代替材料提案 | 中 |

**テスト内容**:
- リクエストバリデーション（必須フィールド、型チェック）
- 外部APIのモック（成功・失敗ケース）
- エラーハンドリング（400、500エラー）
- レスポンス形式の確認

#### 機能単位の統合
| 機能 | テストファイル | テスト内容 | 優先度 |
|------|-------------|----------|--------|
| 材料入力フォーム | `components/features/search/IngredientInput.integration.test.tsx` | IngredientInput + IngredientTag + useIngredients | 高 |
| お気に入り機能 | `components/features/favorites/FavoriteButton.integration.test.tsx` | FavoriteButton + useFavorites + Supabaseモック | 高 |
| 認証フォーム | `components/features/auth/AuthForm.integration.test.tsx` | AuthForm + useAuth + Supabaseモック | 中 |

**実装方法**:
```typescript
// 例: API統合テスト
import { POST } from '@/app/api/recipes/search/route';
import { generateRecipes } from '@/lib/gemini';
import { searchRecipesByIngredients } from '@/lib/recipe-api';

jest.mock('@/lib/gemini');
jest.mock('@/lib/recipe-api');

describe('POST /api/recipes/search', () => {
  it('材料リストからレシピを取得できる', async () => {
    (generateRecipes as jest.Mock).mockResolvedValue([/* AI recipes */]);
    (searchRecipesByIngredients as jest.Mock).mockResolvedValue([/* API recipes */]);

    const request = new Request('http://localhost/api/recipes/search', {
      method: 'POST',
      body: JSON.stringify({ ingredients: ['玉ねぎ', 'にんじん'] }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.recipes).toHaveLength(6); // AI 3 + API 3
  });
});
```

---

## 🌐 3. E2Eテスト (End-to-End Tests)

### 対象範囲
実際のブラウザでユーザーフローを再現、全てのレイヤーを統合したテスト

### ツール
**Cypress** または **Playwright** を推奨

### 実装推奨

#### クリティカルなユーザーフロー

| ユーザーフロー | テストファイル | テスト内容 | 優先度 |
|-------------|-------------|----------|--------|
| レシピ検索フロー | `cypress/e2e/recipe-search.cy.ts` | 材料入力 → 検索 → レシピ一覧 → レシピ詳細 | 最高 |
| お気に入り登録フロー | `cypress/e2e/favorites.cy.ts` | ログイン → レシピ検索 → お気に入り追加 → お気に入り一覧 | 高 |
| 認証フロー | `cypress/e2e/auth.cy.ts` | サインアップ → ログイン → ログアウト | 高 |
| 代替材料提案フロー | `cypress/e2e/alternatives.cy.ts` | レシピ詳細 → 代替材料ボタン → 代替材料表示 | 中 |
| レスポンシブデザイン | `cypress/e2e/responsive.cy.ts` | モバイル/タブレット/デスクトップ表示確認 | 中 |

### E2Eテスト実装例

```typescript
// cypress/e2e/recipe-search.cy.ts
describe('レシピ検索フロー', () => {
  it('材料を入力してレシピを検索できる', () => {
    // ホームページにアクセス
    cy.visit('http://localhost:3000');

    // 材料を入力
    cy.get('input[placeholder*="材料"]').type('玉ねぎ');
    cy.get('button:contains("追加")').click();

    cy.get('input[placeholder*="材料"]').type('にんじん');
    cy.get('button:contains("追加")').click();

    // レシピを検索
    cy.get('button:contains("レシピを検索")').click();

    // レシピ一覧が表示される
    cy.url().should('include', '/recipes');
    cy.get('[data-testid="recipe-card"]').should('have.length.at.least', 1);

    // レシピ詳細を表示
    cy.get('[data-testid="recipe-card"]').first().click();
    cy.url().should('match', /\/recipes\/[a-z0-9-]+/);
    cy.get('h1').should('exist');
    cy.get('[data-testid="ingredient-list"]').should('exist');
  });
});
```

### E2Eテストのセットアップ

#### 1. Cypressのインストール
```bash
npm install --save-dev cypress
```

#### 2. package.jsonにスクリプト追加
```json
"scripts": {
  "cypress:open": "cypress open",
  "cypress:run": "cypress run",
  "test:e2e": "cypress run"
}
```

#### 3. 環境変数の設定
```javascript
// cypress.config.js
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
```

---

## 📊 テスト実行コマンド

### 単体テスト
```bash
# テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付き
npm run test:coverage
```

### 統合テスト
```bash
# 単体テストと同じコマンドで実行
npm test

# 特定のファイルのみ
npm test -- integration.test
```

### E2Eテスト
```bash
# Cypress UI起動
npm run cypress:open

# ヘッドレス実行
npm run cypress:run

# 特定のテストのみ
npm run cypress:run -- --spec "cypress/e2e/recipe-search.cy.ts"
```

---

## 🎯 テスト実装の優先順位

### Phase 1: 単体テスト（完了✅）
- ✅ UIコンポーネント（Button、Card、Input、Loading、ErrorMessage）
- ✅ フィーチャーコンポーネント（IngredientTag、IngredientInput、RecipeCard、RecipeGrid）
- ✅ カスタムフック（useIngredients）
- ✅ カバレッジ15%以上達成

### Phase 2: 統合テスト（推奨）
- 🔲 POST /api/recipes/search
- 🔲 POST /api/recipes/alternatives
- 🔲 材料入力フォーム統合
- 🔲 お気に入り機能統合

### Phase 3: E2Eテスト（推奨）
- 🔲 Cypressセットアップ
- 🔲 レシピ検索フロー
- 🔲 お気に入り登録フロー
- 🔲 認証フロー

---

## 🔧 モック戦略

### Supabase
```typescript
// __mocks__/@supabase/supabase-js.ts
export const createClient = jest.fn(() => ({
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
}));
```

### Gemini API
```typescript
// __mocks__/@google/generative-ai.ts
export class GoogleGenerativeAI {
  getGenerativeModel() {
    return {
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify([/* mock recipes */])),
        },
      }),
    };
  }
}
```

### Fetch API
```typescript
// jest.setup.js
global.fetch = jest.fn((url) => {
  if (url.includes('/api/recipes/search')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: { recipes: [] } }),
    });
  }
  return Promise.reject(new Error('Not found'));
});
```

---

## 📈 カバレッジレポート

### 現在のカバレッジ（達成✅）
```
カテゴリ        カバレッジ   目標
--------------------------------
Statements     15.35%     15%+ ✅
Branches       18.75%     15%+ ✅
Functions      19.04%     15%+ ✅
Lines          15.01%     15%+ ✅
```

**テストスイート**: 10個 (すべて成功)
**テスト数**: 86個 (すべて成功)

### 実装済みテストファイル
1. `components/ui/__tests__/Button.test.tsx` - 8テスト
2. `components/ui/__tests__/Card.test.tsx` - 7テスト
3. `components/ui/__tests__/Input.test.tsx` - 13テスト
4. `components/ui/__tests__/Loading.test.tsx` - 3テスト
5. `components/ui/__tests__/ErrorMessage.test.tsx` - 10テスト
6. `components/features/search/__tests__/IngredientTag.test.tsx` - 5テスト
7. `components/features/search/__tests__/IngredientInput.test.tsx` - 11テスト
8. `components/features/recipe/__tests__/RecipeCard.test.tsx` - 11テスト
9. `components/features/recipe/__tests__/RecipeGrid.test.tsx` - 6テスト
10. `hooks/__tests__/useIngredients.test.ts` - 14テスト

### 今後の改善計画
1. API統合テストの実装（POST /api/recipes/search, /api/recipes/alternatives）
2. E2Eテストのセットアップ（Cypress）
3. 認証フローの統合テスト
4. お気に入り機能の統合テスト

---

## 📝 ベストプラクティス

### 単体テスト
- ✅ 1テスト1アサーション（可能な限り）
- ✅ テスト名は「〜が〜する」形式
- ✅ Arrange-Act-Assert（AAA）パターン
- ✅ モックは最小限に
- ✅ data-testid属性の使用を検討

### 統合テスト
- ✅ 実際のユーザー操作に近い形でテスト
- ✅ 外部APIは必ずモック
- ✅ 非同期処理の適切な待機
- ✅ エラーケースも必ずテスト

### E2Eテスト
- ✅ クリティカルなフローのみ
- ✅ テストデータの準備・クリーンアップ
- ✅ 環境変数の管理
- ✅ スクリーンショット・ビデオ記録
- ✅ リトライロジックの実装

---

## 🚀 CI/CDでの実行

### GitHub Actions設定例
```yaml
name: Tests
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: npm run cypress:run
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
```

---

## 📚 参考リソース

- [Jest公式ドキュメント](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress公式ドキュメント](https://www.cypress.io/)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Next.js Testing](https://nextjs.org/docs/testing)

---

**最終更新**: 2025年11月6日
**作成者**: Claude Code
