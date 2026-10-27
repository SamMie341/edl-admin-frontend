'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Shield, Bell, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import { Button } from '@/components/ui/button';

export function AdminHeader() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    toast.success('ອອກຈາກລະບົບສຳເລັດ');
    router.replace('/login');
  };

  return (
    <header className="h-20 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      {/* Title & Path */}
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
        <div>
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ ລັດວິສາຫະກິດໄຟຟ້າລາວ
          </h2>
          <p className="text-xs text-slate-400">
            Électricité du Laos — Content Management System
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200/60">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-blue-700">
                  <UserIcon className="h-5 w-5" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
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
          className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 border-rose-200/80 rounded-xl px-3.5 h-9 cursor-pointer transition-all duration-200 shadow-2xs"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-xs font-semibold">ອອກຈາກລະບົບ</span>
        </Button>
      </div>
    </header>
  );
}
