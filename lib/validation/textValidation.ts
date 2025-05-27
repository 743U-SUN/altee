/**
 * 汎用テキストバリデーション関数
 * 自己紹介文、質問・回答、その他のリッチテキスト入力に対応
 */

// 許可される記号の定数定義
const ALLOWED_SYMBOLS = {
  // 基本的な日本語記号
  japanese: ['・', '。', '、', '！', '？'],
  // 半角記号
  halfWidth: ['!', '?', ':', ',', '"', '/', '@', '#', '$', '%', '&', '*', '(', ')', '+', '=', '[', ']', '{', '}', '|', '\\', '`', '~', '-', '_'],
  // 全角記号
  fullWidth: ['：', '＆', '（', '）', '＋', '＝', '［', '］', '｛', '｝', '｜', '＠', '＃', '＄', '％', '＊', '｀', '～'],
  // 改行文字
  newlines: ['\n', '\r'],
  // スペース
  spaces: [' ', '\u3000'] // 半角・全角スペース
}

// 許可文字をフラット化
export const getAllowedSymbols = (): string[] => {
  return [
    ...ALLOWED_SYMBOLS.japanese,
    ...ALLOWED_SYMBOLS.halfWidth,
    ...ALLOWED_SYMBOLS.fullWidth,
    ...ALLOWED_SYMBOLS.newlines,
    ...ALLOWED_SYMBOLS.spaces
  ]
}

/**
 * 文字が日本語（ひらがな、カタカナ、漢字）かチェック
 */
export const isJapaneseCharacter = (char: string): boolean => {
  const code = char.codePointAt(0)
  if (!code) return false
  
  return (
    // ひらがな
    (code >= 0x3040 && code <= 0x309F) ||
    // カタカナ
    (code >= 0x30A0 && code <= 0x30FF) ||
    // CJK統合漢字
    (code >= 0x4E00 && code <= 0x9FAF) ||
    // CJK拡張A
    (code >= 0x3400 && code <= 0x4DBF) ||
    // CJK拡張B
    (code >= 0x20000 && code <= 0x2EBEF)
  )
}

/**
 * 文字が英数字かチェック
 */
export const isAlphanumeric = (char: string): boolean => {
  return /^[a-zA-Z0-9]$/.test(char)
}

/**
 * 文字が許可されている記号かチェック
 */
export const isAllowedSymbol = (char: string): boolean => {
  return getAllowedSymbols().includes(char)
}

/**
 * リッチテキストの全文字が有効かチェック（改行あり版）
 */
export const validateRichTextCharacters = (text: string): boolean => {
  if (!text) return true // 空文字は許可
  
  for (const char of text) {
    if (
      !isJapaneseCharacter(char) &&
      !isAlphanumeric(char) &&
      !isAllowedSymbol(char)
    ) {
      console.log(`Invalid character detected: "${char}" (U+${char.codePointAt(0)?.toString(16)})`)
      return false
    }
  }
  
  return true
}

/**
 * 基本テキストの全文字が有効かチェック（改行なし版）
 */
export const validateBasicTextCharacters = (text: string): boolean => {
  if (!text) return true // 空文字は許可
  
  for (const char of text) {
    // 改行文字は除外
    if (char === '\n' || char === '\r') {
      return false
    }
    
    if (
      !isJapaneseCharacter(char) &&
      !isAlphanumeric(char) &&
      !isAllowedSymbol(char)
    ) {
      console.log(`Invalid character detected: "${char}" (U+${char.codePointAt(0)?.toString(16)})`)
      return false
    }
  }
  
  return true
}

/**
 * 連続する記号の数をチェック
 */
export const hasConsecutiveSymbols = (text: string, maxCount: number): boolean => {
  if (!text) return false
  
  let consecutiveCount = 0
  let lastCharWasSymbol = false
  
  for (const char of text) {
    const isSymbol = isAllowedSymbol(char) || ['-', '_'].includes(char)
    
    if (isSymbol) {
      if (lastCharWasSymbol) {
        consecutiveCount++
      } else {
        consecutiveCount = 1
      }
      
      if (consecutiveCount >= maxCount) {
        return true
      }
    } else {
      consecutiveCount = 0
    }
    
    lastCharWasSymbol = isSymbol
  }
  
  return false
}

/**
 * デバッグ用：テキスト内の各文字の種類を分析
 */
export const analyzeText = (text: string) => {
  const analysis = {
    totalChars: text.length,
    japanese: 0,
    alphanumeric: 0,
    allowedSymbols: 0,
    newlines: 0,
    invalidChars: [] as string[]
  }
  
  for (const char of text) {
    if (char === '\n' || char === '\r') {
      analysis.newlines++
    } else if (isJapaneseCharacter(char)) {
      analysis.japanese++
    } else if (isAlphanumeric(char)) {
      analysis.alphanumeric++
    } else if (isAllowedSymbol(char)) {
      analysis.allowedSymbols++
    } else {
      analysis.invalidChars.push(char)
    }
  }
  
  return analysis
}

/**
 * サーバーサイド用のサニタイゼーション関数（リッチテキスト用・改行あり）
 * 許可された文字のみを残し、不正な文字を削除
 */
export const sanitizeRichTextInput = (input: string): string => {
  if (!input) return ''
  
  let sanitized = ''
  
  // 1文字ずつチェックして許可された文字のみを残す
  for (const char of input) {
    if (
      isJapaneseCharacter(char) ||
      isAlphanumeric(char) ||
      isAllowedSymbol(char)
    ) {
      sanitized += char
    }
    // 不正な文字は無視して削除
  }
  
  return sanitized
    .replace(/[<>]/g, '') // HTMLタグ文字を削除（念のため）
    .replace(/\n{3,}/g, '\n\n') // 連続した改行を2つまでに制限
    .trim() // 前後の空白を削除
}

/**
 * サーバーサイド用のサニタイゼーション関数（基本テキスト用・改行なし）
 * 許可された文字のみを残し、改行と不正な文字を削除
 */
export const sanitizeBasicTextInput = (input: string): string => {
  if (!input) return ''
  
  let sanitized = ''
  
  // 1文字ずつチェックして許可された文字のみを残す（改行除外）
  for (const char of input) {
    // 改行文字は除外
    if (char === '\n' || char === '\r') {
      continue
    }
    
    if (
      isJapaneseCharacter(char) ||
      isAlphanumeric(char) ||
      isAllowedSymbol(char)
    ) {
      sanitized += char
    }
    // 不正な文字は無視して削除
  }
  
  return sanitized
    .replace(/[<>]/g, '') // HTMLタグ文字を削除（念のため）
    .replace(/\s+/g, ' ') // 連続した空白を単一の空白に
    .trim() // 前後の空白を削除
}
