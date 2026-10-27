import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { newsApi } from '../infrastructure/news.api';
import type {
  CreateNewsPayload,
  UpdateNewsPayload,
  CreateNewsCategoryPayload,
  UpdateNewsCategoryPayload,
  CreateNewsTagPayload,
  UpdateNewsTagPayload,
  NewsQueryParams,
} from '../domain/news.types';

export const NEWS_QUERY_KEY = ['news'];
export const NEWS_CATEGORIES_QUERY_KEY = ['news-categories'];
export const NEWS_TAGS_QUERY_KEY = ['news-tags'];

// ==========================================
// 1. News Articles Hooks
// ==========================================

export function useNews(params?: NewsQueryParams) {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEY, params],
    queryFn: () => newsApi.getNews(params),
  });
}

export function useNewsById(id?: number) {
  return useQuery({
    queryKey: [...NEWS_QUERY_KEY, 'detail', id],
    queryFn: () => newsApi.getNewsById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNewsPayload) => newsApi.createNews(payload),
    onSuccess: () => {
      toast.success('ສ້າງຂ່າວສານໃໝ່ສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງຂ່າວສານບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateNewsPayload }) =>
      newsApi.updateNews(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂຂ່າວສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂຂ່າວສານບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newsApi.deleteNews(id),
    onSuccess: () => {
      toast.success('ລຶບຂ່າວສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບຂ່າວສານບໍ່ສຳເລັດ');
    },
  });
}

export function useUploadNewsCover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      newsApi.uploadCover(id, file),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດຮູບປົກຂ່າວສານສຳເລັດ');
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບໂຫຼດຮູບປົກບໍ່ສຳເລັດ');
    },
  });
}

export function useUploadNewsGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) =>
      newsApi.uploadGallery(id, files),
    onSuccess: () => {
      toast.success('ອັບໂຫຼດຮູບພາບ Gallery ສຳເລັດ');
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ອັບໂຫຼດຮູບ Gallery ບໍ່ສຳເລັດ');
    },
  });
}

// ==========================================
// 2. News Categories Hooks
// ==========================================

export function useNewsCategories() {
  return useQuery({
    queryKey: NEWS_CATEGORIES_QUERY_KEY,
    queryFn: () => newsApi.getCategories(),
    staleTime: 60 * 1000,
  });
}

export function useCreateNewsCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNewsCategoryPayload) =>
      newsApi.createCategory(payload),
    onSuccess: () => {
      toast.success('ສ້າງໝວດໝູ່ຂ່າວສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງໝວດໝູ່ບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateNewsCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateNewsCategoryPayload;
    }) => newsApi.updateCategory(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂໝວດໝູ່ຂ່າວສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂໝວດໝູ່ບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteNewsCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newsApi.deleteCategory(id),
    onSuccess: () => {
      toast.success('ລຶບໝວດໝູ່ຂ່າວສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_CATEGORIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບໝວດໝູ່ບໍ່ສຳເລັດ (ອາດມີຂ່າວສັງກັດຢູ່)');
    },
  });
}

// ==========================================
// 3. News Tags Hooks
// ==========================================

export function useNewsTags() {
  return useQuery({
    queryKey: NEWS_TAGS_QUERY_KEY,
    queryFn: () => newsApi.getTags(),
    staleTime: 60 * 1000,
  });
}

export function useCreateNewsTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNewsTagPayload) => newsApi.createTag(payload),
    onSuccess: () => {
      toast.success('ສ້າງແທັກຂ່າວສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_TAGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ສ້າງແທັກບໍ່ສຳເລັດ');
    },
  });
}

export function useUpdateNewsTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateNewsTagPayload }) =>
      newsApi.updateTag(id, payload),
    onSuccess: () => {
      toast.success('ແກ້ໄຂແທັກສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_TAGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ແກ້ໄຂແທັກບໍ່ສຳເລັດ');
    },
  });
}

export function useDeleteNewsTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newsApi.deleteTag(id),
    onSuccess: () => {
      toast.success('ລຶບແທັກຂ່າວສານສຳເລັດແລ້ວ');
      queryClient.invalidateQueries({ queryKey: NEWS_TAGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NEWS_QUERY_KEY });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'ລຶບແທັກບໍ່ສຳເລັດ');
    },
  });
}
