import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../infrastructure/user.api';
import type {
  UpdateUserRolePayload,
  ChangePasswordPayload,
} from '../domain/user.types';

export const USERS_QUERY_KEY = ['users'];

/**
 * Hook สำหรับดึงรายชื่อผู้ใช้ทั้งหมด
 */
export function useUsers() {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => userApi.getUsers(),
  });
}

/**
 * Hook สำหรับ Sync ข้อมูลพนักงานจาก HRM Service
 */
export function useSyncUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (empCode: string) => userApi.syncUser(empCode),
    onSuccess: (data) => {
      toast.success(data?.message || 'Sync ຂໍ້ມູນພະນັກງານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Sync ຂໍ້ມູນພະນັກງານລົ້ມເຫຼວ');
    },
  });
}

/**
 * Hook สำหรับแก้ไข Role และ Status
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserRolePayload }) =>
      userApi.updateUserRole(id, payload),
    onSuccess: () => {
      toast.success('ອັບເດດສິດທິຜູ້ໃຊ້ງານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບເດດສິດທິຜູ້ໃຊ້ງານບໍ່ສຳເລັດ');
    },
  });
}

/**
 * Hook สำหรับเปลี่ยน / รีเซ็ตรหัสผ่าน
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ChangePasswordPayload;
    }) => userApi.changePassword(id, payload),
    onSuccess: () => {
      toast.success('ປ່ຽນລະຫັດຜ່ານສຳເລັດແລ້ວ');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ປ່ຽນລະຫັດຜ່ານບໍ່ສຳເລັດ');
    },
  });
}

/**
 * Hook สำหรับลบบัญชีผู้ใช้
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: () => {
      toast.success('ລຶບບັນຊີຜູ້ໃຊ້ງານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບບັນຊີຜູ້ໃຊ້ງານບໍ່ສຳເລັດ');
    },
  });
}
