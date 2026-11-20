export type OrgChartFontId =
  | 'noto-sans-lao'
  | 'phetsarath'
  | 'noto-lao-looped'
  | 'noto-serif-lao'
  | 'saysettha'
  | 'system-sans';

export interface OrgChartFontOption {
  id: OrgChartFontId;
  label: string;
  sublabel: string;
  sampleLao: string;
  cssFamily: string;
}

export const ORG_CHART_FONT_OPTIONS: OrgChartFontOption[] = [
  {
    id: 'noto-sans-lao',
    label: 'Noto Sans Lao',
    sublabel: 'ທັນສະໄໝ (ຄ່າເລີ່ມຕົ້ນ)',
    sampleLao: 'ກຂຄ · EDL',
    cssFamily:
      'var(--font-noto-lao), var(--font-noto-sans), "Noto Sans Lao", sans-serif',
  },
  {
    id: 'phetsarath',
    label: 'Phetsarath (ເພັດສະລາດ)',
    sublabel: 'ຟ້ອນມາດຕະຖານທາງການລັດ',
    sampleLao: 'ກຂຄ · EDL',
    cssFamily:
      'var(--font-phetsarath), "Phetsarath OT", "Phetsarath", var(--font-noto-serif), "Times New Roman", serif',
  },
  {
    id: 'noto-lao-looped',
    label: 'Noto Lao Looped',
    sublabel: 'ຕົວມີຫົວ ອ່ານງ່າຍສະບາຍຕາ',
    sampleLao: 'ກຂຄ · EDL',
    cssFamily:
      'var(--font-noto-lao-looped), var(--font-noto-sans), "Noto Sans Lao Looped", sans-serif',
  },
  {
    id: 'noto-serif-lao',
    label: 'Noto Serif Lao',
    sublabel: 'ຕົວຫຼູຫຼາ ເໝາະກັບຫົວຂໍ້ທາງການ',
    sampleLao: 'ກຂຄ · EDL',
    cssFamily:
      'var(--font-noto-serif-lao), var(--font-noto-serif), "Noto Serif Lao", Georgia, serif',
  },
  {
    id: 'saysettha',
    label: 'Saysettha OT (ໄຊເສດຖາ)',
    sublabel: 'ຟ້ອນໄຊເສດຖາລະບົບ',
    sampleLao: 'ກຂຄ · EDL',
    cssFamily:
      '"Saysettha OT", "Saysettha Web", var(--font-phetsarath), "Phetsarath OT", sans-serif',
  },
  {
    id: 'system-sans',
    label: 'System / Leelawadee',
    sublabel: 'ຟ້ອນພື້ນຖານຂອງເຄື່ອງ',
    sampleLao: 'ກຂຄ · EDL',
    cssFamily:
      '"Leelawadee UI", "DokChampa", system-ui, -apple-system, sans-serif',
  },
];

export function resolveOrgChartCssFont(fontId?: string): string {
  const found = ORG_CHART_FONT_OPTIONS.find((f) => f.id === fontId);
  return found ? found.cssFamily : ORG_CHART_FONT_OPTIONS[0].cssFamily;
}

const LATIN_RUN_REGEX =
  /([A-Za-z][A-Za-z0-9.,'&\-+]*(?:[ ]+(?:\/[ ]+)?[A-Za-z0-9.,'&\-+]+)*)/g;

/**
 * Splits mixed Lao/English text into script runs so English/Latin phrases can
 * render at a balanced optical scale without touching Lao numerals or spacing.
 */
export function splitTextByScript(
  text: string
): Array<{ text: string; isLatin: boolean }> {
  if (!text) return [];
  const runs: Array<{ text: string; isLatin: boolean }> = [];
  let lastIdx = 0;

  for (const match of text.matchAll(LATIN_RUN_REGEX)) {
    const start = match.index ?? 0;
    if (start > lastIdx) {
      runs.push({ text: text.slice(lastIdx, start), isLatin: false });
    }
    runs.push({ text: match[0], isLatin: true });
    lastIdx = start + match[0].length;
  }

  if (lastIdx < text.length) {
    runs.push({ text: text.slice(lastIdx), isLatin: false });
  }
  return runs;
}

export type OrgChartFontWeight = 400 | 500 | 600 | 700 | 800;

export const ORG_CHART_FONT_WEIGHT_OPTIONS: Array<{
  value: OrgChartFontWeight;
  label: string;
}> = [
  { value: 400, label: 'ປົກກະຕິ (400)' },
  { value: 500, label: 'ປານກາງ (500)' },
  { value: 600, label: 'ກາງ-ເຂັ້ມ (600)' },
  { value: 700, label: 'ຕົວເຂັ້ມ (700)' },
  { value: 800, label: 'ເຂັ້ມພິເສດ (800)' },
];

export interface OrgChartNodeFontOverride {
  fontFamily?: OrgChartFontId;
  badgeNoAutoWrap?: boolean;
  badgeFontSize?: number;
  nameLaoSize?: number;
  nameEnSize?: number;
  roleLaoSize?: number;
  roleEnSize?: number;
  badgeWeight?: OrgChartFontWeight;
  nameLaoWeight?: OrgChartFontWeight;
  nameEnWeight?: OrgChartFontWeight;
  roleLaoWeight?: OrgChartFontWeight;
  roleEnWeight?: OrgChartFontWeight;
}

export interface OrgChartStyleConfig {
  fontFamily: OrgChartFontId;
  maxColumnsPerRow: number; // 0 = single row (no wrap), >= 1 = wrap after N cards
  badgeNoAutoWrap: boolean; // true = preserve only explicit Enter line breaks in badge pills
  cardWidth: number;
  photoHeight: number;
  cardGap: number;
  tierGap: number;
  cardRadius: number;
  headerTitleLaoSize: number;
  headerTitleEnSize: number;
  badgeFontSize: number;
  badgeEnScale: number; // Optical ratio for Latin text inside badge pills (e.g. 0.8 = 80%)
  nameLaoSize: number;
  nameEnSize: number;
  roleLaoSize: number;
  roleEnSize: number;
  badgeWeight: OrgChartFontWeight;
  nameLaoWeight: OrgChartFontWeight;
  nameEnWeight: OrgChartFontWeight;
  roleLaoWeight: OrgChartFontWeight;
  roleEnWeight: OrgChartFontWeight;
  headerBorderColor: string;
  badgeBorderColor: string;
  leaderBorderColor: string;
  memberBorderColor: string;
  primaryTextColor: string;
  secondaryTextColor: string;
  lineColor: string;
  backgroundColor: string;
}

export const DEFAULT_ORG_CHART_STYLE: OrgChartStyleConfig = {
  fontFamily: 'noto-sans-lao',
  maxColumnsPerRow: 0,
  badgeNoAutoWrap: false,
  cardWidth: 220,
  photoHeight: 156,
  cardGap: 24,
  tierGap: 56,
  cardRadius: 16,
  headerTitleLaoSize: 22,
  headerTitleEnSize: 12,
  badgeFontSize: 10,
  badgeEnScale: 0.8,
  nameLaoSize: 12,
  nameEnSize: 9.5,
  roleLaoSize: 12.5,
  roleEnSize: 10,
  badgeWeight: 700,
  nameLaoWeight: 700,
  nameEnWeight: 700,
  roleLaoWeight: 700,
  roleEnWeight: 400,
  headerBorderColor: '#1e3a8a',
  badgeBorderColor: '#93c5fd',
  leaderBorderColor: '#f59e0b',
  memberBorderColor: '#fbbf24',
  primaryTextColor: '#1e3a8a',
  secondaryTextColor: '#475569',
  lineColor: '#94a3b8',
  backgroundColor: '#ffffff',
};

export const ORG_CHART_SIZE_PRESETS: Record<
  'compact' | 'standard' | 'large',
  { label: string; values: Partial<OrgChartStyleConfig> }
> = {
  compact: {
    label: 'ນ້ອຍ (S)',
    values: {
      cardWidth: 188,
      photoHeight: 136,
      cardGap: 16,
      tierGap: 44,
      headerTitleLaoSize: 18,
      headerTitleEnSize: 10.5,
      badgeFontSize: 9,
      nameLaoSize: 11,
      nameEnSize: 8.5,
      roleLaoSize: 11,
      roleEnSize: 9,
    },
  },
  standard: {
    label: 'ກາງ (M)',
    values: {
      cardWidth: 220,
      photoHeight: 156,
      cardGap: 24,
      tierGap: 56,
      headerTitleLaoSize: 22,
      headerTitleEnSize: 12,
      badgeFontSize: 10,
      nameLaoSize: 12,
      nameEnSize: 9.5,
      roleLaoSize: 12.5,
      roleEnSize: 10,
    },
  },
  large: {
    label: 'ໃຫຍ່ (L)',
    values: {
      cardWidth: 260,
      photoHeight: 190,
      cardGap: 28,
      tierGap: 68,
      headerTitleLaoSize: 26,
      headerTitleEnSize: 14,
      badgeFontSize: 11.5,
      nameLaoSize: 14,
      nameEnSize: 11,
      roleLaoSize: 14.5,
      roleEnSize: 11.5,
    },
  },
};

export const ORG_CHART_COLOR_THEMES: Array<{
  id: string;
  label: string;
  values: Partial<OrgChartStyleConfig>;
}> = [
  {
    id: 'edl-royal',
    label: 'ຟ້າ-ທອງ ຟຟລ',
    values: {
      headerBorderColor: '#1e3a8a',
      badgeBorderColor: '#93c5fd',
      leaderBorderColor: '#f59e0b',
      memberBorderColor: '#fbbf24',
      primaryTextColor: '#1e3a8a',
      secondaryTextColor: '#475569',
      lineColor: '#94a3b8',
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'emerald-gold',
    label: 'ຂຽວ-ທອງ',
    values: {
      headerBorderColor: '#065f46',
      badgeBorderColor: '#6ee7b7',
      leaderBorderColor: '#d97706',
      memberBorderColor: '#fbbf24',
      primaryTextColor: '#064e3b',
      secondaryTextColor: '#475569',
      lineColor: '#94a3b8',
      backgroundColor: '#ffffff',
    },
  },
  {
    id: 'slate-classic',
    label: 'ເທົາເຂັ້ມ-ນ້ຳເງິນ',
    values: {
      headerBorderColor: '#0f172a',
      badgeBorderColor: '#cbd5e1',
      leaderBorderColor: '#1d4ed8',
      memberBorderColor: '#60a5fa',
      primaryTextColor: '#0f172a',
      secondaryTextColor: '#475569',
      lineColor: '#94a3b8',
      backgroundColor: '#f8fafc',
    },
  },
];

export function resolveOrgChartStyle(
  style?: Partial<OrgChartStyleConfig> | null
): OrgChartStyleConfig {
  return {
    ...DEFAULT_ORG_CHART_STYLE,
    ...(style ?? {}),
  };
}

export interface OrgChartPersonNode {
  id: string;
  nodeType?: 'person' | 'badge'; // 'badge' renders badge pill only (no photo/name card)
  nameLao: string;
  nameEn: string;
  roleLao: string;
  roleEn: string;
  departmentBadge?: string;
  photoUrl?: string; // Data URL or Image URL
  fontOverride?: OrgChartNodeFontOverride;
}

export interface OrgChartTier {
  id: string;
  tierTitleLao?: string;
  tierTitleEn?: string;
  maxColumns?: number; // undefined = follow style.maxColumnsPerRow, 0 = 1 row, >= 1 = cards per row
  nodes: OrgChartPersonNode[];
}

export function resolveTierMaxColumns(
  tier: Pick<OrgChartTier, 'maxColumns'>,
  defaultMaxColumnsPerRow?: number
): number {
  if (typeof tier.maxColumns === 'number' && tier.maxColumns >= 0) {
    return tier.maxColumns;
  }
  return defaultMaxColumnsPerRow && defaultMaxColumnsPerRow > 0
    ? defaultMaxColumnsPerRow
    : 0;
}

export function chunkTierNodes<T>(nodes: T[], maxColumns: number): T[][] {
  if (nodes.length === 0) return [];
  if (!maxColumns || maxColumns <= 0 || nodes.length <= maxColumns) {
    return [nodes];
  }
  const rows: T[][] = [];
  for (let i = 0; i < nodes.length; i += maxColumns) {
    rows.push(nodes.slice(i, i + maxColumns));
  }
  return rows;
}

export interface OrgChartStructure {
  id?: string;
  chartTitleLao: string;
  chartTitleEn: string;
  tiers?: OrgChartTier[];
  leader?: OrgChartPersonNode;
  members?: OrgChartPersonNode[];
  style?: Partial<OrgChartStyleConfig>;
}

export function normalizeChartTiers(chart: Partial<OrgChartStructure>): OrgChartTier[] {
  if (chart.tiers && chart.tiers.length > 0) {
    return chart.tiers;
  }
  // Otherwise convert legacy leader + members to 2 tiers:
  const tiers: OrgChartTier[] = [];
  if (chart.leader) {
    tiers.push({
      id: 'tier-1',
      tierTitleLao: chart.chartTitleLao || 'ປະທານ / ຫົວໜ້າ',
      tierTitleEn: chart.chartTitleEn || 'CHAIRMAN',
      nodes: [chart.leader],
    });
  }
  if (chart.members && chart.members.length > 0) {
    tiers.push({
      id: 'tier-2',
      tierTitleLao: 'ກຳມະການ / ສະມາຊິກ',
      tierTitleEn: 'COMMITTEE / MEMBERS',
      nodes: chart.members,
    });
  }
  if (tiers.length === 0) {
    tiers.push({
      id: 'tier-1',
      tierTitleLao: 'ລະດັບ 1',
      tierTitleEn: 'LEVEL 1',
      nodes: [],
    });
  }
  return tiers;
}

export const DEFAULT_AVATAR_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="200" viewBox="0 0 160 200" fill="%23f1f5f9"><rect width="160" height="200" fill="%23f1f5f9"/><circle cx="80" cy="70" r="35" fill="%23cbd5e1"/><path d="M25 180 C25 125, 135 125, 135 180 Z" fill="%23cbd5e1"/></svg>';

export const DEFAULT_EDL_BOARD_PRESET: OrgChartStructure = {
  chartTitleLao: 'ປະທານສະພາຜູ້ບໍລິຫານ',
  chartTitleEn: 'CHAIRMAN OF THE BOARD',
  tiers: [
    {
      id: 'tier-board-leader',
      tierTitleLao: 'ປະທານສະພາຜູ້ບໍລິຫານ',
      tierTitleEn: 'CHAIRMAN OF THE BOARD',
      nodes: [
        {
          id: 'leader-1',
          nameLao: 'ທ່ານ ປອ. ອາຄົມເດດ ວົງໄຊ',
          nameEn: 'Akhomdeth VONGSAY, PH.D',
          roleLao: 'ປະທານສະພາຜູ້ບໍລິຫານ',
          roleEn: 'Chairman of the Board',
          departmentBadge: 'ປະທານສະພາຜູ້ບໍລິຫານ / CHAIRMAN OF THE BOARD',
        },
      ],
    },
    {
      id: 'tier-board-members',
      tierTitleLao: 'ຄະນະກຳມະການ',
      tierTitleEn: 'COMMITTEE MEMBERS',
      nodes: [
        {
          id: 'member-1',
          departmentBadge:
            'ຫົວໜ້າກົມຄຸ້ມຄອງວິສາຫະກິດລັດລົງທຶນ ແລະ ການປະກັນໄພ, ກະຊວງການເງິນ',
          nameLao: 'ທ່ານ ໄພບູນ ທ່ຽງລະໄມ',
          nameEn: 'Mr.Phaithoun THIENGLAMAI',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
        },
        {
          id: 'member-2',
          departmentBadge: 'ຫົວໜ້າກົມຄຸ້ມຄອງໜີ້ສິນສາທາລະນະ ກະຊວງການເງິນ',
          nameLao: 'ທ່ານ ວິເລດ ກິນນາວົງ',
          nameEn: 'Mr.Vileth KINNAVONG',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
        },
        {
          id: 'member-3',
          departmentBadge: 'ຫົວໜ້າກົມກວດກາ ກະຊວງອຸດສາຫະກຳ ແລະ ການຄ້າ',
          nameLao: 'ທ່ານ ເພັດສະຫວັນ ລັດຕະນະທອງໄຊ',
          nameEn: 'Mr.Phetsavanh RATTANATHONGXAY',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
        },
        {
          id: 'member-4',
          departmentBadge:
            'ຫົວໜ້າກົມນະໂຍບາຍ, ແຜນຍຸດທະສາດ ແລະ ປະເມີນຜົນ ກະຊວງອຸດສາຫະກຳ ແລະ ການຄ້າ',
          nameLao: 'ທ່ານ ນາງ ປອ. ສັນຕິສຸກ ພິມພະຈັນ',
          nameEn: 'Santisouk PHIMPHACHANH, PH.D',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
        },
        {
          id: 'member-5',
          departmentBadge: 'ຫົວໜ້າຫ້ອງການຄະນະກຳມະການຄຸ້ມຄອງຫຼັກຊັບ',
          nameLao: 'ທ່ານ ປອ.ຊາຍຄຳ ພຸດທະວົງ',
          nameEn: 'Xaykham PHOUTTHAVONG, PH.D',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
        },
        {
          id: 'member-6',
          departmentBadge: 'ຮອງອະທິການບໍດີ ມະຫາວິທະຍາໄລ ແຫ່ງຊາດ',
          nameLao: 'ທ່ານ ຮສ.ປອ ພູເພັດ ກ້ຽວພິລາວົງ',
          nameEn: 'Phouphet KYOPHILAVONG, Prof.D',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
        },
        {
          id: 'member-7',
          departmentBadge:
            'ຫົວໜ້າກົມຄຸ້ມຄອງທະນາຄານທຸລະກິດ ທະນາຄານແຫ່ງ ສປປ ລາວ',
          nameLao: 'ທ່ານ ເພັດສະຖາພອນ ແກ້ວວົງວິຈິດ',
          nameEn: 'Mr.Phetsathaphone KEOVONGVICHITH',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
        },
      ],
    },
  ],
  // Legacy compatibility:
  leader: {
    id: 'leader-1',
    nameLao: 'ທ່ານ ປອ. ອາຄົມເດດ ວົງໄຊ',
    nameEn: 'Akhomdeth VONGSAY, PH.D',
    roleLao: 'ປະທານສະພາຜູ້ບໍລິຫານ',
    roleEn: 'Chairman of the Board',
    departmentBadge: 'ປະທານສະພາຜູ້ບໍລິຫານ / CHAIRMAN OF THE BOARD',
  },
  members: [],
};

export const DEFAULT_EXECUTIVE_PRESET: OrgChartStructure = {
  chartTitleLao: 'ຄະນະຜູ້ອຳນວຍການໃຫຍ່',
  chartTitleEn: 'MANAGING DIRECTORS & EXECUTIVES',
  tiers: [
    {
      id: 'tier-exec-1',
      tierTitleLao: 'ຄະນະຜູ້ອຳນວຍການໃຫຍ່',
      tierTitleEn: 'MANAGING DIRECTOR',
      nodes: [
        {
          id: 'leader-exec',
          nameLao: 'ທ່ານ ຜູ້ອຳນວຍການໃຫຍ່ ຟຟລ',
          nameEn: 'Managing Director of EDL',
          roleLao: 'ຜູ້ອຳນວຍການໃຫຍ່',
          roleEn: 'Managing Director',
          departmentBadge: 'ຄະນະຜູ້ອຳນວຍການໃຫຍ່ / MANAGING DIRECTOR',
        },
      ],
    },
    {
      id: 'tier-exec-2',
      tierTitleLao: 'ຄະນະຮອງຜູ້ອຳນວຍການໃຫຍ່',
      tierTitleEn: 'DEPUTY MANAGING DIRECTORS',
      nodes: [
        {
          id: 'member-exec-1',
          departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານທຸລະກິດ',
          nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 1',
          nameEn: 'Deputy Managing Director 1',
          roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
          roleEn: 'Deputy Managing Director',
        },
        {
          id: 'member-exec-2',
          departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານເຕັກນິກ ແລະ ວິສະວະກຳ',
          nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 2',
          nameEn: 'Deputy Managing Director 2',
          roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
          roleEn: 'Deputy Managing Director',
        },
        {
          id: 'member-exec-3',
          departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານການເງິນ ແລະ ບັນຊີ',
          nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 3',
          nameEn: 'Deputy Managing Director 3',
          roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
          roleEn: 'Deputy Managing Director',
        },
        {
          id: 'member-exec-4',
          departmentBadge: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່ ຜູ້ຊີ້ນຳສາຍງານແຜນການ ແລະ ຄຸ້ມຄອງລະບົບ',
          nameLao: 'ທ່ານ ຮອງຜູ້ອຳນວຍການໃຫຍ່ 4',
          nameEn: 'Deputy Managing Director 4',
          roleLao: 'ຮອງຜູ້ອຳນວຍການໃຫຍ່',
          roleEn: 'Deputy Managing Director',
        },
      ],
    },
  ],
  leader: {
    id: 'leader-exec',
    nameLao: 'ທ່ານ ຜູ້ອຳນວຍການໃຫຍ່ ຟຟລ',
    nameEn: 'Managing Director of EDL',
    roleLao: 'ຜູ້ອຳນວຍການໃຫຍ່',
    roleEn: 'Managing Director',
    departmentBadge: 'ຄະນະຜູ້ອຳນວຍການໃຫຍ່ / MANAGING DIRECTOR',
  },
  members: [],
};

export const DEFAULT_BLANK_PRESET: OrgChartStructure = {
  chartTitleLao: 'ໂຄງຮ່າງການຈັດຕັ້ງໃໝ່',
  chartTitleEn: 'ORGANIZATION STRUCTURE',
  tiers: [
    {
      id: 'tier-blank-1',
      tierTitleLao: 'ລະດັບສູງສຸດ',
      tierTitleEn: 'TOP LEVEL',
      nodes: [
        {
          id: 'leader-blank',
          nameLao: 'ຊື່ ແລະ ນາມສະກຸນ ຫົວໜ້າ',
          nameEn: 'Leader Name & Surname',
          roleLao: 'ຫົວໜ້າ / ຜູ້ອຳນວຍການ',
          roleEn: 'Head / Director',
          departmentBadge: 'ຕຳແໜ່ງສູງສຸດ / TOP LEADER',
        },
      ],
    },
    {
      id: 'tier-blank-2',
      tierTitleLao: 'ລະດັບກຳມະການ',
      tierTitleEn: 'SECOND LEVEL',
      nodes: [
        {
          id: 'member-blank-1',
          departmentBadge: 'ໜ່ວຍງານ / ພະແນກ / ສັງກັດ 1',
          nameLao: 'ຊື່ ສະມາຊິກ 1',
          nameEn: 'Member Name 1',
          roleLao: 'ຕຳແໜ່ງ 1',
          roleEn: 'Position 1',
        },
        {
          id: 'member-blank-2',
          departmentBadge: 'ໜ່ວຍງານ / ພະແນກ / ສັງກັດ 2',
          nameLao: 'ຊື່ ສະມາຊິກ 2',
          nameEn: 'Member Name 2',
          roleLao: 'ຕຳແໜ່ງ 2',
          roleEn: 'Position 2',
        },
      ],
    },
  ],
  leader: {
    id: 'leader-blank',
    nameLao: 'ຊື່ ແລະ ນາມສະກຸນ ຫົວໜ້າ',
    nameEn: 'Leader Name & Surname',
    roleLao: 'ຫົວໜ້າ / ຜູ້ອຳນວຍການ',
    roleEn: 'Head / Director',
    departmentBadge: 'ຕຳແໜ່ງສູງສຸດ / TOP LEADER',
  },
  members: [],
};
