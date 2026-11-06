import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { locationApi } from '../infrastructure/location.api';

export const PROVINCES_QUERY_KEY = ['locations', 'provinces'];
export const DISTRICTS_QUERY_KEY = ['locations', 'districts'];
export const VILLAGES_QUERY_KEY = ['locations', 'villages'];

/**
 * Hook ດຶງລາຍຊື່ແຂວງ
 */
export function useProvinces(includeDistricts = false) {
  return useQuery({
    queryKey: [...PROVINCES_QUERY_KEY, { includeDistricts }],
    queryFn: () => locationApi.getProvinces(includeDistricts),
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}

/**
 * Hook ຊິ້ງຂໍ້ມູນແຂວງຈາກ HRM
 */
export function useSyncProvinces() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => locationApi.syncProvinces(),
    onSuccess: (data) => {
      toast.success(
        data?.message || `ຊິ້ງຂໍ້ມູນແຂວງສຳເລັດແລ້ວ (ທັງໝົດ ${data?.total || 0} ແຂວງ)`
      );
      queryClient.invalidateQueries({ queryKey: PROVINCES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ຊິ້ງຂໍ້ມູນແຂວງຈາກ HRM ລົ້ມເຫຼວ');
    },
  });
}

/**
 * Hook ດຶງລາຍຊື່ເມືອງ (ທັງໝົດ ຫຼື ຕາມແຂວງ)
 */
export function useDistricts(provinceId?: number) {
  return useQuery({
    queryKey: [...DISTRICTS_QUERY_KEY, provinceId],
    queryFn: () => locationApi.getDistricts(provinceId),
    staleTime: 1000 * 60 * 15,
  });
}

/**
 * Hook ຊິ້ງຂໍ້ມູນເມືອງຈາກ HRM
 */
export function useSyncDistricts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => locationApi.syncDistricts(),
    onSuccess: (data) => {
      toast.success(
        data?.message || `ຊິ້ງຂໍ້ມູນເມືອງສຳເລັດແລ້ວ (ທັງໝົດ ${data?.total || 0} ເມືອງ)`
      );
      queryClient.invalidateQueries({ queryKey: DISTRICTS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ຊິ້ງຂໍ້ມູນເມືອງຈາກ HRM ລົ້ມເຫຼວ');
    },
  });
}

/**
 * Hook ດຶງລາຍຊື່ບ້ານ (ທັງໝົດ ຫຼື ຕາມເມືອງ)
 */
export function useVillages(districtId?: number) {
  return useQuery({
    queryKey: [...VILLAGES_QUERY_KEY, districtId],
    queryFn: () => locationApi.getVillages(districtId),
    enabled: districtId !== undefined, // fetch when district is selected to optimize load
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook ຊິ້ງຂໍ້ມູນບ້ານຈາກ HRM
 */
export function useSyncVillages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => locationApi.syncVillages(),
    onSuccess: (data) => {
      toast.success(
        data?.message || `ຊິ້ງຂໍ້ມູນບ້ານສຳເລັດແລ້ວ (ທັງໝົດ ${data?.total || 0} ບ້ານ)`
      );
      queryClient.invalidateQueries({ queryKey: VILLAGES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ຊິ້ງຂໍ້ມູນບ້ານຈາກ HRM ລົ້ມເຫຼວ');
    },
  });
}
