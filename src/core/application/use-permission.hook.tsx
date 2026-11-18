'use client';

import React from 'react';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import type { AuthUser } from '@/modules/auth/domain/auth.types';

export type PermissionActionType = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | string;

export function getAuthUserRole(role: any): string {
  if (!role) return '';
  if (typeof role === 'object' && role !== null && 'name' in role) return role.name;
  return typeof role === 'string' ? role : '';
}

/**
 * ກວດສອບວ່າສິດທິ (module + action) ຖືກປິດ/ຫັກອອກ (DENY) ຫຼືບໍ່
 * ກວດສອບກ່ອນເງື່ອນໄຂ SUPERADMIN ເພື່ອໃຫ້ການປິດສິດສະເພາະບຸກຄົນມີຜົນທຸກ Role
 */
export function isPermissionDenied(
  user: AuthUser | null | undefined,
  module: string,
  action: PermissionActionType
): boolean {
  if (!user) return false;
  const upperModule = module.toUpperCase();
  const upperAction = action.toUpperCase();

  if (
    user.deniedPermissions?.some(
      (p) =>
        p.module.toUpperCase() === upperModule &&
        p.action.toUpperCase() === upperAction
    )
  ) {
    return true;
  }

  if (
    user.userPermissions?.some(
      (up) =>
        up.effect === 'DENY' &&
        up.permission?.module.toUpperCase() === upperModule &&
        up.permission?.action.toUpperCase() === upperAction
    )
  ) {
    return true;
  }

  return false;
}

/**
 * ฟังก์ชันตรวจสอบสิทธิ์ของผู้ใช้ (PBAC / RBAC)
 * - ตรวจสอบ DENY ก่อนเสมอ (มีผลกับทุก Role รวมถึง SUPERADMIN)
 * - หากเป็น SUPERADMIN และไม่ถูก DENY จะได้รับสิทธิ์โดยอัตโนมัติ (ตรงตาม Backend PermissionsGuard)
 * - ตรวจสอบ module และ action จาก user.permissions
 */
export function checkUserPermission(
  user: AuthUser | null | undefined,
  module: string,
  action: PermissionActionType
): boolean {
  if (!user) return false;
  if (isPermissionDenied(user, module, action)) return false;
  if (getAuthUserRole(user.role).toUpperCase() === 'SUPERADMIN') return true;

  const permissions = user.permissions || [];
  return permissions.some(
    (p) =>
      p.module.toUpperCase() === module.toUpperCase() &&
      p.action.toUpperCase() === action.toUpperCase()
  );
}

/**
 * ฟังก์ชันตรวจสอบว่าผู้ใช้มีสิทธิ์ใน action ใด action หนึ่งหรือไม่
 */
export function checkUserAnyPermission(
  user: AuthUser | null | undefined,
  module: string,
  actions: PermissionActionType[]
): boolean {
  if (!user) return false;
  return actions.some((action) => checkUserPermission(user, module, action));
}

/**
 * ฟังก์ชันตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงโมดูลนั้นๆ หรือไม่ (มีสิทธิ์ใดก็ได้ในโมดูล)
 */
export function checkUserModuleAccess(
  user: AuthUser | null | undefined,
  module: string
): boolean {
  if (!user) return false;
  const userRole = getAuthUserRole(user.role).toUpperCase();
  if (userRole === 'SUPERADMIN') {
    return !isPermissionDenied(user, module, 'READ');
  }

  const permissions = user.permissions || [];
  const upperModule = module.toUpperCase();

  // ກວດສອບສິດທິລະດັບ Module ຢ່າງເຂັ້ມງວດ (ບໍ່ Bypass ໃຫ້ Role ອື່ນນອກຈາກ SUPERADMIN)
  return permissions.some(
    (p) =>
      p.module.toUpperCase() === upperModule &&
      !isPermissionDenied(user, module, p.action)
  );
}

/**
 * Custom Hook สำหรับเช็ค Permission ใน React Component
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const userRole = getAuthUserRole(user?.role);
  const isSuperAdmin = userRole === 'SUPERADMIN';
  const isAdmin = userRole === 'ADMIN' || isSuperAdmin;

  const can = (module: string, action: PermissionActionType): boolean => {
    return checkUserPermission(user, module, action);
  };

  const canAny = (module: string, actions: PermissionActionType[]): boolean => {
    return checkUserAnyPermission(user, module, actions);
  };

  const canAccessModule = (module: string): boolean => {
    return checkUserModuleAccess(user, module);
  };

  return {
    user,
    isSuperAdmin,
    isAdmin,
    can,
    canAny,
    canAccessModule,
  };
}

interface CanProps {
  module: string;
  action: PermissionActionType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Declarative Component สำหรับครอบ UI ให้แสดงผลเฉพาะผู้ที่มีสิทธิ์
 */
export function Can({ module, action, children, fallback = null }: CanProps) {
  const { can } = usePermission();

  if (can(module, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
