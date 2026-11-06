export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface UserPermissionItem {
  module: string;
  action: string;
}

export interface AuthUser {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string | null;
  division: string | null;
  unit: string | null;
  role: UserRole | string;
  permissions?: UserPermissionItem[];
}

export interface LoginPayload {
  empCode: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
