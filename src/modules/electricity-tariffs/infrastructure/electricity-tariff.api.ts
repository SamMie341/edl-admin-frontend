import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type {
  ApiResponse,
  PaginationMeta,
} from '@/core/domain/api-response.entity';
import type {
  ElectricityTariffItem,
  CreateElectricityTariffPayload,
  UpdateElectricityTariffPayload,
  ElectricityTariffQueryParams,
} from '../domain/electricity-tariff.types';

export interface ElectricityTariffListResult {
  items: ElectricityTariffItem[];
  meta: PaginationMeta;
  isServerPaginated: boolean;
}

interface NestedPaginatedData {
  data: ElectricityTariffItem[];
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

export const electricityTariffApi = {
  /**
   * ດຶງລາຍການໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າທັງໝົດ (GET /api/v1/electricity-tariffs)
   */
  async getAll(
    params?: ElectricityTariffQueryParams
  ): Promise<ElectricityTariffListResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;

    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };
    if (params?.search) {
      queryParams.search = params.search;
    }
    if (params?.tariffType) {
      queryParams.tariffType = params.tariffType;
    }
    if (params?.status) {
      queryParams.status = params.status;
    }

    const { data } = await apiClient.get<
      ApiResponse<ElectricityTariffItem[] | NestedPaginatedData>
    >(API_ENDPOINTS.ELECTRICITY_TARIFFS.BASE, { params: queryParams });

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
   * ດຶງລາຍລະອຽດອັດຕາຄ່າໄຟຟ້າຕາມ ID (GET /api/v1/electricity-tariffs/:id)
   */
  async getById(id: number): Promise<ElectricityTariffItem> {
    const { data } = await apiClient.get<ApiResponse<ElectricityTariffItem>>(
      API_ENDPOINTS.ELECTRICITY_TARIFFS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າໃໝ່ (POST /api/v1/electricity-tariffs)
   */
  async create(
    payload: CreateElectricityTariffPayload
  ): Promise<ElectricityTariffItem> {
    const { data } = await apiClient.post<ApiResponse<ElectricityTariffItem>>(
      API_ENDPOINTS.ELECTRICITY_TARIFFS.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າ (PUT /api/v1/electricity-tariffs/:id)
   */
  async update(
    id: number,
    payload: UpdateElectricityTariffPayload
  ): Promise<ElectricityTariffItem> {
    const { data } = await apiClient.put<ApiResponse<ElectricityTariffItem>>(
      API_ENDPOINTS.ELECTRICITY_TARIFFS.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ (DELETE /api/v1/electricity-tariffs/:id)
   */
  async remove(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ELECTRICITY_TARIFFS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ອັບໂຫຼດຮູບພາບຕາຕະລາງອັດຕາຄ່າໄຟຟ້າ (POST /api/v1/electricity-tariffs/:id/upload/image)
   */
  async uploadImage(
    id: number,
    file: File
  ): Promise<{
    message: string;
    imagePath: string;
    data: ElectricityTariffItem;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{
        message: string;
        imagePath: string;
        data: ElectricityTariffItem;
      }>
    >(API_ENDPOINTS.ELECTRICITY_TARIFFS.UPLOAD_IMAGE(id), formData);

    return data.data;
  },

  /**
   * ອັບໂຫຼດໄຟລ໌ PDF ອັດຕາຄ່າໄຟຟ້າ (POST /api/v1/electricity-tariffs/:id/upload/document)
   */
  async uploadDocument(
    id: number,
    file: File
  ): Promise<{
    message: string;
    filePath: string;
    data: ElectricityTariffItem;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{
        message: string;
        filePath: string;
        data: ElectricityTariffItem;
      }>
    >(API_ENDPOINTS.ELECTRICITY_TARIFFS.UPLOAD_DOCUMENT(id), formData);

    return data.data;
  },
};
