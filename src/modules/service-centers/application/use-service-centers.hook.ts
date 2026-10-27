import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serviceCenterApi } from '../infrastructure/service-center.api';
import type {
  CreateServiceCenterPayload,
  UpdateServiceCenterPayload,
} from '../domain/service-center.types';

export const SERVICE_CENTERS_QUERY_KEY = ['service-centers'];

export function useServiceCenters(provinceId?: number) {
  return useQuery({
    queryKey: [...SERVICE_CENTERS_QUERY_KEY, provinceId],
    queryFn: () => serviceCenterApi.getServiceCenters(provinceId),
  });
}

export function useCreateServiceCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServiceCenterPayload) =>
      serviceCenterApi.createServiceCenter(payload),
    onSuccess: () => {
      toast.success('ສ້າງຂໍ້ມູນສູນບໍລິການໃໝ່ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: SERVICE_CENTERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງຂໍ້ມູນສູນບໍລິການບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateServiceCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateServiceCenterPayload;
    }) => serviceCenterApi.updateServiceCenter(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂໍ້ມູນສູນບໍລິການສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: SERVICE_CENTERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂຂໍ້ມູນສູນບໍລິການບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteServiceCenter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => serviceCenterApi.deleteServiceCenter(id),
    onSuccess: () => {
      toast.success('ລຶບຂໍ້ມູນສູນບໍລິການສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: SERVICE_CENTERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບຂໍ້ມູນສູນບໍລິການບໍ່ສຳເລັດ');
    },
  });
}

export function useSyncServiceCenters() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => serviceCenterApi.syncServiceCenters(),
    onSuccess: (data) => {
      toast.success(
        data?.message || `ຊິ້ງຂໍ້ມູນສູນບໍລິການສຳເລັດແລ້ວ (${data?.total || 0} ສູນ)`
      );
      queryClient.invalidateQueries({ queryKey: SERVICE_CENTERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ຊິ້ງຂໍ້ມູນສູນບໍລິການລົ້ມເຫຼວ');
    },
  });
}

export function useUploadServiceCenterImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      serviceCenterApi.uploadImage(id, file),
    onSuccess: (data) => {
      toast.success(data?.message || 'ອັບໂຫຼດຮູບພາບສູນບໍລິການສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: SERVICE_CENTERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບໂຫຼດຮູບພາບສູນບໍລິການບໍ່ສຳເລັດ');
    },
  });
}

// Location Dropdown Hooks
export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: () => serviceCenterApi.getProvinces(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDistricts(provinceId?: number) {
  return useQuery({
    queryKey: ['districts', provinceId],
    queryFn: () => serviceCenterApi.getDistricts(provinceId),
    enabled: Boolean(provinceId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVillages(districtId?: number) {
  return useQuery({
    queryKey: ['villages', districtId],
    queryFn: () => serviceCenterApi.getVillages(districtId),
    enabled: Boolean(districtId),
    staleTime: 5 * 60 * 1000,
  });
}
