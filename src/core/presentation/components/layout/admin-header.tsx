'use client';

import { useRouter } from 'next/navigation';
import {
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import { useSidebarStore } from '@/core/application/sidebar.store';
import { Button } from '@/components/ui/button';

export function AdminHeader() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { toggleMobile, toggleDesktop, isCollapsedDesktop } = useSidebarStore();

  const handleLogout = () => {
    clearAuth();
    toast.success('ອອກຈາກລະບົບສຳເລັດ');
    router.replace('/login');
  };

  return (
    <header className="h-16 sm:h-20 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Menu Toggle / Desktop Toggle + Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          onClick={toggleMobile}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Collapse / Expand Button */}
        <button
          type="button"
          onClick={toggleDesktop}
          className="hidden lg:flex p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer shrink-0"
          title={isCollapsedDesktop ? 'ຂະຫຍາຍເມນູດ້ານຂ້າງ' : 'ຫຍໍ້ເມນູດ້ານຂ້າງ'}
        >
          {isCollapsedDesktop ? (
            <PanelLeftOpen className="h-5 w-5 text-blue-600" />
          ) : (
            <PanelLeftClose className="h-5 w-5 text-slate-500" />
          )}
        </button>

        <div className="h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100 hidden sm:block shrink-0" />

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight truncate max-w-[200px] xs:max-w-[280px] sm:max-w-none">
            ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ ລັດວິສາຫະກິດໄຟຟ້າລາວ
          </h2>
          <p className="text-[11px] text-slate-400 hidden sm:block truncate">
            Électricité du Laos — Content Management System
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-4 border-l border-slate-200/60">
            <div className="relative">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white rounded-[9px] sm:rounded-[10px] flex items-center justify-center text-blue-700">
                  <UserIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <Shield className="h-3 w-3 text-blue-600" />
                <span className="font-semibold text-blue-700">{user.role}</span>
                {user.department && (
                  <span className="truncate max-w-[140px]">• {user.department}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 border-rose-200/80 rounded-xl px-2.5 sm:px-3.5 h-8 sm:h-9 cursor-pointer transition-all duration-200 shadow-2xs"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs font-semibold hidden xs:inline">ອອກຈາກລະບົບ</span>
        </Button>
      </div>
    </header>
  );
}
