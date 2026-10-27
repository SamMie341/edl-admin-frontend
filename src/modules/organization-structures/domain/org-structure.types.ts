export type StructureType =
  | 'BOARD_OF_DIRECTORS'
  | 'EXECUTIVE_BOARD'
  | 'ORG_STRUCTURE';

export type CommonStatus = 'ACTIVE' | 'INACTIVE';

export interface OrgStructureItem {
  id: number;
  structureType: StructureType;
  structureName: string;
  imageUrl?: string | null;
  orderIndex: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrgStructurePayload {
  structureType: StructureType;
  structureName: string;
  imageUrl?: string;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface UpdateOrgStructurePayload
  extends Partial<CreateOrgStructurePayload> {}

export const STRUCTURE_TYPE_LABELS: Record<
  StructureType,
  { label: string; labelEn: string; color: string }
> = {
  BOARD_OF_DIRECTORS: {
    label: 'ສະພາຜູ້ອຳນວຍການ',
    labelEn: 'Board of Directors',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  EXECUTIVE_BOARD: {
    label: 'ຄະນະຜູ້ບໍລິຫານ',
    labelEn: 'Executive Board',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  ORG_STRUCTURE: {
    label: 'ໂຄງຮ່າງການຈັດຕັ້ງລວມ',
    labelEn: 'Organization Structure',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
};
