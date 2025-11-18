/**
 * Supabase Client, Auth, and Favorites Helpers
 */

export { supabase } from './client';
export {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  onAuthStateChange,
  resetPassword,
} from './auth';
export type { AuthResult } from './auth';
export {
  getFavorites,
  getFavoriteById,
  getFavoriteByRecipeTitle,
  addFavorite,
  removeFavoriteByRecipeTitle,
  removeFavoriteById,
} from './favorites';
export type { FavoritesResult } from './favorites';
