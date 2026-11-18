'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { roleApi } from '../infrastructure/role.api';
import { PROFILE_QUERY_KEY } from '@/modules/auth/application/use-profile.hook';
import type {
  CreateRolePayload,
  UpdateRolePayload,
} from '../domain/role.types';

export const ROLES_QUERY_KEY = ['roles'];
export const ROLES_DROPDOWN_QUERY_KEY = ['roles', 'dropdown'];

/**
 * Hook สำหรับดึงรายการบทบาททั้งหมด (พร้อม Pagination และ Search)
 */
export function useRoles(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...ROLES_QUERY_KEY, params],
    queryFn: () => roleApi.getRoles(params),
  });
}

/**
 * Hook สำหรับดึงรายการบทบาทสำหรับ Dropdown
 */
export function useRolesDropdown() {
  return useQuery({
    queryKey: ROLES_DROPDOWN_QUERY_KEY,
    queryFn: () => roleApi.getRolesDropdown(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook สำหรับดึงข้อมูลบทบาทตาม ID
 */
export function useRoleById(id: number | null | undefined) {
  return useQuery({
    queryKey: [...ROLES_QUERY_KEY, id],
    queryFn: () => roleApi.getRoleById(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook สำหรับสร้างบทบาทใหม่
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => roleApi.createRole(payload),
    onSuccess: () => {
      toast.success('ສ້າງບົດບາດໃໝ່ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_DROPDOWN_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງບົດບາດໃໝ່ບໍ່ສຳເລັດ');
    },
  });
}

/**
 * Hook สำหรับแก้ไขบทบาทและอัปเดตสิทธิ์
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRolePayload }) =>
      roleApi.updateRole(id, payload),
    onSuccess: () => {
      toast.success('ອັບເດດຂໍ້ມູນບົດບາດສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_DROPDOWN_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບເດດບົດບາດບໍ່ສຳເລັດ');
    },
  });
}

/**
 * Hook สำหรับลบบทบาท
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => roleApi.deleteRole(id),
    onSuccess: () => {
      toast.success('ລຶບບົດບາດສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ROLES_DROPDOWN_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບບົດບາດບໍ່ສຳເລັດ');
    },
  });
}
