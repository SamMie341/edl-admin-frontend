import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orgStructureApi } from '../infrastructure/org-structure.api';
import type {
  CreateOrgStructurePayload,
  UpdateOrgStructurePayload,
} from '../domain/org-structure.types';

export const ORG_STRUCTURES_QUERY_KEY = ['org-structures'];

export function useOrgStructures() {
  return useQuery({
    queryKey: ORG_STRUCTURES_QUERY_KEY,
    queryFn: () => orgStructureApi.getOrgStructures(),
  });
}

export function useOrgStructureDropdown() {
  return useQuery({
    queryKey: [...ORG_STRUCTURES_QUERY_KEY, 'dropdown'],
    queryFn: () => orgStructureApi.getDropdown(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateOrgStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrgStructurePayload) =>
      orgStructureApi.createOrgStructure(payload),
    onSuccess: () => {
      toast.success('ສ້າງໂຄງຮ່າງການຈັດຕັ້ງໃໝ່ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງໂຄງຮ່າງການຈັດຕັ້ງບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateOrgStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateOrgStructurePayload;
    }) => orgStructureApi.updateOrgStructure(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂໂຄງຮ່າງການຈັດຕັ້ງສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂໂຄງຮ່າງການຈັດຕັ້ງບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteOrgStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => orgStructureApi.deleteOrgStructure(id),
    onSuccess: () => {
      toast.success('ລຶບໂຄງຮ່າງການຈັດຕັ້ງສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບໂຄງຮ່າງການຈັດຕັ້ງບໍ່ສຳເລັດ');
    },
  });
}

export function useUploadOrgStructureImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      orgStructureApi.uploadImage(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດຮູບພາບໂຄງຮ່າງສຳເລັດ');
      queryClient.invalidateQueries({ queryKey: ORG_STRUCTURES_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບໂຫຼດຮູບພາບໂຄງຮ່າງບໍ່ສຳເລັດ');
    },
  });
}
