import { apiClient } from '@/core/infrastructure/http/axios-client';
import { API_ENDPOINTS } from '@/core/config/constants';
import type { ApiResponse } from '@/core/domain/api-response.entity';
import type {
  TariffCategory,
  CreateTariffCategoryPayload,
  UpdateTariffCategoryPayload,
  ApplianceCategory,
  AppliancePreset,
  SavingActionTemplate,
  TariffNotice,
  TariffSchedule,
  CreateApplianceCategoryPayload,
  UpdateApplianceCategoryPayload,
  CreateAppliancePresetPayload,
  UpdateAppliancePresetPayload,
  CreateSavingActionTemplatePayload,
  UpdateSavingActionTemplatePayload,
  CreateTariffNoticePayload,
  UpdateTariffNoticePayload,
  UpsertTariffSchedulePayload,
  CalculateElectricityPayload,
  CalculateBillResponse,
  CalculatorConfigResponse,
} from '../domain/electricity-calculator.types';

export const electricityCalculatorApi = {
  // ==========================================================================
  // Public / Calculator Endpoints
  // ==========================================================================

  /**
   * 1. ດຶງຂໍ້ມູນຕັ້ງຕົ້ນທັງໝົດສຳລັບລະບົບຄິດໄລ່ຄ່າໄຟ (GET /api/v1/electricity-calculator/config)
   */
  async getConfig(): Promise<CalculatorConfigResponse> {
    const { data } = await apiClient.get<ApiResponse<CalculatorConfigResponse>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.CONFIG
    );
    return data.data;
  },

  /**
   * 2. ດຶງຕາຕະລາງ 8 ຂັ້ນບັນໄດລາຍເດືອນ (GET /api/v1/electricity-calculator/schedules?year=&month=&categoryId=)
   */
  async getSchedule(
    year?: number,
    month?: number,
    categoryId?: number
  ): Promise<TariffSchedule | null> {
    const params: Record<string, any> = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (categoryId) params.categoryId = categoryId;

    const { data } = await apiClient.get<ApiResponse<TariffSchedule | null>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.SCHEDULES,
      { params }
    );
    return data.data;
  },

  /**
   * 3. ຄິດໄລ່ຄ່າໄຟຟ້າຂັ້ນບັນໄດ + ແຜນປະຢັດໄຟ + Outlook 2026-2029 (POST /api/v1/electricity-calculator/calculate)
   */
  async calculateBill(
    payload: CalculateElectricityPayload
  ): Promise<CalculateBillResponse> {
    const { data } = await apiClient.post<ApiResponse<CalculateBillResponse>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.CALCULATE,
      payload
    );
    return data.data;
  },

  // ==========================================================================
  // Admin Endpoints: Tariff Categories (3.22.1)
  // ==========================================================================

  async getTariffCategories(search?: string): Promise<TariffCategory[]> {
    const { data } = await apiClient.get<ApiResponse<TariffCategory[]>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_CATEGORIES,
      { params: search ? { search } : undefined }
    );
    return data.data;
  },

  async getTariffCategoryById(id: number): Promise<TariffCategory> {
    const { data } = await apiClient.get<ApiResponse<TariffCategory>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_CATEGORY_BY_ID(id)
    );
    return data.data;
  },

  async createTariffCategory(
    payload: CreateTariffCategoryPayload
  ): Promise<TariffCategory> {
    const { data } = await apiClient.post<ApiResponse<TariffCategory>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_CATEGORIES,
      payload
    );
    return data.data;
  },

  async updateTariffCategory(
    id: number,
    payload: UpdateTariffCategoryPayload
  ): Promise<TariffCategory> {
    const { data } = await apiClient.put<ApiResponse<TariffCategory>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_CATEGORY_BY_ID(id),
      payload
    );
    return data.data;
  },

  async deleteTariffCategory(id: number): Promise<any> {
    const { data } = await apiClient.delete<ApiResponse<any>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_CATEGORY_BY_ID(id)
    );
    return data.data;
  },

  // ==========================================================================
  // Admin Endpoints: Appliance Categories
  // ==========================================================================

  async getCategories(search?: string): Promise<ApplianceCategory[]> {
    const { data } = await apiClient.get<ApiResponse<ApplianceCategory[]>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.CATEGORIES,
      { params: search ? { search } : undefined }
    );
    return data.data;
  },

  async getCategoryById(id: number): Promise<ApplianceCategory> {
    const { data } = await apiClient.get<ApiResponse<ApplianceCategory>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.CATEGORY_BY_ID(id)
    );
    return data.data;
  },

  async createCategory(
    payload: CreateApplianceCategoryPayload
  ): Promise<ApplianceCategory> {
    const { data } = await apiClient.post<ApiResponse<ApplianceCategory>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.CATEGORIES,
      payload
    );
    return data.data;
  },

  async updateCategory(
    id: number,
    payload: UpdateApplianceCategoryPayload
  ): Promise<ApplianceCategory> {
    const { data } = await apiClient.put<ApiResponse<ApplianceCategory>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.CATEGORY_BY_ID(id),
      payload
    );
    return data.data;
  },

  async deleteCategory(id: number): Promise<any> {
    const { data } = await apiClient.delete<ApiResponse<any>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.CATEGORY_BY_ID(id)
    );
    return data.data;
  },

  // ==========================================================================
  // Admin Endpoints: Appliance Presets
  // ==========================================================================

  async getPresets(categoryId?: number, search?: string): Promise<AppliancePreset[]> {
    const params: Record<string, any> = {};
    if (categoryId) params.categoryId = categoryId;
    if (search) params.search = search;

    const { data } = await apiClient.get<ApiResponse<AppliancePreset[]>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.PRESETS,
      { params }
    );
    return data.data;
  },

  async getPresetById(id: number): Promise<AppliancePreset> {
    const { data } = await apiClient.get<ApiResponse<AppliancePreset>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.PRESET_BY_ID(id)
    );
    return data.data;
  },

  async createPreset(
    payload: CreateAppliancePresetPayload
  ): Promise<AppliancePreset> {
    const { data } = await apiClient.post<ApiResponse<AppliancePreset>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.PRESETS,
      payload
    );
    return data.data;
  },

  async updatePreset(
    id: number,
    payload: UpdateAppliancePresetPayload
  ): Promise<AppliancePreset> {
    const { data } = await apiClient.put<ApiResponse<AppliancePreset>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.PRESET_BY_ID(id),
      payload
    );
    return data.data;
  },

  async deletePreset(id: number): Promise<any> {
    const { data } = await apiClient.delete<ApiResponse<any>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.PRESET_BY_ID(id)
    );
    return data.data;
  },

  // ==========================================================================
  // Admin Endpoints: Saving Action Templates
  // ==========================================================================

  async getSavingTemplates(
    categoryId?: number,
    search?: string
  ): Promise<SavingActionTemplate[]> {
    const params: Record<string, any> = {};
    if (categoryId) params.categoryId = categoryId;
    if (search) params.search = search;

    const { data } = await apiClient.get<ApiResponse<SavingActionTemplate[]>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.SAVING_TEMPLATES,
      { params }
    );
    return data.data;
  },

  async getSavingTemplateById(id: number): Promise<SavingActionTemplate> {
    const { data } = await apiClient.get<ApiResponse<SavingActionTemplate>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.SAVING_TEMPLATE_BY_ID(id)
    );
    return data.data;
  },

  async createSavingTemplate(
    payload: CreateSavingActionTemplatePayload
  ): Promise<SavingActionTemplate> {
    const { data } = await apiClient.post<ApiResponse<SavingActionTemplate>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.SAVING_TEMPLATES,
      payload
    );
    return data.data;
  },

  async updateSavingTemplate(
    id: number,
    payload: UpdateSavingActionTemplatePayload
  ): Promise<SavingActionTemplate> {
    const { data } = await apiClient.put<ApiResponse<SavingActionTemplate>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.SAVING_TEMPLATE_BY_ID(id),
      payload
    );
    return data.data;
  },

  async deleteSavingTemplate(id: number): Promise<any> {
    const { data } = await apiClient.delete<ApiResponse<any>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.SAVING_TEMPLATE_BY_ID(id)
    );
    return data.data;
  },

  // ==========================================================================
  // Admin Endpoints: Tariff Notices & Monthly Schedules
  // ==========================================================================

  async getTariffNotices(): Promise<TariffNotice[]> {
    const { data } = await apiClient.get<ApiResponse<TariffNotice[]>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_NOTICES
    );
    return data.data;
  },

  async getTariffNoticeById(id: number): Promise<TariffNotice> {
    const { data } = await apiClient.get<ApiResponse<TariffNotice>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_NOTICE_BY_ID(id)
    );
    return data.data;
  },

  async createTariffNotice(
    payload: CreateTariffNoticePayload
  ): Promise<TariffNotice> {
    const { data } = await apiClient.post<ApiResponse<TariffNotice>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_NOTICES,
      payload
    );
    return data.data;
  },

  async updateTariffNotice(
    id: number,
    payload: UpdateTariffNoticePayload
  ): Promise<TariffNotice> {
    const { data } = await apiClient.put<ApiResponse<TariffNotice>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_NOTICE_BY_ID(id),
      payload
    );
    return data.data;
  },

  async deleteTariffNotice(id: number): Promise<any> {
    const { data } = await apiClient.delete<ApiResponse<any>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.TARIFF_NOTICE_BY_ID(id)
    );
    return data.data;
  },

  async upsertSchedule(
    payload: UpsertTariffSchedulePayload
  ): Promise<TariffSchedule> {
    const { data } = await apiClient.put<ApiResponse<TariffSchedule>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.UPSERT_SCHEDULE,
      payload
    );
    return data.data;
  },

  async deleteSchedule(id: number): Promise<any> {
    const { data } = await apiClient.delete<ApiResponse<any>>(
      API_ENDPOINTS.ELECTRICITY_CALCULATOR.DELETE_SCHEDULE(id)
    );
    return data.data;
  },
};
