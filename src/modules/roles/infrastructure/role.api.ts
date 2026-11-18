import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  RoleItem,
  RoleDropdownItem,
  CreateRolePayload,
  UpdateRolePayload,
  RolesListResponse,
} from '../domain/role.types';

export const roleApi = {
  /**
   * ດຶງລາຍຊື່ບົດບາດທັງໝົດ (GET /api/v1/roles?search=&page=&limit=)
   */
  async getRoles(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<RolesListResponse> {
    const { data } = await apiClient.get<ApiResponse<RoleItem[]>>(
      API_ENDPOINTS.ROLES.BASE,
      { params }
    );
    return {
      data: data.data || [],
      meta: (data as any).meta || {
        total: (data.data || []).length,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      },
    };
  },

  /**
   * ດຶງລາຍຊື່ບົດບາດສຳລັບ Dropdown (GET /api/v1/roles/dropdown)
   */
  async getRolesDropdown(): Promise<RoleDropdownItem[]> {
    const { data } = await apiClient.get<ApiResponse<RoleDropdownItem[]>>(
      API_ENDPOINTS.ROLES.DROPDOWN
    );
    return data.data;
  },

  /**
   * ດຶງຂໍ້ມູນບົດບາດຕາມ ID ພ້ອມສິດທິ (GET /api/v1/roles/:id)
   */
  async getRoleById(id: number): Promise<RoleItem> {
    const { data } = await apiClient.get<ApiResponse<RoleItem>>(
      API_ENDPOINTS.ROLES.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງບົດບາດໃໝ່ ພ້ອມກຳນົດສິດທິ (POST /api/v1/roles)
   */
  async createRole(payload: CreateRolePayload): Promise<RoleItem> {
    const { data } = await apiClient.post<ApiResponse<RoleItem>>(
      API_ENDPOINTS.ROLES.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນບົດບາດ ແລະ ສິດທິ (PUT /api/v1/roles/:id)
   */
  async updateRole(
    id: number,
    payload: UpdateRolePayload
  ): Promise<RoleItem> {
    const { data } = await apiClient.put<ApiResponse<RoleItem>>(
      API_ENDPOINTS.ROLES.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບບົດບາດ (DELETE /api/v1/roles/:id)
   */
  async deleteRole(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.ROLES.BY_ID(id)
    );
    return data.data;
  },
};
