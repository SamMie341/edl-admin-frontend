import type { PermissionItem } from '@/modules/users/domain/user.types';

export interface RoleItem {
  id: number;
  name: string;
  description?: string | null;
  userCount?: number;
  permissionCount?: number;
  permissions?: PermissionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleDropdownItem {
  id: number;
  name: string;
  description?: string | null;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissionIds?: number[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  permissionIds?: number[];
}

export interface RolesListResponse {
  data: RoleItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
