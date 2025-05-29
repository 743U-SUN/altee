"use client";

import { useState } from "react";
import { DisplayDevice } from "@/types/device";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import { X, Scale } from "lucide-react";
import { DeviceIcon } from "./DeviceIcon";

interface DeviceComparisonProps {
  devices: DisplayDevice[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 属性のラベルマッピング（DeviceDetailsと共通化できるが、一旦ここに定義）
const attributeLabels: Record<string, string> = {
  // マウス属性
  dpi_max: "最大DPI",
  dpi_min: "最小DPI",
  weight: "重量",
  width: "幅",
  depth: "奥行",
  height: "高さ",
  polling_rate: "ポーリングレート",
  connection_type: "接続方式",
  sensor_type: "センサー",
  buttons: "ボタン数",
  programmable_buttons: "プログラマブルボタン数",
  onboard_memory: "オンボードメモリ",
  wireless_charging: "ワイヤレス充電",
  shape: "形状",
  
  // キーボード属性
  layout: "レイアウト",
  key_arrangement: "キー配列",
  switch_type: "スイッチタイプ",
  key_stroke: "キーストローク",
  actuation_point: "アクチュエーションポイント",
  rapid_trigger: "Rapid Trigger",
  rapid_trigger_min: "Rapid Trigger最小値",
};

// 値のフォーマット（DeviceDetailsと同じロジック）
const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";
  
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  
  if (typeof value === "boolean") {
    return value ? "対応" : "非対応";
  }
  
  // 各種マッピング
  const mappings: Record<string, Record<string, string>> = {
    connection_type: {
      wired: "有線",
      wireless: "無線",
      both: "有線/無線両対応"
    },
    shape: {
      symmetric: "左右対称",
      right_handed: "右手用",
      left_handed: "左手用",
      ergonomic: "エルゴノミック"
    },
    layout: {
      full: "フルサイズ",
      tkl: "テンキーレス",
      "60": "60%",
      "65": "65%",
      "75": "75%",
      "80": "80%"
    },
    key_arrangement: {
      jp: "日本語配列",
      us: "英語配列",
      iso: "ISO配列"
    },
    switch_type: {
      mechanical: "メカニカル",
      magnetic: "磁気",
      optical: "光学",
      capacitive: "静電容量"
    }
  };
  
  if (mappings[key] && mappings[key][value]) {
    return mappings[key][value];
  }
  
  return String(value);
};

// 単位の取得
const getUnit = (key: string): string => {
  const units: Record<string, string> = {
    dpi_max: "",
    dpi_min: "",
    weight: "g",
    width: "mm",
    depth: "mm",
    height: "mm",
    polling_rate: "Hz",
    key_stroke: "mm",
    actuation_point: "mm",
    rapid_trigger_min: "mm",
  };
  return units[key] || "";
};

export function DeviceComparison({ devices, open, onOpenChange }: DeviceComparisonProps) {
  if (devices.length === 0) {
    return null;
  }

  // すべての属性キーを収集
  const allAttributeKeys = new Set<string>();
  devices.forEach(device => {
    Object.keys(device.attributes || {}).forEach(key => {
      allAttributeKeys.add(key);
    });
  });

  const attributeKeys = Array.from(allAttributeKeys).sort();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>デバイス比較</DialogTitle>
          <DialogDescription>
            選択したデバイスのスペックを比較します
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 z-10 bg-background w-[200px]">
                    項目
                  </TableHead>
                  {devices.map((device) => (
                    <TableHead key={device.id} className="min-w-[200px]">
                      <div className="space-y-2">
                        <div className="aspect-square relative w-16 h-16 mx-auto bg-muted rounded">
                          <Image
                            src={device.imageUrl}
                            alt={device.title}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-sm line-clamp-2">
                            {device.title}
                          </p>
                          <Badge 
                            variant={device.sourceType === "official" ? "default" : "secondary"}
                            className="mt-1"
                          >
                            {device.sourceType === "official" ? "公式" : "カスタム"}
                          </Badge>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* カテゴリ */}
                <TableRow>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    カテゴリ
                  </TableCell>
                  {devices.map((device) => (
                    <TableCell key={device.id}>
                      <div className="flex items-center gap-2">
                        <DeviceIcon category={device.category} className="h-4 w-4" />
                        <span className="capitalize">{device.category}</span>
                      </div>
                    </TableCell>
                  ))}
                </TableRow>

                {/* 属性 */}
                {attributeKeys.map((key) => {
                  const label = attributeLabels[key] || key;
                  const unit = getUnit(key);
                  
                  return (
                    <TableRow key={key}>
                      <TableCell className="sticky left-0 z-10 bg-background font-medium">
                        {label}
                      </TableCell>
                      {devices.map((device) => {
                        const value = device.attributes?.[key];
                        const formattedValue = formatValue(key, value);
                        
                        return (
                          <TableCell key={device.id}>
                            {formattedValue}
                            {unit && formattedValue !== "-" && ` ${unit}`}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}

                {/* 購入リンク */}
                <TableRow>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    購入リンク
                  </TableCell>
                  {devices.map((device) => (
                    <TableCell key={device.id}>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <a
                          href={device.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Amazonで見る
                        </a>
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
