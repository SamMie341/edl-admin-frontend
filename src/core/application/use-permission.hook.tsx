'use client';

import React from 'react';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import type { AuthUser } from '@/modules/auth/domain/auth.types';

export type PermissionActionType = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | string;

/**
 * ฟังก์ชันตรวจสอบสิทธิ์ของผู้ใช้ (PBAC / RBAC)
 * - หากเป็น SUPERADMIN จะได้รับสิทธิ์ทั้งหมดโดยอัตโนมัติ (ตรงตาม Backend PermissionsGuard)
 * - ตรวจสอบ module และ action จาก user.permissions
 */
export function checkUserPermission(
  user: AuthUser | null | undefined,
  module: string,
  action: PermissionActionType
): boolean {
  if (!user) return false;
  if (user.role === 'SUPERADMIN') return true;

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
  if (user.role === 'SUPERADMIN') return true;

  const permissions = user.permissions || [];
  const upperModule = module.toUpperCase();
  const upperActions = actions.map((a) => a.toUpperCase());

  return permissions.some(
    (p) =>
      p.module.toUpperCase() === upperModule &&
      upperActions.includes(p.action.toUpperCase())
  );
}

/**
 * ฟังก์ชันตรวจสอบว่าผู้ใช้มีสิทธิ์เข้าถึงโมดูลนั้นๆ หรือไม่ (มีสิทธิ์ใดก็ได้ในโมดูล)
 */
export function checkUserModuleAccess(
  user: AuthUser | null | undefined,
  module: string
): boolean {
  if (!user) return false;
  if (user.role === 'SUPERADMIN') return true;

  const permissions = user.permissions || [];
  const upperModule = module.toUpperCase();

  return permissions.some((p) => p.module.toUpperCase() === upperModule);
}

/**
 * Custom Hook สำหรับเช็ค Permission ใน React Component
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);

  const isSuperAdmin = user?.role === 'SUPERADMIN';
  const isAdmin = user?.role === 'ADMIN' || isSuperAdmin;

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
