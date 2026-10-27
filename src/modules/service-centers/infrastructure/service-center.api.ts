import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  ServiceCenterItem,
  CreateServiceCenterPayload,
  UpdateServiceCenterPayload,
  SyncServiceCenterResponse,
  ProvinceItem,
  DistrictItem,
  VillageItem,
} from '../domain/service-center.types';

export const serviceCenterApi = {
  /**
   * ດຶງລາຍຊື່ສູນບໍລິການທັງໝົດ (GET /api/v1/service-centers ຫຼື /service-centers/province/:provinceId)
   */
  async getServiceCenters(provinceId?: number): Promise<ServiceCenterItem[]> {
    try {
      const url = provinceId
        ? `/service-centers/province/${provinceId}`
        : API_ENDPOINTS.SERVICE_CENTERS.BASE;
      const { data } = await apiClient.get<ApiResponse<ServiceCenterItem[]>>(url);
      return data.data;
    } catch {
      // Fallback query parameter
      try {
        const params = provinceId ? { provinceId } : undefined;
        const { data } = await apiClient.get<ApiResponse<ServiceCenterItem[]>>(
          API_ENDPOINTS.SERVICE_CENTERS.BASE,
          { params }
        );
        return data.data;
      } catch {
        // Fallback fetch all to let client filter safely
        const { data } = await apiClient.get<ApiResponse<ServiceCenterItem[]>>(
          API_ENDPOINTS.SERVICE_CENTERS.BASE
        );
        return data.data;
      }
    }
  },

  /**
   * ດຶງຂໍ້ມູນສູນບໍລິການຕາມ ID (GET /api/v1/service-centers/:id)
   */
  async getServiceCenterById(id: number): Promise<ServiceCenterItem> {
    const { data } = await apiClient.get<ApiResponse<ServiceCenterItem>>(
      API_ENDPOINTS.SERVICE_CENTERS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງສູນບໍລິການໃໝ່ (POST /api/v1/service-centers)
   */
  async createServiceCenter(
    payload: CreateServiceCenterPayload
  ): Promise<ServiceCenterItem> {
    const { data } = await apiClient.post<ApiResponse<ServiceCenterItem>>(
      API_ENDPOINTS.SERVICE_CENTERS.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນສູນບໍລິການ (PUT /api/v1/service-centers/:id)
   */
  async updateServiceCenter(
    id: number,
    payload: UpdateServiceCenterPayload
  ): Promise<ServiceCenterItem> {
    const { data } = await apiClient.put<ApiResponse<ServiceCenterItem>>(
      API_ENDPOINTS.SERVICE_CENTERS.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບສູນບໍລິການ (DELETE /api/v1/service-centers/:id)
   */
  async deleteServiceCenter(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.SERVICE_CENTERS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ຊິ້ງຂໍ້ມູນສູນບໍລິການຈາກ Inside API (POST /api/v1/service-centers/sync)
   */
  async syncServiceCenters(): Promise<SyncServiceCenterResponse> {
    const { data } = await apiClient.post<ApiResponse<SyncServiceCenterResponse>>(
      API_ENDPOINTS.SERVICE_CENTERS.SYNC
    );
    return data.data;
  },

  /**
   * ອັບໂຫຼດຮູບພາບສູນບໍລິການ (POST /api/v1/service-centers/:id/upload/image)
   */
  async uploadImage(
    id: number,
    file: File
  ): Promise<{ message: string; imagePath: string; serviceCenter: ServiceCenterItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; imagePath: string; serviceCenter: ServiceCenterItem }>
    >(API_ENDPOINTS.SERVICE_CENTERS.UPLOAD_IMAGE(id), formData);

    return data.data;
  },

  // Location Master Data APIs
  async getProvinces(): Promise<ProvinceItem[]> {
    const { data } = await apiClient.get<ApiResponse<ProvinceItem[]>>(
      API_ENDPOINTS.PROVINCES.BASE
    );
    return data.data;
  },

  async getDistricts(provinceId?: number): Promise<DistrictItem[]> {
    const url = provinceId
      ? API_ENDPOINTS.DISTRICTS.BY_PROVINCE(provinceId)
      : API_ENDPOINTS.DISTRICTS.BASE;
    const { data } = await apiClient.get<ApiResponse<DistrictItem[]>>(url);
    return data.data;
  },

  async getVillages(districtId?: number): Promise<VillageItem[]> {
    const url = districtId
      ? API_ENDPOINTS.VILLAGES.BY_DISTRICT(districtId)
      : API_ENDPOINTS.VILLAGES.BASE;
    const { data } = await apiClient.get<ApiResponse<VillageItem[]>>(url);
    return data.data;
  },
};
