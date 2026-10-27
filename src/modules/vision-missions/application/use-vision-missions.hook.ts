import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { visionMissionApi } from '../infrastructure/vision-mission.api';
import type {
  CreateVisionMissionPayload,
  UpdateVisionMissionPayload,
} from '../domain/vision-mission.types';

export const VISION_MISSIONS_QUERY_KEY = ['vision-missions'];

export function useVisionMissions() {
  return useQuery({
    queryKey: VISION_MISSIONS_QUERY_KEY,
    queryFn: () => visionMissionApi.getVisionMissions(),
  });
}

export function useVisionMissionById(id?: number) {
  return useQuery({
    queryKey: [...VISION_MISSIONS_QUERY_KEY, 'detail', id],
    queryFn: () => visionMissionApi.getVisionMissionById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateVisionMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVisionMissionPayload) =>
      visionMissionApi.createVisionMission(payload),
    onSuccess: () => {
      toast.success('ສ້າງຂໍ້ມູນສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: VISION_MISSIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງຂໍ້ມູນບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateVisionMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateVisionMissionPayload;
    }) => visionMissionApi.updateVisionMission(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂໍ້ມູນສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: VISION_MISSIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂຂໍ້ມູນບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteVisionMission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => visionMissionApi.deleteVisionMission(id),
    onSuccess: () => {
      toast.success('ລຶບຂໍ້ມູນສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: VISION_MISSIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບຂໍ້ມູນບໍ່ສຳເລັດ');
    },
  });
}

export function useUploadVisionMissionImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      visionMissionApi.uploadImage(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດຮູບພາບສຳເລັດ');
      queryClient.invalidateQueries({ queryKey: VISION_MISSIONS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບໂຫຼດຮູບພາບບໍ່ສຳເລັດ');
    },
  });
}
