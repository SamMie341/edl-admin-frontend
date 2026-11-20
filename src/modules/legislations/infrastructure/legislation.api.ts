import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type {
  ApiResponse,
  PaginationMeta,
} from '@/core/domain/api-response.entity';
import type {
  LegislationItem,
  CreateLegislationPayload,
  UpdateLegislationPayload,
  LegislationQueryParams,
} from '../domain/legislation.types';

export interface LegislationListResult {
  items: LegislationItem[];
  meta: PaginationMeta;
  isServerPaginated: boolean;
}

interface NestedPaginatedData {
  data: LegislationItem[];
  meta?: Partial<PaginationMeta>;
}

function isNestedPaginatedData(val: unknown): val is NestedPaginatedData {
  return (
    typeof val === 'object' &&
    val !== null &&
    'data' in val &&
    Array.isArray((val as NestedPaginatedData).data)
  );
}

export const legislationApi = {
  /**
   * ດຶງລາຍການເອກະສານນິຕິກຳທັງໝົດ (GET /api/v1/legislations)
   */
  async getAll(
    params?: LegislationQueryParams
  ): Promise<LegislationListResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };
    if (params?.search) {
      queryParams.search = params.search;
    }
    if (params?.status) {
      queryParams.status = params.status;
    }

    const { data } = await apiClient.get<
      ApiResponse<LegislationItem[] | NestedPaginatedData>
    >(API_ENDPOINTS.LEGISLATIONS.BASE, { params: queryParams });

    const payload = data.data;

    if (isNestedPaginatedData(payload)) {
      const total = Number(payload.meta?.total) || payload.data.length;
      const metaLimit = Number(payload.meta?.limit) || limit;
      return {
        items: payload.data,
        meta: {
          total,
          page: Number(payload.meta?.page) || page,
          limit: metaLimit,
          totalPages:
            Number(payload.meta?.totalPages) ||
            Math.ceil(total / metaLimit) ||
            1,
        },
        isServerPaginated: Boolean(payload.meta),
      };
    }

    const items = Array.isArray(payload) ? payload : [];
    const total = Number(data.meta?.total) || items.length;
    const metaLimit = Number(data.meta?.limit) || limit;

    return {
      items,
      meta: {
        total,
        page: Number(data.meta?.page) || page,
        limit: metaLimit,
        totalPages:
          Number(data.meta?.totalPages) || Math.ceil(total / metaLimit) || 1,
      },
      isServerPaginated: Boolean(data.meta),
    };
  },

  /**
   * ດຶງລາຍລະອຽດເອກະສານນິຕິກຳຕາມ ID (GET /api/v1/legislations/:id)
   */
  async getById(id: number): Promise<LegislationItem> {
    const { data } = await apiClient.get<ApiResponse<LegislationItem>>(
      API_ENDPOINTS.LEGISLATIONS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງເອກະສານນິຕິກຳໃໝ່ (POST /api/v1/legislations)
   */
  async create(payload: CreateLegislationPayload): Promise<LegislationItem> {
    const { data } = await apiClient.post<ApiResponse<LegislationItem>>(
      API_ENDPOINTS.LEGISLATIONS.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນເອກະສານນິຕິກຳ (PUT /api/v1/legislations/:id)
   */
  async update(
    id: number,
    payload: UpdateLegislationPayload
  ): Promise<LegislationItem> {
    const { data } = await apiClient.put<ApiResponse<LegislationItem>>(
      API_ENDPOINTS.LEGISLATIONS.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບເອກະສານນິຕິກຳ (DELETE /api/v1/legislations/:id)
   */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.LEGISLATIONS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ອັບໂຫຼດໄຟລ໌ PDF ເອກະສານນິຕິກຳ (POST /api/v1/legislations/:id/upload/document)
   */
  async uploadDocument(
    id: number,
    file: File
  ): Promise<{ message: string; filePath: string; data: LegislationItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{
        message: string;
        filePath: string;
        data: LegislationItem;
      }>
    >(API_ENDPOINTS.LEGISLATIONS.UPLOAD_DOCUMENT(id), formData);

    return data.data;
  },
};
