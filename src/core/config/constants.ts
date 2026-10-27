export const AUTH_TOKEN_COOKIE = 'edl_admin_token';
export const AUTH_USER_STORAGE_KEY = 'edl_admin_user';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
  },
  USERS: {
    BASE: '/users',
    SYNC: (empCode: string) => `/users/sync/${empCode}`,
    CHANGE_ROLE: (id: number) => `/users/change-role/${id}`,
    CHANGE_PASSWORD: (id: number) => `/users/change-password/${id}`,
    BY_ID: (id: number) => `/users/${id}`,
  },
  DEPARTMENTS: {
    BASE: '/departments',
    BY_ID: (id: number) => `/departments/${id}`,
  },
  BRANCHES: {
    BASE: '/branches',
    DROPDOWN: '/branches/dropdown',
    BY_DEPARTMENT: (deptId: number) => `/branches/department/${deptId}`,
    BY_ID: (id: number) => `/branches/${id}`,
    SYNC: '/branches/sync',
    UPLOAD_IMAGE: (id: number, imageType: 'branch' | 'cover' | 'structure') =>
      `/branches/${id}/upload/${imageType}`,
  },
  SERVICE_CENTERS: {
    BASE: '/service-centers',
    BY_ID: (id: number) => `/service-centers/${id}`,
    SYNC: '/service-centers/sync',
    UPLOAD_IMAGE: (id: number) => `/service-centers/${id}/upload/image`,
  },
  PROVINCES: {
    BASE: '/provinces',
    SYNC: '/provinces/sync',
  },
  DISTRICTS: {
    BASE: '/districts',
    BY_PROVINCE: (provinceId: number) => `/districts/province/${provinceId}`,
    SYNC: '/districts/sync',
  },
  VILLAGES: {
    BASE: '/villages',
    BY_DISTRICT: (districtId: number) => `/villages/district/${districtId}`,
    SYNC: '/villages/sync',
  },
  ORG_STRUCTURES: {
    BASE: '/org-structures',
    DROPDOWN: '/org-structures/dropdown',
    BY_ID: (id: number) => `/org-structures/${id}`,
    UPLOAD_IMAGE: (id: number) => `/org-structures/${id}/upload/image`,
  },
  VISION_MISSIONS: {
    BASE: '/vision-missions',
    BY_ID: (id: number) => `/vision-missions/${id}`,
    UPLOAD_IMAGE: (id: number) => `/vision-missions/${id}/upload/image`,
  },
  ELECTRICAL_KNOWLEDGE: {
    BASE: '/electrical-knowledge',
    BY_ID: (id: number) => `/electrical-knowledge/${id}`,
    VIEW: (id: number) => `/electrical-knowledge/${id}/view`,
    UPLOAD_COVER: (id: number) => `/electrical-knowledge/${id}/upload/cover`,
  },
  MAGAZINES: {
    BASE: '/magazines',
    BY_ID: (id: number) => `/magazines/${id}`,
    DOWNLOAD: (id: number) => `/magazines/${id}/download`,
    UPLOAD_COVER: (id: number) => `/magazines/${id}/upload/cover`,
    UPLOAD_DOCUMENT: (id: number) => `/magazines/${id}/upload/document`,
  },
  NEWS_CATEGORIES: {
    BASE: '/news-categories',
    BY_ID: (id: number) => `/news-categories/${id}`,
  },
  NEWS: {
    BASE: '/news',
    BY_ID: (id: number) => `/news/${id}`,
    VIEW: (id: number) => `/news/${id}/view`,
    UPLOAD_COVER: (id: number) => `/news/${id}/upload/cover`,
    UPLOAD_GALLERY: (id: number) => `/news/${id}/upload/gallery`,
  },
  NEWS_TAGS: {
    BASE: '/news-tags',
    BY_ID: (id: number) => `/news-tags/${id}`,
  },
  LEGISLATIONS: {
    BASE: '/legislations',
    BY_ID: (id: number) => `/legislations/${id}`,
    UPLOAD_DOCUMENT: (id: number) => `/legislations/${id}/upload/document`,
  },
  ELECTRICITY_TARIFFS: {
    BASE: '/electricity-tariffs',
    BY_ID: (id: number) => `/electricity-tariffs/${id}`,
    UPLOAD_IMAGE: (id: number) => `/electricity-tariffs/${id}/upload/image`,
    UPLOAD_DOCUMENT: (id: number) => `/electricity-tariffs/${id}/upload/document`,
  },
  PROCUREMENTS: {
    BASE: '/procurements',
    BY_ID: (id: number) => `/procurements/${id}`,
    UPLOAD_IMAGE: (id: number) => `/procurements/${id}/upload/image`,
    UPLOAD_DOCUMENT: (id: number) => `/procurements/${id}/upload/document`,
  },
  POSITIONS: {
    BASE: '/positions',
    BY_ID: (id: number) => `/positions/${id}`,
  },
  JOB_POSTINGS: {
    BASE: '/job-postings',
    BY_ID: (id: number) => `/job-postings/${id}`,
    UPLOAD_DOCUMENT: (id: number) => `/job-postings/${id}/upload/document`,
  },
} as const;
