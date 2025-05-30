/**
 * 商品データのCSVインポート/エクスポート用ユーティリティ
 */

/**
 * 商品データをCSV形式に変換
 */
export async function exportProductsToCSV(products: any[]): Promise<string> {
  // 動的インポート
  const { stringify } = await import('csv-stringify/sync');
  // CSVのヘッダー定義
  const headers = [
    'name',
    'description',
    'category',
    'manufacturer',
    'amazonUrl',
    'asin',
    'imageUrl',
    'price',
    'isActive',
    // マウス属性
    'mouse_dpi_min',
    'mouse_dpi_max',
    'mouse_weight',
    'mouse_length',
    'mouse_width',
    'mouse_height',
    'mouse_buttons',
    'mouse_connection_type',
    'mouse_polling_rate',
    'mouse_battery_life',
    'mouse_sensor',
    'mouse_rgb',
    'mouse_software',
    // キーボード属性
    'keyboard_layout',
    'keyboard_switch_type',
    'keyboard_actuation_point',
    'keyboard_connection_type',
    'keyboard_rapid_trigger',
    'keyboard_rgb',
    'keyboard_software',
    'keyboard_keycaps',
    'keyboard_hot_swap',
  ];

  // データを整形
  const rows = products.map(product => {
    const attributes = product.attributes || {};
    const row: any = {
      name: product.name || '',
      description: product.description || '',
      category: product.category?.slug || '',
      manufacturer: product.manufacturer?.name || '',
      amazonUrl: product.amazonUrl || '',
      asin: product.asin || '',
      imageUrl: product.imageUrl || '',
      price: product.price || '',
      isActive: product.isActive ? 'true' : 'false',
    };

    // マウス属性
    if (product.category?.slug === 'mouse') {
      row.mouse_dpi_min = attributes.dpi_min || '';
      row.mouse_dpi_max = attributes.dpi_max || '';
      row.mouse_weight = attributes.weight || '';
      row.mouse_length = attributes.length || '';
      row.mouse_width = attributes.width || '';
      row.mouse_height = attributes.height || '';
      row.mouse_buttons = attributes.buttons || '';
      row.mouse_connection_type = attributes.connection_type || '';
      row.mouse_polling_rate = attributes.polling_rate || '';
      row.mouse_battery_life = attributes.battery_life || '';
      row.mouse_sensor = attributes.sensor || '';
      row.mouse_rgb = attributes.rgb ? 'true' : 'false';
      row.mouse_software = attributes.software || '';
    }

    // キーボード属性
    if (product.category?.slug === 'keyboard') {
      row.keyboard_layout = attributes.layout || '';
      row.keyboard_switch_type = attributes.switch_type || '';
      row.keyboard_actuation_point = attributes.actuation_point || '';
      row.keyboard_connection_type = attributes.connection_type || '';
      row.keyboard_rapid_trigger = attributes.rapid_trigger ? 'true' : 'false';
      row.keyboard_rgb = attributes.rgb ? 'true' : 'false';
      row.keyboard_software = attributes.software || '';
      row.keyboard_keycaps = attributes.keycaps || '';
      row.keyboard_hot_swap = attributes.hot_swap ? 'true' : 'false';
    }

    return row;
  });

  // CSV文字列に変換
  const csv = stringify(rows, {
    header: true,
    columns: headers,
    bom: true, // Excelで開く際の文字化け対策
  });

  return csv;
}

/**
 * CSVファイルから商品データをパース
 */
export async function parseProductsFromCSV(csvContent: string): Promise<{
  valid: any[];
  errors: Array<{ row: number; error: string }>;
}> {
  // 動的インポート
  const { parse } = await import('csv-parse/sync');
  const valid: any[] = [];
  const errors: Array<{ row: number; error: string }> = [];

  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
    });

    records.forEach((record: any, index: number) => {
      const rowNumber = index + 2; // ヘッダー行を考慮

      try {
        // 必須フィールドのチェック
        if (!record.name) {
          errors.push({ row: rowNumber, error: '商品名が必要です' });
          return;
        }
        if (!record.category || !['mouse', 'keyboard'].includes(record.category)) {
          errors.push({ row: rowNumber, error: 'カテゴリはmouseまたはkeyboardである必要があります' });
          return;
        }
        if (!record.amazonUrl) {
          errors.push({ row: rowNumber, error: 'Amazon URLが必要です' });
          return;
        }
        if (!record.asin) {
          errors.push({ row: rowNumber, error: 'ASINが必要です' });
          return;
        }

        // 商品データの構築
        const productData: any = {
          name: record.name,
          description: record.description || null,
          category: record.category,
          manufacturer: record.manufacturer || null,
          amazonUrl: record.amazonUrl,
          asin: record.asin,
          imageUrl: record.imageUrl || '',
          price: record.price ? parseFloat(record.price) : null,
          isActive: record.isActive === 'true',
          attributes: {},
        };

        // カテゴリ別属性の処理
        if (record.category === 'mouse') {
          const mouseAttrs: any = {};
          
          if (record.mouse_dpi_min) mouseAttrs.dpi_min = parseInt(record.mouse_dpi_min);
          if (record.mouse_dpi_max) mouseAttrs.dpi_max = parseInt(record.mouse_dpi_max);
          if (record.mouse_weight) mouseAttrs.weight = parseInt(record.mouse_weight);
          if (record.mouse_length) mouseAttrs.length = parseFloat(record.mouse_length);
          if (record.mouse_width) mouseAttrs.width = parseFloat(record.mouse_width);
          if (record.mouse_height) mouseAttrs.height = parseFloat(record.mouse_height);
          if (record.mouse_buttons) mouseAttrs.buttons = parseInt(record.mouse_buttons);
          if (record.mouse_connection_type) mouseAttrs.connection_type = record.mouse_connection_type;
          if (record.mouse_polling_rate) mouseAttrs.polling_rate = parseInt(record.mouse_polling_rate);
          if (record.mouse_battery_life) mouseAttrs.battery_life = parseInt(record.mouse_battery_life);
          if (record.mouse_sensor) mouseAttrs.sensor = record.mouse_sensor;
          if (record.mouse_rgb) mouseAttrs.rgb = record.mouse_rgb === 'true';
          if (record.mouse_software) mouseAttrs.software = record.mouse_software;

          productData.attributes = mouseAttrs;
        } else if (record.category === 'keyboard') {
          const keyboardAttrs: any = {};
          
          if (record.keyboard_layout) keyboardAttrs.layout = record.keyboard_layout;
          if (record.keyboard_switch_type) keyboardAttrs.switch_type = record.keyboard_switch_type;
          if (record.keyboard_actuation_point) keyboardAttrs.actuation_point = parseFloat(record.keyboard_actuation_point);
          if (record.keyboard_connection_type) keyboardAttrs.connection_type = record.keyboard_connection_type;
          if (record.keyboard_rapid_trigger) keyboardAttrs.rapid_trigger = record.keyboard_rapid_trigger === 'true';
          if (record.keyboard_rgb) keyboardAttrs.rgb = record.keyboard_rgb === 'true';
          if (record.keyboard_software) keyboardAttrs.software = record.keyboard_software;
          if (record.keyboard_keycaps) keyboardAttrs.keycaps = record.keyboard_keycaps;
          if (record.keyboard_hot_swap) keyboardAttrs.hot_swap = record.keyboard_hot_swap === 'true';

          productData.attributes = keyboardAttrs;
        }

        valid.push(productData);
      } catch (error) {
        errors.push({ 
          row: rowNumber, 
          error: error instanceof Error ? error.message : '不明なエラー' 
        });
      }
    });
  } catch (error) {
    errors.push({ 
      row: 0, 
      error: 'CSVファイルの解析に失敗しました' 
    });
  }

  return { valid, errors };
}

/**
 * サンプルCSVテンプレートを生成
 */
export async function generateSampleCSV(): Promise<string> {
  const sampleData = [
    {
      name: 'Logicool G Pro X Superlight（サンプル）',
      description: '超軽量ワイヤレスゲーミングマウス',
      category: 'mouse',
      manufacturer: 'Logicool',
      amazonUrl: 'https://www.amazon.co.jp/dp/B08MVQ6LKK',
      asin: 'B08MVQ6LKK',
      imageUrl: 'https://example.com/image.jpg',
      price: '16500',
      isActive: 'true',
      mouse_dpi_min: '100',
      mouse_dpi_max: '25600',
      mouse_weight: '63',
      mouse_length: '125',
      mouse_width: '63.5',
      mouse_height: '40',
      mouse_buttons: '5',
      mouse_connection_type: 'wireless',
      mouse_polling_rate: '1000',
      mouse_battery_life: '70',
      mouse_sensor: 'HERO 25K',
      mouse_rgb: 'true',
      mouse_software: 'G HUB',
    },
    {
      name: 'Wooting 60HE（サンプル）',
      description: '磁気スイッチ搭載ゲーミングキーボード',
      category: 'keyboard',
      manufacturer: 'Wooting',
      amazonUrl: 'https://www.amazon.co.jp/dp/B0EXAMPLE',
      asin: 'B0EXAMPLE',
      imageUrl: 'https://example.com/keyboard.jpg',
      price: '29800',
      isActive: 'true',
      keyboard_layout: '60',
      keyboard_switch_type: 'magnetic',
      keyboard_actuation_point: '0.1',
      keyboard_connection_type: 'wired',
      keyboard_rapid_trigger: 'true',
      keyboard_rgb: 'true',
      keyboard_software: 'Wootility',
      keyboard_keycaps: 'PBT',
      keyboard_hot_swap: 'false',
    },
  ];

  return exportProductsToCSV(sampleData);
}