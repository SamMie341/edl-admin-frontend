'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/modules/auth/application/auth.store';
import { SIDEBAR_NAVIGATION, type NavItem } from '@/core/config/navigation';
import {
  getAuthUserRole,
  checkUserModuleAccess,
} from '@/core/application/use-permission.hook';
import { PermissionDenied } from '../shared/permission-denied';
import type { AuthUser } from '@/modules/auth/domain/auth.types';

interface RouteAccessResult {
  allowed: boolean;
  moduleName?: string;
  reason?: string;
}

/**
 * ກວດສອບສິດການເຂົ້າເຖິງ Route ຕາມ Role ແລະ Module (PBAC)
 */
function evaluateRouteAccess(
  user: AuthUser | null,
  item: NavItem
): RouteAccessResult {
  if (!user) {
    return { allowed: false, reason: 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' };
  }

  const userRole = getAuthUserRole(user.role);

  // 1. ກວດສອບຕາມ Module Permissions (PBAC) ຖ້າມີການກຳນົດ module ຫຼື modules
  if (item.modules && item.modules.length > 0) {
    const hasAccess = item.modules.some((m) => checkUserModuleAccess(user, m));
    if (!hasAccess) {
      return {
        allowed: false,
        moduleName: item.title,
        reason: `ບັນຊີຂອງທ່ານບໍ່ໄດ້ຮັບສິດທິໃນການເຂົ້າເຖິງ ຫຼື ຈັດການຂໍ້ມູນໃນໂມດູນ ${item.title}. ກະລຸນາຕິດຕໍ່ Super Admin ເພື່ອກຳນົດສິດການນຳໃຊ້.`,
      };
    }
    return { allowed: true };
  }

  if (item.module) {
    const hasAccess = checkUserModuleAccess(user, item.module);
    if (!hasAccess) {
      return {
        allowed: false,
        moduleName: item.title,
        reason: `ບັນຊີຂອງທ່ານບໍ່ໄດ້ຮັບສິດທິໃນການເຂົ້າເຖິງ ຫຼື ຈັດການຂໍ້ມູນໃນໂມດູນ ${item.title}. ກະລຸນາຕິດຕໍ່ Super Admin ເພື່ອກຳນົດສິດການນຳໃຊ້.`,
      };
    }
    return { allowed: true };
  }

  // 2. SuperAdmin ສາມາດເຂົ້າເຖິງ Route ທີ່ບໍ່ໄດ້ກຳນົດ module ໄດ້ທຸກ Route
  if (userRole.toUpperCase() === 'SUPERADMIN') {
    return { allowed: true };
  }

  // 3. ກວດສອບຕາມ Role (ຖ້າ Item ບໍ່ມີ module ແຕ່ມີການກຳນົດສະເພາະ Role)
  if (item.roles && item.roles.length > 0) {
    const isRoleMatched = item.roles.some(
      (r) => r.toUpperCase() === userRole.toUpperCase()
    );
    if (!isRoleMatched) {
      return {
        allowed: false,
        moduleName: item.title,
        reason: `ສະເພາະບົດບາດ ${item.roles.join(', ')} ເທົ່ານັ້ນທີ່ມີສິດເຂົ້າເຖິງສ່ວນນີ້ (ບົດບາດຂອງທ່ານ: ${userRole})`,
      };
    }
  }

  return { allowed: true };
}

export function RoutePermissionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [isMounted, setIsMounted] = useState(false);

  // ລວມລາຍການ Route ທັງໝົດຈາກ SIDEBAR_NAVIGATION (ລວມທັງ Route ລູກ)
  const allNavItems = useMemo(
    () =>
      SIDEBAR_NAVIGATION.flatMap((group) =>
        group.items.flatMap((item) =>
          item.children && item.children.length > 0
            ? [
                item,
                ...item.children.map((c) => ({
                  ...c,
                  icon: c.icon || item.icon,
                  module: c.module || item.module,
                  roles: c.roles || item.roles,
                })),
              ]
            : [item]
        )
      ),
    []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ປ້ອງກັນ Hydration Mismatch & ສະແດງ Loader ຂະນະທີ່ກຳລັງກວດສອບ Session
  if (!isMounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
          <span className="text-xs font-medium">ກຳລັງກວດສອບສິດທິ...</span>
        </div>
      </div>
    );
  }

  // ຊອກຫາ Route ທີ່ກົງກັບ Pathname ປະຈຸບັນ
  const matchedItem = allNavItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== '/' &&
        item.href !== '/dashboard' &&
        pathname.startsWith(`${item.href}/`))
  );

  // ຖ້າເປັນ Route ທີ່ມີກົດລະບຽບກຳນົດສິດ
  if (matchedItem) {
    const access = evaluateRouteAccess(user, matchedItem);
    if (!access.allowed) {
      return (
        <PermissionDenied
          moduleName={access.moduleName || matchedItem.title}
          message={access.reason}
        />
      );
    }
  }

  return <>{children}</>;
}
