import type { ReactNode } from 'react';
import { AdminSidebar } from '@/core/presentation/components/layout/admin-sidebar';
import { AdminHeader } from '@/core/presentation/components/layout/admin-header';
import { AppBackground } from '@/core/presentation/components/layout/app-background';
import { ProfileSync } from '@/modules/auth/presentation/components/profile-sync';
import { RoutePermissionGuard } from '@/core/presentation/components/layout/route-permission-guard';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppBackground className="h-screen h-dvh overflow-hidden" contentClassName="h-full overflow-hidden">
      <ProfileSync />
      <div className="h-full flex w-full overflow-hidden relative">
        <AdminSidebar />
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden transition-all duration-300">
          <AdminHeader />
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
            <RoutePermissionGuard>
              {children}
            </RoutePermissionGuard>
          </main>
        </div>
      </div>
    </AppBackground>
  );
}
