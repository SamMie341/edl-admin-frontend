import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userApi } from '../infrastructure/user.api';
import { PROFILE_QUERY_KEY } from '@/modules/auth/application/use-profile.hook';
import type {
  UpdateUserRolePayload,
  ChangePasswordPayload,
  AssignPermissionsPayload,
} from '../domain/user.types';

export const USERS_QUERY_KEY = ['users'];
export const PERMISSIONS_LIST_QUERY_KEY = ['permissions', 'list'];
export const USER_PERMISSIONS_QUERY_KEY = (id: number) => ['users', 'permissions', id];

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
 * Hook สำหรับดึงรายการสิทธิ์ทั้งหมดในระบบ (Permissions List)
 */
export function usePermissionsList() {
  return useQuery({
    queryKey: PERMISSIONS_LIST_QUERY_KEY,
    queryFn: () => userApi.getPermissions(),
    staleTime: 5 * 60 * 1000, // แคช 5 นาทีเนื่องจากเป็น Master data
  });
}

/**
 * Hook สำหรับดึงสิทธิ์จาก Role, ALLOW, DENY และสิทธิ์สุทธิของผู้ใช้ตาม ID
 */
export function useUserPermissions(id: number | null | undefined) {
  return useQuery({
    queryKey: USER_PERMISSIONS_QUERY_KEY(id ?? 0),
    queryFn: () => userApi.getUserPermissions(id!),
    enabled: Boolean(id),
  });
}

/**
 * Hook สำหรับกำหนดสิทธิ์ให้กับผู้ใช้งาน (Assign Permissions: ALLOW / DENY)
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: AssignPermissionsPayload;
    }) => userApi.assignPermissions(id, payload),
    onSuccess: (data, variables) => {
      toast.success(data?.message || 'ກຳນົດສິດການນຳໃຊ້ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_PERMISSIONS_QUERY_KEY(variables.id) });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ກຳນົດສິດການນຳໃຊ້ບໍ່ສຳເລັດ');
    },
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
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
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
