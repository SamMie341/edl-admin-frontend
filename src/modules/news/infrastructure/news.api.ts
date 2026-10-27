import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse, PaginationMeta } from '@/core/domain/api-response.entity';
import type {
  NewsItem,
  NewsCategoryItem,
  NewsTagItem,
  CreateNewsPayload,
  UpdateNewsPayload,
  CreateNewsCategoryPayload,
  UpdateNewsCategoryPayload,
  CreateNewsTagPayload,
  UpdateNewsTagPayload,
  NewsQueryParams,
} from '../domain/news.types';

export interface PaginatedNewsResponse {
  items: NewsItem[];
  meta: PaginationMeta;
}

export const newsApi = {
  // ===============================
  // 1. News Articles API
  // ===============================

  async getNews(params?: NewsQueryParams): Promise<PaginatedNewsResponse> {
    const { data } = await apiClient.get<ApiResponse<NewsItem[]>>(
      API_ENDPOINTS.NEWS.BASE,
      { params }
    );

    // If backend wrapped in pagination interceptor
    const meta: PaginationMeta = data.meta || {
      total: Array.isArray(data.data) ? data.data.length : 0,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: Math.ceil((Array.isArray(data.data) ? data.data.length : 0) / (params?.limit || 10)) || 1,
    };

    return {
      items: Array.isArray(data.data) ? data.data : [],
      meta,
    };
  },

  async getNewsById(id: number): Promise<NewsItem> {
    const { data } = await apiClient.get<ApiResponse<NewsItem>>(
      API_ENDPOINTS.NEWS.BY_ID(id)
    );
    return data.data;
  },

  async createNews(payload: CreateNewsPayload): Promise<NewsItem> {
    const { data } = await apiClient.post<ApiResponse<NewsItem>>(
      API_ENDPOINTS.NEWS.BASE,
      payload
    );
    return data.data;
  },

  async updateNews(id: number, payload: UpdateNewsPayload): Promise<NewsItem> {
    const { data } = await apiClient.put<ApiResponse<NewsItem>>(
      API_ENDPOINTS.NEWS.BY_ID(id),
      payload
    );
    return data.data;
  },

  async deleteNews(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.NEWS.BY_ID(id)
    );
    return data.data;
  },

  async incrementView(id: number): Promise<{ message: string; viewCount: number }> {
    const { data } = await apiClient.put<ApiResponse<{ message: string; viewCount: number }>>(
      API_ENDPOINTS.NEWS.VIEW(id)
    );
    return data.data;
  },

  async uploadCover(
    id: number,
    file: File
  ): Promise<{ message: string; imagePath: string; data: NewsItem }> {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; imagePath: string; data: NewsItem }>
    >(API_ENDPOINTS.NEWS.UPLOAD_COVER(id), formData);

    return data.data;
  },

  async uploadGallery(
    id: number,
    files: File[]
  ): Promise<{ message: string; imagePaths: string[]; data: NewsItem }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const { data } = await apiClient.post<
      ApiResponse<{ message: string; imagePaths: string[]; data: NewsItem }>
    >(API_ENDPOINTS.NEWS.UPLOAD_GALLERY(id), formData);

    return data.data;
  },

  // ===============================
  // 2. News Categories API
  // ===============================

  async getCategories(): Promise<NewsCategoryItem[]> {
    const { data } = await apiClient.get<ApiResponse<NewsCategoryItem[]>>(
      API_ENDPOINTS.NEWS_CATEGORIES.BASE
    );
    return Array.isArray(data.data) ? data.data : [];
  },

  async getCategoryById(id: number): Promise<NewsCategoryItem> {
    const { data } = await apiClient.get<ApiResponse<NewsCategoryItem>>(
      API_ENDPOINTS.NEWS_CATEGORIES.BY_ID(id)
    );
    return data.data;
  },

  async createCategory(payload: CreateNewsCategoryPayload): Promise<NewsCategoryItem> {
    const { data } = await apiClient.post<ApiResponse<NewsCategoryItem>>(
      API_ENDPOINTS.NEWS_CATEGORIES.BASE,
      payload
    );
    return data.data;
  },

  async updateCategory(
    id: number,
    payload: UpdateNewsCategoryPayload
  ): Promise<NewsCategoryItem> {
    const { data } = await apiClient.put<ApiResponse<NewsCategoryItem>>(
      API_ENDPOINTS.NEWS_CATEGORIES.BY_ID(id),
      payload
    );
    return data.data;
  },

  async deleteCategory(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.NEWS_CATEGORIES.BY_ID(id)
    );
    return data.data;
  },

  // ===============================
  // 3. News Tags API
  // ===============================

  async getTags(): Promise<NewsTagItem[]> {
    const { data } = await apiClient.get<ApiResponse<NewsTagItem[]>>(
      API_ENDPOINTS.NEWS_TAGS.BASE
    );
    return Array.isArray(data.data) ? data.data : [];
  },

  async getTagById(id: number): Promise<NewsTagItem> {
    const { data } = await apiClient.get<ApiResponse<NewsTagItem>>(
      API_ENDPOINTS.NEWS_TAGS.BY_ID(id)
    );
    return data.data;
  },

  async createTag(payload: CreateNewsTagPayload): Promise<NewsTagItem> {
    const { data } = await apiClient.post<ApiResponse<NewsTagItem>>(
      API_ENDPOINTS.NEWS_TAGS.BASE,
      payload
    );
    return data.data;
  },

  async updateTag(id: number, payload: UpdateNewsTagPayload): Promise<NewsTagItem> {
    const { data } = await apiClient.put<ApiResponse<NewsTagItem>>(
      API_ENDPOINTS.NEWS_TAGS.BY_ID(id),
      payload
    );
    return data.data;
  },

  async deleteTag(id: number): Promise<{ message: string }> {
    const { data } = await apiClient.delete<ApiResponse<{ message: string }>>(
      API_ENDPOINTS.NEWS_TAGS.BY_ID(id)
    );
    return data.data;
  },
};
