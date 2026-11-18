'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SIDEBAR_NAVIGATION } from '@/core/config/navigation';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import {
  getAuthUserRole,
  checkUserModuleAccess,
} from '@/core/application/use-permission.hook';
import { useSidebarStore } from '@/core/application/sidebar.store';
import { cn } from '@/lib/utils';
import {
  ChevronRight,
  ChevronDown,
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

  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus((prev) => {
      const currentState =
        prev[href] ?? (pathname === href || pathname.startsWith(`${href}/`));
      return { ...prev, [href]: !currentState };
    });
  };

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
          'border-r border-slate-200/60 bg-white/95 backdrop-blur-xl flex flex-col transition-all duration-300 ease-in-out shrink-0',
          // Mobile styles (fixed drawer sliding in/out)
          'fixed inset-y-0 left-0 z-50 shadow-2xl h-full',
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop styles: permanently docked full-height in the layout
          'lg:static lg:h-full lg:shadow-xs',
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
            const userRole = getAuthUserRole(user?.role);

            const visibleItems = group.items.filter((item) => {
              if (!user) return false;

              // 1. ກວດສອບສິດລະດັບ Module (PBAC) ຖ້າມີການກຳນົດ module ຫຼື modules (ກວດ DENY ກ່ອນ SUPERADMIN ພາຍໃນ hook)
              if (item.modules && item.modules.length > 0) {
                return item.modules.some((m) => checkUserModuleAccess(user, m));
              }

              if (item.module) {
                return checkUserModuleAccess(user, item.module);
              }

              if (userRole.toUpperCase() === 'SUPERADMIN') return true;

              // 2. ກວດສອບ Role ສະເພາະຖ້າບໍ່ມີ module
              if (item.roles && item.roles.length > 0) {
                return item.roles.some(
                  (r) => r.toUpperCase() === userRole.toUpperCase()
                );
              }

              return true;
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
                    const hasChildren = Boolean(item.children && item.children.length > 0);
                    const isParentOrChildActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`) ||
                      (item.children?.some(
                        (c) => pathname === c.href || pathname.startsWith(`${c.href}/`)
                      ) ?? false);

                    const isSubmenuOpen = openSubmenus[item.href] ?? isParentOrChildActive;

                    // If item has children
                    if (hasChildren && item.children) {
                      return (
                        <li key={item.href} className="space-y-1">
                          {isCollapsedDesktop ? (
                            <Link
                              href={item.children[0]?.href || item.href}
                              title={item.title}
                              className={cn(
                                'group relative flex items-center justify-center px-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                                isParentOrChildActive
                                  ? 'bg-blue-50/90 text-blue-700 font-semibold shadow-2xs'
                                  : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                                  isParentOrChildActive
                                    ? 'text-blue-600'
                                    : 'text-slate-400 group-hover:text-blue-600'
                                )}
                              />
                            </Link>
                          ) : (
                            <div>
                              <button
                                type="button"
                                onClick={() => toggleSubmenu(item.href)}
                                className={cn(
                                  'w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer',
                                  isParentOrChildActive
                                    ? 'bg-blue-50/70 text-blue-700 font-semibold'
                                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                                )}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <Icon
                                    className={cn(
                                      'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                                      isParentOrChildActive
                                        ? 'text-blue-600'
                                        : 'text-slate-400 group-hover:text-blue-600'
                                    )}
                                  />
                                  <span className="truncate">{item.title}</span>
                                </div>
                                <ChevronDown
                                  className={cn(
                                    'h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0',
                                    isSubmenuOpen && 'rotate-180 text-blue-600'
                                  )}
                                />
                              </button>

                              {isSubmenuOpen && (
                                <ul className="mt-1 space-y-0.5 pl-4 ml-4 border-l border-slate-200/90">
                                  {item.children.map((child) => {
                                    const ChildIcon = child.icon;
                                    const isChildActive =
                                      pathname === child.href ||
                                      pathname.startsWith(`${child.href}/`);

                                    return (
                                      <li key={child.href}>
                                        <Link
                                          href={child.href}
                                          className={cn(
                                            'group flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all duration-150',
                                            isChildActive
                                              ? 'bg-blue-100/70 text-blue-700 font-bold shadow-2xs'
                                              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                                          )}
                                        >
                                          {ChildIcon ? (
                                            <ChildIcon
                                              className={cn(
                                                'h-3.5 w-3.5 shrink-0 transition-colors',
                                                isChildActive
                                                  ? 'text-blue-600'
                                                  : 'text-slate-400 group-hover:text-blue-500'
                                              )}
                                            />
                                          ) : (
                                            <span
                                              className={cn(
                                                'h-1.5 w-1.5 rounded-full shrink-0 transition-colors',
                                                isChildActive
                                                  ? 'bg-blue-600'
                                                  : 'bg-slate-300 group-hover:bg-blue-400'
                                              )}
                                            />
                                          )}
                                          <span className="truncate">{child.title}</span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    }

                    // Standard item without children
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
