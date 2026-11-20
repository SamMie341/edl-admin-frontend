export type ElectricalKnowledgeStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export const ELECTRICAL_KNOWLEDGE_STATUS_LABELS: Record<
  ElectricalKnowledgeStatus,
  string
> = {
  ACTIVE: 'ເຜີຍແຜ່ (Active)',
  DRAFT: 'ສະບັບຮ່າງ (Draft)',
  ARCHIVED: 'ເກັບຖາວອນ (Archived)',
};

export interface ElectricalKnowledgeItem {
  id: number;
  title: string;
  coverImage?: string | null;
  content: string;
  videoUrl?: string | null;
  status: ElectricalKnowledgeStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateElectricalKnowledgePayload {
  title: string;
  coverImage?: string;
  videoUrl?: string;
  content: string;
  status?: ElectricalKnowledgeStatus;
}

export type UpdateElectricalKnowledgePayload =
  Partial<CreateElectricalKnowledgePayload>;

export interface ElectricalKnowledgeQueryParams {
  search?: string;
  status?: ElectricalKnowledgeStatus;
  page?: number;
  limit?: number;
}
