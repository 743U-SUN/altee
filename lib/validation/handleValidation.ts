import { HandleValidationResult } from "../types/handle";

/**
 * ハンドルが一時的なものかチェック
 */
export function isTemporaryHandle(handle: string | null | undefined): boolean {
  if (!handle) return true;
  return handle.startsWith('temp_');
}

/**
 * ハンドルのバリデーション
 */
export function validateHandle(handle: string): HandleValidationResult {
  // 空文字チェック
  if (!handle.trim()) {
    return {
      isValid: false,
      message: "ハンドルを入力してください"
    };
  }

  // 長さチェック（3-20文字）
  if (handle.length < 3 || handle.length > 20) {
    return {
      isValid: false,
      message: "ハンドルは3文字以上20文字以下で入力してください"
    };
  }

  // 使用可能文字チェック（英数字、アンダースコア、ハイフンのみ）
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validPattern.test(handle)) {
    return {
      isValid: false,
      message: "ハンドルは英数字、アンダースコア（_）、ハイフン（-）のみ使用できます"
    };
  }

  // 最初と最後がアンダースコアまたはハイフンでないかチェック
  if (handle.startsWith('_') || handle.startsWith('-') || handle.endsWith('_') || handle.endsWith('-')) {
    return {
      isValid: false,
      message: "ハンドルの最初と最後にアンダースコアやハイフンは使用できません"
    };
  }

  // 予約語チェック
  const reservedWords = ['admin', 'api', 'app', 'www', 'mail', 'ftp', 'help', 'about', 'contact', 'privacy', 'terms', 'login', 'register', 'signup', 'signin', 'logout', 'user', 'users', 'profile', 'settings', 'dashboard', 'welcome', 'temp'];
  if (reservedWords.includes(handle.toLowerCase())) {
    return {
      isValid: false,
      message: "このハンドルは予約語のため使用できません"
    };
  }

  return {
    isValid: true
  };
}

/**
 * ハンドルの重複チェック（API呼び出し）
 */
export async function checkHandleAvailability(handle: string): Promise<HandleValidationResult> {
  try {
    const response = await fetch(`/api/user/handle/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ handle }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        isValid: false,
        message: data.message || "ハンドルの確認中にエラーが発生しました"
      };
    }

    return {
      isValid: data.available,
      message: data.available ? "使用可能です" : "このハンドルは既に使用されています"
    };
  } catch (error) {
    return {
      isValid: false,
      message: "ハンドルの確認中にエラーが発生しました"
    };
  }
}
