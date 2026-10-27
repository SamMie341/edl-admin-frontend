import Image from 'next/image';
import { AppBackground } from '@/core/presentation/components/layout/app-background';
import { LoginCard } from '@/modules/auth/presentation/login-card';

export default function LoginPage() {
  return (
    <AppBackground showWatermark={false}>
      <div className="relative flex-1 flex items-center justify-center p-4 md:p-8 min-h-screen overflow-hidden">
        {/* Big EDL Logo Watermark on Login Page Background (มองเห็นโลโก้ชัดเจน) */}
        <div 
          className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] sm:w-[700px] sm:h-[700px] opacity-[0.08] select-none z-0"
          aria-hidden="true"
        >
          <Image
            src="/images/edl-logo-transparent.png"
            alt="EDL Brand Watermark"
            fill
            className="object-contain filter drop-shadow-2xl"
            priority
          />
        </div>

        {/* Foreground Login Card */}
        <div className="relative z-10 w-full max-w-5xl">
          <LoginCard />
        </div>
      </div>
    </AppBackground>
  );
}
