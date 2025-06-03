"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { updateUserPageBackground, getUserPageBackground } from "@/lib/actions/background-actions";
import type { BackgroundType, PatternType, PageType } from "@/types/background";
import { PATTERN_TYPES } from "@/types/background";

// パターンスタイルを動的に生成
function getPatternStyle(patternType: PatternType, size: number) {
  const baseSize = size * 10; // 基本サイズ
  
  switch (patternType) {
    case "dots":
      return {
        backgroundImage: `radial-gradient(circle, currentColor ${size}px, transparent ${size}px)`,
        backgroundSize: `${baseSize}px ${baseSize}px`
      };
    case "stripes-vertical":
      return {
        backgroundImage: `repeating-linear-gradient(
          90deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize}px
        )`
      };
    case "stripes-horizontal":
      return {
        backgroundImage: `repeating-linear-gradient(
          0deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize}px
        )`
      };
    case "stripes-diagonal":
      return {
        backgroundImage: `repeating-linear-gradient(
          45deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize * 1.414}px
        )`
      };
    case "stripes-diagonal-reverse":
      return {
        backgroundImage: `repeating-linear-gradient(
          -45deg,
          currentColor,
          currentColor ${size * 2}px,
          transparent ${size * 2}px,
          transparent ${baseSize * 1.414}px
        )`
      };
    case "geometric":
      return {
        backgroundImage: `
          linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor),
          linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 75%, currentColor 75%, currentColor)
        `,
        backgroundSize: `${baseSize * 2}px ${baseSize * 2}px`,
        backgroundPosition: `0 0, ${baseSize}px ${baseSize}px`
      };
    case "grid":
      return {
        backgroundImage: `
          linear-gradient(currentColor 1px, transparent 1px),
          linear-gradient(90deg, currentColor 1px, transparent 1px)
        `,
        backgroundSize: `${baseSize * 2}px ${baseSize * 2}px`
      };
    case "grid-bold":
      return {
        backgroundImage: `
          linear-gradient(currentColor ${size * 10}px, transparent ${size * 10}px),
          linear-gradient(90deg, currentColor ${size * 10}px, transparent ${size * 10}px)
        `,
        backgroundSize: `${baseSize * 4}px ${baseSize * 4}px`
      };
    default:
      return {};
  }
}

interface BackgroundSettingsProps {
  pageType?: PageType;
}

export function BackgroundSettings({ pageType = "home" }: BackgroundSettingsProps) {
  const { data: session } = useSession();
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("solid");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [patternType, setPatternType] = useState<PatternType>("dots");
  const [patternColor, setPatternColor] = useState("#000000");
  const [patternOpacity, setPatternOpacity] = useState(0.1);
  const [patternSize, setPatternSize] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 既存の設定を読み込む
  useEffect(() => {
    const loadSettings = async () => {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const background = await getUserPageBackground(session.user.id, pageType);
        if (background) {
          setBackgroundType(background.backgroundType as BackgroundType);
          setBackgroundColor(background.backgroundColor);
          if (background.patternType) {
            setPatternType(background.patternType as PatternType);
          }
          setPatternColor(background.patternColor);
          setPatternOpacity(background.patternOpacity);
          setPatternSize(background.patternSize || 1.0);
        }
      } catch (error) {
        console.error("Failed to load background settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [session?.user?.id, pageType]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    setIsSaving(true);
    try {
      await updateUserPageBackground(pageType, {
        backgroundType,
        backgroundColor,
        patternType: backgroundType === "pattern" ? patternType : undefined,
        patternColor: backgroundType === "pattern" ? patternColor : undefined,
        patternOpacity: backgroundType === "pattern" ? patternOpacity : undefined,
        patternSize: backgroundType === "pattern" ? patternSize : undefined
      });
      toast.success("背景設定を保存しました");
    } catch (error) {
      console.error("Failed to save background settings:", error);
      toast.error("背景設定の保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return <div className="py-4">読み込み中...</div>;
  }

  return (
    <div className="py-4">
      <p className="text-gray-600 mb-6">
        プロフィールページの背景を設定します。無地またはパターンから選択できます。
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左カラム：設定 */}
        <div className="space-y-6">
          {/* 背景タイプ選択 */}
          <div className="space-y-3">
            <Label>背景タイプ</Label>
            <RadioGroup value={backgroundType} onValueChange={(value) => setBackgroundType(value as BackgroundType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solid" id="solid" />
                <Label htmlFor="solid">無地</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pattern" id="pattern" />
                <Label htmlFor="pattern">パターン</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 背景色選択 */}
          <div className="space-y-3">
            <Label>背景色</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                    setBackgroundColor(value);
                  }
                }}
                placeholder="#ffffff"
                className="flex-1"
                maxLength={7}
              />
            </div>
          </div>

          {/* パターン設定 */}
          {backgroundType === "pattern" && (
            <>
              <div className="space-y-3">
                <Label>パターンタイプ</Label>
                <Select value={patternType} onValueChange={(value) => setPatternType(value as PatternType)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="パターンを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PATTERN_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>パターン色</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={patternColor}
                    onChange={(e) => setPatternColor(e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={patternColor}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setPatternColor(value);
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1"
                    maxLength={7}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* 右カラム：プレビューと調整 */}
        <div className="space-y-6">
          {/* プレビュー */}
          <div className="space-y-3">
            <Label>プレビュー</Label>
            <div
              className="h-64 rounded-lg border relative overflow-hidden"
              style={{
                backgroundColor
              }}
            >
              {backgroundType === "pattern" && (
                <div
                  className="absolute inset-0"
                  style={{
                    color: `${patternColor}${Math.round(patternOpacity * 255).toString(16).padStart(2, '0')}`,
                    ...getPatternStyle(patternType, patternSize)
                  }}
                />
              )}
              <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-sm">
                {backgroundType === "solid" ? "無地" : "パターン"}: {backgroundColor}
              </div>
            </div>
          </div>

          {/* パターン調整 */}
          {backgroundType === "pattern" && (
            <>
              <div className="space-y-3">
                <Label>パターンの透明度: {Math.round(patternOpacity * 100)}%</Label>
                <Slider
                  value={[patternOpacity]}
                  onValueChange={([value]) => setPatternOpacity(value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-3">
                <Label>
                  パターンのサイズ: {patternSize.toFixed(1)}x
                  {patternType === "dots" && ` (ドットサイズ: ${Math.round(patternSize * 2)}px)`}
                  {patternType?.includes("stripes") && ` (ストライプ幅: ${Math.round(patternSize * 2)}px)`}
                </Label>
                <Slider
                  value={[patternSize]}
                  onValueChange={([value]) => setPatternSize(value)}
                  min={0.5}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>
            </>
          )}

          {/* 保存ボタン */}
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? "保存中..." : "背景設定を保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
