import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  VisionMissionItem,
  CreateVisionMissionPayload,
  UpdateVisionMissionPayload,
} from '../domain/vision-mission.types';

export const visionMissionApi = {
  /**
   * ດຶງຂໍ້ມູນວິໄສທັດ ແລະ ພາລະກິດທັງໝົດ (GET /api/v1/vision-missions)
   */
  async getVisionMissions(): Promise<VisionMissionItem[]> {
    const { data } = await apiClient.get<ApiResponse<VisionMissionItem[]>>(
      API_ENDPOINTS.VISION_MISSIONS.BASE
    );
    return Array.isArray(data.data) ? data.data : [];
  },

  /**
   * ດຶງຂໍ້ມູນຕາມ ID (GET /api/v1/vision-missions/:id)
   */
  async getVisionMissionById(id: number): Promise<VisionMissionItem> {
    const { data } = await apiClient.get<ApiResponse<VisionMissionItem>>(
      API_ENDPOINTS.VISION_MISSIONS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງຂໍ້ມູນໃໝ່ (POST /api/v1/vision-missions)
   */
  async createVisionMission(
    payload: CreateVisionMissionPayload
  ): Promise<VisionMissionItem> {
    const { data } = await apiClient.post<ApiResponse<VisionMissionItem>>(
      API_ENDPOINTS.VISION_MISSIONS.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນ (PUT /api/v1/vision-missions/:id)
   */
  async updateVisionMission(
    id: number,
    payload: UpdateVisionMissionPayload
  ): Promise<VisionMissionItem> {
    const { data } = await apiClient.put<ApiResponse<VisionMissionItem>>(
      API_ENDPOINTS.VISION_MISSIONS.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບຂໍ້ມູນ (DELETE /api/v1/vision-missions/:id)
   */
  async deleteVisionMission(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.VISION_MISSIONS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ອັບໂຫຼດຮູບພາບ (POST /api/v1/vision-missions/:id/upload/image)
   */
  async uploadImage(
    id: number,
    file: File
  ): Promise<{ message: string; imagePath: string; data: VisionMissionItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; imagePath: string; data: VisionMissionItem }>
    >(API_ENDPOINTS.VISION_MISSIONS.UPLOAD_IMAGE(id), formData);

    return data.data;
  },
};
