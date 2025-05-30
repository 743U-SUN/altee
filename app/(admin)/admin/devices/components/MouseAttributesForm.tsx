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
import { MouseAttributes } from "@/types/device";
import { useManufacturers } from "../hooks/useManufacturers";

interface MouseAttributesFormProps {
  form: UseFormReturn<any>;
}

export function MouseAttributesForm({ form }: MouseAttributesFormProps) {
  const attributes = form.watch("attributes") || {};
  const { manufacturers, loading: manufacturersLoading } = useManufacturers();

  const updateAttribute = (key: keyof MouseAttributes | 'manufacturerId', value: any) => {
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
      // マウス固有の属性はmouseオブジェクト内に保存
      const mouseAttributes = currentAttributes.mouse || {};
      form.setValue("attributes", {
        ...currentAttributes,
        mouse: {
          ...mouseAttributes,
          [key]: processedValue,
        },
      });
    }
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-medium">マウス詳細属性</h3>
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
                <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                  {manufacturer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* DPI設定 */}
        <div className="space-y-2">
          <FormLabel>最大DPI</FormLabel>
          <Input
            type="number"
            placeholder="25600"
            value={attributes.mouse?.dpi_max || ""}
            onChange={(e) => updateAttribute("dpi_max", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        
        <div className="space-y-2">
          <FormLabel>最小DPI</FormLabel>
          <Input
            type="number"
            placeholder="100"
            value={attributes.mouse?.dpi_min || ""}
            onChange={(e) => updateAttribute("dpi_min", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* 重量・寸法 */}
        <div className="space-y-2">
          <FormLabel>重量 (g)</FormLabel>
          <Input
            type="number"
            placeholder="79"
            value={attributes.mouse?.weight || ""}
            onChange={(e) => updateAttribute("weight", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>ボタン数</FormLabel>
          <Input
            type="number"
            placeholder="5"
            value={attributes.mouse?.buttons || ""}
            onChange={(e) => updateAttribute("buttons", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* 寸法 */}
        <div className="space-y-2">
          <FormLabel>幅 (mm)</FormLabel>
          <Input
            type="number"
            placeholder="125"
            value={attributes.mouse?.width || ""}
            onChange={(e) => updateAttribute("width", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>奥行 (mm)</FormLabel>
          <Input
            type="number"
            placeholder="63"
            value={attributes.mouse?.length || ""}
            onChange={(e) => updateAttribute("length", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>高さ (mm)</FormLabel>
          <Input
            type="number"
            placeholder="40"
            value={attributes.mouse?.height || ""}
            onChange={(e) => updateAttribute("height", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>


        {/* 接続方式 */}
        <div className="space-y-2 col-span-2">
          <FormLabel>接続方式</FormLabel>
          <Select
            value={attributes.mouse?.connection_type || ""}
            onValueChange={(value) => updateAttribute("connection_type", value || undefined)}
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

        {/* 形状 */}
        {/* ポーリングレート */}
        <div className="space-y-2 col-span-2">
          <FormLabel>ポーリングレート (Hz)</FormLabel>
          <Input
            placeholder="1000"
            value={attributes.mouse?.polling_rate || ""}
            onChange={(e) => updateAttribute("polling_rate", e.target.value ? Number(e.target.value) : undefined)}
          />
          <p className="text-sm text-muted-foreground">
            最大ポーリングレートを入力してください（例: 1000）
          </p>
        </div>

        {/* センサー */}
        <div className="space-y-2 col-span-2">
          <FormLabel>センサー</FormLabel>
          <Input
            placeholder="HERO 25K"
            value={attributes.mouse?.sensor || ""}
            onChange={(e) => updateAttribute("sensor", e.target.value || undefined)}
          />
        </div>

        {/* ソフトウェア */}
        <div className="space-y-2 col-span-2">
          <FormLabel>対応ソフトウェア</FormLabel>
          <Input
            placeholder="Logitech G HUB"
            value={attributes.mouse?.software || ""}
            onChange={(e) => updateAttribute("software", e.target.value || undefined)}
          />
        </div>
      </div>

      {/* チェックボックス項目 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rgb"
            checked={attributes.mouse?.rgb || false}
            onCheckedChange={(checked) => updateAttribute("rgb", checked)}
          />
          <label htmlFor="rgb" className="text-sm font-medium">
            RGB対応
          </label>
        </div>
      </div>
    </div>
  );
}