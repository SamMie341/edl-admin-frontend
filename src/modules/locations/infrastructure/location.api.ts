import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  ProvinceItem,
  DistrictItem,
  VillageItem,
  SyncLocationResponse,
} from '../domain/location.types';

export const locationApi = {
  /**
   * ດຶງຂໍ້ມູນແຂວງທັງໝົດ (GET /api/v1/provinces)
   */
  async getProvinces(includeDistricts?: boolean): Promise<ProvinceItem[]> {
    const { data } = await apiClient.get<ApiResponse<ProvinceItem[]>>(
      API_ENDPOINTS.PROVINCES.BASE,
      {
        params: includeDistricts ? { includeDistricts: 'true' } : undefined,
      }
    );
    return Array.isArray(data.data) ? data.data : [];
  },

  /**
   * ຊິ້ງຂໍ້ມູນແຂວງຈາກ HRM Service (POST /api/v1/provinces/sync)
   */
  async syncProvinces(): Promise<SyncLocationResponse> {
    const { data } = await apiClient.post<ApiResponse<SyncLocationResponse>>(
      API_ENDPOINTS.PROVINCES.SYNC
    );
    return data.data;
  },

  /**
   * ດຶງຂໍ້ມູນເມືອງທັງໝົດ ຫຼື ຕາມລະຫັດແຂວງ (GET /api/v1/districts ຫຼື /districts/province/:id)
   */
  async getDistricts(provinceId?: number): Promise<DistrictItem[]> {
    const url = provinceId
      ? API_ENDPOINTS.DISTRICTS.BY_PROVINCE(provinceId)
      : API_ENDPOINTS.DISTRICTS.BASE;
    const { data } = await apiClient.get<ApiResponse<DistrictItem[]>>(url);
    return Array.isArray(data.data) ? data.data : [];
  },

  /**
   * ຊິ້ງຂໍ້ມູນເມືອງຈາກ HRM Service (POST /api/v1/districts/sync)
   */
  async syncDistricts(): Promise<SyncLocationResponse> {
    const { data } = await apiClient.post<ApiResponse<SyncLocationResponse>>(
      API_ENDPOINTS.DISTRICTS.SYNC
    );
    return data.data;
  },

  /**
   * ດຶງຂໍ້ມູນບ້ານທັງໝົດ ຫຼື ຕາມລະຫັດເມືອງ (GET /api/v1/villages ຫຼື /villages/district/:id)
   */
  async getVillages(districtId?: number): Promise<VillageItem[]> {
    const url = districtId
      ? API_ENDPOINTS.VILLAGES.BY_DISTRICT(districtId)
      : API_ENDPOINTS.VILLAGES.BASE;
    const { data } = await apiClient.get<ApiResponse<VillageItem[]>>(url);
    return Array.isArray(data.data) ? data.data : [];
  },

  /**
   * ຊິ້ງຂໍ້ມູນບ້ານຈາກ HRM Service (POST /api/v1/villages/sync)
   */
  async syncVillages(): Promise<SyncLocationResponse> {
    const { data } = await apiClient.post<ApiResponse<SyncLocationResponse>>(
      API_ENDPOINTS.VILLAGES.SYNC
    );
    return data.data;
  },
};
