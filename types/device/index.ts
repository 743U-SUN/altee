// デバイス管理システムの型定義

// カスタム商品データの型定義（JSONフィールド用）
export interface CustomProductData {
  title: string;                    // "ASUS ROG Keris Wireless"
  description?: string;
  imageUrl: string;                 // OGメタデータから取得
  amazonUrl: string;                // 元のURL
  userAffiliateUrl?: string;        // ユーザーのアソシエイトID付きURL
  asin: string;                     // 重複チェック用
  category: string;                 // "mouse", "keyboard"
  attributes?: Record<string, any>; // {"dpi_max": 16000, "weight": 79, ...}
  addedByUserId: string;            // 追加したユーザーID
  potentialForPromotion: boolean;   // 昇格候補フラグ
  createdAt: string;                // ISO文字列
  displayOrder?: number;             // 表示順序（オプション）
}

// 表示用の統一インターフェース
export interface DisplayDevice {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  affiliateUrl: string;            // 表示用リンク（管理者 or ユーザー）
  category: string;
  attributes: Record<string, any>;
  sourceType: 'official' | 'custom';  // バッジ表示用
  note?: string;
  userCount?: number;              // 使用者数（公開版用）
  productId?: number;              // 元のProduct IDを保持（お気に入り機能用）
}

// マウスの属性
export interface MouseAttributes {
  manufacturer?: string;           // メーカー名 (例: "Logicool", "Razer")
  dpi_max?: number;                // 最大DPI (例: 25600)
  dpi_min?: number;                // 最小DPI (例: 100)
  weight?: number;                 // 重量 (g)
  width?: number;                  // 幅 (mm)
  depth?: number;                  // 奥行 (mm)
  height?: number;                 // 高さ (mm)
  polling_rate?: number[];         // ポーリングレート (Hz) [125, 500, 1000, 8000]
  connection_type?: 'wired' | 'wireless' | 'both';  // 接続方式
  buttons?: number;                // ボタン数
  bluetooth?: boolean;             // Bluetooth対応
  onboard_memory?: boolean;        // オンボードメモリ
  wireless_charging?: boolean;     // ワイヤレス充電対応
  shape?: 'symmetric' | 'right_handed' | 'left_handed' | 'ergonomic';  // 形状
}

// キーボードの属性
export interface KeyboardAttributes {
  manufacturer?: string;           // メーカー名 (例: "Logicool", "Razer")
  layout?: 'full' | 'tkl' | '60' | '65' | '75' | '80';  // キーレイアウト
  key_arrangement?: 'jp' | 'us' | 'iso';                 // キー配列
  width?: number;                  // 幅 (mm)
  depth?: number;                  // 奥行 (mm)
  height?: number;                 // 高さ (mm)
  weight?: number;                 // 重量 (g)
  polling_rate?: number[];         // ポーリングレート (Hz)
  switch_type?: 'mechanical' | 'magnetic' | 'optical' | 'capacitive';  // スイッチタイプ
  key_stroke?: number;             // キーストローク (mm)
  actuation_point?: number;        // アクチュエーションポイント (mm)
  rapid_trigger?: boolean;         // Rapid Trigger対応
  rapid_trigger_min?: number;      // Rapid Trigger最小値 (mm)
  connection_type?: 'wired' | 'wireless' | 'both';  // 接続方式
}

// デバイスカテゴリーの定義
export const DEVICE_CATEGORIES = {
  MOUSE: 'mouse',
  KEYBOARD: 'keyboard',
  // 将来の拡張用
  HEADSET: 'headset',
  MICROPHONE: 'microphone',
  MONITOR: 'monitor',
  CAPTURE_BOARD: 'capture_board',
  STREAM_DECK: 'stream_deck',
  CHAIR: 'chair',
  DESK: 'desk'
} as const;

export type DeviceCategory = typeof DEVICE_CATEGORIES[keyof typeof DEVICE_CATEGORIES];

// 現在実装されているカテゴリー（Phase 1）
export const IMPLEMENTED_CATEGORIES: DeviceCategory[] = [
  DEVICE_CATEGORIES.MOUSE,
  DEVICE_CATEGORIES.KEYBOARD
];

// Amazon関連の型定義
export interface OGProductInfo {
  title: string;
  description?: string;
  imageUrl: string;
  price?: string;
  asin: string;
}

// 昇格候補の型定義
export interface PromotionCandidate {
  asin: string;
  title: string;
  imageUrl: string;
  userCount: number;              // 何人が追加しているか
  devices: Array<{
    id: number;
    userId: string;
    customData: CustomProductData;
    createdAt: Date;
  }>;
}
