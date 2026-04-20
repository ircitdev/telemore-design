/**
 * Экспорт всех страниц telemore.op в JPG x2 (retina)
 * Требует: puppeteer
 *
 * Usage: node export-screens.js
 * Output: designs/export/<NN>_<page-name>.jpg
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const OP_FILE = path.join(__dirname, 'designs', 'telemore.op');
const OUT_DIR = path.join(__dirname, 'designs', 'export');
const SCALE = 2; // x2 retina

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ============ PenNode → HTML converter ============

/** Преобразовать fill (массив объектов) в CSS background */
function fillToCss(fill) {
  if (!fill || !fill.length) return 'transparent';
  const f = fill[0];
  if (f.type === 'solid') return f.color;
  if (f.type === 'linear_gradient') {
    const stops = (f.stops || []).map(s => `${s.color} ${(s.offset * 100).toFixed(1)}%`).join(', ');
    // OpenPencil angle: 0° = top-to-bottom (снизу вверх в CSS — инверсия)
    const cssAngle = ((f.angle ?? 180)) + 'deg';
    return `linear-gradient(${cssAngle}, ${stops})`;
  }
  return 'transparent';
}

/** fill для текста (может быть градиент) */
function fillToTextCss(fill, styleDefault = {}) {
  if (!fill || !fill.length) return { color: '#fff' };
  const f = fill[0];
  if (f.type === 'solid') return { color: f.color };
  if (f.type === 'linear_gradient') {
    const stops = (f.stops || []).map(s => `${s.color} ${(s.offset * 100).toFixed(1)}%`).join(', ');
    const cssAngle = ((f.angle ?? 180)) + 'deg';
    return {
      background: `linear-gradient(${cssAngle}, ${stops})`,
      '-webkit-background-clip': 'text',
      'background-clip': 'text',
      color: 'transparent',
      '-webkit-text-fill-color': 'transparent'
    };
  }
  return { color: '#fff' };
}

/** Stroke → border CSS */
function strokeToCss(stroke) {
  if (!stroke) return {};
  const t = stroke.thickness ?? 1;
  const f = stroke.fill && stroke.fill[0];
  const color = f?.type === 'solid' ? f.color : (f?.stops?.[0]?.color || '#fff');
  // Для градиентной рамки используем outline + box-shadow, но упрощенно — solid
  return { border: `${t}px solid ${color}` };
}

/** Effects → box-shadow */
function effectsToCss(effects) {
  if (!effects || !effects.length) return {};
  const shadows = effects.filter(e => e.type === 'shadow').map(e =>
    `${e.offsetX || 0}px ${e.offsetY || 0}px ${e.blur || 0}px ${e.spread || 0}px ${e.color}`
  ).join(', ');
  return shadows ? { 'box-shadow': shadows } : {};
}

/** Размер значения (число / fill_container / fit_content) */
function sizeVal(v, parentAxis) {
  if (typeof v === 'number') return v + 'px';
  if (v === 'fill_container') return '100%';
  if (v === 'fit_content') return 'auto';
  return 'auto';
}

/** Padding → [top, right, bottom, left] CSS */
function paddingCss(p) {
  if (p === undefined || p === null) return '0';
  if (typeof p === 'number') return `${p}px`;
  if (Array.isArray(p)) {
    if (p.length === 2) return `${p[0]}px ${p[1]}px`;
    if (p.length === 4) return `${p[0]}px ${p[1]}px ${p[2]}px ${p[3]}px`;
  }
  return '0';
}

function cssStr(obj) {
  return Object.entries(obj).map(([k, v]) => `${k}:${v}`).join(';');
}

function escapeHtml(s) {
  return String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
}

/** Рендер одного нода в HTML */
function renderNode(node, isRoot = false, parentLayout = 'none') {
  if (!node) return '';
  const type = node.type;

  // Общие стили
  const style = {};

  // Размеры
  if (node.width !== undefined) style.width = sizeVal(node.width);
  if (node.height !== undefined) style.height = sizeVal(node.height);

  // Layout для frame
  if (type === 'frame' || !type) {
    if (node.layout === 'vertical' || node.layout === 'horizontal') {
      style.display = 'flex';
      style['flex-direction'] = node.layout === 'vertical' ? 'column' : 'row';
      if (node.gap !== undefined) style.gap = node.gap + 'px';
      if (node.alignItems) style['align-items'] = node.alignItems === 'start' ? 'flex-start' : node.alignItems === 'end' ? 'flex-end' : node.alignItems;
      if (node.justifyContent) {
        const jc = node.justifyContent;
        style['justify-content'] = jc === 'start' ? 'flex-start' : jc === 'end' ? 'flex-end' : jc === 'space_between' ? 'space-between' : jc === 'space_around' ? 'space-around' : jc;
      }
    }
    if (node.padding !== undefined) style.padding = paddingCss(node.padding);
    if (node.cornerRadius !== undefined) style['border-radius'] = node.cornerRadius + 'px';
    if (node.fill) style.background = fillToCss(node.fill);
    Object.assign(style, strokeToCss(node.stroke));
    Object.assign(style, effectsToCss(node.effects));
    if (node.clipContent) style.overflow = 'hidden';
    // Для child в flex-контейнере с fill_container
    if (parentLayout === 'horizontal' && node.width === 'fill_container') {
      style.flex = '1 1 0';
      style.width = 'auto';
      style['min-width'] = '0';
    }
    if (parentLayout === 'vertical' && node.height === 'fill_container') {
      style.flex = '1 1 0';
      style.height = 'auto';
    }
    // box-sizing: border-box для правильного расчёта padding+border
    style['box-sizing'] = 'border-box';

    const childrenHtml = (node.children || []).map(c => renderNode(c, false, node.layout || 'none')).join('');
    return `<div style="${cssStr(style)}">${childrenHtml}</div>`;
  }

  if (type === 'text') {
    const ts = {};
    if (node.fontFamily) ts['font-family'] = `"${node.fontFamily}", Roboto, sans-serif`;
    if (node.fontSize) ts['font-size'] = node.fontSize + 'px';
    if (node.fontWeight) ts['font-weight'] = node.fontWeight;
    if (node.fontStyle) ts['font-style'] = node.fontStyle;
    if (node.letterSpacing) ts['letter-spacing'] = node.letterSpacing + 'px';
    if (node.lineHeight) ts['line-height'] = node.lineHeight;
    if (node.textAlign) ts['text-align'] = node.textAlign;
    if (node.width !== undefined) ts.width = sizeVal(node.width);
    Object.assign(ts, fillToTextCss(node.fill));
    Object.assign(ts, effectsToCss(node.effects));
    if (parentLayout === 'horizontal' && node.width === 'fill_container') {
      ts.flex = '1 1 0'; ts['min-width'] = '0';
    }
    ts['box-sizing'] = 'border-box';
    ts['white-space'] = node.textGrowth === 'fixed-width' ? 'normal' : 'pre-wrap';
    ts['word-wrap'] = 'break-word';
    return `<div style="${cssStr(ts)}">${escapeHtml(node.content || '')}</div>`;
  }

  if (type === 'rectangle') {
    const rs = {};
    if (node.width) rs.width = sizeVal(node.width);
    if (node.height) rs.height = sizeVal(node.height);
    if (node.cornerRadius !== undefined) rs['border-radius'] = node.cornerRadius + 'px';
    if (node.fill) rs.background = fillToCss(node.fill);
    Object.assign(rs, strokeToCss(node.stroke));
    Object.assign(rs, effectsToCss(node.effects));
    rs['box-sizing'] = 'border-box';
    return `<div style="${cssStr(rs)}"></div>`;
  }

  if (type === 'ellipse') {
    const es = {};
    if (node.width) es.width = sizeVal(node.width);
    if (node.height) es.height = sizeVal(node.height);
    es['border-radius'] = '50%';
    if (node.fill) es.background = fillToCss(node.fill);
    Object.assign(es, strokeToCss(node.stroke));
    Object.assign(es, effectsToCss(node.effects));
    return `<div style="${cssStr(es)}"></div>`;
  }

  if (type === 'path') {
    const w = node.width || 24;
    const h = node.height || 24;
    const strokeFill = node.stroke && node.stroke.fill && node.stroke.fill[0];
    const strokeColor = strokeFill?.type === 'solid' ? strokeFill.color : '#fff';
    const strokeWidth = node.stroke?.thickness || 2;
    const fillStyle = node.fill && node.fill[0] && node.fill[0].type === 'solid' ? node.fill[0].color : 'none';
    return `<svg width="${w}" height="${h}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="${fillStyle}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${escapeHtml(node.d || '')}"/></svg>`;
  }

  if (type === 'image') {
    const ims = {};
    if (node.width) ims.width = sizeVal(node.width);
    if (node.height) ims.height = sizeVal(node.height);
    if (node.cornerRadius) ims['border-radius'] = node.cornerRadius + 'px';
    ims.background = '#333';
    return `<div style="${cssStr(ims)}"></div>`;
  }

  return '';
}

/** Обернуть в целую HTML-страницу */
function wrapHtml(rootNode, width, height) {
  const content = renderNode(rootNode, true, 'none');
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${width}px;height:${height}px;overflow:hidden;background:#000;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#fff;}
  body > div{width:${width}px;height:${height}px;}
</style>
</head><body>${content}</body></html>`;
}

// ============ Main ============

async function main() {
  const doc = JSON.parse(fs.readFileSync(OP_FILE, 'utf8'));
  console.log(`Exporting ${doc.pages.length} pages (scale x${SCALE}) to ${OUT_DIR}\n`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  let i = 0;
  for (const page of doc.pages) {
    i++;
    const root = page.children?.[0];
    if (!root) {
      console.log(`  [${i}] ${page.name.padEnd(42)} SKIP (empty)`);
      continue;
    }
    const W = root.width || 375;
    const H = root.height || 812;

    const pg = await browser.newPage();
    await pg.setViewport({
      width: W,
      height: H,
      deviceScaleFactor: SCALE
    });
    await pg.setContent(wrapHtml(root, W, H), { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 200));

    // Безопасное имя файла
    const safeName = page.name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_');
    const num = String(i).padStart(2, '0');
    const outPath = path.join(OUT_DIR, `${num}_${safeName}.jpg`);

    await pg.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 92,
      fullPage: false,
      clip: { x: 0, y: 0, width: W, height: H }
    });

    const size = fs.statSync(outPath).size;
    console.log(`  [${i}] ${page.name.padEnd(42)} ${W}×${H} → ${(size/1024).toFixed(0)} KB`);

    await pg.close();
  }

  await browser.close();
  console.log(`\n✅ Exported ${doc.pages.length} screens to ${OUT_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
