import type { ReactNode } from 'react';
import { AdminSidebar } from '@/core/presentation/components/layout/admin-sidebar';
import { AdminHeader } from '@/core/presentation/components/layout/admin-header';
import { AppBackground } from '@/core/presentation/components/layout/app-background';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppBackground>
      <div className="min-h-screen flex w-full relative">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <AdminHeader />
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AppBackground>
  );
}
