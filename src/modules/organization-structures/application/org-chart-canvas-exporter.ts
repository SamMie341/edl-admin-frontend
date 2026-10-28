import type {
  OrgChartStructure,
  OrgChartPersonNode,
} from '../domain/org-chart-designer.types';
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
    // If it's a relative path from backend storage, prepend full storage URL
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

  // Shoulders
  ctx.beginPath();
  ctx.arc(cx, y + h * 0.95, r * 1.8, Math.PI, Math.PI * 2);
  ctx.fill();
}

/**
 * Wraps text into lines for canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  // Split on comma first if present
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

  // If still single long line without spaces, split by half
  if (lines.length === 1 && lines[0].length > 32) {
    const half = Math.floor(lines[0].length / 2);
    return [lines[0].substring(0, half), lines[0].substring(half)];
  }

  return lines;
}

/**
 * Exports OrgChartStructure into a high-resolution PNG File
 */
export async function exportOrgChartToImageFile(
  chart: OrgChartStructure,
  fileName = 'org-structure.png'
): Promise<File> {
  const memberCount = Math.max(chart.members.length, 1);
  const cardWidth = 200;
  const cardGap = 24;
  const paddingX = 60;
  const paddingY = 50;

  const totalMembersWidth =
    memberCount * cardWidth + (memberCount - 1) * cardGap;
  const canvasWidth = Math.max(totalMembersWidth + paddingX * 2, 1200);
  const canvasHeight = 920;

  const canvas = document.createElement('canvas');
  // High-DPI 2x scale
  const scale = 2;
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
  const headerPillW = 420;
  const headerPillH = 70;
  const headerPillX = (canvasWidth - headerPillW) / 2;
  const headerPillY = paddingY;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1e3a8a'; // Deep blue border
  ctx.lineWidth = 2.5;
  roundRect(ctx, headerPillX, headerPillY, headerPillW, headerPillH, 16);
  ctx.fill();
  ctx.stroke();

  // Header Title Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1e3a8a';
  ctx.font = `bold 22px ${fontSans}`;
  ctx.fillText(chart.chartTitleLao || 'ປະທານສະພາຜູ້ບໍລິຫານ', canvasWidth / 2, headerPillY + 24);

  ctx.fillStyle = '#2563eb';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(chart.chartTitleEn || 'CHAIRMAN OF THE BOARD', canvasWidth / 2, headerPillY + 48);

  // --- 2. Leader Card (Level 1) ---
  const leaderCardW = 210;
  const leaderCardH = 260;
  const leaderCardX = (canvasWidth - leaderCardW) / 2;
  const leaderCardY = headerPillY + headerPillH + 30;

  // Leader Card Box with Amber border
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#f59e0b'; // Amber border
  ctx.lineWidth = 2;
  roundRect(ctx, leaderCardX, leaderCardY, leaderCardW, leaderCardH, 16);
  ctx.fill();
  ctx.stroke();

  // Leader Photo
  const photoW = 180;
  const photoH = 175;
  const photoX = leaderCardX + (leaderCardW - photoW) / 2;
  const photoY = leaderCardY + 12;

  ctx.save();
  roundRect(ctx, photoX, photoY, photoW, photoH, 10);
  ctx.clip();
  if (chart.leader.photoUrl) {
    try {
      const leaderImg = await loadImage(chart.leader.photoUrl);
      ctx.drawImage(leaderImg, photoX, photoY, photoW, photoH);
    } catch {
      drawAvatarPlaceholder(ctx, photoX, photoY, photoW, photoH);
    }
  } else {
    drawAvatarPlaceholder(ctx, photoX, photoY, photoW, photoH);
  }
  ctx.restore();

  // Leader Names
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1e3a8a';
  ctx.font = `bold 14px ${fontSans}`;
  ctx.fillText(chart.leader.nameLao || '', leaderCardX + leaderCardW / 2, leaderCardY + 208);

  ctx.fillStyle = '#475569';
  ctx.font = `bold 10px ${fontSans}`;
  ctx.fillText(chart.leader.nameEn || '', leaderCardX + leaderCardW / 2, leaderCardY + 230);

  // --- 3. Tree Connector Lines ---
  const stemStartY = leaderCardY + leaderCardH;
  const crossbarY = stemStartY + 45;

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;

  // Stem from leader down to crossbar
  ctx.beginPath();
  ctx.moveTo(canvasWidth / 2, stemStartY);
  ctx.lineTo(canvasWidth / 2, crossbarY);
  ctx.stroke();

  // Member centers
  const memberPositions: number[] = [];
  const startMembersX = (canvasWidth - totalMembersWidth) / 2;

  for (let i = 0; i < memberCount; i++) {
    const mX = startMembersX + i * (cardWidth + cardGap);
    memberPositions.push(mX + cardWidth / 2);
  }

  // Crossbar line spanning from first member center to last member center
  if (memberPositions.length > 1) {
    ctx.beginPath();
    ctx.moveTo(memberPositions[0], crossbarY);
    ctx.lineTo(memberPositions[memberPositions.length - 1], crossbarY);
    ctx.stroke();
  }

  // --- 4. Member Cards (Level 2) ---
  const memberPillH = 48;
  const memberCardH = 290;
  const memberPillY = crossbarY + 25;
  const memberCardY = memberPillY + memberPillH + 15;

  for (let i = 0; i < chart.members.length; i++) {
    const member = chart.members[i];
    const mCenterX = memberPositions[i];
    const mX = mCenterX - cardWidth / 2;

    // Line from crossbar to member pill
    ctx.beginPath();
    ctx.moveTo(mCenterX, crossbarY);
    ctx.lineTo(mCenterX, memberPillY);
    ctx.stroke();

    // Top Department Pill
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#93c5fd'; // Light blue
    ctx.lineWidth = 1.5;
    roundRect(ctx, mX, memberPillY, cardWidth, memberPillH, 12);
    ctx.fill();
    ctx.stroke();

    // Department Badge Text (multiline wrap)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1e3a8a';
    ctx.font = `bold 9.5px ${fontSans}`;
    const badgeText = member.departmentBadge || 'ກຳມະການ';
    const lines = wrapText(ctx, badgeText, cardWidth - 16);

    if (lines.length >= 2) {
      ctx.fillText(lines[0], mCenterX, memberPillY + 16);
      ctx.fillText(lines[1], mCenterX, memberPillY + 32);
    } else {
      ctx.fillText(lines[0] || badgeText, mCenterX, memberPillY + 24);
    }

    // Line from pill to card
    ctx.beginPath();
    ctx.moveTo(mCenterX, memberPillY + memberPillH);
    ctx.lineTo(mCenterX, memberCardY);
    ctx.stroke();

    // Member Card Box
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#f59e0b'; // Amber border
    ctx.lineWidth = 1.8;
    roundRect(ctx, mX, memberCardY, cardWidth, memberCardH, 16);
    ctx.fill();
    ctx.stroke();

    // Member Photo
    const mPhotoW = cardWidth - 24;
    const mPhotoH = 160;
    const mPhotoX = mX + 12;
    const mPhotoY = memberCardY + 12;

    ctx.save();
    roundRect(ctx, mPhotoX, mPhotoY, mPhotoW, mPhotoH, 10);
    ctx.clip();
    if (member.photoUrl) {
      try {
        const mImg = await loadImage(member.photoUrl);
        ctx.drawImage(mImg, mPhotoX, mPhotoY, mPhotoW, mPhotoH);
      } catch {
        drawAvatarPlaceholder(ctx, mPhotoX, mPhotoY, mPhotoW, mPhotoH);
      }
    } else {
      drawAvatarPlaceholder(ctx, mPhotoX, mPhotoY, mPhotoW, mPhotoH);
    }
    ctx.restore();

    // Member Lao Name
    ctx.fillStyle = '#1e3a8a';
    ctx.font = `bold 12px ${fontSans}`;
    ctx.fillText(member.nameLao || '', mCenterX, memberCardY + 192);

    // Member En Name
    ctx.fillStyle = '#475569';
    ctx.font = `bold 9px ${fontSans}`;
    ctx.fillText(member.nameEn || '', mCenterX, memberCardY + 214);

    // Role Lao
    ctx.fillStyle = '#1e3a8a';
    ctx.font = `bold 13.5px ${fontSans}`;
    ctx.fillText(member.roleLao || 'ກຳມະການ', mCenterX, memberCardY + 242);

    // Role En
    ctx.fillStyle = '#64748b';
    ctx.font = `10.5px ${fontSans}`;
    ctx.fillText(member.roleEn || 'Committee', mCenterX, memberCardY + 264);
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
