export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CommonStatus = 'ACTIVE' | 'INACTIVE';

export interface NewsCategoryItem {
  id: number;
  categoryName: string;
  description?: string | null;
  orderIndex: number;
  status: CommonStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

export interface NewsTagItem {
  id: number;
  tagName: string;
  status?: CommonStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

export interface NewsTagRelationItem {
  newsId: number;
  tagId: number;
  createdAt?: string;
  tag?: NewsTagItem;
}

export interface NewsItem {
  id: number;
  categoryId: number;
  titleLa: string;
  titleEn?: string | null;
  subtitleLa?: string | null;
  subtitleEn?: string | null;
  coverImage?: string | null;
  galleryImages?: string[] | null;
  videoUrl?: string | null;
  contentLa: string;
  contentEn?: string | null;
  viewCount: number;
  publishedAt?: string | null;
  status: NewsStatus;
  createdAt: string;
  updatedAt: string;
  category?: NewsCategoryItem;
  tags?: NewsTagRelationItem[];
}

// Payload DTOs
export interface CreateNewsPayload {
  categoryId: number;
  titleLa: string;
  titleEn?: string;
  subtitleLa?: string;
  subtitleEn?: string;
  coverImage?: string;
  galleryImages?: string[];
  videoUrl?: string;
  contentLa: string;
  contentEn?: string;
  publishedAt?: string;
  status?: NewsStatus;
  tagIds?: number[];
}

export interface UpdateNewsPayload extends Partial<CreateNewsPayload> {}

export interface CreateNewsCategoryPayload {
  categoryName: string;
  description?: string;
  orderIndex?: number;
  status?: CommonStatus;
}

export interface UpdateNewsCategoryPayload extends Partial<CreateNewsCategoryPayload> {}

export interface CreateNewsTagPayload {
  tagName: string;
}

export interface UpdateNewsTagPayload extends Partial<CreateNewsTagPayload> {}

export interface NewsQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  categoryId?: number;
  status?: NewsStatus;
}
