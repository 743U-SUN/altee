/**
 * デバイス属性表示コンポーネント
 */

import { MouseAttributes, KeyboardAttributes } from '@/types/device';

interface DeviceAttributesProps {
  category: string;
  attributes: Record<string, any>;
  className?: string;
}

export function DeviceAttributes({ category, attributes, className = '' }: DeviceAttributesProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null;
  }

  const renderMouseAttributes = (attrs: MouseAttributes) => {
    return (
      <div className={`grid grid-cols-2 gap-2 text-sm ${className}`}>
        {attrs.dpi_max && (
          <div>
            <span className="text-muted-foreground">最大DPI:</span>{' '}
            <span className="font-medium">{attrs.dpi_max}</span>
          </div>
        )}
        {attrs.weight && (
          <div>
            <span className="text-muted-foreground">重量:</span>{' '}
            <span className="font-medium">{attrs.weight}g</span>
          </div>
        )}
        {attrs.connection_type && (
          <div>
            <span className="text-muted-foreground">接続:</span>{' '}
            <span className="font-medium">
              {attrs.connection_type === 'wireless' ? 'ワイヤレス' : 
               attrs.connection_type === 'wired' ? '有線' : '両対応'}
            </span>
          </div>
        )}
        {attrs.buttons && (
          <div>
            <span className="text-muted-foreground">ボタン数:</span>{' '}
            <span className="font-medium">{attrs.buttons}</span>
          </div>
        )}
        {attrs.sensor_type && (
          <div className="col-span-2">
            <span className="text-muted-foreground">センサー:</span>{' '}
            <span className="font-medium">{attrs.sensor_type}</span>
          </div>
        )}
      </div>
    );
  };

  const renderKeyboardAttributes = (attrs: KeyboardAttributes) => {
    const layoutNames: Record<string, string> = {
      'full': 'フルサイズ',
      'tkl': 'テンキーレス',
      '60': '60%',
      '65': '65%',
      '75': '75%',
      '80': '80%',
    };

    const switchTypeNames: Record<string, string> = {
      'mechanical': 'メカニカル',
      'magnetic': '磁気',
      'optical': '光学',
      'capacitive': '静電容量',
    };

    return (
      <div className={`grid grid-cols-2 gap-2 text-sm ${className}`}>
        {attrs.layout && (
          <div>
            <span className="text-muted-foreground">レイアウト:</span>{' '}
            <span className="font-medium">{layoutNames[attrs.layout] || attrs.layout}</span>
          </div>
        )}
        {attrs.switch_type && (
          <div>
            <span className="text-muted-foreground">スイッチ:</span>{' '}
            <span className="font-medium">{switchTypeNames[attrs.switch_type] || attrs.switch_type}</span>
          </div>
        )}
        {attrs.connection_type && (
          <div>
            <span className="text-muted-foreground">接続:</span>{' '}
            <span className="font-medium">
              {attrs.connection_type === 'wireless' ? 'ワイヤレス' : 
               attrs.connection_type === 'wired' ? '有線' : '両対応'}
            </span>
          </div>
        )}
        {attrs.rapid_trigger !== undefined && (
          <div>
            <span className="text-muted-foreground">RT:</span>{' '}
            <span className="font-medium">{attrs.rapid_trigger ? '対応' : '非対応'}</span>
          </div>
        )}
        {attrs.weight && (
          <div>
            <span className="text-muted-foreground">重量:</span>{' '}
            <span className="font-medium">{attrs.weight}g</span>
          </div>
        )}
        {attrs.key_arrangement && (
          <div>
            <span className="text-muted-foreground">配列:</span>{' '}
            <span className="font-medium">
              {attrs.key_arrangement === 'jp' ? '日本語' : 
               attrs.key_arrangement === 'us' ? '英語' : 'ISO'}
            </span>
          </div>
        )}
      </div>
    );
  };

  switch (category) {
    case 'mouse':
      return renderMouseAttributes(attributes as MouseAttributes);
    case 'keyboard':
      return renderKeyboardAttributes(attributes as KeyboardAttributes);
    default:
      // デフォルトの属性表示
      return (
        <div className={`grid grid-cols-2 gap-2 text-sm ${className}`}>
          {Object.entries(attributes).slice(0, 6).map(([key, value]) => (
            <div key={key}>
              <span className="text-muted-foreground">{key}:</span>{' '}
              <span className="font-medium">{String(value)}</span>
            </div>
          ))}
        </div>
      );
  }
}
