import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { electricityTariffApi } from '../infrastructure/electricity-tariff.api';
import type {
  CreateElectricityTariffPayload,
  UpdateElectricityTariffPayload,
  ElectricityTariffQueryParams,
} from '../domain/electricity-tariff.types';

export const ELECTRICITY_TARIFFS_QUERY_KEY = ['electricity-tariffs'];

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function useElectricityTariffs(
  params?: ElectricityTariffQueryParams
) {
  return useQuery({
    queryKey: [...ELECTRICITY_TARIFFS_QUERY_KEY, params],
    queryFn: () => electricityTariffApi.getAll(params),
  });
}

export function useElectricityTariffById(id?: number) {
  return useQuery({
    queryKey: [...ELECTRICITY_TARIFFS_QUERY_KEY, 'detail', id],
    queryFn: () => electricityTariffApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateElectricityTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateElectricityTariffPayload) =>
      electricityTariffApi.create(payload),
    onSuccess: () => {
      toast.success('ສ້າງຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICITY_TARIFFS_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'ສ້າງຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ')
      );
    },
  });
}

export function useUpdateElectricityTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateElectricityTariffPayload;
    }) => electricityTariffApi.update(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICITY_TARIFFS_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'ແກ້ໄຂຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ')
      );
    },
  });
}

export function useDeleteElectricityTariff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => electricityTariffApi.remove(id),
    onSuccess: () => {
      toast.success('ລຶບຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICITY_TARIFFS_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ລຶບຂໍ້ມູນອັດຕາຄ່າໄຟຟ້າບໍ່ສຳເລັດ'));
    },
  });
}

export function useUploadElectricityTariffImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      electricityTariffApi.uploadImage(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດຮູບພາບຕາຕະລາງອັດຕາຄ່າໄຟສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICITY_TARIFFS_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ອັບໂຫຼດຮູບພາບຕາຕະລາງບໍ່ສຳເລັດ'));
    },
  });
}

export function useUploadElectricityTariffDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      electricityTariffApi.uploadDocument(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດໄຟລ໌ PDF ອັດຕາຄ່າໄຟສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({
        queryKey: ELECTRICITY_TARIFFS_QUERY_KEY,
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'ອັບໂຫຼດໄຟລ໌ PDF ບໍ່ສຳເລັດ'));
    },
  });
}
