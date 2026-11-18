export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF' | string;

export interface RoleItem {
  id: number;
  name: UserRole;
  description?: string | null;
}

export function getUserRoleName(role?: UserRole | RoleItem | null): string {
  if (!role) return '';
  if (typeof role === 'object' && role !== null && 'name' in role) {
    return role.name;
  }
  return typeof role === 'string' ? role : '';
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type PermissionAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | string;

export type PermissionEffect = 'ALLOW' | 'DENY';

export interface PermissionItem {
  id: number;
  module: string;
  action: PermissionAction;
  createdAt?: string;
}

export interface UserPermissionRelation {
  effect?: PermissionEffect;
  permission: {
    id: number;
    module: string;
    action: PermissionAction;
  };
}

export interface UserItem {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  divisionName?: string | null;
  unitName?: string | null;
  roleId?: number | null;
  role: UserRole | RoleItem;
  status: UserStatus;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userPermissions?: UserPermissionRelation[];
}

export interface UpdateUserRolePayload {
  role?: UserRole;
  status?: UserStatus;
}

export interface ChangePasswordPayload {
  oldPassword?: string;
  newPassword?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AssignPermissionsPayload {
  permissionIds?: number[];
  deniedPermissionIds?: number[];
}

export type PermissionRefEntry =
  | PermissionItem
  | {
      id?: number;
      permissionId?: number;
      permission?: PermissionItem;
    };

export interface UserPermissionsDetail {
  rolePermissions?: PermissionRefEntry[];
  allowedPermissions?: PermissionRefEntry[];
  deniedPermissions?: PermissionRefEntry[];
  effectivePermissions?: PermissionRefEntry[];
}

export interface AssignPermissionsResponse {
  message: string;
  user?: UserItem;
  allowedPermissions?: PermissionRefEntry[];
  deniedPermissions?: PermissionRefEntry[];
  effectivePermissions?: PermissionRefEntry[];
}

export interface SyncUserResponse {
  message: string;
  user: UserItem;
}
