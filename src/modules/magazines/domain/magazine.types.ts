export type MagazineStatus = 'ACTIVE' | 'INACTIVE';

export const MAGAZINE_STATUS_LABELS: Record<MagazineStatus, string> = {
  ACTIVE: 'ເຜີຍແຜ່ (Active)',
  INACTIVE: 'ປິດການເຜີຍແຜ່ (Inactive)',
};

export interface MagazineItem {
  id: number;
  title: string;
  issueNumber?: string | null;
  coverImage?: string | null;
  fileUrl?: string | null;
  publishedDate: string;
  downloadCount: number;
  status: MagazineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMagazinePayload {
  title: string;
  issueNumber?: string;
  coverImage?: string;
  fileUrl?: string;
  publishedDate: string;
  status?: MagazineStatus;
}

export type UpdateMagazinePayload = Partial<CreateMagazinePayload>;

export interface MagazineQueryParams {
  search?: string;
  status?: MagazineStatus;
  page?: number;
  limit?: number;
}
