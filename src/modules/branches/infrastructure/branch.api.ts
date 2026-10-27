import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  BranchItem,
  CreateBranchPayload,
  UpdateBranchPayload,
  BranchImageType,
  SyncBranchesResponse,
} from '../domain/branch.types';

export const branchApi = {
  /**
   * ດຶງລາຍຊື່ສາຂາທັງໝົດ (GET /api/v1/branches?departmentId=)
   */
  async getBranches(departmentId?: number): Promise<BranchItem[]> {
    const params = departmentId ? { departmentId } : undefined;
    const { data } = await apiClient.get<ApiResponse<BranchItem[]>>(
      API_ENDPOINTS.BRANCHES.BASE,
      { params }
    );
    return data.data;
  },

  /**
   * ດຶງລາຍການສາຂາສຳລັບ Dropdown (GET /api/v1/branches/dropdown)
   */
  async getBranchesDropdown(departmentId?: number): Promise<BranchItem[]> {
    const params = departmentId ? { departmentId } : undefined;
    const { data } = await apiClient.get<ApiResponse<BranchItem[]>>(
      API_ENDPOINTS.BRANCHES.DROPDOWN,
      { params }
    );
    return data.data;
  },

  /**
   * ດຶງຂໍ້ມູນສາຂາຕາມ ID (GET /api/v1/branches/:id)
   */
  async getBranchById(id: number): Promise<BranchItem> {
    const { data } = await apiClient.get<ApiResponse<BranchItem>>(
      API_ENDPOINTS.BRANCHES.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງສາຂາໃໝ່ (POST /api/v1/branches)
   */
  async createBranch(payload: CreateBranchPayload): Promise<BranchItem> {
    const { data } = await apiClient.post<ApiResponse<BranchItem>>(
      API_ENDPOINTS.BRANCHES.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນສາຂາ (PUT /api/v1/branches/:id)
   */
  async updateBranch(
    id: number,
    payload: UpdateBranchPayload
  ): Promise<BranchItem> {
    const { data } = await apiClient.put<ApiResponse<BranchItem>>(
      API_ENDPOINTS.BRANCHES.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບສາຂາ (DELETE /api/v1/branches/:id)
   */
  async deleteBranch(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.BRANCHES.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ຊິ້ງຂໍ້ມູນສາຂາ ແລະ ດາວໂຫຼດຮູບຈາກ Inside API (POST /api/v1/branches/sync)
   */
  async syncBranches(): Promise<SyncBranchesResponse> {
    const { data } = await apiClient.post<ApiResponse<SyncBranchesResponse>>(
      API_ENDPOINTS.BRANCHES.SYNC
    );
    return data.data;
  },

  /**
   * ອັບໂຫຼດຮູບພາບສາຂາ (POST /api/v1/branches/:id/upload/:imageType)
   */
  async uploadBranchImage(
    id: number,
    imageType: BranchImageType,
    file: File
  ): Promise<{ message: string; imagePath: string; branch: BranchItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; imagePath: string; branch: BranchItem }>
    >(`/branches/${id}/upload/${imageType}`, formData);

    return data.data;
  },
};
