/**
 * ハンドルとして使用できない予約語の定義
 * カテゴリ別に管理し、追加・削除を容易にする
 */

/**
 * システム関連の予約語
 * サーバーやインフラ関連のキーワード
 */
export const SYSTEM_RESERVED_WORDS = [
  'admin',
  'api',
  'app',
  'www',
  'mail',
  'ftp',
  'cdn',
  'assets',
  'static',
  'public',
  'private'
] as const;

/**
 * ページ関連の予約語
 * 一般的なWebサイトのページ名
 */
export const PAGE_RESERVED_WORDS = [
  'help',
  'about',
  'contact',
  'privacy',
  'terms',
  'support',
  'blog',
  'news',
  'faq',
  'docs',
  'documentation'
] as const;

/**
 * 認証関連の予約語
 * ログインや認証機能に関するキーワード
 */
export const AUTH_RESERVED_WORDS = [
  'login',
  'register',
  'signup',
  'signin',
  'logout',
  'signout',
  'auth',
  'oauth',
  'callback'
] as const;

/**
 * ユーザー関連の予約語
 * ユーザー機能に関するキーワード
 */
export const USER_RESERVED_WORDS = [
  'user',
  'users',
  'profile',
  'account',
  'settings',
  'preferences',
  'config',
  'dashboard'
] as const;

/**
 * アプリ機能関連の予約語
 * アプリケーション固有の機能に関するキーワード
 */
export const APP_RESERVED_WORDS = [
  'welcome',
  'home',
  'search',
  'explore',
  'trending',
  'popular',
  'featured'
] as const;

/**
 * 内部処理関連の予約語
 * システム内部で使用される特別なキーワード
 */
export const INTERNAL_RESERVED_WORDS = [
  'temp',
  'test',
  'demo',
  'example',
  'sample',
  'null',
  'undefined',
  'error',
  'debug'
] as const;

/**
 * すべての予約語を統合した配列
 * 新しいカテゴリを追加した場合は、ここにも追加すること
 */
export const ALL_RESERVED_WORDS = [
  ...SYSTEM_RESERVED_WORDS,
  ...PAGE_RESERVED_WORDS,
  ...AUTH_RESERVED_WORDS,
  ...USER_RESERVED_WORDS,
  ...APP_RESERVED_WORDS,
  ...INTERNAL_RESERVED_WORDS
] as const;

/**
 * 予約語かどうかをチェックする関数
 * @param handle チェック対象のハンドル（小文字で渡すこと）
 * @returns 予約語の場合true
 */
export function isReservedWord(handle: string): boolean {
  return ALL_RESERVED_WORDS.includes(handle as any);
}

/**
 * 予約語の種類を返す関数（デバッグやログ用）
 * @param handle チェック対象のハンドル（小文字で渡すこと）
 * @returns 予約語のカテゴリ名、予約語でない場合はnull
 */
export function getReservedWordCategory(handle: string): string | null {
  if (SYSTEM_RESERVED_WORDS.includes(handle as any)) return 'SYSTEM';
  if (PAGE_RESERVED_WORDS.includes(handle as any)) return 'PAGE';
  if (AUTH_RESERVED_WORDS.includes(handle as any)) return 'AUTH';
  if (USER_RESERVED_WORDS.includes(handle as any)) return 'USER';
  if (APP_RESERVED_WORDS.includes(handle as any)) return 'APP';
  if (INTERNAL_RESERVED_WORDS.includes(handle as any)) return 'INTERNAL';
  return null;
}
