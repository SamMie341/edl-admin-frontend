import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  OrgStructureItem,
  CreateOrgStructurePayload,
  UpdateOrgStructurePayload,
} from '../domain/org-structure.types';

export const orgStructureApi = {
  /**
   * ດຶງຂໍ້ມູນໂຄງຮ່າງການຈັດຕັ້ງທັງໝົດ (GET /api/v1/org-structures)
   */
  async getOrgStructures(): Promise<OrgStructureItem[]> {
    const { data } = await apiClient.get<ApiResponse<OrgStructureItem[]>>(
      API_ENDPOINTS.ORG_STRUCTURES.BASE
    );
    return Array.isArray(data.data) ? data.data : [];
  },

  /**
   * ດຶງຂໍ້ມູນສຳລັບ Dropdown (GET /api/v1/org-structures/dropdown)
   */
  async getDropdown(): Promise<Partial<OrgStructureItem>[]> {
    const { data } = await apiClient.get<ApiResponse<Partial<OrgStructureItem>[]>>(
      API_ENDPOINTS.ORG_STRUCTURES.DROPDOWN
    );
    return Array.isArray(data.data) ? data.data : [];
  },

  /**
   * ດຶງຂໍ້ມູນຕາມ ID (GET /api/v1/org-structures/:id)
   */
  async getOrgStructureById(id: number): Promise<OrgStructureItem> {
    const { data } = await apiClient.get<ApiResponse<OrgStructureItem>>(
      API_ENDPOINTS.ORG_STRUCTURES.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງໂຄງຮ່າງການຈັດຕັ້ງໃໝ່ (POST /api/v1/org-structures)
   */
  async createOrgStructure(
    payload: CreateOrgStructurePayload
  ): Promise<OrgStructureItem> {
    const { data } = await apiClient.post<ApiResponse<OrgStructureItem>>(
      API_ENDPOINTS.ORG_STRUCTURES.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂໂຄງຮ່າງການຈັດຕັ້ງ (PUT /api/v1/org-structures/:id)
   */
  async updateOrgStructure(
    id: number,
    payload: UpdateOrgStructurePayload
  ): Promise<OrgStructureItem> {
    const { data } = await apiClient.put<ApiResponse<OrgStructureItem>>(
      API_ENDPOINTS.ORG_STRUCTURES.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບໂຄງຮ່າງການຈັດຕັ້ງ (DELETE /api/v1/org-structures/:id)
   */
  async deleteOrgStructure(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ORG_STRUCTURES.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ອັບໂຫຼດຮູບພາບໂຄງຮ່າງ (POST /api/v1/org-structures/:id/upload/image)
   */
  async uploadImage(
    id: number,
    file: File
  ): Promise<{ message: string; imagePath: string; data: OrgStructureItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; imagePath: string; data: OrgStructureItem }>
    >(API_ENDPOINTS.ORG_STRUCTURES.UPLOAD_IMAGE(id), formData);

    return data.data;
  },
};
