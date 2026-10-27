'use client';

import React from 'react';
import Image from 'next/image';

interface AppBackgroundProps {
  children: React.ReactNode;
  showWatermark?: boolean;
}

export function AppBackground({
  children,
  showWatermark = true,
}: AppBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full bg-slate-50/70 text-slate-800 overflow-x-hidden font-sans">
      {/* 1. Subtle Engineering Grid Pattern */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-[0.02] bg-[radial-gradient(#1e40af_1px,transparent_1px)] [background-size:24px_24px]" 
        aria-hidden="true" 
      />

      {/* 2. Soft Pastel Ambient Lighting (แสง Glow สบายตา) */}
      <div 
        className="pointer-events-none fixed -top-40 -left-40 h-[550px] w-[550px] rounded-full bg-blue-400/[0.07] blur-[140px]"
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none fixed top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-amber-300/[0.05] blur-[150px]"
        aria-hidden="true" 
      />
      <div 
        className="pointer-events-none fixed -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full bg-sky-400/[0.06] blur-[160px]"
        aria-hidden="true" 
      />

      {/* 3. EDL Official Logo Watermark บนพื้นหลัง (มองเห็นชัดเจน มีมิติ สบายตา) */}
      {showWatermark && (
        <div 
          className="pointer-events-none fixed top-1/2 right-10 -translate-y-1/2 w-[500px] h-[500px] lg:w-[650px] lg:h-[650px] opacity-[0.07] select-none z-0 transition-opacity duration-500"
          aria-hidden="true"
        >
          <Image
            src="/images/edl-logo-transparent.png"
            alt="EDL Background Watermark"
            fill
            className="object-contain -rotate-6 filter drop-shadow-md"
            priority
          />
        </div>
      )}

      {/* 4. Foreground Content */}
      <div className="relative z-1 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
