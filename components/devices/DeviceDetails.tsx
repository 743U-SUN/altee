import { MouseAttributes, KeyboardAttributes } from "@/types/device";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Wifi, 
  Cable, 
  Gauge, 
  Weight, 
  Ruler, 
  MousePointer2, 
  Keyboard,
  Zap,
  Battery,
  Settings2,
  Cpu
} from "lucide-react";

interface DeviceDetailsProps {
  category: string;
  attributes: Record<string, any>;
}

// 属性のラベルマッピング
const attributeLabels: Record<string, { label: string; icon?: any; unit?: string }> = {
  // マウス属性
  dpi_max: { label: "最大DPI", icon: Gauge },
  dpi_min: { label: "最小DPI", icon: Gauge },
  weight: { label: "重量", icon: Weight, unit: "g" },
  width: { label: "幅", icon: Ruler, unit: "mm" },
  depth: { label: "奥行", icon: Ruler, unit: "mm" },
  height: { label: "高さ", icon: Ruler, unit: "mm" },
  polling_rate: { label: "ポーリングレート", icon: Zap, unit: "Hz" },
  connection_type: { label: "接続方式", icon: Wifi },
  sensor_type: { label: "センサー", icon: Cpu },
  buttons: { label: "ボタン数", icon: MousePointer2 },
  programmable_buttons: { label: "プログラマブルボタン数", icon: Settings2 },
  onboard_memory: { label: "オンボードメモリ", icon: Cpu },
  wireless_charging: { label: "ワイヤレス充電", icon: Battery },
  shape: { label: "形状" },
  
  // キーボード属性
  layout: { label: "レイアウト", icon: Keyboard },
  key_arrangement: { label: "キー配列", icon: Keyboard },
  switch_type: { label: "スイッチタイプ", icon: Settings2 },
  key_stroke: { label: "キーストローク", icon: Ruler, unit: "mm" },
  actuation_point: { label: "アクチュエーションポイント", icon: Ruler, unit: "mm" },
  rapid_trigger: { label: "Rapid Trigger", icon: Zap },
  rapid_trigger_min: { label: "Rapid Trigger最小値", icon: Zap, unit: "mm" },
};

// 値のフォーマット
const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return "-";
  
  // 配列の場合
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  
  // ブール値の場合
  if (typeof value === "boolean") {
    return value ? "対応" : "非対応";
  }
  
  // 接続方式の場合
  if (key === "connection_type") {
    const types: Record<string, string> = {
      wired: "有線",
      wireless: "無線",
      both: "有線/無線両対応"
    };
    return types[value] || value;
  }
  
  // 形状の場合
  if (key === "shape") {
    const shapes: Record<string, string> = {
      symmetric: "左右対称",
      right_handed: "右手用",
      left_handed: "左手用",
      ergonomic: "エルゴノミック"
    };
    return shapes[value] || value;
  }
  
  // レイアウトの場合
  if (key === "layout") {
    const layouts: Record<string, string> = {
      full: "フルサイズ",
      tkl: "テンキーレス",
      "60": "60%",
      "65": "65%",
      "75": "75%",
      "80": "80%"
    };
    return layouts[value] || value;
  }
  
  // キー配列の場合
  if (key === "key_arrangement") {
    const arrangements: Record<string, string> = {
      jp: "日本語配列",
      us: "英語配列",
      iso: "ISO配列"
    };
    return arrangements[value] || value;
  }
  
  // スイッチタイプの場合
  if (key === "switch_type") {
    const types: Record<string, string> = {
      mechanical: "メカニカル",
      magnetic: "磁気",
      optical: "光学",
      capacitive: "静電容量"
    };
    return types[value] || value;
  }
  
  return String(value);
};

// 属性をグループ化
const groupAttributes = (attributes: Record<string, any>, category: string) => {
  const groups: Record<string, Array<{ key: string; value: any }>> = {
    main: [],
    specs: [],
    features: []
  };
  
  if (category === "mouse") {
    const mainKeys = ["dpi_max", "connection_type", "sensor_type"];
    const specKeys = ["weight", "width", "depth", "height", "buttons", "programmable_buttons"];
    const featureKeys = ["polling_rate", "onboard_memory", "wireless_charging", "shape"];
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (mainKeys.includes(key)) {
        groups.main.push({ key, value });
      } else if (specKeys.includes(key)) {
        groups.specs.push({ key, value });
      } else if (featureKeys.includes(key)) {
        groups.features.push({ key, value });
      }
    });
  } else if (category === "keyboard") {
    const mainKeys = ["layout", "key_arrangement", "switch_type"];
    const specKeys = ["width", "depth", "height", "weight", "key_stroke", "actuation_point"];
    const featureKeys = ["polling_rate", "rapid_trigger", "rapid_trigger_min", "connection_type"];
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (mainKeys.includes(key)) {
        groups.main.push({ key, value });
      } else if (specKeys.includes(key)) {
        groups.specs.push({ key, value });
      } else if (featureKeys.includes(key)) {
        groups.features.push({ key, value });
      }
    });
  }
  
  return groups;
};

export function DeviceDetails({ category, attributes }: DeviceDetailsProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            詳細情報は登録されていません
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const groups = groupAttributes(attributes, category);
  
  return (
    <div className="space-y-4">
      {/* 主要スペック */}
      {groups.main.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">主要スペック</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groups.main.map(({ key, value }) => {
              const config = attributeLabels[key];
              const Icon = config?.icon;
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{config?.label || key}</span>
                  </div>
                  <span className="text-sm">
                    {formatValue(key, value)}
                    {config?.unit && value !== "-" && ` ${config.unit}`}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      
      {/* 詳細スペック */}
      {groups.specs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">詳細スペック</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groups.specs.map(({ key, value }) => {
              const config = attributeLabels[key];
              const Icon = config?.icon;
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{config?.label || key}</span>
                  </div>
                  <span className="text-sm">
                    {formatValue(key, value)}
                    {config?.unit && value !== "-" && ` ${config.unit}`}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      
      {/* 機能 */}
      {groups.features.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">機能</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {groups.features.map(({ key, value }) => {
              const config = attributeLabels[key];
              const Icon = config?.icon;
              
              return (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="text-sm font-medium">{config?.label || key}</span>
                  </div>
                  <span className="text-sm">
                    {formatValue(key, value)}
                    {config?.unit && value !== "-" && ` ${config.unit}`}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
