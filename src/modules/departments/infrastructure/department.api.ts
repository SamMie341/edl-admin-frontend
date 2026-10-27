import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  DepartmentItem,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '../domain/department.types';

export const departmentApi = {
  /**
   * ດຶງລາຍຊື່ຝ່າຍທັງໝົດ (GET /api/v1/departments)
   */
  async getDepartments(): Promise<DepartmentItem[]> {
    const { data } = await apiClient.get<ApiResponse<DepartmentItem[]>>(
      API_ENDPOINTS.DEPARTMENTS.BASE
    );
    return data.data;
  },

  /**
   * ດຶງຂໍ້ມູນຝ່າຍຕາມ ID (GET /api/v1/departments/:id)
   */
  async getDepartmentById(id: number): Promise<DepartmentItem> {
    const { data } = await apiClient.get<ApiResponse<DepartmentItem>>(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id)
    );
    return data.data;
  },

  /**
   * ສ້າງຝ່າຍໃໝ່ (POST /api/v1/departments)
   */
  async createDepartment(
    payload: CreateDepartmentPayload
  ): Promise<DepartmentItem> {
    const { data } = await apiClient.post<ApiResponse<DepartmentItem>>(
      API_ENDPOINTS.DEPARTMENTS.BASE,
      payload
    );
    return data.data;
  },

  /**
   * ແກ້ໄຂຂໍ້ມູນຝ່າຍ (PUT /api/v1/departments/:id)
   */
  async updateDepartment(
    id: number,
    payload: UpdateDepartmentPayload
  ): Promise<DepartmentItem> {
    const { data } = await apiClient.put<ApiResponse<DepartmentItem>>(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບຂໍ້ມູນຝ່າຍ (DELETE /api/v1/departments/:id)
   */
  async deleteDepartment(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.DEPARTMENTS.BY_ID(id)
    );
    return data.data;
  },
};
