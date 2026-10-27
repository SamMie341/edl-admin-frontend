export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AuthUser {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  department: string | null;
  division: string | null;
  unit: string | null;
  role: UserRole | string;
}

export interface LoginPayload {
  empCode: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
