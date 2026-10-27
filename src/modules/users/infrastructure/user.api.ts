import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  UserItem,
  UpdateUserRolePayload,
  ChangePasswordPayload,
  SyncUserResponse,
} from '../domain/user.types';

export const userApi = {
  /**
   * ດຶງລາຍຊື່ຜູ້ໃຊ້ງານທັງໝົດ (GET /api/v1/users)
   */
  async getUsers(): Promise<UserItem[]> {
    const { data } = await apiClient.get<ApiResponse<UserItem[]>>(
      API_ENDPOINTS.USERS.BASE
    );
    return data.data;
  },

  /**
   * ຊິ້ງຂໍ້ມູນພະນັກງານຈາກ HRM ເຂົ້າລະບົບ (POST /api/v1/users/sync/:empCode)
   */
  async syncUser(empCode: string): Promise<SyncUserResponse> {
    const { data } = await apiClient.post<ApiResponse<SyncUserResponse>>(
      API_ENDPOINTS.USERS.SYNC(empCode)
    );
    return data.data;
  },

  /**
   * ປ່ຽນສິດທິ (Role) ແລະ ສະຖານະ (Status) (PUT /api/v1/users/change-role/:id)
   */
  async updateUserRole(
    id: number,
    payload: UpdateUserRolePayload
  ): Promise<UserItem> {
    const { data } = await apiClient.put<ApiResponse<UserItem>>(
      API_ENDPOINTS.USERS.CHANGE_ROLE(id),
      payload
    );
    return data.data;
  },

  /**
   * ປ່ຽນລະຫັດຜ່ານ / Reset ລະຫັດຜ່ານ (PUT /api/v1/users/change-password/:id)
   */
  async changePassword(
    id: number,
    payload: ChangePasswordPayload
  ): Promise<{ message: string }> {
    const { data } = await apiClient.put<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.USERS.CHANGE_PASSWORD(id),
      payload
    );
    return data.data;
  },

  /**
   * ລຶບບັນຊີຜູ້ໃຊ້ (DELETE /api/v1/users/:id)
   */
  async deleteUser(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.USERS.BY_ID(id)
    );
    return data.data;
  },
};
