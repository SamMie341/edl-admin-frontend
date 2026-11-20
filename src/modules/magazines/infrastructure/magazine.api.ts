import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type {
  ApiResponse,
  PaginationMeta,
} from '@/core/domain/api-response.entity';
import type {
  MagazineItem,
  CreateMagazinePayload,
  UpdateMagazinePayload,
  MagazineQueryParams,
} from '../domain/magazine.types';

export interface MagazineListResult {
  items: MagazineItem[];
  meta?: PaginationMeta;
}

export const magazineApi = {
  /**
   * ດຶງລາຍຊື່ວາລະສານທັງໝົດ (GET /api/v1/magazines)
   */
  async getAll(params?: MagazineQueryParams): Promise<MagazineListResult> {
    const cleanParams =
      params && Object.values(params).some((v) => v !== undefined)
        ? params
        : undefined;

    const { data } = await apiClient.get<ApiResponse<MagazineItem[]>>(
      API_ENDPOINTS.MAGAZINES.BASE,
      { params: cleanParams }
    );

    return {
      items: Array.isArray(data.data) ? data.data : [],
      meta: data.meta,
    };
  },

  /**
   * ດຶງລາຍລະອຽດວາລະສານຕາມ ID (GET /api/v1/magazines/:id)
   */
  async getById(id: number): Promise<MagazineItem> {
    const { data } = await apiClient.get<ApiResponse<MagazineItem>>(
      API_ENDPOINTS.MAGAZINES.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງວາລະສານໃໝ່ (POST /api/v1/magazines)
   */
  async create(payload: CreateMagazinePayload): Promise<MagazineItem> {
    const { data } = await apiClient.post<ApiResponse<MagazineItem>>(
      API_ENDPOINTS.MAGAZINES.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນວາລະສານ (PUT /api/v1/magazines/:id)
   */
  async update(
    id: number,
    payload: UpdateMagazinePayload
  ): Promise<MagazineItem> {
    const { data } = await apiClient.put<ApiResponse<MagazineItem>>(
      API_ENDPOINTS.MAGAZINES.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບວາລະສານ (DELETE /api/v1/magazines/:id)
   */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.MAGAZINES.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ເພີ່ມຍອດດາວໂຫຼດວາລະສານ (PUT /api/v1/magazines/:id/download)
   */
  async incrementDownload(
    id: number
  ): Promise<{ message: string; downloadCount: number }> {
    const { data } = await apiClient.put<
      ApiResponse<{ message: string; downloadCount: number }>
    >(API_ENDPOINTS.MAGAZINES.DOWNLOAD(id));
    return data.data;
  },

  /**
   * ອັບໂຫຼດຮູບໜ້າປົກວາລະສານ (POST /api/v1/magazines/:id/upload/cover)
   */
  async uploadCover(
    id: number,
    file: File
  ): Promise<{ message: string; imagePath: string; data: MagazineItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; imagePath: string; data: MagazineItem }>
    >(API_ENDPOINTS.MAGAZINES.UPLOAD_COVER(id), formData);

    return data.data;
  },

  /**
   * ອັບໂຫຼດໄຟລ໌ເອກະສານ PDF ຂອງວາລະສານ (POST /api/v1/magazines/:id/upload/document)
   */
  async uploadDocument(
    id: number,
    file: File
  ): Promise<{ message: string; filePath: string; data: MagazineItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; filePath: string; data: MagazineItem }>
    >(API_ENDPOINTS.MAGAZINES.UPLOAD_DOCUMENT(id), formData);

    return data.data;
  },
};
