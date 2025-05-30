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

  const updateAttribute = (key: keyof MouseAttributes, value: any) => {
    const currentAttributes = form.getValues("attributes") || {};
    // "unselected"の場合はundefinedにする
    const processedValue = value === "unselected" ? undefined : value;
    form.setValue("attributes", {
      ...currentAttributes,
      [key]: processedValue,
    });
  };

  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-medium">マウス詳細属性</h3>
      <div className="grid grid-cols-2 gap-4">
        {/* メーカー選択 */}
        <div className="space-y-2 col-span-2">
          <FormLabel>メーカー</FormLabel>
          <Select
            value={attributes.manufacturer || ""}
            onValueChange={(value) => updateAttribute("manufacturer", value || undefined)}
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
        {/* DPI設定 */}
        <div className="space-y-2">
          <FormLabel>最大DPI</FormLabel>
          <Input
            type="number"
            placeholder="25600"
            value={attributes.dpi_max || ""}
            onChange={(e) => updateAttribute("dpi_max", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        
        <div className="space-y-2">
          <FormLabel>最小DPI</FormLabel>
          <Input
            type="number"
            placeholder="100"
            value={attributes.dpi_min || ""}
            onChange={(e) => updateAttribute("dpi_min", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* 重量・寸法 */}
        <div className="space-y-2">
          <FormLabel>重量 (g)</FormLabel>
          <Input
            type="number"
            placeholder="79"
            value={attributes.weight || ""}
            onChange={(e) => updateAttribute("weight", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>ボタン数</FormLabel>
          <Input
            type="number"
            placeholder="5"
            value={attributes.buttons || ""}
            onChange={(e) => updateAttribute("buttons", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        {/* 寸法 */}
        <div className="space-y-2">
          <FormLabel>幅 (mm)</FormLabel>
          <Input
            type="number"
            placeholder="125"
            value={attributes.width || ""}
            onChange={(e) => updateAttribute("width", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>奥行 (mm)</FormLabel>
          <Input
            type="number"
            placeholder="63"
            value={attributes.depth || ""}
            onChange={(e) => updateAttribute("depth", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>高さ (mm)</FormLabel>
          <Input
            type="number"
            placeholder="40"
            value={attributes.height || ""}
            onChange={(e) => updateAttribute("height", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>


        {/* 接続方式 */}
        <div className="space-y-2 col-span-2">
          <FormLabel>接続方式</FormLabel>
          <Select
            value={attributes.connection_type || ""}
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
        <div className="space-y-2 col-span-2">
          <FormLabel>形状</FormLabel>
          <Select
            value={attributes.shape || ""}
            onValueChange={(value) => updateAttribute("shape", value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="形状を選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unselected">未選択</SelectItem>
              <SelectItem value="symmetric">左右対称</SelectItem>
              <SelectItem value="right_handed">右手用</SelectItem>
              <SelectItem value="left_handed">左手用</SelectItem>
              <SelectItem value="ergonomic">エルゴノミクス</SelectItem>
            </SelectContent>
          </Select>
        </div>


        {/* ポーリングレート */}
        <div className="space-y-2 col-span-2">
          <FormLabel>ポーリングレート (Hz)</FormLabel>
          <Input
            placeholder="125,500,1000,8000"
            value={attributes.polling_rate ? attributes.polling_rate.join(",") : ""}
            onChange={(e) => {
              const rates = e.target.value
                .split(",")
                .map(rate => Number(rate.trim()))
                .filter(rate => !isNaN(rate));
              updateAttribute("polling_rate", rates.length > 0 ? rates : undefined);
            }}
          />
          <p className="text-sm text-muted-foreground">
            カンマ区切りで入力してください（例: 125,500,1000,8000）
          </p>
        </div>
      </div>

      {/* チェックボックス項目 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="bluetooth"
            checked={attributes.bluetooth || false}
            onCheckedChange={(checked) => updateAttribute("bluetooth", checked)}
          />
          <label htmlFor="bluetooth" className="text-sm font-medium">
            Bluetooth対応
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="onboard_memory"
            checked={attributes.onboard_memory || false}
            onCheckedChange={(checked) => updateAttribute("onboard_memory", checked)}
          />
          <label htmlFor="onboard_memory" className="text-sm font-medium">
            オンボードメモリ対応
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="wireless_charging"
            checked={attributes.wireless_charging || false}
            onCheckedChange={(checked) => updateAttribute("wireless_charging", checked)}
          />
          <label htmlFor="wireless_charging" className="text-sm font-medium">
            ワイヤレス充電対応
          </label>
        </div>
      </div>
    </div>
  );
}