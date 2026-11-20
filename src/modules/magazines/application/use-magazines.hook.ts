import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { magazineApi } from '../infrastructure/magazine.api';
import type {
  CreateMagazinePayload,
  UpdateMagazinePayload,
  MagazineQueryParams,
} from '../domain/magazine.types';

export const MAGAZINES_QUERY_KEY = ['magazines'];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function useMagazines(params?: MagazineQueryParams) {
  return useQuery({
    queryKey: [...MAGAZINES_QUERY_KEY, params],
    queryFn: () => magazineApi.getAll(params),
  });
}

export function useMagazineById(id?: number) {
  return useQuery({
    queryKey: [...MAGAZINES_QUERY_KEY, 'detail', id],
    queryFn: () => magazineApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateMagazine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMagazinePayload) => magazineApi.create(payload),
    onSuccess: () => {
      toast.success('ສ້າງຂໍ້ມູນວາລະສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: MAGAZINES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ສ້າງຂໍ້ມູນວາລະສານບໍ່ສຳເລັດ'));
    },
  });
}

export function useUpdateMagazine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateMagazinePayload;
    }) => magazineApi.update(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂໍ້ມູນວາລະສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: MAGAZINES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ແກ້ໄຂຂໍ້ມູນວາລະສານບໍ່ສຳເລັດ'));
    },
  });
}

export function useDeleteMagazine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => magazineApi.remove(id),
    onSuccess: () => {
      toast.success('ລຶບວາລະສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: MAGAZINES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ລຶບວາລະສານບໍ່ສຳເລັດ'));
    },
  });
}

export function useUploadMagazineCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      magazineApi.uploadCover(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດຮູບໜ້າປົກວາລະສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: MAGAZINES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ອັບໂຫຼດຮູບໜ້າປົກບໍ່ສຳເລັດ'));
    },
  });
}

export function useUploadMagazineDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      magazineApi.uploadDocument(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດໄຟລ໌ PDF ວາລະສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: MAGAZINES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ອັບໂຫຼດໄຟລ໌ PDF ບໍ່ສຳເລັດ'));
    },
  });
}

export function useIncrementMagazineDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => magazineApi.incrementDownload(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MAGAZINES_QUERY_KEY });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ບໍ່ສາມາດອັບເດດຍອດດາວໂຫຼດໄດ້'));
    },
  });
}
