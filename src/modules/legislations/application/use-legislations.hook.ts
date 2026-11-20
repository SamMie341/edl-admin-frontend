import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { legislationApi } from '../infrastructure/legislation.api';
import type {
  CreateLegislationPayload,
  UpdateLegislationPayload,
  LegislationQueryParams,
} from '../domain/legislation.types';

export const LEGISLATIONS_QUERY_KEY = ['legislations'];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function useLegislations(params?: LegislationQueryParams) {
  return useQuery({
    queryKey: [...LEGISLATIONS_QUERY_KEY, params],
    queryFn: () => legislationApi.getAll(params),
  });
}

export function useLegislationById(id?: number) {
  return useQuery({
    queryKey: [...LEGISLATIONS_QUERY_KEY, 'detail', id],
    queryFn: () => legislationApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateLegislation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLegislationPayload) =>
      legislationApi.create(payload),
    onSuccess: () => {
      toast.success('ສ້າງເອກະສານນິຕິກຳໃໝ່ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: LEGISLATIONS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ສ້າງເອກະສານນິຕິກຳບໍ່ສຳເລັດ'));
    },
  });
}

export function useUpdateLegislation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateLegislationPayload;
    }) => legislationApi.update(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂໍ້ມູນນິຕິກຳສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: LEGISLATIONS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ແກ້ໄຂຂໍ້ມູນນິຕິກຳບໍ່ສຳເລັດ'));
    },
  });
}

export function useDeleteLegislation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => legislationApi.remove(id),
    onSuccess: () => {
      toast.success('ລຶບເອກະສານນິຕິກຳສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: LEGISLATIONS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ລຶບເອກະສານນິຕິກຳບໍ່ສຳເລັດ'));
    },
  });
}

export function useUploadLegislationDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      legislationApi.uploadDocument(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດໄຟລ໌ PDF ນິຕິກຳສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: LEGISLATIONS_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ອັບໂຫຼດໄຟລ໌ PDF ນິຕິກຳບໍ່ສຳເລັດ'));
    },
  });
}
