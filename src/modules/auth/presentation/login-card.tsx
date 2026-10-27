'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, User, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '@/modules/auth/infrastructure/auth.api';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  empCode: z.string().min(1, 'ກະລຸນາປ້ອນລະຫັດພະນັກງານ'),
  password: z.string().min(1, 'ກະລຸນາປ້ອນລະຫັດຜ່ານ'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginCard() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      empCode: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await authApi.login(values);
      setAuth(result.user, result.accessToken);
      toast.success(`ຍິນດີຕ້ອນຮັບ ${result.user.firstName} ${result.user.lastName}`);
      router.replace('/dashboard');
    } catch (error: any) {
      toast.error(error?.message || 'ເຂົ້າສູ່ລະບົບບໍ່ສຳເລັດ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(30,58,138,0.08)] border border-slate-200/60 bg-white/80 backdrop-blur-2xl transition-all duration-300 z-10">
      {/* ฝั่งซ้าย: Corporate Hero Showcase พร้อมโลโก้ EDL Watermark ในพื้นหลัง */}
      <div className="relative lg:col-span-5 bg-gradient-to-br from-blue-700/90 via-blue-800/85 to-indigo-900/85 p-8 lg:p-12 text-white flex flex-col justify-between overflow-hidden">
        {/* 1. EDL Background Logo Watermark ซ้อนในพื้นหลังฝั่งซ้าย */}
        <div className="pointer-events-none absolute -bottom-12 -right-12 w-80 h-80 opacity-[0.14] select-none">
          <Image
            src="/images/edl-logo-transparent.png"
            alt="EDL Watermark"
            fill
            className="object-contain -rotate-12 filter drop-shadow-xl"
            priority
          />
        </div>

        {/* 2. Decorative Circuit & Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-300/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_60%)]" />

        {/* Top Header */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-medium text-blue-100 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>ລະບົບບໍລິຫານເວັບໄຊຫຼັກ (Official CMS)</span>
          </div>
          
          <div className="flex items-center gap-3.5 pt-2">
            <div className="relative w-16 h-16 rounded-2xl bg-white p-1.5 shadow-lg ring-2 ring-white/30 flex items-center justify-center shrink-0">
              <Image
                src="/images/edl-logo-transparent.png"
                alt="EDL Logo"
                width={60}
                height={60}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                ໄຟຟ້າລາວ
              </h2>
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
                Électricité du Laos
              </p>
            </div>
          </div>
        </div>

        {/* Middle Visual Catchphrase */}
        <div className="relative z-10 my-10 space-y-3">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight leading-snug text-white">
            ພະລັງງານໄຟຟ້າ <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-sky-100 to-white">
              ເພື່ອການພັດທະນາປະເທດຊາດ
            </span>
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed max-w-sm">
            EDL Web Admin Portal — ລະບົບຄຸ້ມຄອງຂໍ້ມູນຂ່າວສານ, ສາຂາ, ສູນບໍລິການ, ແລະ ເນື້ອຫາດິຈິຕອນ ຟຟລ
          </p>
        </div>

        {/* Bottom Security Badge */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-blue-200/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>ລະບົບປ້ອງກັນຂໍ້ມູນ 256-bit JWT Encryption</span>
          </div>
          <span className="font-mono text-[11px] opacity-75">v1.0.0</span>
        </div>
      </div>

      {/* ฝั่งขวา: Modern Clean Glass Login Form */}
      <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-white/75 backdrop-blur-xl">
        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600/90 mb-2">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Authentication Gate</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              ເຂົ້າສູ່ລະບົບ (Sign In)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              ກະລຸນາປ້ອນລະຫັດພະນັກງານ ແລະ ລະຫັດຜ່ານຂອງທ່ານເພື່ອເຂົ້າໃຊ້ງານ
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Employee Code */}
            <div className="space-y-1.5">
              <label
                htmlFor="empCode"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
              >
                ລະຫັດພະນັກງານ (Employee Code)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="empCode"
                  type="text"
                  placeholder="ຕົວຢ່າງ: 10001"
                  autoComplete="username"
                  {...register('empCode')}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200/90 bg-slate-50/50 text-slate-800 placeholder-slate-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              {errors.empCode && (
                <p className="text-xs font-medium text-rose-500">
                  {errors.empCode.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                >
                  ລະຫັດຜ່ານ (Password)
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200/90 bg-slate-50/50 text-slate-800 placeholder-slate-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-rose-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer active:scale-[0.99]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>ກຳລັງກວດສອບສິດທິ...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>ເຂົ້າສູ່ລະບົບ</span>
                  <Zap className="w-4 h-4 fill-current" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer Assistance */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              ມີບັນຫາໃນການເຂົ້າສູ່ລະບົບ? ກະລຸນາຕິດຕໍ່ຝ່າຍເຕັກໂນໂລຢີຂໍ້ມູນຂ່າວສານ ຟຟລ (IT Center)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
