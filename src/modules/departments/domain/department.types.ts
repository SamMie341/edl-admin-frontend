export interface DepartmentItem {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    branches?: number;
    serviceCenters?: number;
    users?: number;
  };
}

export interface CreateDepartmentPayload {
  name: string;
}

export interface UpdateDepartmentPayload {
  name: string;
}
