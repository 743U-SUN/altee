/**
 * 日付フォーマット関連のユーティリティ関数
 */

/**
 * 日付を「YYYY年MM月DD日」形式でフォーマットする関数
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/**
 * 日付を「YYYY-MM-DD」形式でフォーマットする関数
 */
export function formatISODate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toISOString().split('T')[0];
}

/**
 * 日付を「YYYY年MM月DD日 HH:MM」形式でフォーマットする関数
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * 相対的な日付表示（〇日前、〇時間前など）を返す関数
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  // 1分未満
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`;
  }
  
  // 1時間未満
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  }
  
  // 24時間未満
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  }
  
  // 30日未満
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}日前`;
  }
  
  // 12ヶ月未満
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}ヶ月前`;
  }
  
  // それ以上
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
}

/**
 * 日付がn日前以内かどうかを判定する関数
 */
export function isWithinDays(date: Date | string, days: number): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  
  return diffInDays <= days;
}

/**
 * 日付が現在より未来かどうかを判定する関数
 */
export function isFutureDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  return d.getTime() > now.getTime();
}