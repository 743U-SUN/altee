"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { KeyboardAttributes } from "@/types/device";
import { useManufacturers } from "../hooks/useManufacturers";

interface KeyboardAttributesFormProps {
  form: UseFormReturn<any>;
}

export function KeyboardAttributesForm({ form }: KeyboardAttributesFormProps) {
  const attributes = form.watch("attributes") || {};
  const { manufacturers, loading: manufacturersLoading } = useManufacturers();

  const updateAttribute = (key: keyof KeyboardAttributes | 'manufacturerId', value: any) => {
    const currentAttributes = form.getValues("attributes") || {};
    // "unselected"の場合はundefinedにする
    const processedValue = value === "unselected" ? undefined : value;
    
    if (key === 'manufacturerId') {
      // メーカーIDは最上位レベルに保存
      form.setValue("attributes", {
        ...currentAttributes,
        manufacturerId: processedValue,
      });
    } else {
      // キーボード固有の属性はkeyboardオブジェクト内に保存
      const keyboardAttributes = currentAttributes.keyboard || {};
      form.setValue("attributes", {
        ...currentAttributes,
        keyboard: {
          ...keyboardAttributes,
          [key]: processedValue,
        },
      });
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-medium">キーボード詳細属性</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* メーカー選択 */}
        <div className="space-y-2 col-span-2">
          <FormLabel>メーカー</FormLabel>
          <Select
            value={attributes.manufacturerId || ""}
            onValueChange={(value) => updateAttribute("manufacturerId", value || undefined)}
            disabled={manufacturersLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={manufacturersLoading ? "読み込み中..." : "メーカーを選択"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unselected">未選択</SelectItem>
              {manufacturers.map((manufacturer) => (
                <SelectItem key={manufacturer.id} value={manufacturer.name}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* レイアウト・配列 */}
        <div className="space-y-2">
          <FormLabel>キーレイアウト</FormLabel>
          <Select
            value={attributes.keyboard?.layout || ""}
            onValueChange={(value) => updateAttribute("layout", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="レイアウトを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unselected">未選択</SelectItem>
              <SelectItem value="full">フルサイズ</SelectItem>
              <SelectItem value="tkl">テンキーレス (TKL)</SelectItem>
              <SelectItem value="60">60%</SelectItem>
              <SelectItem value="65">65%</SelectItem>
              <SelectItem value="75">75%</SelectItem>
              <SelectItem value="80">80%</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FormLabel>キー配列</FormLabel>
          <Select
            value={attributes.keyboard?.keyArrangement || ""}
            onValueChange={(value) => updateAttribute("keyArrangement", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="配列を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unselected">未選択</SelectItem>
              <SelectItem value="jp">日本語 (JIS)</SelectItem>
              <SelectItem value="us">英語 (US)</SelectItem>
              <SelectItem value="iso">ISO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* スイッチタイプ */}
        <div className="space-y-2">
          <FormLabel>スイッチタイプ</FormLabel>
          <Select
            value={attributes.keyboard?.switchType || ""}
            onValueChange={(value) => updateAttribute("switchType", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="スイッチを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unselected">未選択</SelectItem>
              <SelectItem value="mechanical">メカニカル</SelectItem>
              <SelectItem value="magnetic">マグネティック</SelectItem>
              <SelectItem value="optical">光学式</SelectItem>
              <SelectItem value="capacitive">静電容量無接点</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 接続方式 */}
        <div className="space-y-2">
          <FormLabel>接続方式</FormLabel>
          <Select
            value={attributes.keyboard?.connectionType || ""}
            onValueChange={(value) => updateAttribute("connectionType", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="接続方式を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unselected">未選択</SelectItem>
              <SelectItem value="wired">有線</SelectItem>
              <SelectItem value="wireless">ワイヤレス</SelectItem>
              <SelectItem value="both">有線・ワイヤレス両対応</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 寸法・重量 */}
        <div className="space-y-2">
          <FormLabel>幅 (mm)</FormLabel>
          <Input
            type="number"
            placeholder="360"
            value={attributes.keyboard?.width || ""}
            onChange={(e) => updateAttribute("width", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>奥行 (mm)</FormLabel>
          <Input
            type="number"
            placeholder="150"
            value={attributes.keyboard?.depth || ""}
            onChange={(e) => updateAttribute("depth", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>高さ (mm)</FormLabel>
          <Input
            type="number"
            placeholder="40"
            value={attributes.keyboard?.height || ""}
            onChange={(e) => updateAttribute("height", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>重量 (g)</FormLabel>
          <Input
            type="number"
            placeholder="800"
            value={attributes.keyboard?.weight || ""}
            onChange={(e) => updateAttribute("weight", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* キーストローク関連 */}
        <div className="space-y-2">
          <FormLabel>キーストローク (mm)</FormLabel>
          <Input
            type="number"
            step="0.1"
            placeholder="4.0"
            value={attributes.keyboard?.keyStroke || ""}
            onChange={(e) => updateAttribute("keyStroke", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>アクチュエーションポイント (mm)</FormLabel>
          <Input
            type="number"
            step="0.1"
            placeholder="2.0"
            value={attributes.keyboard?.actuationPoint || ""}
            onChange={(e) => updateAttribute("actuationPoint", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* Rapid Trigger関連 */}
        <div className="space-y-2 col-span-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rapidTrigger"
              checked={attributes.keyboard?.rapidTrigger || false}
              onCheckedChange={(checked) => updateAttribute("rapidTrigger", checked)}
            />
            <label htmlFor="rapidTrigger" className="text-sm font-medium">
              Rapid Trigger対応
            </label>
          </div>
        </div>

        {attributes.keyboard?.rapidTrigger && (
          <div className="space-y-2 col-span-2">
            <FormLabel>Rapid Trigger最小値 (mm)</FormLabel>
            <Input
              type="number"
              step="0.1"
              placeholder="0.1"
              value={attributes.keyboard?.rapidTriggerMin || ""}
              onChange={(e) => updateAttribute("rapidTriggerMin", e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
        )}

        {/* ポーリングレート */}
        <div className="space-y-2 col-span-2">
          <FormLabel>ポーリングレート (Hz)</FormLabel>
          <Input
            placeholder="125,500,1000,8000"
            value={attributes.keyboard?.pollingRate ? attributes.keyboard.pollingRate.join(",") : ""}
            onChange={(e) => {
              const rates = e.target.value
                .split(",")
                .map(rate => Number(rate.trim()))
                .filter(rate => !isNaN(rate));
              updateAttribute("pollingRate", rates.length > 0 ? rates : undefined);
            }}
          />
          <p className="text-sm text-muted-foreground">
            カンマ区切りで入力してください（例: 125,500,1000,8000）
          </p>
        </div>
      </div>
    </div>
  );
}