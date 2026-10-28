'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SIDEBAR_NAVIGATION } from '@/core/config/navigation';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import { useSidebarStore } from '@/core/application/sidebar.store';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const {
    isOpenMobile,
    isCollapsedDesktop,
    closeMobile,
    toggleDesktop,
  } = useSidebarStore();

  // Close mobile drawer when route changes
  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  return (
    <>
      {/* 1. Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* 2. Main Sidebar */}
      <aside
        className={cn(
          // Common styles
          'border-r border-slate-200/60 bg-white/95 backdrop-blur-xl flex flex-col h-screen transition-all duration-300 ease-in-out',
          // Mobile styles (fixed drawer sliding in/out)
          'fixed inset-y-0 left-0 z-50 shadow-2xl lg:shadow-xs',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop styles (sticky, responsive width)
          'lg:sticky lg:top-0',
          isCollapsedDesktop ? 'lg:w-20' : 'lg:w-72',
          // Width on mobile is always full 72 (288px)
          'w-72'
        )}
      >
        {/* Brand Header with EDL Logo & Toggles */}
        <div
          className={cn(
            'h-16 sm:h-20 flex items-center border-b border-slate-100/80 bg-gradient-to-r from-blue-50/40 via-white/40 to-transparent shrink-0',
            isCollapsedDesktop ? 'lg:justify-center lg:px-2 px-6 justify-between' : 'px-6 justify-between'
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-1 border border-slate-100 shadow-sm flex items-center justify-center shrink-0">
              <Image
                src="/images/edl-logo.png"
                alt="EDL Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div className={cn('min-w-0 flex-1', isCollapsedDesktop && 'lg:hidden')}>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-slate-800 text-sm tracking-tight truncate">
                  ໄຟຟ້າລາວ (EDL)
                </h1>
              </div>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                Admin Management Portal
              </p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            type="button"
            onClick={closeMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse/Expand Toggle on Desktop */}
          <button
            type="button"
            onClick={toggleDesktop}
            className={cn(
              'hidden lg:flex items-center justify-center h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer',
              isCollapsedDesktop && 'mx-auto'
            )}
            title={isCollapsedDesktop ? 'ຂະຫຍາຍເມນູ (Expand)' : 'ຫຍໍ້ເມນູ (Collapse)'}
          >
            {isCollapsedDesktop ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Scroll Area */}
        <nav className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 space-y-5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {SIDEBAR_NAVIGATION.map((group) => {
            const visibleItems = group.items.filter((item) => {
              if (!item.roles || item.roles.length === 0) return true;
              if (!user?.role) return true;
              return item.roles.includes(user.role as any);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.groupTitle} className="space-y-1">
                <p
                  className={cn(
                    'px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 truncate',
                    isCollapsedDesktop && 'lg:hidden'
                  )}
                >
                  {group.groupTitle}
                </p>

                {isCollapsedDesktop && (
                  <div className="hidden lg:block h-px bg-slate-200/60 my-2 mx-2" />
                )}

                <ul className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={isCollapsedDesktop ? item.title : undefined}
                          className={cn(
                            'group relative flex items-center px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                            isCollapsedDesktop
                              ? 'lg:justify-center lg:px-2'
                              : 'justify-between',
                            isActive
                              ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-2xs'
                              : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center gap-3 min-w-0',
                              isCollapsedDesktop && 'lg:gap-0 lg:justify-center'
                            )}
                          >
                            <Icon
                              className={cn(
                                'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                                isActive
                                  ? 'text-blue-600'
                                  : 'text-slate-400 group-hover:text-blue-600'
                              )}
                            />
                            <span
                              className={cn(
                                'truncate',
                                isCollapsedDesktop && 'lg:hidden'
                              )}
                            >
                              {item.title}
                            </span>
                          </div>

                          {!isCollapsedDesktop && isActive && (
                            <ChevronRight className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User Footer Snippet */}
        <div
          className={cn(
            'p-3.5 sm:p-4 border-t border-slate-100/80 bg-slate-50/40 shrink-0',
            isCollapsedDesktop && 'lg:p-3 lg:flex lg:justify-center'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-between text-[11px] text-slate-400',
              isCollapsedDesktop && 'lg:justify-center'
            )}
          >
            <span className={cn(isCollapsedDesktop && 'lg:hidden')}>
              ສະຖານະເຊື່ອມຕໍ່ API
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-emerald-600 font-medium"
              title="API Online"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={cn(isCollapsedDesktop && 'lg:hidden')}>Online</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
