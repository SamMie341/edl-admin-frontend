import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type { LoginPayload, LoginResponse, AuthUser } from '../domain/auth.types';

export const authApi = {
  /**
   * ເຂົ້າສູ່ລະບົບ (POST /api/v1/auth/login)
   */
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      payload
    );
    return data.data;
  },

  /**
   * ດຶງຂໍ້ມູນ Profile & Permissions ຫຼ້າສຸດຂອງຜູ້ໃຊ້ປະຈຸບັນ (GET /api/v1/auth/profile)
   */
  async getProfile(): Promise<AuthUser> {
    const { data } = await apiClient.get<ApiResponse<AuthUser>>(
      API_ENDPOINTS.AUTH.PROFILE
    );
    return data.data;
  },
};
