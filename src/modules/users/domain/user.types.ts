export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type PermissionAction = 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | string;

export interface PermissionItem {
  id: number;
  module: string;
  action: PermissionAction;
  createdAt?: string;
}

export interface UserPermissionRelation {
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
  role: UserRole;
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
  permissionIds: number[];
}

export interface AssignPermissionsResponse {
  message: string;
  user: UserItem;
}

export interface SyncUserResponse {
  message: string;
  user: UserItem;
}
