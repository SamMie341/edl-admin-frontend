export interface ProvinceItem {
  id: number;
  name: string;
  code?: string | null;
  shortName?: string | null;
  branchCode?: string | null;
  createdAt: string;
  updatedAt: string;
  disctricts?: DistrictItem[];
}

export interface DistrictItem {
  id: number;
  provinceId: number;
  code?: string | null;
  name?: string | null;
  nameEn?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
  province?: ProvinceItem;
  villages?: VillageItem[];
}

export interface VillageItem {
  id: number;
  districtId: number;
  code?: string | null;
  name?: string | null;
  nameEn?: string | null;
  status?: string | null;
  createdAt: string;
  updatedAt: string;
  district?: DistrictItem;
}

export interface SyncLocationResponse {
  message: string;
  total: number;
  data: any[];
}

export type LocationTabType = 'provinces' | 'districts' | 'villages';
