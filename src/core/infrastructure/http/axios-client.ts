import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/core/infrastructure/storage/token-storage';
import type { ApiErrorResponse } from '@/core/domain/api-response.entity';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://uat-web-admin.edl.com.la/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: ແນບ JWT Token ແລະ ຈັດການ FormData ອັດຕະໂນມັດ
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: ຈັດການ 401 Unauthorized ແລະ Error Mapping
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      tokenStorage.clearAll();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    const rawMessage = error.response?.data?.message;
    const formattedMessage = Array.isArray(rawMessage)
      ? rawMessage.join(', ')
      : rawMessage || error.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ກັບລະບົບ';

    return Promise.reject(new Error(formattedMessage));
  }
);

/**
 * Helper ສຳລັບດຶง URL ຮູບພາບ ຫຼື ໄຟລ໌ PDF ຈາກ Backend (/uploads/...)
 */
export function getStorageUrl(filePath?: string | null): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'https://uat-web-admin.edl.com.la';
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${cleanBase}${cleanPath}`;
}
