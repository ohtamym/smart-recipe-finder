# コンポーネント設計書

## 1. 概要

本ドキュメントは、スマートレシピファインダーのコンポーネント構成、レンダリング方式、状態管理について詳細に記述します。

### 1.1 使用技術
- **Framework**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: React Hooks, Context API
- **UI**: モバイルファースト

---

## 2. ディレクトリ構成

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # トップページ (SSR)
│   ├── recipes/
│   │   ├── page.tsx            # レシピ一覧 (CSR)
│   │   └── [id]/
│   │       └── page.tsx        # レシピ詳細 (CSR)
│   ├── favorites/
│   │   └── page.tsx            # お気に入り一覧 (CSR)
│   └── auth/
│       └── page.tsx            # 認証ページ (CSR)
├── components/
│   ├── layout/                  # レイアウトコンポーネント
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── features/                # 機能別コンポーネント
│   │   ├── search/
│   │   │   ├── IngredientInput.tsx
│   │   │   ├── IngredientTag.tsx
│   │   │   └── SearchButton.tsx
│   │   ├── recipe/
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── RecipeDetail.tsx
│   │   │   ├── IngredientList.tsx
│   │   │   ├── InstructionList.tsx
│   │   │   └── AlternativeIngredients.tsx
│   │   ├── favorites/
│   │   │   ├── FavoriteButton.tsx
│   │   │   └── FavoritesList.tsx
│   │   └── auth/
│   │       ├── LoginForm.tsx
│   │       └── SignupForm.tsx
│   ├── ui/                      # 共通UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorMessage.tsx
│   └── providers/               # Context Providers
│       ├── AuthProvider.tsx
│       └── RecipeProvider.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabaseクライアント
│   │   ├── auth.ts             # 認証関連
│   │   └── favorites.ts        # お気に入り操作
│   ├── gemini/
│   │   └── client.ts           # Gemini API
│   └── utils/
│       ├── recipeParser.ts     # レシピデータ変換
│       └── validators.ts       # バリデーション
├── types/
│   ├── recipe.ts               # レシピ型定義
│   ├── user.ts                 # ユーザー型定義
│   └── api.ts                  # API型定義
└── hooks/
    ├── useAuth.ts              # 認証フック
    ├── useFavorites.ts         # お気に入りフック
    ├── useRecipeSearch.ts      # レシピ検索フック
    └── useIngredients.ts       # 材料入力フック
```

---

## 3. レンダリング方式一覧

| ページ/機能 | パス | レンダリング方式 | 理由 |
|-----------|------|----------------|------|
| トップページ | `/` | SSR | SEO対策、初期表示の高速化 |
| レシピ一覧 | `/recipes` | CSR | 動的データ、検索結果 |
| レシピ詳細 | `/recipes/[id]` | CSR | 動的データ、ユーザーインタラクション |
| お気に入り | `/favorites` | CSR | 認証必須、個人データ |
| 認証ページ | `/auth` | CSR | セキュリティ、動的フォーム |

### 3.1 レンダリング方式の判断基準

- **SSR**: SEO重視、初期表示重視、公開コンテンツ
- **CSR**: 認証必須、ユーザー固有データ、頻繁な更新
- **SSG**: 静的コンテンツ（今回は未使用）

---

## 4. ページコンポーネント詳細

### 4.1 トップページ (`/` - SSR)

**ファイル**: `app/page.tsx`

#### 責務
- 材料入力フォーム表示
- アプリケーションの紹介
- ログイン状態の表示

#### レンダリング方式
```typescript
// SSR実装例
export default async function Home() {
  // サーバーサイドで初期データ取得（オプション）
  return (
    <main className="container mx-auto px-4 py-8">
      <Hero />
      <IngredientSearchForm />
      <FeatureSection />
    </main>
  );
}
```

#### 使用コンポーネント
- `Hero`: ヒーローセクション
- `IngredientSearchForm`: 材料入力フォーム
- `FeatureSection`: 機能紹介

#### State管理
- クライアントコンポーネント内で材料リストを管理
- `useIngredients`カスタムフックで材料追加/削除

---

### 4.2 レシピ一覧ページ (`/recipes` - CSR)

**ファイル**: `app/recipes/page.tsx`

#### 責務
- 検索結果のレシピカード一覧表示
- お気に入りボタン
- レシピ詳細へのナビゲーション

#### レンダリング方式
```typescript
'use client';

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const ingredients = searchParams.get('ingredients')?.split(',') || [];
  const { recipes, loading, error } = useRecipeSearch(ingredients);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">検索結果</h1>
      <RecipeGrid recipes={recipes} />
    </div>
  );
}
```

#### 使用コンポーネント
- `RecipeGrid`: レシピカードのグリッド表示
- `RecipeCard`: 個別レシピカード
- `FavoriteButton`: お気に入りボタン
- `Loading`: ローディング表示
- `ErrorMessage`: エラー表示

#### State管理
- `useRecipeSearch`: レシピ検索状態
- `useFavorites`: お気に入り状態

---

### 4.3 レシピ詳細ページ (`/recipes/[id]` - CSR)

**ファイル**: `app/recipes/[id]/page.tsx`

#### 責務
- レシピの詳細情報表示
- 材料リスト（手持ち/追加購入を区別）
- 調理手順
- 代替材料提案
- お気に入り登録/解除

#### レンダリング方式
```typescript
'use client';

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const { recipe, loading, error } = useRecipe(params.id);
  const [showAlternatives, setShowAlternatives] = useState(false);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!recipe) return <NotFound />;

  return (
    <div className="container mx-auto px-4 py-8">
      <RecipeDetail recipe={recipe} />
      <IngredientList ingredients={recipe.ingredients} />
      <InstructionList instructions={recipe.instructions} />
      <AlternativeIngredients 
        show={showAlternatives}
        ingredients={recipe.ingredients}
      />
    </div>
  );
}
```

#### 使用コンポーネント
- `RecipeDetail`: レシピヘッダー（タイトル、画像、難易度）
- `IngredientList`: 材料リスト
- `InstructionList`: 調理手順
- `AlternativeIngredients`: 代替材料提案
- `FavoriteButton`: お気に入りボタン

#### State管理
- `useRecipe`: 個別レシピデータ取得
- `showAlternatives`: 代替材料表示フラグ

---

### 4.4 お気に入りページ (`/favorites` - CSR)

**ファイル**: `app/favorites/page.tsx`

#### 責務
- お気に入りレシピ一覧表示
- お気に入り削除機能
- レシピ詳細へのナビゲーション

#### レンダリング方式
```typescript
'use client';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, loading, removeFavorite } = useFavorites();

  if (!user) {
    redirect('/auth');
  }

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">お気に入りレシピ</h1>
      {favorites.length === 0 ? (
        <EmptyState />
      ) : (
        <FavoritesList 
          favorites={favorites} 
          onRemove={removeFavorite}
        />
      )}
    </div>
  );
}
```

#### 使用コンポーネント
- `FavoritesList`: お気に入りリスト
- `RecipeCard`: レシピカード（削除ボタン付き）
- `EmptyState`: 空状態表示

#### State管理
- `useAuth`: 認証状態
- `useFavorites`: お気に入りデータ取得/削除

---

### 4.5 認証ページ (`/auth` - CSR)

**ファイル**: `app/auth/page.tsx`

#### 責務
- ログイン/サインアップフォーム
- 認証状態の管理
- リダイレクト処理

#### レンダリング方式
```typescript
'use client';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const { user } = useAuth();

  if (user) {
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {mode === 'login' ? 'ログイン' : '新規登録'}
      </h1>
      {mode === 'login' ? (
        <LoginForm onSwitchMode={() => setMode('signup')} />
      ) : (
        <SignupForm onSwitchMode={() => setMode('login')} />
      )}
    </div>
  );
}
```

#### 使用コンポーネント
- `LoginForm`: ログインフォーム
- `SignupForm`: サインアップフォーム

#### State管理
- `mode`: ログイン/サインアップ切り替え
- `useAuth`: 認証状態管理

---

## 5. 共通コンポーネント詳細

### 5.1 Layout Components

#### Header.tsx
```typescript
'use client';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          RecipeFinder
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/favorites">お気に入り</Link>
              <Button onClick={signOut} variant="outline">
                ログアウト
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button>ログイン</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
```

#### Navigation.tsx (モバイル用)
```typescript
'use client';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'ホーム', icon: HomeIcon },
    { href: '/recipes', label: '検索', icon: SearchIcon },
    { href: '/favorites', label: 'お気に入り', icon: HeartIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center ${
              pathname === item.href ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
```

---

### 5.2 Feature Components

#### IngredientInput.tsx
```typescript
'use client';

interface IngredientInputProps {
  onAdd: (ingredient: string) => void;
}

export function IngredientInput({ onAdd }: IngredientInputProps) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  // オートコンプリート機能（オプション）
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    // 材料候補を取得（将来実装）
    // setSuggestions(await fetchSuggestions(newValue));
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="材料を入力（例: トマト、玉ねぎ）"
        className="w-full"
      />
      {suggestions.length > 0 && (
        <SuggestionList suggestions={suggestions} onSelect={onAdd} />
      )}
    </form>
  );
}
```

#### RecipeCard.tsx
```typescript
'use client';

interface RecipeCardProps {
  recipe: Recipe;
  showFavoriteButton?: boolean;
}

export function RecipeCard({ recipe, showFavoriteButton = true }: RecipeCardProps) {
  const router = useRouter();

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow">
      <div onClick={() => router.push(`/recipes/${recipe.id}`)}>
        {recipe.imageUrl && (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>🕐 {recipe.cookTime}分</span>
            <span>📊 {recipe.difficulty}</span>
            <span>👥 {recipe.servings}人分</span>
          </div>
          {recipe.source && (
            <span className="text-xs text-gray-500 mt-2 inline-block">
              {recipe.source === 'ai' ? 'AI生成' : 'レシピDB'}
            </span>
          )}
        </div>
      </div>
      {showFavoriteButton && (
        <div className="px-4 pb-4">
          <FavoriteButton recipeId={recipe.id} />
        </div>
      )}
    </Card>
  );
}
```

#### FavoriteButton.tsx
```typescript
'use client';

interface FavoriteButtonProps {
  recipeId: string;
}

export function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, addFavorite, removeFavorite, loading } = useFavorites();
  const router = useRouter();

  const handleClick = async () => {
    if (!user) {
      router.push('/auth');
      return;
    }

    if (isFavorite(recipeId)) {
      await removeFavorite(recipeId);
    } else {
      await addFavorite(recipeId);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isFavorite(recipeId) ? 'solid' : 'outline'}
      className="w-full"
    >
      {isFavorite(recipeId) ? '❤️ お気に入り済み' : '🤍 お気に入りに追加'}
    </Button>
  );
}
```

#### IngredientList.tsx
```typescript
interface IngredientListProps {
  ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const available = ingredients.filter(i => i.isAvailable);
  const needed = ingredients.filter(i => !i.isAvailable);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">✅ 手持ちの材料</h3>
        <ul className="space-y-1">
          {available.map((ing, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{ing.name}</span>
              <span className="text-gray-600">{ing.amount}</span>
            </li>
          ))}
        </ul>
      </div>
      {needed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-orange-600">
            🛒 追加で必要な材料
          </h3>
          <ul className="space-y-1">
            {needed.map((ing, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{ing.name}</span>
                <span className="text-gray-600">{ing.amount}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

### 5.3 UI Components

#### Button.tsx
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'solid', 
  size = 'md', 
  className = '',
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-lg font-medium transition-colors';
  
  const variantStyles = {
    solid: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### Card.tsx
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
```

#### Loading.tsx
```typescript
export function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

---

## 6. カスタムフック詳細

### 6.1 useAuth.ts
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Supabaseセッション確認
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signIn, signUp, signOut };
}
```

### 6.2 useFavorites.ts
```typescript
export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFavorites(data);
    }
    setLoading(false);
  };

  const addFavorite = async (recipe: Recipe) => {
    if (!user) return;

    const { error } = await supabase.from('favorites').insert({
      user_id: user.id,
      recipe_id: recipe.id,
      recipe_data: recipe,
      source: recipe.source,
    });

    if (!error) {
      await fetchFavorites();
    }
  };

  const removeFavorite = async (recipeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id);

    if (!error) {
      await fetchFavorites();
    }
  };

  const isFavorite = (recipeId: string) => {
    return favorites.some(f => f.recipe_id === recipeId);
  };

  return { favorites, loading, addFavorite, removeFavorite, isFavorite };
}
```

### 6.3 useRecipeSearch.ts

**レシピ検索フック（キャッシュ機能付き）**

レシピ検索APIを呼び出し、結果をsessionStorageにキャッシュします。同じ材料での再検索時はキャッシュから読み込み、API呼び出しを回避します。

**キャッシュ戦略**:
- **キーの生成**: 材料をソートして順序に依存しないキーを生成（例: "玉ねぎ,にんじん" と "にんじん,玉ねぎ" は同じキャッシュ）
- **保存先**: sessionStorage（タブを閉じるまで有効）
- **再生成**: `forceRefresh=true` でキャッシュをクリアして新規取得

```typescript
export interface UseRecipeSearchReturn {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;
  search: (ingredients: string[], forceRefresh?: boolean) => Promise<void>;
  reset: () => void;
  isFromCache: boolean;  // キャッシュから読み込んだか
}

export function useRecipeSearch(initialIngredients?: string[]): UseRecipeSearchReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  /**
   * レシピを検索
   * @param ingredients - 検索する材料のリスト
   * @param forceRefresh - trueの場合、キャッシュを無視して新規取得
   */
  const search = useCallback(async (ingredients: string[], forceRefresh = false) => {
    // 強制再取得の場合はキャッシュをクリア
    if (forceRefresh) {
      clearCache(ingredients);
    }

    // キャッシュチェック
    if (!forceRefresh) {
      const cachedRecipes = getCachedRecipes(ingredients);
      if (cachedRecipes) {
        setRecipes(cachedRecipes);
        setError(null);
        setIsFromCache(true);
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      // API呼び出し（AI + 外部API並列取得）
      const response = await fetch('/api/recipes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();

      if (data.success) {
        const fetchedRecipes = data.data.recipes;
        setRecipes(fetchedRecipes);
        setError(null);

        // キャッシュに保存
        setCachedRecipes(ingredients, fetchedRecipes);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setRecipes([]);
    setIsLoading(false);
    setError(null);
    setIsFromCache(false);
  }, []);

  return { recipes, isLoading, error, search, reset, isFromCache };
}

/**
 * キャッシュキー生成（材料をソートして順序非依存）
 */
function generateCacheKey(ingredients: string[]): string {
  const sortedIngredients = [...ingredients].sort().join(',');
  return `recipes-cache-${sortedIngredients}`;
}

/**
 * キャッシュからレシピを取得
 */
function getCachedRecipes(ingredients: string[]): Recipe[] | null {
  try {
    const cacheKey = generateCacheKey(ingredients);
    const cached = sessionStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
}

/**
 * キャッシュにレシピを保存
 */
function setCachedRecipes(ingredients: string[], recipes: Recipe[]): void {
  try {
    const cacheKey = generateCacheKey(ingredients);
    sessionStorage.setItem(cacheKey, JSON.stringify(recipes));
    // レシピ詳細ページ用のキャッシュも更新
    sessionStorage.setItem('recipes', JSON.stringify(recipes));
  } catch (error) {
    console.error('キャッシュの保存エラー:', error);
  }
}

/**
 * キャッシュをクリア
 */
function clearCache(ingredients: string[]): void {
  try {
    const cacheKey = generateCacheKey(ingredients);
    sessionStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('キャッシュのクリアエラー:', error);
  }
}
```

**使用例**:
```typescript
// レシピ一覧ページ
const { recipes, isLoading, error, search, isFromCache } = useRecipeSearch();

// 通常検索（キャッシュを使用）
useEffect(() => {
  if (ingredients.length > 0) {
    search(ingredients);
  }
}, [ingredients, search]);

// 再生成ボタン（キャッシュをクリアして新規取得）
const handleRefresh = () => {
  search(ingredients, true);
};

// キャッシュインジケーター表示
{isFromCache && (
  <div>💾 キャッシュから読み込み</div>
)}
```

### 6.4 useIngredients.ts
```typescript
export function useIngredients() {
  const [ingredients, setIngredients] = useState<string[]>([]);

  const addIngredient = (ingredient: string) => {
    if (!ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
  };

  const clearIngredients = () => {
    setIngredients([]);
  };

  return { ingredients, addIngredient, removeIngredient, clearIngredients };
}
```

---

## 7. 型定義 (types/recipe.ts)

```typescript
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  servings: number;
  cookTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  instructions: Instruction[];
  imageUrl?: string;
  tags?: string[];
  source: 'ai' | 'api';
}

export interface Ingredient {
  name: string;
  amount: string;
  isAvailable: boolean;
}

export interface Instruction {
  step: number;
  description: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  recipe_id: string;
  recipe_data: Recipe;
  source: 'ai' | 'api';
  created_at: string;
}
```

---

## 8. Context Providers

### 8.1 AuthProvider.tsx
```typescript
'use client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```

### 8.4 useAuth（hooks/useAuth.ts）

**完了状況**: ✅ 実装完了（2025年11月6日）

**役割**: Supabase Authを使用した認証状態管理を提供するカスタムフック

**返却値**:
```typescript
interface UseAuthReturn {
  user: User | null;              // 現在のユーザー情報
  session: Session | null;        // セッション情報
  isLoading: boolean;             // 認証状態の読み込み中フラグ
  isAuthenticated: boolean;       // 認証済みかどうか
  signUp: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signIn: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  signOut: () => Promise<{success: boolean; error?: string}>;
}
```

**主要機能**:
- 初期化時に現在のユーザー情報を取得
- リアルタイムで認証状態の変更を検知（`onAuthStateChange`）
- サインアップ、ログイン、ログアウトのメソッド提供
- Supabaseエラーメッセージの日本語化
- useEffect のクリーンアップ関数でリスナーを適切に解除

**エラーメッセージの日本語化**:
```typescript
"Invalid login credentials" → "メールアドレスまたはパスワードが正しくありません"
"User already registered" → "このメールアドレスは既に登録されています"
"Password should be at least..." → "パスワードは6文字以上である必要があります"
"Email not confirmed" → "メールアドレスが確認されていません"
```

**使用例**:
```typescript
function AuthenticatedApp() {
  const { user, isLoading, isAuthenticated, signIn, signUp, signOut } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <LoginForm onSignIn={signIn} onSignUp={signUp} />;
  }

  return (
    <Dashboard user={user} onSignOut={signOut} />
  );
}
```

---

## 9. パフォーマンス最適化

### 9.1 コンポーネントの最適化
- `React.memo`でレンダリング最適化
- `useMemo`、`useCallback`で不要な再計算を防止
- 画像の遅延読み込み（lazy loading）

### 9.2 コード分割
- 動的インポート（`next/dynamic`）でバンドルサイズ削減
- ルートベースのコード分割（App Router自動対応）

### 9.3 キャッシング
- SWRまたはReact Queryでデータキャッシング（将来検討）
- Next.jsのキャッシュ機能活用

---

## 10. アクセシビリティ

- セマンティックHTML使用
- ARIA属性の適切な設定
- キーボードナビゲーション対応
- カラーコントラスト確保
- スクリーンリーダー対応

---

## 11. レスポンシブデザイン

### ブレークポイント（Tailwind CSS）
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### モバイルファースト設計
- デフォルト: モバイルレイアウト
- `md:`以上でデスクトップレイアウト
- ボトムナビゲーション（モバイル）
- ヘッダーナビゲーション（デスクトップ）

---

**作成日**: 2025年11月1日
**最終更新**: 2025年11月6日
**バージョン**: 1.2
