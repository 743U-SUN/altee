import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 既存のユーティリティ関数があればそれらを維持
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
