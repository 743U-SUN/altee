// lib/svg-sanitizer.ts
// SVGファイルのサニタイズ機能

/**
 * 危険なSVG要素やイベントハンドラーを除去するサニタイザー
 */

// 危険なタグのリスト
const DANGEROUS_TAGS = [
  'script',
  'object',
  'embed',
  'applet',
  'iframe',
  'frame',
  'frameset',
  'audio',
  'video',
  'source',
  'track',
  'base',
  'link',
  'meta',
  // styleタグは個別処理するため除外
  // 'style', // CSSインジェクション防止のため除去
];

// 危険な属性のリスト（イベントハンドラーやJavaScript実行可能な属性）
const DANGEROUS_ATTRIBUTES = [
  // イベントハンドラー
  'onload', 'onclick', 'onmouseover', 'onmouseout', 'onmousemove',
  'onmousedown', 'onmouseup', 'onfocus', 'onblur', 'onchange',
  'onsubmit', 'onreset', 'onselect', 'onkeydown', 'onkeypress',
  'onkeyup', 'onabort', 'onerror', 'onresize', 'onscroll',
  'onunload', 'onbeforeunload', 'ondragstart', 'ondrag', 'ondragend',
  'ondragenter', 'ondragover', 'ondragleave', 'ondrop',
  'ontouchstart', 'ontouchmove', 'ontouchend', 'ontouchcancel',
  'onanimationstart', 'onanimationend', 'onanimationiteration',
  'ontransitionend', 'onwheel', 'oncontextmenu',
  
  // JavaScriptを実行可能な属性
  'href', // javascript:プロトコルを含む可能性
  'xlink:href', // 古いSVG仕様
  'data', // object要素のdata属性
  'formaction',
  'action',
  
  // 外部リソース読み込み
  'src',
  'background',
  'poster',
  
  // style属性とstyleタグは個別処理するため除外
  // 'style',
];

// 安全な属性のホワイトリスト
const SAFE_ATTRIBUTES = [
  // SVG基本属性
  'id', 'class', 'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
  'dx', 'dy', 'transform', 'viewBox', 'preserveAspectRatio',
  
  // 描画属性
  'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-dasharray', 'stroke-dashoffset', 'fill-opacity', 'stroke-opacity',
  'opacity', 'color', 'display', 'visibility',
  
  // パス関連
  'd', 'pathLength',
  
  // テキスト関連
  'font-family', 'font-size', 'font-weight', 'font-style', 'text-anchor',
  'dominant-baseline', 'alignment-baseline', 'baseline-shift',
  
  // グラデーション・パターン
  'offset', 'stop-color', 'stop-opacity', 'gradientUnits', 'gradientTransform',
  'patternUnits', 'patternTransform',
  
  // アニメーション（安全なもののみ）
  'dur', 'begin', 'end', 'repeatCount', 'repeatDur', 'restart',
  'calcMode', 'values', 'keyTimes', 'keySplines', 'from', 'to', 'by',
  'attributeName', 'attributeType', 'additive', 'accumulate',
  
  // フィルター
  'filter', 'filterUnits', 'primitiveUnits',
  
  // クリッピング・マスキング
  'clip-path', 'mask', 'clip-rule', 'fill-rule',
  
  // マーカー
  'marker-start', 'marker-mid', 'marker-end',
  
  // その他の安全な属性
  'version', 'xmlns', 'xmlns:xlink', 'xml:lang', 'xml:space',
  'role', 'aria-label', 'aria-labelledby', 'aria-describedby',
  'title', 'desc',
];

/**
 * SVGファイルのサニタイズ結果
 */
export interface SvgSanitizeResult {
  /** サニタイズされたSVGコンテンツ */
  sanitizedSvg: string;
  /** 危険な要素が除去されたかどうか */
  hasRemovedDangerousContent: boolean;
  /** 除去された要素の詳細 */
  removedElements: string[];
  /** 除去された属性の詳細 */
  removedAttributes: string[];
}

/**
 * 危険なCSSプロパティをチェック
 */
function isDangerousCss(cssText: string): boolean {
  const dangerousPatterns = [
    /javascript\s*:/i,
    /expression\s*\(/i,
    /behavior\s*:/i,
    /vbscript\s*:/i,
    /data\s*:/i,
    /@import/i,
    /url\s*\(\s*["']?(?!#)[^)]*["']?\s*\)/i, // 外部URL（ハッシュリンク以外）
    /-moz-binding/i,
    /binding/i,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(cssText));
}

/**
 * style属性値をサニタイズ
 */
function sanitizeStyleAttribute(styleValue: string): string | null {
  if (isDangerousCss(styleValue)) {
    return null;
  }
  
  // 安全なCSSプロパティのみを許可
  const safeCssProperties = [
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'stroke-dasharray', 'stroke-dashoffset', 'fill-opacity', 'stroke-opacity',
    'opacity', 'color', 'display', 'visibility', 'font-family', 'font-size',
    'font-weight', 'font-style', 'text-anchor', 'dominant-baseline',
    'alignment-baseline', 'baseline-shift', 'stop-color', 'stop-opacity',
    'filter', 'clip-path', 'mask', 'marker-start', 'marker-mid', 'marker-end'
  ];
  
  // CSSプロパティを解析して安全なもののみ保持
  const declarations = styleValue.split(';')
    .map(decl => decl.trim())
    .filter(decl => decl.length > 0)
    .filter(decl => {
      const [property] = decl.split(':').map(p => p.trim());
      return safeCssProperties.includes(property.toLowerCase());
    });
  
  return declarations.length > 0 ? declarations.join('; ') : null;
}

/**
 * <style>タグの内容をサニタイズ
 */
function sanitizeStyleContent(styleContent: string): string | null {
  if (isDangerousCss(styleContent)) {
    return null;
  }
  
  // 基本的なCSS構文チェック（セレクタ { プロパティ: 値; } 形式）
  const cssRules = styleContent.match(/[^{}]+\{[^{}]*\}/g);
  if (!cssRules) {
    return null;
  }
  
  const safeCssProperties = [
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'stroke-dasharray', 'stroke-dashoffset', 'fill-opacity', 'stroke-opacity',
    'opacity', 'color', 'display', 'visibility', 'font-family', 'font-size',
    'font-weight', 'font-style', 'text-anchor', 'dominant-baseline',
    'alignment-baseline', 'baseline-shift', 'stop-color', 'stop-opacity',
    'filter', 'clip-path', 'mask', 'marker-start', 'marker-mid', 'marker-end'
  ];
  
  const sanitizedRules = cssRules.filter(rule => {
    const [, properties] = rule.split('{');
    const declarations = properties.replace('}', '').split(';')
      .map(decl => decl.trim())
      .filter(decl => decl.length > 0);
    
    return declarations.every(decl => {
      const [property] = decl.split(':').map(p => p.trim());
      return safeCssProperties.includes(property.toLowerCase());
    });
  });
  
  return sanitizedRules.length > 0 ? sanitizedRules.join('\n') : null;
}

/**
 * 危険なプロトコルをチェック
 */
function isDangerousUrl(url: string): boolean {
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'ftp:',
    'jar:',
  ];
  
  const normalizedUrl = url.toLowerCase().trim();
  return dangerousProtocols.some(protocol => normalizedUrl.startsWith(protocol));
}

/**
 * 属性値をサニタイズ
 */
function sanitizeAttributeValue(name: string, value: string): string | null {
  // style属性は特別処理
  if (name === 'style') {
    return sanitizeStyleAttribute(value);
  }
  
  // href属性は特別チェック
  if (name === 'href' || name === 'xlink:href') {
    if (isDangerousUrl(value)) {
      return null; // 危険なURLは除去
    }
    // 相対URLまたはハッシュリンクのみ許可
    if (value.startsWith('#') || value.startsWith('./') || value.startsWith('../')) {
      return value;
    }
    return null; // その他の外部URLは除去
  }
  
  // その他の属性は基本的にそのまま（ただし悪意のあるスクリプトコードをチェック）
  if (value.toLowerCase().includes('javascript:') || 
      value.toLowerCase().includes('data:') ||
      value.toLowerCase().includes('<script') ||
      value.toLowerCase().includes('</script')) {
    return null;
  }
  
  return value;
}

/**
 * SVGコンテンツをサニタイズ
 */
export function sanitizeSvg(svgContent: string): SvgSanitizeResult {
  const removedElements: string[] = [];
  const removedAttributes: string[] = [];
  let hasRemovedDangerousContent = false;
  
  try {
    // 基本的なXMLとして解析（簡易パーサー）
    let sanitized = svgContent;
    
    // 1. 危険なタグを除去
    DANGEROUS_TAGS.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, 'gis');
      const selfClosingRegex = new RegExp(`<${tag}[^>]*\\s*/>`, 'gis');
      
      if (regex.test(sanitized) || selfClosingRegex.test(sanitized)) {
        removedElements.push(tag);
        hasRemovedDangerousContent = true;
        sanitized = sanitized.replace(regex, '');
        sanitized = sanitized.replace(selfClosingRegex, '');
      }
    });
    
    // 2. 危険な属性を除去
    DANGEROUS_ATTRIBUTES.forEach(attr => {
      const regex = new RegExp(`\\s${attr}\\s*=\\s*[\"'][^\"']*[\"']`, 'gis');
      if (regex.test(sanitized)) {
        removedAttributes.push(attr);
        hasRemovedDangerousContent = true;
        sanitized = sanitized.replace(regex, '');
      }
    });
    
    // 4. <style>タグの内容をサニタイズ（色情報保持のため）
    sanitized = sanitized.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, content) => {
      const sanitizedContent = sanitizeStyleContent(content);
      if (sanitizedContent) {
        return `<style>${sanitizedContent}</style>`;
      }
      hasRemovedDangerousContent = true;
      removedElements.push('style (dangerous content)');
      return '';
    });
    
    // 5. style属性の個別サニタイズ
    sanitized = sanitized.replace(/\sstyle\s*=\s*["']([^"']*)["']/gi, (match, styleValue) => {
      const sanitizedStyle = sanitizeStyleAttribute(styleValue);
      if (sanitizedStyle) {
        return ` style="${sanitizedStyle}"`;
      }
      hasRemovedDangerousContent = true;
      removedAttributes.push('style (dangerous content)');
      return '';
    });
    
    // 6. DOCTYPE宣言の除去（XXE攻撃防止）
    sanitized = sanitized.replace(/<!DOCTYPE[^>]*>/gi, '');
    
    // 7. XML処理命令の除去
    sanitized = sanitized.replace(/<\?xml[^>]*\?>/gi, '');
    
    // 8. CDATAセクションの除去（潜在的な危険性）
    if (sanitized.includes('<![CDATA[')) {
      sanitized = sanitized.replace(/<!\[CDATA\[.*?\]\]>/gis, '');
      hasRemovedDangerousContent = true;
      removedElements.push('CDATA');
    }
    
    // 9. コメント内のスクリプトコードを除去
    sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, (match) => {
      if (match.toLowerCase().includes('script') || 
          match.toLowerCase().includes('javascript')) {
        hasRemovedDangerousContent = true;
        return '';
      }
      return match;
    });
    
    // 10. 基本的なSVG構造の検証
    const trimmedSanitized = sanitized.trim();
    const hasSvgStart = /<svg[\s>]/i.test(trimmedSanitized);
    const hasSvgEnd = /<\/svg\s*>/i.test(trimmedSanitized);
    
    if (!hasSvgStart || !hasSvgEnd) {
      throw new Error('Invalid SVG structure');
    }
    
    return {
      sanitizedSvg: sanitized.trim(),
      hasRemovedDangerousContent,
      removedElements,
      removedAttributes
    };
    
  } catch (error) {
    throw new Error(`SVGサニタイズエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * SVGファイルの内容を検証・サニタイズ
 */
export async function sanitizeSvgFile(file: File): Promise<SvgSanitizeResult> {
  if (file.type !== 'image/svg+xml') {
    throw new Error('SVGファイルではありません');
  }
  
  const content = await file.text();
  return sanitizeSvg(content);
}

/**
 * サニタイズされたSVGからBufferを作成
 */
export function createSvgBuffer(sanitizedSvg: string): Buffer {
  return Buffer.from(sanitizedSvg, 'utf-8');
}

/**
 * SVGファイルかどうかを判定
 */
export function isSvgFile(file: File): boolean {
  return file.type === 'image/svg+xml' && file.name.toLowerCase().endsWith('.svg');
}