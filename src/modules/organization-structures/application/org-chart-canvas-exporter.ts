import type {
  OrgChartStructure,
  OrgChartPersonNode,
  OrgChartTier,
  OrgChartFontId,
} from '../domain/org-chart-designer.types';
import {
  normalizeChartTiers,
  resolveOrgChartStyle,
  resolveTierMaxColumns,
  chunkTierNodes,
  splitTextByScript,
} from '../domain/org-chart-designer.types';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import { orgStructureApi } from '../infrastructure/org-structure.api';

/**
 * ແປງ path ຮູບພາບໃຫ້ເປັນ URL ທີ່ສາມາດໂຫຼດໄດ້
 * ຮອງຮັບທັງ short file path (/uploads/...), data:image/base64, blob:, ແລະ full http URLs
 */
export function resolveAvatarUrl(url?: string | null): string {
  if (!url) return '';
  if (
    url.startsWith('data:image/') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  ) {
    return url;
  }
  return getStorageUrl(url);
}

const STORAGE_KEY_PREFIX = 'edl_org_chart_data_';

export function saveOrgChartToStorage(
  identifier: string | number,
  data: OrgChartStructure
): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${identifier}`,
        JSON.stringify(data)
      );
    }
  } catch (e) {
    console.error('Failed to save org chart to localStorage', e);
  }
}

export function loadOrgChartFromStorage(
  identifier: string | number
): OrgChartStructure | null {
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage.getItem(
        `${STORAGE_KEY_PREFIX}${identifier}`
      );
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error('Failed to load org chart from localStorage', e);
  }
  return null;
}

/**
 * Helper to load an image into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = resolveAvatarUrl(src);
  });
}

/**
 * Draws rounded rectangle path on Canvas
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws avatar silhouette placeholder
 */
function drawAvatarPlaceholder(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x, y, w, h);

  const cx = x + w / 2;
  const cy = y + h * 0.42;
  const r = Math.min(w, h) * 0.22;

  ctx.fillStyle = '#cbd5e1';
  // Head
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Shoulder / Body
  ctx.beginPath();
  ctx.ellipse(cx, y + h * 0.95, r * 1.8, r * 1.4, 0, Math.PI, 0);
  ctx.fill();
}

interface WrapToken {
  text: string;
  spaceBefore: boolean;
}

interface FittedTextBlock {
  lines: string[];
  fontSize: number;
  font: string;
  latinFont?: string;
  lineHeight: number;
  height: number;
  scale?: number;
}

interface NodeLayout {
  node: OrgChartPersonNode;
  badge: FittedTextBlock | null;
  pillW: number;
  nameLao: FittedTextBlock;
  nameEn: FittedTextBlock | null;
  roleLao: FittedTextBlock;
  roleEn: FittedTextBlock;
  neededPillH: number;
  neededCardH: number;
}

interface RowLayout {
  nodes: NodeLayout[];
  hasBadges: boolean;
  hasCards: boolean;
  pillH: number;
  pillGap: number;
  cardH: number;
}

interface TierLayout {
  tier: OrgChartTier;
  rows: RowLayout[];
}

function splitIntoGraphemes(text: string): string[] {
  if (!text) return [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('lo', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * Tokenizes Lao/English text into wrap-safe word chunks while keeping spacing exact
 */
function tokenizeForWrap(text: string): WrapToken[] {
  const normalized = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const wordSegmenter =
    typeof Intl !== 'undefined' && 'Segmenter' in Intl
      ? new Intl.Segmenter('lo', { granularity: 'word' })
      : null;

  const tokens: WrapToken[] = [];
  const spaceParts = normalized.split(' ');

  for (let sIdx = 0; sIdx < spaceParts.length; sIdx++) {
    const chunk = spaceParts[sIdx];
    if (!chunk) continue;

    // Allow clean breaks after '/' while keeping '/' attached to previous piece
    const rawSlashParts = chunk.split('/');
    const slashParts = rawSlashParts
      .map((p, idx) => (idx < rawSlashParts.length - 1 ? `${p}/` : p))
      .filter(Boolean);
    let isFirstInSpaceChunk = true;

    for (const part of slashParts) {
      if (wordSegmenter) {
        const segs = Array.from(wordSegmenter.segment(part), (s) => s.segment);
        for (const seg of segs) {
          if (!seg) continue;
          // Keep trailing punctuation attached to previous token so lines never start with ',' or '.'
          if (/^[,.;:!?)\]]+$/.test(seg) && tokens.length > 0) {
            tokens[tokens.length - 1].text += seg;
            continue;
          }
          tokens.push({
            text: seg,
            spaceBefore: sIdx > 0 && isFirstInSpaceChunk,
          });
          isFirstInSpaceChunk = false;
        }
      } else {
        tokens.push({
          text: part,
          spaceBefore: sIdx > 0 && isFirstInSpaceChunk,
        });
        isFirstInSpaceChunk = false;
      }
    }
  }

  return tokens;
}

/**
 * Measures pixel width of a segment while accounting for optional scaled Latin font
 */
function measureSegmentWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  baseFont: string,
  latinFont?: string
): number {
  if (!latinFont || latinFont === baseFont) {
    ctx.font = baseFont;
    return ctx.measureText(text).width;
  }
  let total = 0;
  for (const run of splitTextByScript(text)) {
    ctx.font = run.isLatin ? latinFont : baseFont;
    total += ctx.measureText(run.text).width;
  }
  return total;
}

/**
 * Wraps a single paragraph (no newlines) strictly within maxWidth pixels
 */
function wrapSingleParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseFont: string,
  latinFont?: string
): string[] {
  const tokens = tokenizeForWrap(text);
  if (tokens.length === 0) return [];

  const lines: string[] = [];
  let currentLine = '';

  const pushOversizedToken = (rawToken: string) => {
    const graphemes = splitIntoGraphemes(rawToken);
    let chunk = '';
    for (const g of graphemes) {
      const candidate = chunk + g;
      if (
        chunk &&
        measureSegmentWidth(ctx, candidate, baseFont, latinFont) > maxWidth
      ) {
        lines.push(chunk);
        chunk = g;
      } else {
        chunk = candidate;
      }
    }
    currentLine = chunk;
  };

  for (const token of tokens) {
    if (!currentLine) {
      if (measureSegmentWidth(ctx, token.text, baseFont, latinFont) <= maxWidth) {
        currentLine = token.text;
      } else {
        pushOversizedToken(token.text);
      }
      continue;
    }

    const candidate = token.spaceBefore
      ? `${currentLine} ${token.text}`
      : `${currentLine}${token.text}`;

    if (measureSegmentWidth(ctx, candidate, baseFont, latinFont) <= maxWidth) {
      currentLine = candidate;
    } else {
      lines.push(currentLine);
      if (measureSegmentWidth(ctx, token.text, baseFont, latinFont) <= maxWidth) {
        currentLine = token.text;
      } else {
        pushOversizedToken(token.text);
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Wraps multi-line text into lines strictly fitting maxWidth while preserving explicit Enter (\n) line breaks
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseFont: string,
  latinFont?: string
): string[] {
  const trimmed = text.replace(/\r\n/g, '\n').trim();
  if (!trimmed) return [];

  const paragraphs = trimmed.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    const cleanPara = para.replace(/\s+/g, ' ').trim();
    if (!cleanPara) {
      lines.push('');
      continue;
    }
    lines.push(
      ...wrapSingleParagraph(ctx, cleanPara, maxWidth, baseFont, latinFont)
    );
  }

  return lines;
}

/**
 * Truncates a single line with ellipsis so its width strictly fits maxWidth
 */
function truncateLineToWidth(
  ctx: CanvasRenderingContext2D,
  line: string,
  maxWidth: number,
  baseFont: string,
  latinFont?: string
): string {
  if (measureSegmentWidth(ctx, line, baseFont, latinFont) <= maxWidth) {
    return line;
  }
  const graphemes = splitIntoGraphemes(line);
  while (graphemes.length > 0) {
    graphemes.pop();
    const candidate = `${graphemes.join('').trimEnd()}…`;
    if (measureSegmentWidth(ctx, candidate, baseFont, latinFont) <= maxWidth) {
      return candidate;
    }
  }
  return '…';
}

/**
 * Wraps and auto-fits text cleanly within maxWidth & maxLines without overflow
 */
function fitTextBlock(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontFamily: string,
  options: {
    baseSize: number;
    minSize: number;
    bold?: boolean;
    fontWeight?: number;
    lineHeightRatio?: number;
    maxLines: number;
    noAutoWrap?: boolean;
    latinScale?: number;
  }
): FittedTextBlock {
  const {
    baseSize,
    minSize,
    bold = false,
    fontWeight,
    lineHeightRatio = 1.35,
    maxLines,
    noAutoWrap = false,
    latinScale,
  } = options;

  const weightToken = String(fontWeight ?? (bold ? 700 : 400));

  const makeFonts = (size: number) => {
    const font = `${weightToken} ${size}px ${fontFamily}`;
    const latinFont =
      latinScale && latinScale !== 1
        ? `${weightToken} ${Number((size * latinScale).toFixed(2))}px ${fontFamily}`
        : undefined;
    return { font, latinFont };
  };

  const trimmed = text.replace(/\r\n/g, '\n').trim();
  if (!trimmed) {
    const { font, latinFont } = makeFonts(baseSize);
    return {
      lines: [],
      fontSize: baseSize,
      font,
      latinFont,
      lineHeight: Math.ceil(baseSize * lineHeightRatio),
      height: 0,
    };
  }

  if (noAutoWrap) {
    const lines = trimmed
      .split('\n')
      .map((line) => line.replace(/\s+/g, ' ').trim());
    const minStrictSize = Math.max(5.5, minSize - 2.5);

    for (let size = baseSize; size >= minStrictSize; size -= 0.5) {
      const { font, latinFont } = makeFonts(size);
      const maxLineW = Math.max(
        ...lines.map((line) =>
          measureSegmentWidth(ctx, line, font, latinFont)
        ),
        0
      );
      if (maxLineW <= maxWidth) {
        const lineHeight = Math.ceil(size * lineHeightRatio);
        return {
          lines,
          fontSize: size,
          font,
          latinFont,
          lineHeight,
          height: lines.length * lineHeight,
        };
      }
    }

    const { font: fallbackFont, latinFont: fallbackLatinFont } =
      makeFonts(minStrictSize);
    const maxLineW = Math.max(
      ...lines.map((line) =>
        measureSegmentWidth(ctx, line, fallbackFont, fallbackLatinFont)
      ),
      1
    );
    const scale = Math.max(0.42, maxWidth / maxLineW);
    const unscaledLH = Math.ceil(minStrictSize * lineHeightRatio);
    const scaledLH = unscaledLH * scale;
    return {
      lines,
      fontSize: minStrictSize,
      font: fallbackFont,
      latinFont: fallbackLatinFont,
      lineHeight: unscaledLH,
      height: lines.length * scaledLH,
      scale,
    };
  }

  for (let size = baseSize; size >= minSize; size -= 0.5) {
    const { font, latinFont } = makeFonts(size);
    const lines = wrapText(ctx, trimmed, maxWidth, font, latinFont);
    if (lines.length <= maxLines) {
      const lineHeight = Math.ceil(size * lineHeightRatio);
      return {
        lines,
        fontSize: size,
        font,
        latinFont,
        lineHeight,
        height: lines.length * lineHeight,
      };
    }
  }

  const { font: fallbackFont, latinFont: fallbackLatinFont } =
    makeFonts(minSize);
  const rawLines = wrapText(
    ctx,
    trimmed,
    maxWidth,
    fallbackFont,
    fallbackLatinFont
  );
  const clamped = rawLines.slice(0, maxLines);
  if (rawLines.length > maxLines) {
    const lastIdx = clamped.length - 1;
    clamped[lastIdx] = truncateLineToWidth(
      ctx,
      `${clamped[lastIdx]} ${rawLines.slice(maxLines).join(' ')}`,
      maxWidth,
      fallbackFont,
      fallbackLatinFont
    );
  }
  const lineHeight = Math.ceil(minSize * lineHeightRatio);
  return {
    lines: clamped,
    fontSize: minSize,
    font: fallbackFont,
    latinFont: fallbackLatinFont,
    lineHeight,
    height: clamped.length * lineHeight,
  };
}

/**
 * Draws a single centered text line onto Canvas, supporting mixed Lao/Latin scaling
 */
function drawCenteredCanvasLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  centerX: number,
  lineCenterY: number,
  block: FittedTextBlock
) {
  if (!line) return;
  if (!block.latinFont || block.latinFont === block.font) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = block.font;
    ctx.fillText(line, centerX, lineCenterY);
    return;
  }

  const runs = splitTextByScript(line);
  const hasLatin = runs.some((r) => r.isLatin);
  if (!hasLatin) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = block.font;
    ctx.fillText(line, centerX, lineCenterY);
    return;
  }

  const totalW = measureSegmentWidth(ctx, line, block.font, block.latinFont);
  let cursorX = centerX - totalW / 2;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const baselineY = lineCenterY + block.fontSize * 0.32;

  for (const run of runs) {
    ctx.font = run.isLatin ? block.latinFont : block.font;
    ctx.fillText(run.text, cursorX, baselineY);
    cursorX += ctx.measureText(run.text).width;
  }
}

/**
 * Draws a centered FittedTextBlock starting at topY
 */
function drawFittedTextBlock(
  ctx: CanvasRenderingContext2D,
  block: FittedTextBlock,
  centerX: number,
  topY: number,
  color: string
) {
  if (block.lines.length === 0) return;
  ctx.save();
  ctx.fillStyle = color;

  if (block.scale && block.scale < 1) {
    const midY = topY + block.height / 2;
    ctx.translate(centerX, midY);
    ctx.scale(block.scale, block.scale);
    ctx.translate(-centerX, -midY);
    const rawStartY =
      topY + block.height / 2 - (block.lines.length * block.lineHeight) / 2;
    for (let i = 0; i < block.lines.length; i++) {
      const lineCenterY = rawStartY + i * block.lineHeight + block.lineHeight / 2;
      drawCenteredCanvasLine(ctx, block.lines[i], centerX, lineCenterY, block);
    }
  } else {
    for (let i = 0; i < block.lines.length; i++) {
      const lineCenterY = topY + i * block.lineHeight + block.lineHeight / 2;
      drawCenteredCanvasLine(ctx, block.lines[i], centerX, lineCenterY, block);
    }
  }

  ctx.restore();
}

/**
 * Draws an image with object-fit: cover cropping inside target rectangle
 */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgW = img.naturalWidth || img.width;
  const imgH = img.naturalHeight || img.height;
  if (!imgW || !imgH) {
    ctx.drawImage(img, x, y, w, h);
    return;
  }

  const targetRatio = w / h;
  const imgRatio = imgW / imgH;

  let sx = 0;
  let sy = 0;
  let sw = imgW;
  let sh = imgH;

  if (imgRatio > targetRatio) {
    sw = imgH * targetRatio;
    sx = (imgW - sw) / 2;
  } else {
    sh = imgW / targetRatio;
    sy = (imgH - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Reads runtime CSS variable value injected by next/font on :root so HTML5 Canvas
 * uses the exact loaded @font-face family name rather than falling back to OS defaults.
 */
function readCssFontVar(varName: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return '';
  return window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
}

function resolveCanvasFontFamily(fontId?: OrgChartFontId | string): string {
  switch (fontId) {
    case 'phetsarath': {
      const phetsarath = readCssFontVar('--font-phetsarath');
      const notoSerif = readCssFontVar('--font-noto-serif');
      return [
        phetsarath,
        '"Phetsarath OT"',
        '"Phetsarath"',
        notoSerif,
        '"Times New Roman"',
        'serif',
      ]
        .filter(Boolean)
        .join(', ');
    }
    case 'noto-lao-looped': {
      const looped = readCssFontVar('--font-noto-lao-looped');
      const notoSans = readCssFontVar('--font-noto-sans');
      return [
        looped,
        '"Noto Sans Lao Looped"',
        notoSans,
        '"Noto Sans"',
        'sans-serif',
      ]
        .filter(Boolean)
        .join(', ');
    }
    case 'noto-serif-lao': {
      const serifLao = readCssFontVar('--font-noto-serif-lao');
      const notoSerif = readCssFontVar('--font-noto-serif');
      return [
        serifLao,
        '"Noto Serif Lao"',
        notoSerif,
        '"Noto Serif"',
        'Georgia',
        'serif',
      ]
        .filter(Boolean)
        .join(', ');
    }
    case 'saysettha': {
      const phetsarath = readCssFontVar('--font-phetsarath');
      const notoSans = readCssFontVar('--font-noto-sans');
      return [
        '"Saysettha OT"',
        '"Saysettha Web"',
        phetsarath,
        '"Phetsarath OT"',
        notoSans,
        'sans-serif',
      ]
        .filter(Boolean)
        .join(', ');
    }
    case 'system-sans':
      return '"Leelawadee UI", "DokChampa", system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    case 'noto-sans-lao':
    default: {
      const notoLao = readCssFontVar('--font-noto-lao');
      const notoSans = readCssFontVar('--font-noto-sans');
      return [
        notoLao,
        '"Noto Sans Lao"',
        notoSans,
        '"Noto Sans"',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif',
      ]
        .filter(Boolean)
        .join(', ');
    }
  }
}

/**
 * Exports Multi-Tier OrgChartStructure into a high-resolution PNG File
 */
export async function exportOrgChartToImageFile(
  chart: OrgChartStructure,
  fileName = 'org-structure.png'
): Promise<File> {
  const tiers = normalizeChartTiers(chart);
  const nonEmptyTiers = tiers.filter((t) => t.nodes.length > 0);
  const activeTiers = nonEmptyTiers.length > 0 ? nonEmptyTiers : tiers;

  const style = resolveOrgChartStyle(chart.style);
  const chartCanvasFont = resolveCanvasFontFamily(style.fontFamily);
  const uniqueNodeFonts = Array.from(
    new Set(
      activeTiers.flatMap((t) =>
        t.nodes
          .map((n) => n.fontOverride?.fontFamily)
          .filter((f): f is OrgChartFontId => Boolean(f))
      )
    )
  );

  if (typeof document !== 'undefined' && document.fonts) {
    try {
      const familiesToLoad = [
        chartCanvasFont,
        ...uniqueNodeFonts.map((f) => resolveCanvasFontFamily(f)),
      ];
      await Promise.allSettled(
        familiesToLoad.flatMap((ff) => [
          document.fonts.load(`400 16px ${ff}`, 'ກຂຄລາວ ABCD'),
          document.fonts.load(`600 16px ${ff}`, 'ກຂຄລາວ ABCD'),
          document.fonts.load(`700 16px ${ff}`, 'ກຂຄລາວ ABCD'),
          document.fonts.load(`800 16px ${ff}`, 'ກຂຄລາວ ABCD'),
        ])
      );
      await document.fonts.ready;
    } catch {
      // Ignore font loading warnings and continue with available fonts
    }
  }
  const cardWidth = style.cardWidth;
  const cardGap = style.cardGap;
  const paddingX = 60;
  const paddingY = 50;
  const textMaxWidth = cardWidth - 24; // 12px inner padding on both sides
  const photoH = style.photoHeight;
  const interTierGap = style.tierGap;
  const pillCardGap = 14;
  const cardRadius = style.cardRadius;

  const subRowGap = Math.max(28, Math.round(interTierGap * 0.65));

  const maxNodesInAnyRow = Math.max(
    ...activeTiers.map((t) => {
      const cols = resolveTierMaxColumns(t, style.maxColumnsPerRow);
      return cols > 0 ? Math.min(cols, t.nodes.length) : t.nodes.length;
    }),
    1
  );
  const maxTierWidth =
    maxNodesInAnyRow * cardWidth + (maxNodesInAnyRow - 1) * cardGap;
  const canvasWidth = Math.max(maxTierWidth + paddingX * 2, 960);

  // Use a temporary measurement context to pre-compute exact dynamic heights
  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d');
  if (!mCtx) throw new Error('Cannot get canvas context');

  const fontSans = chartCanvasFont;

  // --- Pre-measure Top Header Pill ---
  const titleLaoText = (chart.chartTitleLao || 'ໂຄງຮ່າງການຈັດຕັ້ງ')
    .replace(/\r\n/g, '\n')
    .trim();
  const titleEnText = (chart.chartTitleEn || 'ORGANIZATION STRUCTURE')
    .replace(/\r\n/g, '\n')
    .trim();

  const measureLongestLine = (raw: string) =>
    Math.max(
      ...raw.split('\n').map((line) => mCtx.measureText(line.trim()).width),
      0
    );

  mCtx.font = `bold ${style.headerTitleLaoSize}px ${fontSans}`;
  const rawTitleLaoW = measureLongestLine(titleLaoText);
  mCtx.font = `bold ${style.headerTitleEnSize}px ${fontSans}`;
  const rawTitleEnW = measureLongestLine(titleEnText);

  const maxAllowedHeaderW = canvasWidth - paddingX * 2;
  const desiredHeaderW = Math.ceil(Math.max(rawTitleLaoW, rawTitleEnW)) + 80;
  const headerPillW = Math.min(Math.max(460, desiredHeaderW), maxAllowedHeaderW);
  const headerTextMaxW = headerPillW - 48;

  const fittedTitleLao = fitTextBlock(
    mCtx,
    titleLaoText,
    headerTextMaxW,
    fontSans,
    {
      baseSize: style.headerTitleLaoSize,
      minSize: Math.max(11, style.headerTitleLaoSize - 8),
      bold: true,
      lineHeightRatio: 1.3,
      maxLines: 4,
    }
  );
  const fittedTitleEn = fitTextBlock(
    mCtx,
    titleEnText,
    headerTextMaxW,
    fontSans,
    {
      baseSize: style.headerTitleEnSize,
      minSize: Math.max(8, style.headerTitleEnSize - 4),
      bold: true,
      lineHeightRatio: 1.3,
      maxLines: 4,
    }
  );
  const headerPillH = Math.max(
    72,
    14 + fittedTitleLao.height + 6 + fittedTitleEn.height + 14
  );

  // --- Pre-measure Every Tier & Card ---
  const tierLayouts: TierLayout[] = activeTiers.map((tier) => {
    const effectiveCols = resolveTierMaxColumns(tier, style.maxColumnsPerRow);
    const isSoloPerRow = tier.nodes.length === 1 || effectiveCols === 1;

    const nodeLayouts: NodeLayout[] = tier.nodes.map((node) => {
      const isBadgeOnly = node.nodeType === 'badge';
      const ov = node.fontOverride;
      const nodeFont = ov?.fontFamily
        ? resolveCanvasFontFamily(ov.fontFamily)
        : fontSans;
      const badgeSize = ov?.badgeFontSize ?? style.badgeFontSize;
      const nameLaoSize = ov?.nameLaoSize ?? style.nameLaoSize;
      const nameEnSize = ov?.nameEnSize ?? style.nameEnSize;
      const roleLaoSize = ov?.roleLaoSize ?? style.roleLaoSize;
      const roleEnSize = ov?.roleEnSize ?? style.roleEnSize;
      const badgeNoAutoWrap = ov?.badgeNoAutoWrap ?? style.badgeNoAutoWrap;

      const badgeWeight = ov?.badgeWeight ?? style.badgeWeight;
      const nameLaoWeight = ov?.nameLaoWeight ?? style.nameLaoWeight;
      const nameEnWeight = ov?.nameEnWeight ?? style.nameEnWeight;
      const roleLaoWeight = ov?.roleLaoWeight ?? style.roleLaoWeight;
      const roleEnWeight = ov?.roleEnWeight ?? style.roleEnWeight;

      const badgeEnScale = style.badgeEnScale ?? 0.8;
      const badgeText =
        node.departmentBadge ||
        (isBadgeOnly ? node.nameLao || 'ປ້າຍ / ໜ່ວຍງານ' : '');

      let badgePillW = cardWidth;
      if (isSoloPerRow && badgeText) {
        const soloBaseFont = `${badgeWeight} ${badgeSize}px ${nodeFont}`;
        const soloLatinFont =
          badgeEnScale !== 1
            ? `${badgeWeight} ${Number((badgeSize * badgeEnScale).toFixed(2))}px ${nodeFont}`
            : undefined;
        const longestBadgeW = Math.max(
          ...badgeText
            .replace(/\r\n/g, '\n')
            .trim()
            .split('\n')
            .map((line) =>
              measureSegmentWidth(mCtx, line.trim(), soloBaseFont, soloLatinFont)
            ),
          0
        );
        badgePillW = Math.min(
          Math.max(cardWidth, Math.ceil(longestBadgeW) + 32),
          Math.min(560, canvasWidth - paddingX * 2)
        );
      }

      const badgeMaxTextW = badgePillW - (isSoloPerRow ? 24 : 16);
      const badge = badgeText
        ? fitTextBlock(mCtx, badgeText, badgeMaxTextW, nodeFont, {
            baseSize: badgeSize,
            minSize: Math.max(7.5, badgeSize - 2),
            fontWeight: badgeWeight,
            lineHeightRatio: 1.38,
            maxLines: 6,
            noAutoWrap: badgeNoAutoWrap,
            latinScale: badgeEnScale,
          })
        : null;

      const nameLao = fitTextBlock(
        mCtx,
        node.nameLao || '',
        textMaxWidth,
        nodeFont,
        {
          baseSize: nameLaoSize,
          minSize: Math.max(8, nameLaoSize - 3),
          fontWeight: nameLaoWeight,
          lineHeightRatio: 1.35,
          maxLines: 5,
        }
      );

      const nameEn = node.nameEn
        ? fitTextBlock(mCtx, node.nameEn, textMaxWidth, nodeFont, {
            baseSize: nameEnSize,
            minSize: Math.max(7.5, nameEnSize - 2),
            fontWeight: nameEnWeight,
            lineHeightRatio: 1.3,
            maxLines: 5,
          })
        : null;

      const roleLao = fitTextBlock(
        mCtx,
        node.roleLao || 'ກຳມະການ',
        textMaxWidth,
        nodeFont,
        {
          baseSize: roleLaoSize,
          minSize: Math.max(8, roleLaoSize - 3),
          fontWeight: roleLaoWeight,
          lineHeightRatio: 1.35,
          maxLines: 5,
        }
      );

      const roleEn = fitTextBlock(
        mCtx,
        node.roleEn || 'Committee',
        textMaxWidth,
        nodeFont,
        {
          baseSize: roleEnSize,
          minSize: Math.max(7.5, roleEnSize - 2),
          fontWeight: roleEnWeight,
          lineHeightRatio: 1.3,
          maxLines: 5,
        }
      );

      const neededPillH = badge
        ? Math.max(isBadgeOnly ? 48 : 44, badge.height + (isBadgeOnly ? 18 : 16))
        : 0;

      // Photo (12 + photoH) + gap (12) + Name block + Divider (16) + Role block + Bottom pad (16)
      const nameSectionH =
        (nameLao.height || 16) + (nameEn ? 3 + nameEn.height : 0);
      const roleSectionH = roleLao.height + 3 + roleEn.height;
      const neededCardH = isBadgeOnly
        ? 0
        : 12 + photoH + 12 + nameSectionH + 16 + roleSectionH + 16;

      return {
        node,
        badge,
        pillW: badgePillW,
        nameLao,
        nameEn,
        roleLao,
        roleEn,
        neededPillH,
        neededCardH,
      };
    });

    const chunkedRows = chunkTierNodes(nodeLayouts, effectiveCols);
    const rows: RowLayout[] = chunkedRows.map((rowNodes) => {
      const hasBadges = rowNodes.some((l) => l.badge !== null);
      const hasCards = rowNodes.some((l) => l.node.nodeType !== 'badge');
      const pillH = hasBadges
        ? Math.max(44, ...rowNodes.map((l) => l.neededPillH))
        : 0;
      const pillGap = hasBadges && hasCards ? pillCardGap : 0;
      const cardH = hasCards
        ? Math.max(
            photoH + 115,
            ...rowNodes
              .filter((l) => l.node.nodeType !== 'badge')
              .map((l) => l.neededCardH)
          )
        : 0;

      return {
        nodes: rowNodes,
        hasBadges,
        hasCards,
        pillH,
        pillGap,
        cardH,
      };
    });

    return {
      tier,
      rows,
    };
  });

  const renderedTiers = tierLayouts.filter((t) => t.rows.length > 0);
  const totalTiersHeight = renderedTiers.reduce((sum, t, idx) => {
    const tierRowsHeight = t.rows.reduce(
      (rSum, row, rIdx) =>
        rSum + row.pillH + row.pillGap + row.cardH + (rIdx > 0 ? subRowGap : 0),
      0
    );
    return sum + tierRowsHeight + (idx > 0 ? interTierGap : 0);
  }, 0);

  const headerBottomToTier1Gap = 36;
  const canvasHeight = Math.max(
    paddingY + headerPillH + headerBottomToTier1Gap + totalTiersHeight + paddingY,
    480
  );

  const canvas = document.createElement('canvas');
  const scale = 2; // High-DPI 2x Retina
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = style.backgroundColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // --- 1. Top Header Pill ---
  const headerPillX = (canvasWidth - headerPillW) / 2;
  const headerPillY = paddingY;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = style.headerBorderColor;
  ctx.lineWidth = 2.5;
  roundRect(
    ctx,
    headerPillX,
    headerPillY,
    headerPillW,
    headerPillH,
    Math.min(cardRadius, 16)
  );
  ctx.fill();
  ctx.stroke();

  ctx.save();
  roundRect(ctx, headerPillX + 4, headerPillY + 4, headerPillW - 8, headerPillH - 8, 12);
  ctx.clip();
  const titleTotalH = fittedTitleLao.height + 6 + fittedTitleEn.height;
  const titleStartY = headerPillY + (headerPillH - titleTotalH) / 2;
  drawFittedTextBlock(
    ctx,
    fittedTitleLao,
    canvasWidth / 2,
    titleStartY,
    style.primaryTextColor
  );
  drawFittedTextBlock(
    ctx,
    fittedTitleEn,
    canvasWidth / 2,
    titleStartY + fittedTitleLao.height + 6,
    '#2563eb'
  );
  ctx.restore();

  // Stem from Header Pill down to Tier 1
  let prevTierBottomY = headerPillY + headerPillH;
  let currentY = prevTierBottomY + headerBottomToTier1Gap;

  // Render each tier (supporting multi-row wrapping inside a tier)
  for (let tIdx = 0; tIdx < renderedTiers.length; tIdx++) {
    const tLayout = renderedTiers[tIdx];
    let prevRowBottomY = prevTierBottomY;

    // Pre-compute Y positions for all wrapped rows so continuous center spine
    // can be painted cleanly before opaque white cards sit on top
    const rowYPositions: { startY: number; gapAbove: number }[] = [];
    let scanY = currentY;
    for (let rIdx = 0; rIdx < tLayout.rows.length; rIdx++) {
      const r = tLayout.rows[rIdx];
      const gapAbove =
        rIdx > 0
          ? subRowGap
          : tIdx > 0
            ? interTierGap
            : headerBottomToTier1Gap;
      rowYPositions.push({ startY: scanY, gapAbove });
      scanY += r.pillH + r.pillGap + r.cardH + subRowGap;
    }

    if (tLayout.rows.length > 1) {
      const firstRowMeta = rowYPositions[0];
      const lastRowMeta = rowYPositions[rowYPositions.length - 1];
      const topSpineY =
        tIdx > 0 || tLayout.rows[0].nodes.length > 1
          ? firstRowMeta.startY - Math.round(firstRowMeta.gapAbove / 2)
          : firstRowMeta.startY;
      const bottomSpineY =
        lastRowMeta.startY - Math.round(lastRowMeta.gapAbove / 2);

      ctx.strokeStyle = style.lineColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, topSpineY);
      ctx.lineTo(canvasWidth / 2, bottomSpineY);
      ctx.stroke();
    }

    for (let rIdx = 0; rIdx < tLayout.rows.length; rIdx++) {
      const row = tLayout.rows[rIdx];
      const nodeCount = row.nodes.length;
      if (nodeCount === 0) continue;

      const totalWidth = nodeCount * cardWidth + (nodeCount - 1) * cardGap;
      const startX = (canvasWidth - totalWidth) / 2;

      const nodeCenters: number[] = [];
      for (let i = 0; i < nodeCount; i++) {
        nodeCenters.push(startX + i * (cardWidth + cardGap) + cardWidth / 2);
      }

      // Connector lines from previous tier or previous wrapped row
      ctx.strokeStyle = style.lineColor;
      ctx.lineWidth = 1.5;

      const getDropTargetY = (nodeIndex: number) =>
        row.hasBadges && !row.nodes[nodeIndex].badge && row.hasCards
          ? currentY + row.pillH + row.pillGap
          : currentY;

      if (rIdx > 0 || tIdx > 0 || nodeCenters.length > 1) {
        const gapFromAbove = rowYPositions[rIdx].gapAbove;
        const crossbarY = currentY - Math.round(gapFromAbove / 2);

        if (rIdx === 0) {
          ctx.beginPath();
          ctx.moveTo(canvasWidth / 2, prevRowBottomY);
          ctx.lineTo(canvasWidth / 2, crossbarY);
          ctx.stroke();
        }

        if (nodeCenters.length > 1) {
          ctx.beginPath();
          ctx.moveTo(nodeCenters[0], crossbarY);
          ctx.lineTo(nodeCenters[nodeCenters.length - 1], crossbarY);
          ctx.stroke();
        }

        for (let i = 0; i < nodeCenters.length; i++) {
          const cx = nodeCenters[i];
          ctx.beginPath();
          ctx.moveTo(cx, crossbarY);
          ctx.lineTo(cx, getDropTargetY(i));
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(nodeCenters[0], prevRowBottomY);
        ctx.lineTo(nodeCenters[0], getDropTargetY(0));
        ctx.stroke();
      }

      // Draw cards for this wrapped row
      const pillH = row.pillH;
      const cardH = row.cardH;
      const pillY = currentY;
      const cardY = pillY + pillH + row.pillGap;

      for (let i = 0; i < nodeCount; i++) {
        const nLayout = row.nodes[i];
      const { node } = nLayout;
      const isBadgeOnly = node.nodeType === 'badge';
      const cx = nodeCenters[i];
      const x = cx - cardWidth / 2;

      // 1. Department Badge Pill
      if (nLayout.badge) {
        const pillW = nLayout.pillW;
        const pillX = cx - pillW / 2;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = style.badgeBorderColor;
        ctx.lineWidth = isBadgeOnly ? 1.8 : 1.5;
        roundRect(ctx, pillX, pillY, pillW, pillH, Math.min(cardRadius, 12));
        ctx.fill();
        ctx.stroke();

        ctx.save();
        roundRect(ctx, pillX + 4, pillY + 3, pillW - 8, pillH - 6, 9);
        ctx.clip();
        const badgeTopY = pillY + (pillH - nLayout.badge.height) / 2;
        drawFittedTextBlock(
          ctx,
          nLayout.badge,
          cx,
          badgeTopY,
          style.primaryTextColor
        );
        ctx.restore();

        if (!isBadgeOnly) {
          // Stem from pill to card
          ctx.strokeStyle = style.lineColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx, pillY + pillH);
          ctx.lineTo(cx, cardY);
          ctx.stroke();
        }
      }

      if (isBadgeOnly) {
        continue;
      }

      // 2. Member Card Box
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle =
        tIdx === 0 ? style.leaderBorderColor : style.memberBorderColor;
      ctx.lineWidth = tIdx === 0 ? 2.2 : 1.8;
      roundRect(ctx, x, cardY, cardWidth, cardH, cardRadius);
      ctx.fill();
      ctx.stroke();

      // 3. Photo
      const photoW = cardWidth - 24;
      const photoX = x + 12;
      const photoY = cardY + 12;

      ctx.save();
      roundRect(
        ctx,
        photoX,
        photoY,
        photoW,
        photoH,
        Math.max(cardRadius - 6, 6)
      );
      ctx.clip();
      if (node.photoUrl) {
        try {
          const img = await loadImage(node.photoUrl);
          drawImageCover(ctx, img, photoX, photoY, photoW, photoH);
        } catch {
          drawAvatarPlaceholder(ctx, photoX, photoY, photoW, photoH);
        }
      } else {
        drawAvatarPlaceholder(ctx, photoX, photoY, photoW, photoH);
      }
      ctx.restore();

      // Clip text content strictly within the card border
      ctx.save();
      roundRect(
        ctx,
        x + 4,
        cardY + 4,
        cardWidth - 8,
        cardH - 8,
        Math.max(cardRadius - 4, 6)
      );
      ctx.clip();

      let cursorY = photoY + photoH + 12;

      // 4. Lao Name
      if (nLayout.nameLao.lines.length > 0) {
        drawFittedTextBlock(
          ctx,
          nLayout.nameLao,
          cx,
          cursorY,
          style.primaryTextColor
        );
        cursorY += nLayout.nameLao.height;
      }

      // 5. English Name
      if (nLayout.nameEn && nLayout.nameEn.lines.length > 0) {
        cursorY += 3;
        drawFittedTextBlock(
          ctx,
          nLayout.nameEn,
          cx,
          cursorY,
          style.secondaryTextColor
        );
        cursorY += nLayout.nameEn.height;
      }

      // Divider
      cursorY += 8;
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 16, cursorY);
      ctx.lineTo(x + cardWidth - 16, cursorY);
      ctx.stroke();
      cursorY += 8;

      // 6. Role Lao & English
      drawFittedTextBlock(
        ctx,
        nLayout.roleLao,
        cx,
        cursorY,
        style.primaryTextColor
      );
      cursorY += nLayout.roleLao.height + 3;
      drawFittedTextBlock(
        ctx,
        nLayout.roleEn,
        cx,
        cursorY,
        style.secondaryTextColor
      );

        ctx.restore();
      }

      prevRowBottomY = cardY + cardH;
      if (rIdx < tLayout.rows.length - 1) {
        currentY = prevRowBottomY + subRowGap;
      }
    }

    // Set up Y for next tier
    prevTierBottomY = prevRowBottomY;
    currentY = prevTierBottomY + interTierGap;
  }

  // Convert canvas to Blob & File
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        const file = new File([blob], fileName, { type: 'image/png' });
        resolve(file);
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * ບີບອັດ ແລະ ຫຍໍ້ຂະໜາດຮູບພາບ Portrait ຂອງບຸກຄະລາກອນ
 * ໃຫ້ເຫຼືອຂະໜາດນ້ອຍພຽງ ~8-15KB ປ້ອງກັນ Payload Too Large (500 Error)
 */
export async function compressAvatarImage(
  fileOrDataUrl: File | string,
  maxWidth = 180,
  maxHeight = 230,
  quality = 0.72
): Promise<string> {
  if (typeof window === 'undefined') {
    return typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '';
  }

  // 1. Get initial data url
  let initialUrl: string;
  if (fileOrDataUrl instanceof File) {
    initialUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrDataUrl);
    });
  } else {
    initialUrl = fileOrDataUrl;
  }

  // If already a tiny SVG or external URL or already small data URL (< 15KB)
  if (
    !initialUrl.startsWith('data:image/') ||
    initialUrl.startsWith('data:image/svg') ||
    initialUrl.length < 15000
  ) {
    return initialUrl;
  }

  // 2. Load into Image & resize on Canvas
  try {
    const img = await loadImage(initialUrl);
    let width = img.naturalWidth || img.width;
    let height = img.naturalHeight || img.height;

    if (!width || !height) return initialUrl;

    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return initialUrl;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', quality);
  } catch (err) {
    console.warn('compressAvatarImage warning:', err);
    return initialUrl;
  }
}

/**
 * Helper ສຳລັບອັບໂຫຼດຮູບພາບປະຈຳຕົວຂຶ້ນ Backend Server (/uploads/org-structures/avatars/...)
 * ຖ້າ API ສຳເລັດຈະສົ່ງ path ສັ້ນກັບຄືນມາ (~45 ຕົວອັກສອນ)
 * ຖ້າ backend ຍັງບໍ່ໄດ້ deploy endpoint ຫຼື offline ຈະ fallback ໃຊ້ compressed Base64 (~8-12KB)
 */
export async function uploadOrProcessAvatar(
  fileOrUrl: File | string
): Promise<string> {
  if (!fileOrUrl) return '';

  // 1. ຖ້າເປັນ path ຂອງ Server ຢູ່ແລ້ວ ຫຼື full URL
  if (typeof fileOrUrl === 'string') {
    if (
      fileOrUrl.startsWith('/uploads/') ||
      fileOrUrl.startsWith('http://') ||
      fileOrUrl.startsWith('https://')
    ) {
      return fileOrUrl;
    }
  }

  // 2. ຖ້າເປັນ File object: ອັບໂຫຼດຂຶ້ນ Server ກ່ອນ
  if (fileOrUrl instanceof File) {
    try {
      const res = await orgStructureApi.uploadAvatar(fileOrUrl);
      if (res?.imagePath) {
        return res.imagePath;
      }
    } catch (err) {
      console.warn(
        'Avatar upload endpoint failed, falling back to local compression:',
        err
      );
    }
    // Fallback: ບີບອັດເປັນ base64 ຂະໜາດນ້ອຍ
    return await compressAvatarImage(fileOrUrl);
  }

  // 3. ຖ້າເປັນ Base64 data URL: ແປງເປັນ File ແລ້ວອັບໂຫຼດຂຶ້ນ Server ເພື່ອຫຼຸດ payload
  if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('data:image/')) {
    try {
      const res = await fetch(fileOrUrl);
      const blob = await res.blob();
      const file = new File([blob], `avatar-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      const uploadRes = await orgStructureApi.uploadAvatar(file);
      if (uploadRes?.imagePath) {
        return uploadRes.imagePath;
      }
    } catch (err) {
      console.warn(
        'Base64 auto-upload failed, falling back to local compression:',
        err
      );
    }
    // Fallback: ບີບອັດໃຫ້ເຫຼືອ < 12KB
    return await compressAvatarImage(fileOrUrl);
  }

  return fileOrUrl;
}

/**
 * ກວດສອບ ແລະ ປ່ຽນຮູບພາບທຸກຮູບໃນ Org Chart Structure ໃຫ້ເປັນ URL ສັ້ນ
 * ພ້ອມຕັດ duplicate keys (leader/members) ເພື່ອຫຼຸດຂະໜາດ JSON Payload ລົງເຫຼືອພຽງບໍ່ເທົ່າໃດ KB
 */
export async function sanitizeChartStructure(
  structure: OrgChartStructure
): Promise<OrgChartStructure> {
  if (!structure) return structure;
  const cloned: OrgChartStructure = JSON.parse(JSON.stringify(structure));
  const tiers = normalizeChartTiers(cloned);

  for (const tier of tiers) {
    for (const node of tier.nodes) {
      if (node.photoUrl) {
        try {
          node.photoUrl = await uploadOrProcessAvatar(node.photoUrl);
        } catch (e) {
          console.warn('Failed to sanitize node photo:', e);
        }
      }
    }
  }

  cloned.tiers = tiers;

  // ຕັດ duplicate keys (leader ແລະ members) ອອກ ເພື່ອຫຼຸດຂະໜາດ Payload ລົງ 50%
  delete cloned.leader;
  delete cloned.members;

  return cloned;
}

