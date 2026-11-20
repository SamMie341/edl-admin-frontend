export type LegislationStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export const LEGISLATION_STATUS_LABELS: Record<LegislationStatus, string> = {
  ACTIVE: 'ມີຜົນບັງຄັບໃຊ້ (Active)',
  INACTIVE: 'ປິດການນຳໃຊ້ (Inactive)',
  ARCHIVED: 'ເກັບຖາວອນ (Archived)',
};

export interface LegislationItem {
  id: number;
  documentNumber?: string | null;
  title: string;
  fileUrl?: string | null;
  issueDate?: string | null;
  status: LegislationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLegislationPayload {
  documentNumber?: string;
  title: string;
  fileUrl?: string;
  issueDate?: string;
  status?: LegislationStatus;
}

export type UpdateLegislationPayload = Partial<CreateLegislationPayload>;

export interface LegislationQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: LegislationStatus;
}
