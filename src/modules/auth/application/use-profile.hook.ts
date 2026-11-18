'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '../infrastructure/auth.api';
import { useAuthStore } from './auth.store';
import { tokenStorage } from '@/core/infrastructure/storage/token-storage';

export const PROFILE_QUERY_KEY = ['auth', 'profile'];

/**
 * Hook ສຳລັບດຶງ ແລະ Sync ຂໍ້ມູນ Profile ພ້ອມສິດທິ (Permissions & Role) ຫຼ້າສຸດຈາກ Backend
 * - ຮອງຮັບການ Auto-refresh ເມື່ອເປີດໜ້າໃໝ່ / Reload (F5)
 * - ຮອງຮັບການ Auto-sync ເມື່ອຜູ້ໃຊ້ສັບປ່ຽນແຖບໜ້າຈໍກັບມາ (Window Focus)
 */
export function useProfile() {
  const setUser = useAuthStore((state) => state.setUser);
  const token = typeof window !== 'undefined' ? tokenStorage.getToken() : null;

  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => {
      const profile = await authApi.getProfile();
      setUser(profile);
      return profile;
    },
    enabled: Boolean(token),
    staleTime: 30 * 1000, // 30 ວິນາທີ
    refetchOnWindowFocus: true, // ເມື່ອ Focus ກັບມາທີ່ໜ້າຈໍ ຈະດຶງສິດຫຼ້າສຸດອັດຕະໂນມັດ
    retry: false,
  });
}
