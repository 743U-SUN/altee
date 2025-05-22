/**
 * セキュリティ関連のユーティリティ関数
 * XSS対策、入力値のサニタイゼーション、バリデーションなど
 */

// HTMLエスケープ関数
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// 入力値のサニタイゼーション（より厳密）
export const sanitizeUserInput = (input: string): string => {
  return input
    .trim() // 前後の空白を削除
    .replace(/[\x00-\x1F\x7F]/g, '') // 制御文字を削除
    .replace(/[<>]/g, '') // HTMLタグ文字を削除
    .replace(/[^\p{L}\p{N}\s\-_。、！？]/gu, '') // 許可された文字のみ残す
    .replace(/\s+/g, ' ') // 連続した空白を単一の空白に
    .slice(0, 200) // 最大長制限
}

// 危険なパターンの検出
export const containsDangerousPatterns = (input: string): boolean => {
  const dangerousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:/gi,
    /on\w+\s*=/gi, // onclick, onload など
    /<iframe[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /<link[\s\S]*?>/gi,
    /<meta[\s\S]*?>/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /@import/gi,
  ]
  
  return dangerousPatterns.some(pattern => pattern.test(input))
}

// ユーザー名・表示名用の特別なサニタイゼーション
export const sanitizeDisplayName = (name: string): string => {
  return name
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // 制御文字を削除
    .replace(/[<>]/g, '') // HTMLタグ文字を削除
    .replace(/[^\p{L}\p{N}\s\-_。、！？]/gu, '') // より制限的な文字セット
    .replace(/\s+/g, ' ') // 連続した空白を単一の空白に
    .slice(0, 50) // 名前用の長さ制限
}

// レート制限用のシンプルなメモリストア
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// レート制限チェック（分あたりのリクエスト数制限）
export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): boolean => {
  const now = Date.now()
  const userRequests = requestCounts.get(identifier)
  
  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (userRequests.count >= maxRequests) {
    return false
  }
  
  userRequests.count++
  return true
}

// セキュアなランダム文字列生成
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// CSRFトークンの検証（簡易版）
export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  // 実際の実装では、より厳密なCSRFトークン検証を行う
  return token === sessionToken
}
