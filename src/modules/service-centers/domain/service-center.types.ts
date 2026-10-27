export type ServiceCenterStatus = 'ACTIVE' | 'INACTIVE';

export interface ServiceCenterItem {
  id: number;
  departmentId: number;
  branchId: number;
  centerName: string;
  phoneNumber?: string | null;
  provinceId: number;
  districtId: number;
  villageId: number;
  latitude?: number | string | null;
  longitude?: number | string | null;
  imageUrl?: string | null;
  status: ServiceCenterStatus;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: number;
    name: string;
  };
  branch?: {
    id: number;
    branchName: string;
  };
  province?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
  village?: {
    id: number;
    name: string;
  };
}

export interface CreateServiceCenterPayload {
  centerName: string;
  departmentId?: number;
  branchId?: number;
  provinceId: number;
  districtId: number;
  villageId: number;
  phoneNumber?: string;
  latitude?: number | string;
  longitude?: number | string;
  imageUrl?: string;
  status?: ServiceCenterStatus;
}

export interface UpdateServiceCenterPayload
  extends Partial<CreateServiceCenterPayload> {}

export interface ProvinceItem {
  id: number;
  name: string;
  code?: string;
}

export interface DistrictItem {
  id: number;
  provinceId: number;
  name: string;
}

export interface VillageItem {
  id: number;
  districtId: number;
  name: string;
}

export interface SyncServiceCenterResponse {
  message: string;
  total: number;
  data: any[];
}
