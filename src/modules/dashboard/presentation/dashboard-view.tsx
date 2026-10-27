'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SIDEBAR_NAVIGATION } from '@/core/config/navigation';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import { ArrowUpRight, Sparkles, Database, Layers, Radio } from 'lucide-react';

export function DashboardView() {
  const user = useAuthStore((state) => state.user);

  const allModules = SIDEBAR_NAVIGATION.flatMap((group) =>
    group.items.filter((item) => item.href !== '/dashboard')
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Modern Welcome Hero Banner พร้อม EDL Logo Watermark ในพื้นหลัง */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700/90 via-blue-800/85 to-indigo-800/85 p-8 lg:p-10 text-white shadow-[0_16px_40px_rgba(30,58,138,0.08)] border border-white/20">
        {/* EDL Logo Watermark ซ้อนในพื้นหลังขวาของ Banner */}
        <div className="pointer-events-none absolute -bottom-10 -right-10 w-72 h-72 lg:w-80 lg:h-80 opacity-[0.16] select-none">
          <Image
            src="/images/edl-logo-transparent.png"
            alt="EDL Banner Watermark"
            fill
            className="object-contain -rotate-12 filter drop-shadow-xl"
            priority
          />
        </div>

        {/* Glow & Backdrop highlights */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ລະບົບບໍລິຫານຈັດການຂໍ້ມູນ 20 ໂມດູນ (Clean Architecture)</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
              ສະບາຍດີ, {user ? `${user.firstName} ${user.lastName}` : 'ທ່ານຜູ້ບໍລິຫານ'}
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              ຍິນດີຕ້ອນຮັບສູ່ລະບົບຄວບຄຸມຂໍ້ມູນຫຼັກຂອງ ລັດວິສາຫະກິດໄຟຟ້າລາວ. ທ່ານສາມາດເລືອກຈັດການໂມດູນຕ່າງໆດ້ານລຸ່ມນີ້ໄດ້ທັນທີ.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0 shadow-xs">
            <div className="relative w-14 h-14 rounded-xl bg-white p-1.5 shadow-sm flex items-center justify-center">
              <Image
                src="/images/edl-logo-transparent.png"
                alt="EDL Logo"
                width={50}
                height={50}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-xs text-blue-200 font-medium">ສະຖານະລະບົບ</p>
              <p className="text-sm font-bold text-white">ເຊື່ອມຕໍ່ Backend ແລ້ວ</p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>109 Endpoints ພ້ອມໃຊ້ງານ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. System Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white/75 backdrop-blur-xl border border-slate-200/50 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-50/80 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ຈຳນວນໂມດູນ</p>
            <p className="text-2xl font-bold text-slate-800">20 ໂມດູນ</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/75 backdrop-blur-xl border border-slate-200/50 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center shrink-0">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Endpoints</p>
            <p className="text-2xl font-bold text-slate-800">109 APIs</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white/75 backdrop-blur-xl border border-slate-200/50 shadow-2xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50/80 text-amber-600 flex items-center justify-center shrink-0">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ລະບົບເຊື່ອມຕໍ່</p>
            <p className="text-2xl font-bold text-slate-800">HRM & Inside API</p>
          </div>
        </div>
      </div>

      {/* 3. Modules Matrix Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              ລາຍການໂມດູນທັງໝົດໃນລະບົບ ({allModules.length})
            </h2>
            <p className="text-xs text-slate-400">
              ຄລິກທີ່ໂມດູນເພື່ອເຂົ້າສູ່ໜ້າບໍລິຫານຈັດການຂໍ້ມູນ (CRUD & Media Upload)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group relative p-4 rounded-2xl bg-white/75 backdrop-blur-lg border border-slate-200/50 shadow-2xs hover:shadow-md hover:border-blue-400/40 hover:bg-white transition-all duration-200 flex items-start justify-between"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-xl bg-blue-50/70 text-blue-600 flex items-center justify-center group-hover:bg-gradient-to-tr group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:text-white transition-all duration-200 shadow-2xs shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 transition-colors truncate">
                      {mod.title}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                      {mod.href}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
