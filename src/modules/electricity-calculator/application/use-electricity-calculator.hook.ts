import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { electricityCalculatorApi } from '../infrastructure/electricity-calculator.api';
import type {
  CreateTariffCategoryPayload,
  UpdateTariffCategoryPayload,
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
} from '../domain/electricity-calculator.types';

export const CALCULATOR_QUERY_KEYS = {
  CONFIG: ['electricity-calculator', 'config'],
  TARIFF_CATEGORIES: (search?: string) => [
    'electricity-calculator',
    'tariff-categories',
    search,
  ],
  TARIFF_CATEGORY_BY_ID: (id?: number) => [
    'electricity-calculator',
    'tariff-categories',
    id,
  ],
  SCHEDULES: (year?: number, month?: number, categoryId?: number) => [
    'electricity-calculator',
    'schedules',
    year,
    month,
    categoryId,
  ],
  CATEGORIES: (search?: string) => [
    'electricity-calculator',
    'categories',
    search,
  ],
  PRESETS: (categoryId?: number, search?: string) => [
    'electricity-calculator',
    'presets',
    categoryId,
    search,
  ],
  SAVING_TEMPLATES: (categoryId?: number, search?: string) => [
    'electricity-calculator',
    'saving-templates',
    categoryId,
    search,
  ],
  NOTICES: ['electricity-calculator', 'tariff-notices'],
  NOTICE_BY_ID: (id?: number) => [
    'electricity-calculator',
    'tariff-notices',
    id,
  ],
};

// ============================================================================
// 1. Public & Calculation Hooks
// ============================================================================

export function useCalculatorConfig() {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.CONFIG,
    queryFn: () => electricityCalculatorApi.getConfig(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTariffSchedule(
  year?: number,
  month?: number,
  categoryId?: number
) {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.SCHEDULES(year, month, categoryId),
    queryFn: () => electricityCalculatorApi.getSchedule(year, month, categoryId),
    enabled: Boolean(year && month),
  });
}

export function useCalculateBill() {
  return useMutation({
    mutationFn: (payload: CalculateElectricityPayload) =>
      electricityCalculatorApi.calculateBill(payload),
    onError: (error: any) => {
      toast.error(error?.message || 'ຄິດໄລ່ຄ່າໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

// ============================================================================
// 2. Tariff Categories Hooks (Module 3.22.1)
// ============================================================================

export function useTariffCategories(search?: string) {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.TARIFF_CATEGORIES(search),
    queryFn: () => electricityCalculatorApi.getTariffCategories(search),
  });
}

export function useTariffCategory(id?: number) {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.TARIFF_CATEGORY_BY_ID(id),
    queryFn: () => (id ? electricityCalculatorApi.getTariffCategoryById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateTariffCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTariffCategoryPayload) =>
      electricityCalculatorApi.createTariffCategory(payload),
    onSuccess: () => {
      toast.success('ເພີ່ມປະເພດອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'tariff-categories'],
      });
      queryClient.invalidateQueries({
        queryKey: CALCULATOR_QUERY_KEYS.CONFIG,
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ເພີ່ມປະເພດອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateTariffCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTariffCategoryPayload;
    }) => electricityCalculatorApi.updateTariffCategory(id, payload),
    onSuccess: (_, variables) => {
      toast.success('ແກ້ໄຂປະເພດອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'tariff-categories'],
      });
      queryClient.invalidateQueries({
        queryKey: CALCULATOR_QUERY_KEYS.TARIFF_CATEGORY_BY_ID(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: CALCULATOR_QUERY_KEYS.CONFIG,
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂປະເພດອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteTariffCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => electricityCalculatorApi.deleteTariffCategory(id),
    onSuccess: () => {
      toast.success('ລຶບປະເພດອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'tariff-categories'],
      });
      queryClient.invalidateQueries({
        queryKey: CALCULATOR_QUERY_KEYS.CONFIG,
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບປະເພດອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ (ອາດມີຕາຕະລາງຄ່າໄຟຜູກຢູ່)');
    },
  });
}

// ============================================================================
// 3. Appliance Categories Hooks
// ============================================================================

export function useApplianceCategories(search?: string) {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.CATEGORIES(search),
    queryFn: () => electricityCalculatorApi.getCategories(search),
  });
}

export function useCreateApplianceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApplianceCategoryPayload) =>
      electricityCalculatorApi.createCategory(payload),
    onSuccess: () => {
      toast.success('ເພີ່ມໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'categories'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ເພີ່ມໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateApplianceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateApplianceCategoryPayload;
    }) => electricityCalculatorApi.updateCategory(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'categories'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteApplianceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => electricityCalculatorApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('ລຶບໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'categories'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

// ============================================================================
// 3. Appliance Presets Hooks
// ============================================================================

export function useAppliancePresets(categoryId?: number, search?: string) {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.PRESETS(categoryId, search),
    queryFn: () => electricityCalculatorApi.getPresets(categoryId, search),
  });
}

export function useCreateAppliancePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppliancePresetPayload) =>
      electricityCalculatorApi.createPreset(payload),
    onSuccess: () => {
      toast.success('ເພີ່ມເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'presets'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ເພີ່ມເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateAppliancePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateAppliancePresetPayload;
    }) => electricityCalculatorApi.updatePreset(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'presets'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteAppliancePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => electricityCalculatorApi.deletePreset(id),
    onSuccess: () => {
      toast.success('ລຶບເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'presets'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບບໍ່ສຳເລັດ');
    },
  });
}

// ============================================================================
// 4. Saving Action Templates Hooks
// ============================================================================

export function useSavingTemplates(categoryId?: number, search?: string) {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.SAVING_TEMPLATES(categoryId, search),
    queryFn: () => electricityCalculatorApi.getSavingTemplates(categoryId, search),
  });
}

export function useCreateSavingTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSavingActionTemplatePayload) =>
      electricityCalculatorApi.createSavingTemplate(payload),
    onSuccess: () => {
      toast.success('ເພີ່ມແມ່ແບບວິທີປະຢັດໄຟສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'saving-templates'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ເພີ່ມແມ່ແບບວິທີປະຢັດໄຟບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateSavingTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateSavingActionTemplatePayload;
    }) => electricityCalculatorApi.updateSavingTemplate(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂແມ່ແບບວິທີປະຢັດໄຟສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'saving-templates'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂແມ່ແບບວິທີປະຢັດໄຟບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteSavingTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      electricityCalculatorApi.deleteSavingTemplate(id),
    onSuccess: () => {
      toast.success('ລຶບແມ່ແບບວິທີປະຢັດໄຟສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'saving-templates'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບແມ່ແບບວິທີປະຢັດໄຟບໍ່ສຳເລັດ');
    },
  });
}

// ============================================================================
// 5. Tariff Notices & Schedules Hooks
// ============================================================================

export function useTariffNotices() {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.NOTICES,
    queryFn: () => electricityCalculatorApi.getTariffNotices(),
  });
}

export function useTariffNotice(id?: number) {
  return useQuery({
    queryKey: CALCULATOR_QUERY_KEYS.NOTICE_BY_ID(id),
    queryFn: () => (id ? electricityCalculatorApi.getTariffNoticeById(id) : null),
    enabled: Boolean(id),
  });
}

export function useCreateTariffNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTariffNoticePayload) =>
      electricityCalculatorApi.createTariffNotice(payload),
    onSuccess: () => {
      toast.success('ເພີ່ມປະກາດອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.NOTICES });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ເພີ່ມປະກາດອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateTariffNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateTariffNoticePayload;
    }) => electricityCalculatorApi.updateTariffNotice(id, payload),
    onSuccess: (_, variables) => {
      toast.success('ແກ້ໄຂປະກາດອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.NOTICES });
      queryClient.invalidateQueries({
        queryKey: CALCULATOR_QUERY_KEYS.NOTICE_BY_ID(variables.id),
      });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂປະກາດອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteTariffNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => electricityCalculatorApi.deleteTariffNotice(id),
    onSuccess: () => {
      toast.success('ລຶບປະກາດອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.NOTICES });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບປະກາດອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ');
    },
  });
}

export function useUpsertSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertTariffSchedulePayload) =>
      electricityCalculatorApi.upsertSchedule(payload),
    onSuccess: (_, variables) => {
      toast.success('ບັນທຶກຕາຕະລາງອັດຕາຄ່າໄຟ 8 ຂັ້ນບັນໄດສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.NOTICES });
      queryClient.invalidateQueries({
        queryKey: CALCULATOR_QUERY_KEYS.NOTICE_BY_ID(variables.noticeId),
      });
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'schedules'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ບັນທຶກຕາຕະລາງຄ່າໄຟບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, noticeId }: { id: number; noticeId?: number }) =>
      electricityCalculatorApi.deleteSchedule(id),
    onSuccess: (_, variables) => {
      toast.success('ລຶບຕາຕະລາງອັດຕາຄ່າໄຟລາຍເດືອນສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.NOTICES });
      if (variables.noticeId) {
        queryClient.invalidateQueries({
          queryKey: CALCULATOR_QUERY_KEYS.NOTICE_BY_ID(variables.noticeId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['electricity-calculator', 'schedules'],
      });
      queryClient.invalidateQueries({ queryKey: CALCULATOR_QUERY_KEYS.CONFIG });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບຕາຕະລາງຄ່າໄຟບໍ່ສຳເລັດ');
    },
  });
}
