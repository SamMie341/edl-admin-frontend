export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserPermissionItem {
  id?: number;
  module: string;
  action: string;
}

export interface AuthUserPermissionRelation {
  effect?: 'ALLOW' | 'DENY';
  permission: UserPermissionItem;
}

export interface AuthUser {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string | null;
  departmentName?: string | null;
  division: string | null;
  divisionName?: string | null;
  unit: string | null;
  unitName?: string | null;
  role: UserRole | string;
  status?: UserStatus | string;
  permissions?: UserPermissionItem[];
  deniedPermissions?: UserPermissionItem[];
  userPermissions?: AuthUserPermissionRelation[];
}

export interface LoginPayload {
  empCode: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
