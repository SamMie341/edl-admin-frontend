import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { departmentApi } from '../infrastructure/department.api';
import type {
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '../domain/department.types';

export const DEPARTMENTS_QUERY_KEY = ['departments'];

export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,
    queryFn: () => departmentApi.getDepartments(),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDepartmentPayload) =>
      departmentApi.createDepartment(payload),
    onSuccess: () => {
      toast.success('ເພີ່ມຂໍ້ມູນຝ່າຍໃໝ່ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ເພີ່ມຂໍ້ມູນຝ່າຍບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateDepartmentPayload;
    }) => departmentApi.updateDepartment(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂໍ້ມູນຝ່າຍສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂຂໍ້ມູນຝ່າຍບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departmentApi.deleteDepartment(id),
    onSuccess: () => {
      toast.success('ລຶບຂໍ້ມູນຝ່າຍສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບຂໍ້ມູນຝ່າຍບໍ່ສຳເລັດ');
    },
  });
}
