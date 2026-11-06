'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface PermissionDeniedProps {
  moduleName?: string;
  message?: string;
}

export function PermissionDenied({
  moduleName,
  message,
}: PermissionDeniedProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 text-center space-y-5 shadow-xl shadow-slate-100">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">
            ທ່ານບໍ່ມີສິດເຂົ້າເຖິງສ່ວນນີ້
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {message ||
              `ບັນຊີຂອງທ່ານບໍ່ໄດ້ຮັບສິດທິໃນການເຂົ້າເຖິງ ຫຼື ຈັດການຂໍ້ມູນໃນໂມດູນ ${
                moduleName || 'ນີ້'
              }. ກະລຸນາຕິດຕໍ່ Super Admin ເພື່ອກຳນົດສິດການນຳໃຊ້.`}
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ກັບຄືນໜ້າຫຼັກ (Dashboard)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
