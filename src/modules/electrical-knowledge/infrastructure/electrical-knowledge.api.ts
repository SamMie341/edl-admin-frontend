import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type {
  ApiResponse,
  PaginationMeta,
} from '@/core/domain/api-response.entity';
import type {
  ElectricalKnowledgeItem,
  CreateElectricalKnowledgePayload,
  UpdateElectricalKnowledgePayload,
  ElectricalKnowledgeQueryParams,
} from '../domain/electrical-knowledge.types';

export interface ElectricalKnowledgeListResult {
  items: ElectricalKnowledgeItem[];
  meta?: PaginationMeta;
}

export const electricalKnowledgeApi = {
  /**
   * ດຶງບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າທັງໝົດ (GET /api/v1/electrical-knowledge)
   */
  async getAll(
    params?: ElectricalKnowledgeQueryParams
  ): Promise<ElectricalKnowledgeListResult> {
    const cleanParams =
      params && Object.values(params).some((v) => v !== undefined)
        ? params
        : undefined;

    const { data } = await apiClient.get<
      ApiResponse<ElectricalKnowledgeItem[]>
    >(API_ENDPOINTS.ELECTRICAL_KNOWLEDGE.BASE, { params: cleanParams });

    return {
      items: Array.isArray(data.data) ? data.data : [],
      meta: data.meta,
    };
  },

  /**
   * ດຶງລາຍລະອຽດບົດຄວາມຕາມ ID (GET /api/v1/electrical-knowledge/:id)
   */
  async getById(id: number): Promise<ElectricalKnowledgeItem> {
    const { data } = await apiClient.get<ApiResponse<ElectricalKnowledgeItem>>(
      API_ENDPOINTS.ELECTRICAL_KNOWLEDGE.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າໃໝ່ (POST /api/v1/electrical-knowledge)
   */
  async create(
    payload: CreateElectricalKnowledgePayload
  ): Promise<ElectricalKnowledgeItem> {
    const { data } = await apiClient.post<ApiResponse<ElectricalKnowledgeItem>>(
      API_ENDPOINTS.ELECTRICAL_KNOWLEDGE.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ (PUT /api/v1/electrical-knowledge/:id)
   */
  async update(
    id: number,
    payload: UpdateElectricalKnowledgePayload
  ): Promise<ElectricalKnowledgeItem> {
    const { data } = await apiClient.put<ApiResponse<ElectricalKnowledgeItem>>(
      API_ENDPOINTS.ELECTRICAL_KNOWLEDGE.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ (DELETE /api/v1/electrical-knowledge/:id)
   */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ELECTRICAL_KNOWLEDGE.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ອັບໂຫຼດຮູບໜ້າປົກບົດຄວາມ (POST /api/v1/electrical-knowledge/:id/upload/cover)
   */
  async uploadCover(
    id: number,
    file: File
  ): Promise<{
    message: string;
    imagePath: string;
    data: ElectricalKnowledgeItem;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{
        message: string;
        imagePath: string;
        data: ElectricalKnowledgeItem;
      }>
    >(API_ENDPOINTS.ELECTRICAL_KNOWLEDGE.UPLOAD_COVER(id), formData);

    return data.data;
  },

  /**
   * ເພີ່ມຍອດເຂົ້າຊົມບົດຄວາມ (PUT /api/v1/electrical-knowledge/:id/view)
   */
  async incrementView(
    id: number
  ): Promise<{ message: string; viewCount: number }> {
    const { data } = await apiClient.put<
      ApiResponse<{ message: string; viewCount: number }>
    >(API_ENDPOINTS.ELECTRICAL_KNOWLEDGE.VIEW(id));
    return data.data;
  },
};
