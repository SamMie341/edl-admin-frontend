import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpenMobile: boolean;
  isCollapsedDesktop: boolean;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleDesktop: () => void;
  setCollapsedDesktop: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpenMobile: false,
      isCollapsedDesktop: false,
      toggleMobile: () => set((state) => ({ isOpenMobile: !state.isOpenMobile })),
      openMobile: () => set({ isOpenMobile: true }),
      closeMobile: () => set({ isOpenMobile: false }),
      toggleDesktop: () => set((state) => ({ isCollapsedDesktop: !state.isCollapsedDesktop })),
      setCollapsedDesktop: (collapsed) => set({ isCollapsedDesktop: collapsed }),
    }),
    {
      name: 'edl_admin_sidebar_state',
      partialize: (state) => ({
        isCollapsedDesktop: state.isCollapsedDesktop,
      }),
    }
  )
);
