export type BranchStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';

export type BranchImageType = 'branchImage' | 'coverImage' | 'orgChartImage';

export interface BranchItem {
  id: number;
  departmentId: number;
  branchName: string;
  branchImage?: string | null;
  coverImage?: string | null;
  orgChartImage?: string | null;
  address?: string | null;
  locationCoordinates?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  roleResponsibilities?: string | null;
  orderIndex: number;
  status: BranchStatus;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    name: string;
  };
}

export interface CreateBranchPayload {
  departmentId: number;
  branchName: string;
  address?: string;
  locationCoordinates?: string;
  email?: string;
  phoneNumber?: string;
  roleResponsibilities?: string;
  orderIndex?: number;
  status?: BranchStatus;
}

export interface UpdateBranchPayload extends Partial<CreateBranchPayload> {}

export interface SyncBranchesResponse {
  message: string;
  total: number;
  data: any[];
}
