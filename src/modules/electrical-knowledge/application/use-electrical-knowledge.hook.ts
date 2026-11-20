import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { electricalKnowledgeApi } from '../infrastructure/electrical-knowledge.api';
import type {
  CreateElectricalKnowledgePayload,
  UpdateElectricalKnowledgePayload,
  ElectricalKnowledgeQueryParams,
} from '../domain/electrical-knowledge.types';

export const ELECTRICAL_KNOWLEDGE_QUERY_KEY = ['electrical-knowledge'];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function useElectricalKnowledgeList(
  params?: ElectricalKnowledgeQueryParams
) {
  return useQuery({
    queryKey: [...ELECTRICAL_KNOWLEDGE_QUERY_KEY, params],
    queryFn: () => electricalKnowledgeApi.getAll(params),
  });
}

export function useElectricalKnowledgeById(id?: number) {
  return useQuery({
    queryKey: [...ELECTRICAL_KNOWLEDGE_QUERY_KEY, 'detail', id],
    queryFn: () => electricalKnowledgeApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateElectricalKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateElectricalKnowledgePayload) =>
      electricalKnowledgeApi.create(payload),
    onSuccess: () => {
      toast.success('ສ້າງບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICAL_KNOWLEDGE_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ສ້າງບົດຄວາມຄວາມຮູ້ບໍ່ສຳເລັດ'));
    },
  });
}

export function useUpdateElectricalKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateElectricalKnowledgePayload;
    }) => electricalKnowledgeApi.update(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICAL_KNOWLEDGE_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ແກ້ໄຂບົດຄວາມຄວາມຮູ້ບໍ່ສຳເລັດ'));
    },
  });
}

export function useDeleteElectricalKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => electricalKnowledgeApi.remove(id),
    onSuccess: () => {
      toast.success('ລຶບບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICAL_KNOWLEDGE_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ລຶບບົດຄວາມຄວາມຮູ້ບໍ່ສຳເລັດ'));
    },
  });
}

export function useUploadElectricalKnowledgeCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      electricalKnowledgeApi.uploadCover(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດຮູບໜ້າປົກບົດຄວາມສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICAL_KNOWLEDGE_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ອັບໂຫຼດຮູບໜ້າປົກບໍ່ສຳເລັດ'));
    },
  });
}

export function useIncrementElectricalKnowledgeView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => electricalKnowledgeApi.incrementView(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ELECTRICAL_KNOWLEDGE_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ບໍ່ສາມາດອັບເດດຍອດເຂົ້າຊົມໄດ້'));
    },
  });
}
