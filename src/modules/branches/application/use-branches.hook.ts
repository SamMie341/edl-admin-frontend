import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchApi } from '../infrastructure/branch.api';
import type {
  CreateBranchPayload,
  UpdateBranchPayload,
  BranchImageType,
} from '../domain/branch.types';

export const BRANCHES_QUERY_KEY = ['branches'];

export function useBranches(departmentId?: number) {
  return useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, departmentId],
    queryFn: () => branchApi.getBranches(departmentId),
  });
}

export function useBranchesDropdown(departmentId?: number) {
  return useQuery({
    queryKey: [...BRANCHES_QUERY_KEY, 'dropdown', departmentId],
    queryFn: () => branchApi.getBranchesDropdown(departmentId),
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBranchPayload) => branchApi.createBranch(payload),
    onSuccess: () => {
      toast.success('ສ້າງຂໍ້ມູນສາຂາໃໝ່ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງຂໍ້ມູນສາຂາບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateBranchPayload;
    }) => branchApi.updateBranch(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂໍ້ມູນສາຂາສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂຂໍ້ມູນສາຂາບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => branchApi.deleteBranch(id),
    onSuccess: () => {
      toast.success('ລຶບຂໍ້ມູນສາຂາສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບຂໍ້ມູນສາຂາບໍ່ສຳເລັດ');
    },
  });
}

export function useSyncBranches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => branchApi.syncBranches(),
    onSuccess: (data) => {
      toast.success(
        data?.message || `ຊິ້ງຂໍ້ມູນສາຂາສຳເລັດແລ້ວ (ທັງໝົດ ${data?.total || 0} ສາຂາ)`
      );
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ຊິ້ງຂໍ້ມູນສາຂາຈາກ Inside API ລົ້ມເຫຼວ');
    },
  });
}

export function useUploadBranchImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      imageType,
      file,
    }: {
      id: number;
      imageType: BranchImageType;
      file: File;
    }) => branchApi.uploadBranchImage(id, imageType, file),
    onSuccess: (data) => {
      toast.success(data?.message || 'ອັບໂຫຼດຮູບພາບສາຂາສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: BRANCHES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບໂຫຼດຮູບພາບສາຂາບໍ່ສຳເລັດ');
    },
  });
}
