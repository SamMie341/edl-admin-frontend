import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type { LoginPayload, LoginResponse } from '../domain/auth.types';

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
};
