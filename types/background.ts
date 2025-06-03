export type BackgroundType = "solid" | "pattern";

export type PageType = "home" | "device" | "info" | "video";

export type PatternType = 
  | "dots" 
  | "stripes-vertical"
  | "stripes-horizontal"
  | "stripes-diagonal"
  | "stripes-diagonal-reverse"
  | "geometric"
  | "grid"
  | "grid-bold";


export interface UserPageBackground {
  id: string;
  userId: string;
  pageType: PageType;
  backgroundType: BackgroundType;
  backgroundColor: string;
  patternType?: PatternType | null;
  patternColor: string;
  patternOpacity: number;
  patternSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BackgroundSettings {
  backgroundType: BackgroundType;
  backgroundColor: string;
  patternType?: PatternType;
  patternColor?: string;
  patternOpacity?: number;
  patternSize?: number;
}

export const PATTERN_TYPES: Record<PatternType, string> = {
  "dots": "ドット",
  "stripes-vertical": "ストライプ（縦）",
  "stripes-horizontal": "ストライプ（横）",
  "stripes-diagonal": "ストライプ（斜め）",
  "stripes-diagonal-reverse": "ストライプ（逆斜め）",
  "geometric": "幾何学模様",
  "grid": "格子状",
  "grid-bold": "格子状（太）"
};

