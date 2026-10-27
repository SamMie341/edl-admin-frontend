export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

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

export interface SyncUserResponse {
  message: string;
  user: UserItem;
}
