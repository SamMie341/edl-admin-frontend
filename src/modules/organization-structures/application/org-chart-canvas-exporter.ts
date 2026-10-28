import type {
  OrgChartStructure,
  OrgChartPersonNode,
  OrgChartTier,
} from '../domain/org-chart-designer.types';
import { normalizeChartTiers } from '../domain/org-chart-designer.types';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';

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
    img.src = src.startsWith('/uploads/') ? getStorageUrl(src) : src;
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

/**
 * Wraps text into lines that fit maxWidth
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  if (text.includes(',')) {
    const parts = text.split(',');
    return parts.map((p, i) => (i < parts.length - 1 ? `${p.trim()},` : p.trim()));
  }

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const testLine = `${currentLine} ${words[i]}`;
    if (ctx.measureText(testLine).width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);

  if (lines.length === 1 && lines[0].length > 32) {
    const half = Math.floor(lines[0].length / 2);
    return [lines[0].substring(0, half), lines[0].substring(half)];
  }

  return lines;
}

/**
 * Exports Multi-Tier OrgChartStructure into a high-resolution PNG File
 */
export async function exportOrgChartToImageFile(
  chart: OrgChartStructure,
  fileName = 'org-structure.png'
): Promise<File> {
  const tiers = normalizeChartTiers(chart);
  const cardWidth = 200;
  const cardGap = 24;
  const paddingX = 60;
  const paddingY = 50;

  const maxNodesInAnyTier = Math.max(...tiers.map((t) => t.nodes.length), 1);
  const maxTierWidth =
    maxNodesInAnyTier * cardWidth + (maxNodesInAnyTier - 1) * cardGap;
  const canvasWidth = Math.max(maxTierWidth + paddingX * 2, 1200);

  // Height based on number of tiers
  const tierHeight = 360; // Card + Pill + line
  const headerSectionHeight = 110;
  const canvasHeight = Math.max(
    paddingY * 2 + headerSectionHeight + tiers.length * tierHeight,
    850
  );

  const canvas = document.createElement('canvas');
  const scale = 2; // High-DPI 2x Retina
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Lao Font Family
  const fontSans =
    '"Noto Sans Lao", "Noto Sans", -apple-system, BlinkMacSystemFont, sans-serif';

  // --- 1. Top Header Pill ---
  const headerPillW = Math.min(460, canvasWidth - 80);
  const headerPillH = 70;
  const headerPillX = (canvasWidth - headerPillW) / 2;
  const headerPillY = paddingY;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.5;
  roundRect(ctx, headerPillX, headerPillY, headerPillW, headerPillH, 16);
  ctx.fill();
  ctx.stroke();

  // Header Title Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1e3a8a';
  ctx.font = `bold 22px ${fontSans}`;
  ctx.fillText(
    chart.chartTitleLao || 'ໂຄງຮ່າງການຈັດຕັ້ງ',
    canvasWidth / 2,
    headerPillY + 24
  );

  ctx.fillStyle = '#2563eb';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(
    chart.chartTitleEn || 'ORGANIZATION STRUCTURE',
    canvasWidth / 2,
    headerPillY + 48
  );

  // Stem from Header Pill down to Tier 1
  let prevTierCenterY = headerPillY + headerPillH;
  let currentY = prevTierCenterY + 30;

  // Render each tier
  for (let tIdx = 0; tIdx < tiers.length; tIdx++) {
    const tier = tiers[tIdx];
    const nodeCount = tier.nodes.length;
    if (nodeCount === 0) continue;

    const totalWidth = nodeCount * cardWidth + (nodeCount - 1) * cardGap;
    const startX = (canvasWidth - totalWidth) / 2;

    const nodeCenters: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodeCenters.push(startX + i * (cardWidth + cardGap) + cardWidth / 2);
    }

    // Connector lines from previous level
    if (tIdx > 0) {
      const crossbarY = currentY - 20;

      // Vertical stem from canvas center down to crossbar
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, prevTierCenterY);
      ctx.lineTo(canvasWidth / 2, crossbarY);
      ctx.stroke();

      // Crossbar across node centers
      if (nodeCenters.length > 1) {
        ctx.beginPath();
        ctx.moveTo(nodeCenters[0], crossbarY);
        ctx.lineTo(nodeCenters[nodeCenters.length - 1], crossbarY);
        ctx.stroke();
      }

      // Vertical drops to each node
      for (const cx of nodeCenters) {
        ctx.beginPath();
        ctx.moveTo(cx, crossbarY);
        ctx.lineTo(cx, currentY);
        ctx.stroke();
      }
    } else {
      // Line from Header Pill down to top node(s)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      for (const cx of nodeCenters) {
        ctx.beginPath();
        ctx.moveTo(cx, prevTierCenterY);
        ctx.lineTo(cx, currentY);
        ctx.stroke();
      }
    }

    // Draw cards for this tier
    const pillH = 44;
    const cardH = 275;
    const pillY = currentY;
    const cardY = pillY + pillH + 12;

    for (let i = 0; i < nodeCount; i++) {
      const node = tier.nodes[i];
      const cx = nodeCenters[i];
      const x = cx - cardWidth / 2;

      // 1. Department Badge Pill
      if (node.departmentBadge) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#93c5fd';
        ctx.lineWidth = 1.5;
        roundRect(ctx, x, pillY, cardWidth, pillH, 12);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#1e3a8a';
        ctx.font = `bold 9px ${fontSans}`;
        const lines = wrapText(ctx, node.departmentBadge, cardWidth - 16);
        if (lines.length >= 2) {
          ctx.fillText(lines[0], cx, pillY + 14);
          ctx.fillText(lines[1], cx, pillY + 28);
        } else {
          ctx.fillText(lines[0] || node.departmentBadge, cx, pillY + 22);
        }

        // Stem from pill to card
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, pillY + pillH);
        ctx.lineTo(cx, cardY);
        ctx.stroke();
      }

      // 2. Member Card Box
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = tIdx === 0 ? '#f59e0b' : '#fbbf24';
      ctx.lineWidth = tIdx === 0 ? 2.2 : 1.8;
      roundRect(ctx, x, cardY, cardWidth, cardH, 16);
      ctx.fill();
      ctx.stroke();

      // 3. Photo
      const photoW = cardWidth - 24;
      const photoH = 150;
      const photoX = x + 12;
      const photoY = cardY + 12;

      ctx.save();
      roundRect(ctx, photoX, photoY, photoW, photoH, 10);
      ctx.clip();
      if (node.photoUrl) {
        try {
          const img = await loadImage(node.photoUrl);
          ctx.drawImage(img, photoX, photoY, photoW, photoH);
        } catch {
          drawAvatarPlaceholder(ctx, photoX, photoY, photoW, photoH);
        }
      } else {
        drawAvatarPlaceholder(ctx, photoX, photoY, photoW, photoH);
      }
      ctx.restore();

      // 4. Lao Name
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e3a8a';
      ctx.font = `bold 12px ${fontSans}`;
      ctx.fillText(node.nameLao || '', cx, cardY + 182);

      // 5. English Name
      ctx.fillStyle = '#475569';
      ctx.font = `bold 9px ${fontSans}`;
      ctx.fillText(node.nameEn || '', cx, cardY + 202);

      // 6. Role Lao & English
      ctx.fillStyle = '#1e3a8a';
      ctx.font = `bold 13px ${fontSans}`;
      ctx.fillText(node.roleLao || 'ກຳມະການ', cx, cardY + 228);

      ctx.fillStyle = '#64748b';
      ctx.font = `10px ${fontSans}`;
      ctx.fillText(node.roleEn || 'Committee', cx, cardY + 248);
    }

    // Set up Y for next tier
    prevTierCenterY = cardY + cardH;
    currentY = prevTierCenterY + 60;
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
 * ໃຫ້ເຫຼືອຂະໜາດນ້ອຍພຽງ ~10-25KB ປ້ອງກັນ Payload Too Large (500 Error)
 */
export async function compressAvatarImage(
  fileOrDataUrl: File | string,
  maxWidth = 260,
  maxHeight = 330,
  quality = 0.8
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

  // If already a tiny SVG or external URL or already small data URL (< 35KB)
  if (
    !initialUrl.startsWith('data:image/') ||
    initialUrl.startsWith('data:image/svg') ||
    initialUrl.length < 35000
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
 * ກວດສອບ ແລະ ບີບອັດຮູບພາບທຸກຮູບໃນ Org Chart Structure
 * ເພື່ອປ້ອງກັນບໍ່ໃຫ້ JSON Payload ໃຫຍ່ເກີນຂະໜາດທີ່ Server ກຳນົດ
 */
export async function sanitizeChartStructure(
  structure: OrgChartStructure
): Promise<OrgChartStructure> {
  if (!structure) return structure;
  const cloned: OrgChartStructure = JSON.parse(JSON.stringify(structure));
  const tiers = normalizeChartTiers(cloned);

  for (const tier of tiers) {
    for (const node of tier.nodes) {
      if (node.photoUrl && node.photoUrl.startsWith('data:image/')) {
        // Compress if larger than ~35KB
        if (node.photoUrl.length > 35000) {
          try {
            node.photoUrl = await compressAvatarImage(node.photoUrl);
          } catch (e) {
            console.warn('Failed to sanitize node photo:', e);
          }
        }
      }
    }
  }

  cloned.tiers = tiers;
  if (cloned.leader?.photoUrl && cloned.leader.photoUrl.startsWith('data:image/')) {
    if (cloned.leader.photoUrl.length > 35000) {
      cloned.leader.photoUrl = await compressAvatarImage(cloned.leader.photoUrl);
    }
  }

  return cloned;
}

