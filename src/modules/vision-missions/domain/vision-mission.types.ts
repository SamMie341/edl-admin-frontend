export type VisionMissionType =
  | 'VISION'
  | 'MISSION'
  | 'CORE_VALUES'
  | 'SLOGAN';

export type CommonStatus = 'ACTIVE' | 'INACTIVE';

export interface VisionMissionItem {
  id: number;
  entryType: VisionMissionType;
  title: string;
  slogan?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  orderIndex: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisionMissionPayload {
  entryType?: VisionMissionType;
  title: string;
  slogan?: string;
  description?: string;
  imageUrl?: string;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface UpdateVisionMissionPayload
  extends Partial<CreateVisionMissionPayload> {}

export const VISION_MISSION_TYPE_CONFIG: Record<
  VisionMissionType,
  { label: string; labelEn: string; color: string; badgeColor: string }
> = {
  VISION: {
    label: 'ວິໄສທັດ',
    labelEn: 'Vision',
    color: 'from-blue-600 to-indigo-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  MISSION: {
    label: 'ພາລະກິດ',
    labelEn: 'Mission',
    color: 'from-emerald-600 to-teal-600',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  CORE_VALUES: {
    label: 'ຄ່ານິຍົມຫຼັກ',
    labelEn: 'Core Values',
    color: 'from-purple-600 to-violet-600',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  SLOGAN: {
    label: 'ຄຳຂວັນ',
    labelEn: 'Slogan',
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};
