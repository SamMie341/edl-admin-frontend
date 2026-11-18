'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Check,
  Search,
  CheckSquare,
  Square,
  Sparkles,
  Info,
  Loader2,
  Building2,
  Newspaper,
  FileSpreadsheet,
  Users,
  Calculator,
  Ban,
  RotateCcw,
} from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  usePermissionsList,
  useUserPermissions,
  useAssignPermissions,
} from '../../application/use-users.hook';
import { useRoleById } from '@/modules/roles/application/use-roles.hook';
import {
  getUserRoleName,
  type UserItem,
  type PermissionItem,
  type PermissionAction,
  type PermissionRefEntry,
} from '../../domain/user.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AssignPermissionsModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

// ຂໍ້ມູນ Module Mapping ສຳລັບແປພາສາລາວ ແລະ ຈັດໝວດໝູ່
export interface ModuleMeta {
  module: string;
  nameLa: string;
  group: 'ORGANIZATION' | 'CONTENT' | 'PUBLIC_SERVICES' | 'HR_IAM';
  icon: any;
}

export const MODULE_GROUPS: Record<
  string,
  { title: string; desc: string; icon: any }
> = {
  ORGANIZATION: {
    title: 'ໂຄງສ້າງອົງກອນ & ສາຂາ (Organization & Branches)',
    desc: 'ຂໍ້ມູນແຜນຜັງ, ວິໄສທັດ, ຝ່າຍ, ສາຂາ, ສູນບໍລິການ ແລະ ທີ່ຕັ້ງ',
    icon: Building2,
  },
  CONTENT: {
    title: 'ຂ່າວສານ & ເນື້ອຫາດິຈິຕອນ (News & Content)',
    desc: 'ຂ່າວສານ, ໝວດໝູ່, ແທັກ, ຄວາມຮູ້ດ້ານໄຟຟ້າ ແລະ ວາລະສານ',
    icon: Newspaper,
  },
  PUBLIC_SERVICES: {
    title: 'ບໍລິການ & ປະກາດສາທາລະນະ (Public Services)',
    desc: 'ອັດຕາຄ່າໄຟຟ້າ, ເອກະສານນິຕິກຳ ແລະ ປະກາດຈັດຊື້-ຈັດຈ້າງ',
    icon: FileSpreadsheet,
  },
  HR_IAM: {
    title: 'ບຸກຄະລາກອນ & ຄວາມປອດໄພ (HR & IAM)',
    desc: 'ປະກາດຮັບສະໝັກງານ, ຕຳແໜ່ງງານ ແລະ ຈັດການຜູ້ໃຊ້ງານລະບົບ',
    icon: Users,
  },
};

export const MODULE_METAS: Record<string, ModuleMeta> = {
  ORGANIZATION_STRUCTURES: {
    module: 'ORGANIZATION_STRUCTURES',
    nameLa: 'ໂຄງຮ່າງການຈັດຕັ້ງ (Org Structure)',
    group: 'ORGANIZATION',
    icon: Building2,
  },
  VISION_MISSIONS: {
    module: 'VISION_MISSIONS',
    nameLa: 'ວິໄສທັດ ແລະ ພາລະກິດ (Vision & Missions)',
    group: 'ORGANIZATION',
    icon: Building2,
  },
  DEPARTMENTS: {
    module: 'DEPARTMENTS',
    nameLa: 'ຂໍ້ມູນຝ່າຍ (Departments)',
    group: 'ORGANIZATION',
    icon: Building2,
  },
  BRANCHES: {
    module: 'BRANCHES',
    nameLa: 'ຂໍ້ມູນສາຂາ (Branches)',
    group: 'ORGANIZATION',
    icon: Building2,
  },
  SERVICE_CENTERS: {
    module: 'SERVICE_CENTERS',
    nameLa: 'ສູນບໍລິການລູກຄ້າ (Service Centers)',
    group: 'ORGANIZATION',
    icon: Building2,
  },
  PROVINCES: {
    module: 'PROVINCES',
    nameLa: 'ຂໍ້ມູນແຂວງ (Provinces)',
    group: 'ORGANIZATION',
    icon: Building2,
  },
  DISTRICTS: {
    module: 'DISTRICTS',
    nameLa: 'ຂໍ້ມູນເມືອງ (Districts)',
    group: 'ORGANIZATION',
    icon: Building2,
  },
  VILLAGES: {
    module: 'VILLAGES',
    nameLa: 'ຂໍ້ມູນບ້ານ (Villages)',
    group: 'ORGANIZATION',
    icon: Building2,
  },

  NEWS: {
    module: 'NEWS',
    nameLa: 'ຂ່າວສານປະຊາສຳພັນ (News)',
    group: 'CONTENT',
    icon: Newspaper,
  },
  NEWS_CATEGORIES: {
    module: 'NEWS_CATEGORIES',
    nameLa: 'ໝວດໝູ່ຂ່າວສານ (Categories)',
    group: 'CONTENT',
    icon: Newspaper,
  },
  NEWS_TAGS: {
    module: 'NEWS_TAGS',
    nameLa: 'ແທັກຂ່າວສານ (Tags)',
    group: 'CONTENT',
    icon: Newspaper,
  },
  ELECTRICAL_KNOWLEDGE: {
    module: 'ELECTRICAL_KNOWLEDGE',
    nameLa: 'ຄວາມຮູ້ດ້ານໄຟຟ້າ (Knowledge)',
    group: 'CONTENT',
    icon: Newspaper,
  },
  MAGAZINES: {
    module: 'MAGAZINES',
    nameLa: 'ວາລະສານດິຈິຕອນ (E-Magazine)',
    group: 'CONTENT',
    icon: Newspaper,
  },

  ELECTRICITY_CALCULATOR: {
    module: 'ELECTRICITY_CALCULATOR',
    nameLa: 'ຄິດໄລ່ຄ່າໄຟຟ້າ & ແຜນປະຢັດໄຟ (Calculator)',
    group: 'PUBLIC_SERVICES',
    icon: Calculator,
  },
  ELECTRICITY_TARIFFS: {
    module: 'ELECTRICITY_TARIFFS',
    nameLa: 'ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ (Tariffs)',
    group: 'PUBLIC_SERVICES',
    icon: FileSpreadsheet,
  },
  LEGISLATIONS: {
    module: 'LEGISLATIONS',
    nameLa: 'ເອກະສານນິຕິກຳ (Legislations)',
    group: 'PUBLIC_SERVICES',
    icon: FileSpreadsheet,
  },
  PROCUREMENTS: {
    module: 'PROCUREMENTS',
    nameLa: 'ປະກາດຈັດຊື້-ຈັດຈ້າງ (Procurements)',
    group: 'PUBLIC_SERVICES',
    icon: FileSpreadsheet,
  },

  JOB_POSTINGS: {
    module: 'JOB_POSTINGS',
    nameLa: 'ປະກາດຮັບສະໝັກງານ (Job Postings)',
    group: 'HR_IAM',
    icon: Users,
  },
  POSITIONS: {
    module: 'POSITIONS',
    nameLa: 'ຕຳແໜ່ງງານ (Positions)',
    group: 'HR_IAM',
    icon: Users,
  },
  USERS: {
    module: 'USERS',
    nameLa: 'ຈັດການຜູ້ໃຊ້ງານ & ສິດທິ (Users & IAM)',
    group: 'HR_IAM',
    icon: Users,
  },
  ROLES: {
    module: 'ROLES',
    nameLa: 'ຈັດການສິດທິບົດບາດ (Roles & RBAC)',
    group: 'HR_IAM',
    icon: ShieldCheck,
  },
};

const ACTIONS: { key: PermissionAction; label: string; color: string }[] = [
  { key: 'READ', label: 'ເບິ່ງ (Read)', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { key: 'CREATE', label: 'ສ້າງ (Create)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'UPDATE', label: 'ແກ້ໄຂ (Update)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'DELETE', label: 'ລຶບ (Delete)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
];

function extractPermissionId(entry: PermissionRefEntry): number | null {
  if ('permission' in entry && entry.permission?.id) return entry.permission.id;
  if ('permissionId' in entry && typeof entry.permissionId === 'number') return entry.permissionId;
  if ('id' in entry && typeof entry.id === 'number') return entry.id;
  return null;
}

export function AssignPermissionsModal({
  user,
  isOpen,
  onClose,
}: AssignPermissionsModalProps) {
  const { data: allPermissions = [], isLoading: isLoadingPerms } = usePermissionsList();
  const { data: userPermissionsDetail, isLoading: isLoadingUserPerms } = useUserPermissions(
    isOpen ? user?.id : null
  );
  const assignMutation = useAssignPermissions();

  const roleName = user ? getUserRoleName(user.role) : '';
  const isSuperAdmin = roleName.toUpperCase() === 'SUPERADMIN';

  const userRoleId =
    user?.roleId ??
    (typeof user?.role === 'object' && user.role !== null && 'id' in user.role
      ? user.role.id
      : null);
  const { data: roleDetail } = useRoleById(isOpen && !isSuperAdmin ? userRoleId : null);

  const rolePermissionIds = useMemo(() => {
    if (isSuperAdmin) {
      return new Set(allPermissions.map((p) => p.id));
    }
    const set = new Set<number>();
    if (userPermissionsDetail?.rolePermissions) {
      userPermissionsDetail.rolePermissions.forEach((entry) => {
        const id = extractPermissionId(entry);
        if (id) set.add(id);
      });
      return set;
    }
    roleDetail?.permissions?.forEach((p) => {
      if (p.id) set.add(p.id);
    });
    return set;
  }, [isSuperAdmin, allPermissions, userPermissionsDetail, roleDetail]);

  const [allowedIds, setAllowedIds] = useState<Set<number>>(new Set());
  const [deniedIds, setDeniedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');

  // ເມື່ອເປີດ Modal ຫຼືປ່ຽນ User ໃຫ້ໂຫຼດສິດ ALLOW / DENY ປະຈຸບັນຂອງ User ນັ້ນໆ
  const userId = user?.id;
  useEffect(() => {
    if (!userId || !isOpen) return;
    setSearchTerm('');
    setSelectedGroupFilter('ALL');
  }, [userId, isOpen]);

  useEffect(() => {
    if (!user || !isOpen) return;

    const nextAllowed = new Set<number>();
    const nextDenied = new Set<number>();

    if (userPermissionsDetail) {
      userPermissionsDetail.allowedPermissions?.forEach((entry) => {
        const id = extractPermissionId(entry);
        if (id) nextAllowed.add(id);
      });
      userPermissionsDetail.deniedPermissions?.forEach((entry) => {
        const id = extractPermissionId(entry);
        if (id) nextDenied.add(id);
      });
    } else if (user.userPermissions && Array.isArray(user.userPermissions)) {
      user.userPermissions.forEach((up) => {
        const id = up.permission?.id;
        if (!id) return;
        if (up.effect === 'DENY') {
          nextDenied.add(id);
        } else {
          nextAllowed.add(id);
        }
      });
    }

    setAllowedIds(nextAllowed);
    setDeniedIds(nextDenied);
  }, [user, isOpen, userPermissionsDetail]);

  // ແຍກ Master Permissions ຕາມ Module: { [module]: { READ: perm, CREATE: perm, ... } }
  const permissionsByModule = useMemo(() => {
    const map = new Map<string, Map<string, PermissionItem>>();
    allPermissions.forEach((p) => {
      if (!map.has(p.module)) {
        map.set(p.module, new Map<string, PermissionItem>());
      }
      map.get(p.module)!.set(p.action, p);
    });
    return map;
  }, [allPermissions]);

  // ລາຍການ Module ທັງໝົດທີ່ມີ
  const moduleList = useMemo(() => {
    const list: string[] = [];
    // ຈັດລຳດັບຕາມ MODULE_METAS
    Object.keys(MODULE_METAS).forEach((mod) => {
      if (permissionsByModule.has(mod)) {
        list.push(mod);
      }
    });
    // ຖ້າມີ module ອື່ນທີ່ backend ມີແຕ່ບໍ່ຢູ່ໃນ MODULE_METAS ໃຫ້ຕື່ມຕໍ່ທ້າຍ
    permissionsByModule.forEach((_, mod) => {
      if (!list.includes(mod)) {
        list.push(mod);
      }
    });
    return list;
  }, [permissionsByModule]);

  // Filter Modules ຕາມ Search Term ແລະ Group Tab
  const filteredModules = useMemo(() => {
    return moduleList.filter((mod) => {
      const meta = MODULE_METAS[mod] || {
        module: mod,
        nameLa: mod,
        group: 'ORGANIZATION',
      };

      if (selectedGroupFilter !== 'ALL' && meta.group !== selectedGroupFilter) {
        return false;
      }

      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        mod.toLowerCase().includes(term) ||
        meta.nameLa.toLowerCase().includes(term)
      );
    });
  }, [moduleList, searchTerm, selectedGroupFilter]);

  const isPermissionEffective = (id: number) =>
    rolePermissionIds.has(id) ? !deniedIds.has(id) : allowedIds.has(id);

  // Function Toggle ສິດແຕ່ລະອັນ (ຮອງຮັບທັງ ALLOW ແລະ DENY ຈາກ Role)
  const handleTogglePermission = (id: number) => {
    if (rolePermissionIds.has(id)) {
      setDeniedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setAllowedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setAllowedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      setDeniedIds((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Function Toggle ທຸກສິດໃນ 1 Module
  const handleToggleModuleAll = (moduleName: string) => {
    const modPerms = permissionsByModule.get(moduleName);
    if (!modPerms) return;

    const ids = Array.from(modPerms.values()).map((p) => p.id);
    const allEffective = ids.every((id) => isPermissionEffective(id));

    if (allEffective) {
      // ປິດທຸກສິດໃນໂມດູນນີ້ (ລົບ ALLOW ອອກ ແລະເພີ່ມເຂົ້າ DENY ຖ້າເປັນສິດຈາກ Role)
      setAllowedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setDeniedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => {
          if (rolePermissionIds.has(id)) next.add(id);
        });
        return next;
      });
    } else {
      // ເປີດທຸກສິດໃນໂມດູນນີ້
      setDeniedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setAllowedIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => {
          if (!rolePermissionIds.has(id)) next.add(id);
        });
        return next;
      });
    }
  };

  // Presets & Bulk Actions
  const handleSelectAll = () => {
    const nextAllowed = new Set<number>();
    allPermissions.forEach((p) => {
      if (!rolePermissionIds.has(p.id)) nextAllowed.add(p.id);
    });
    setAllowedIds(nextAllowed);
    setDeniedIds(new Set());
  };

  const handleClearAll = () => {
    setAllowedIds(new Set());
    setDeniedIds(new Set(rolePermissionIds));
  };

  const handleResetToRole = () => {
    setAllowedIds(new Set());
    setDeniedIds(new Set());
  };

  // Presets ທີ່ກົງກັບຖານຂໍ້ມູນ Backend (seed.ts)
  const handleApplyPreset = (preset: 'SUPERADMIN' | 'ADMIN' | 'EDITOR' | 'STAFF' | 'HR' | 'READONLY') => {
    const next = new Set<number>();

    const editorContentModules = [
      'NEWS',
      'NEWS_CATEGORIES',
      'NEWS_TAGS',
      'ELECTRICAL_KNOWLEDGE',
      'MAGAZINES',
      'ORGANIZATION_STRUCTURES',
      'VISION_MISSIONS',
      'LEGISLATIONS',
      'ELECTRICITY_TARIFFS',
      'ELECTRICITY_CALCULATOR',
      'PROCUREMENTS',
      'JOB_POSTINGS',
    ];
    const editorReferenceModules = [
      'DEPARTMENTS',
      'BRANCHES',
      'SERVICE_CENTERS',
      'PROVINCES',
      'DISTRICTS',
      'VILLAGES',
      'POSITIONS',
    ];

    const hrCrudModules = ['JOB_POSTINGS', 'POSITIONS', 'DEPARTMENTS'];
    const hrRefModules = [
      'BRANCHES',
      'SERVICE_CENTERS',
      'PROVINCES',
      'DISTRICTS',
      'VILLAGES',
      'ORGANIZATION_STRUCTURES',
      'VISION_MISSIONS',
    ];

    allPermissions.forEach((p) => {
      switch (preset) {
        case 'SUPERADMIN':
          next.add(p.id);
          break;

        case 'ADMIN':
          // 19 ໂມດູນ CRUD ເຕັມ (76) + USERS (READ, CREATE, UPDATE = 3) + ROLES (READ = 1) -> ລວມ 80 ສິດ
          if (p.module === 'ROLES') {
            if (p.action === 'READ') next.add(p.id);
          } else if (p.module === 'USERS') {
            if (p.action !== 'DELETE') next.add(p.id);
          } else {
            next.add(p.id);
          }
          break;

        case 'EDITOR':
          // 12 ໂມດູນເນື້ອຫາ CRUD (48) + 7 ໂມດູນອ້າງອີງ READ (7) -> ລວມ 55 ສິດ
          if (editorContentModules.includes(p.module)) {
            next.add(p.id);
          } else if (editorReferenceModules.includes(p.module) && p.action === 'READ') {
            next.add(p.id);
          }
          break;

        case 'STAFF':
          // 19 ໂມດູນ READ ຢ່າງດຽວ (ຍົກເວັ້ນ USERS ແລະ ROLES) -> ລວມ 19 ສິດ
          if (p.module !== 'USERS' && p.module !== 'ROLES' && p.action === 'READ') {
            next.add(p.id);
          }
          break;

        case 'HR':
          if (hrCrudModules.includes(p.module)) {
            next.add(p.id);
          } else if (hrRefModules.includes(p.module) && p.action === 'READ') {
            next.add(p.id);
          }
          break;

        case 'READONLY':
          if (p.action === 'READ') {
            next.add(p.id);
          }
          break;
      }
    });

    const nextAllowed = new Set<number>();
    const nextDenied = new Set<number>();

    allPermissions.forEach((p) => {
      const inPreset = next.has(p.id);
      const inRole = rolePermissionIds.has(p.id);
      if (inPreset && !inRole) nextAllowed.add(p.id);
      if (!inPreset && inRole) nextDenied.add(p.id);
    });

    setAllowedIds(nextAllowed);
    setDeniedIds(nextDenied);
  };

  // ບັນທຶກສິດທິ (ALLOW / DENY)
  const handleSubmit = async () => {
    if (!user) return;
    try {
      await assignMutation.mutateAsync({
        id: user.id,
        payload: {
          permissionIds: Array.from(allowedIds),
          deniedPermissionIds: Array.from(deniedIds),
        },
      });
      onClose();
    } catch {
      // Error is handled by hook toast
    }
  };

  if (!user) return null;

  const totalCount = allPermissions.length;
  const effectiveCount = allPermissions.filter((p) => isPermissionEffective(p.id)).length;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="ກຳນົດສິດການນຳໃຊ້ (Permissions Management)"
      description={`ກຳນົດສິດລະອຽດແຕ່ລະໂມດູນສຳລັບ: ${user.firstName} ${user.lastName} (${user.employeeCode}) [Role: ${roleName || '-'}]`}
      size="2xl"
      onSubmit={handleSubmit}
      submitLabel="ບັນທຶກສິດທິການນຳໃຊ້"
      isSubmitting={assignMutation.isPending}
    >
      <div className="space-y-4">
        {/* Banner ແຈ້ງເຕືອນສຳລັບ SUPERADMIN */}
        {isSuperAdmin && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3 shadow-2xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">ຜູ້ໃຊ້ນີ້ມີ Role SUPERADMIN (ສາມາດປິດສະເພາະສິດທີ່ຕ້ອງການຫ້າມໄດ້)</p>
              <p className="text-amber-800/90 leading-relaxed text-[11px]">
                ໂດຍປົກກະຕິ SUPERADMIN ຈະໄດ້ຮັບທຸກສິດທິອັດຕະໂນມັດ ແຕ່ທ່ານສາມາດກົດຍົກເລີກເພື່ອປິດ/ຫັກສິດສະເພາະຈຸດ (DENY) ໄດ້ ຊຶ່ງລະບົບຈະກວດສອບ DENY ກ່ອນສະເໝີ.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls & Presets Header */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                ສິດໃຊ້ງານໄດ້:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-800 text-white shadow-2xs">
                {effectiveCount} / {totalCount} ສິດ
              </span>
              {allowedIds.size > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                  +{allowedIds.size} ເພີ່ມ (ALLOW)
                </span>
              )}
              {deniedIds.size > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  -{deniedIds.size} ປິດສິດ (DENY)
                </span>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={handleResetToRole}
                title="ລ້າງການປັບແຕ່ງ ALLOW/DENY ທັງໝົດໃຫ້ກັບໄປໃຊ້ສິດຕາມ Role ເດີມ"
                className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-medium transition cursor-pointer text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                ຣີເຊັດຕາມ Role
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer text-[11px]"
              >
                ເປີດທັງໝົດ
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-rose-700 hover:bg-rose-50 font-medium transition cursor-pointer text-[11px]"
              >
                ປິດທັງໝົດ
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('ADMIN')}
                className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200/60 text-purple-700 hover:bg-purple-100/80 font-medium transition cursor-pointer text-[11px] flex items-center gap-1"
                title="19 ໂມດູນ CRUD ເຕັມ + ຈັດການຜູ້ໃຊ້ 3 ສິດ + ອ່ານບົດບາດ 1 ສິດ"
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                Admin (80)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('EDITOR')}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 hover:bg-indigo-100/80 font-medium transition cursor-pointer text-[11px] flex items-center gap-1"
                title="12 ໂມດູນເນື້ອຫາດິຈິຕອນ CRUD + 7 ໂມດູນອ້າງອີງ Read-only"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Editor (55)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('STAFF')}
                className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/60 text-sky-700 hover:bg-sky-100/80 font-medium transition cursor-pointer text-[11px] flex items-center gap-1"
                title="ອ່ານຢ່າງດຽວ 19 ໂມດູນ (ຍົກເວັ້ນ USERS/ROLES)"
              >
                <Sparkles className="w-3 h-3 text-sky-500" />
                Staff (19)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('HR')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-700 hover:bg-emerald-100/80 font-medium transition cursor-pointer text-[11px] flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                HR
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('READONLY')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-700 hover:bg-slate-200/80 font-medium transition cursor-pointer text-[11px]"
              >
                Read-Only
              </button>
            </div>
          </div>

          {/* Search & Group Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-200/50">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ໂມດູນ (Search module)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            {/* Filter Tabs by Group */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
              {[
                { key: 'ALL', label: 'ທຸກໂມດູນ' },
                { key: 'ORGANIZATION', label: 'ອົງກອນ & ສາຂາ' },
                { key: 'CONTENT', label: 'ຂ່າວສານ' },
                { key: 'PUBLIC_SERVICES', label: 'ບໍລິການ & ຈັດຊື້' },
                { key: 'HR_IAM', label: 'ບຸກຄະລາກອນ' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedGroupFilter(tab.key)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap cursor-pointer',
                    selectedGroupFilter === tab.key
                      ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                      : 'bg-white border border-slate-200/60 text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-1 border-t border-slate-200/50 text-[11px] text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-400 inline-flex items-center justify-center text-emerald-600">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              ສິດຈາກ Role
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-600 border border-blue-600 inline-flex items-center justify-center text-white">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              ເພີ່ມສິດ (ALLOW)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-400 inline-flex items-center justify-center text-rose-600">
                <Ban className="w-2.5 h-2.5 stroke-[2.5]" />
              </span>
              ປິດ/ຫັກສິດຈາກ Role (DENY)
            </span>
          </div>
        </div>

        {/* Permissions Matrix Content */}
        {isLoadingPerms || isLoadingUserPerms ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs">ກຳລັງດຶງຂໍ້ມູນສິດທິຈາກລະບົບ...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            ບໍ່ພົບໂມດູນທີ່ກົງກັບເງື່ອນໄຂການຄົ້ນຫາ
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs max-h-[460px] overflow-y-auto divide-y divide-slate-100">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-slate-100/80 px-4 py-2.5 text-[11px] font-bold text-slate-700 sticky top-0 z-10 backdrop-blur-md border-b border-slate-200">
              <div className="col-span-6 sm:col-span-5 flex items-center gap-1.5">
                <span>ໂມດູນ (Module)</span>
              </div>
              <div className="col-span-6 sm:col-span-7 grid grid-cols-4 text-center">
                {ACTIONS.map((a) => (
                  <span key={a.key} className="truncate">
                    {a.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Table Rows */}
            {filteredModules.map((moduleName) => {
              const meta = MODULE_METAS[moduleName] || {
                module: moduleName,
                nameLa: moduleName,
                group: 'ORGANIZATION',
                icon: Building2,
              };

              const modPerms = permissionsByModule.get(moduleName);
              const readPerm = modPerms?.get('READ');
              const createPerm = modPerms?.get('CREATE');
              const updatePerm = modPerms?.get('UPDATE');
              const deletePerm = modPerms?.get('DELETE');

              const modPermList = Array.from(modPerms?.values() || []);
              const allModSelected =
                modPermList.length > 0 &&
                modPermList.every((p) => isPermissionEffective(p.id));
              const someModSelected =
                modPermList.some((p) => isPermissionEffective(p.id)) && !allModSelected;

              return (
                <div
                  key={moduleName}
                  className="grid grid-cols-12 px-4 py-3 items-center hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Module Name & Toggle All in Module */}
                  <div className="col-span-6 sm:col-span-5 pr-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleModuleAll(moduleName)}
                        title={allModSelected ? 'ຍົກເລີກທຸກສິດໃນໂມດູນນີ້' : 'ເລືອກທຸກສິດໃນໂມດູນນີ້'}
                        className="text-slate-400 hover:text-blue-600 transition cursor-pointer shrink-0"
                      >
                        {allModSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : someModSelected ? (
                          <div className="w-4 h-4 rounded border-2 border-blue-600 flex items-center justify-center bg-blue-50">
                            <div className="w-2 h-0.5 bg-blue-600 rounded-full" />
                          </div>
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-slate-800 truncate">
                          {meta.nameLa}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {moduleName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Checkboxes */}
                  <div className="col-span-6 sm:col-span-7 grid grid-cols-4 gap-1 text-center">
                    {[
                      { action: 'READ', perm: readPerm },
                      { action: 'CREATE', perm: createPerm },
                      { action: 'UPDATE', perm: updatePerm },
                      { action: 'DELETE', perm: deletePerm },
                    ].map(({ action, perm }) => {
                      if (!perm) {
                        return (
                          <div
                            key={action}
                            className="text-[11px] text-slate-300 flex items-center justify-center"
                          >
                            -
                          </div>
                        );
                      }

                      const isFromRole = rolePermissionIds.has(perm.id);
                      const isAllowed = allowedIds.has(perm.id);
                      const isDenied = deniedIds.has(perm.id);
                      const isEffective = isPermissionEffective(perm.id);

                      const tooltip = isFromRole
                        ? isDenied
                          ? 'ຖືກປິດ/ຫັກສິດຈາກ Role (DENY) — ກົດເພື່ອຄືນສິດ'
                          : 'ສິດທີ່ມີຢູ່ແລ້ວຈາກ Role — ກົດເພື່ອປິດ/ຫັກສິດ (DENY)'
                        : isAllowed
                          ? 'ສິດ Custom ທີ່ກຳນົດເພີ່ມ (ALLOW) — ກົດເພື່ອເອົາອອກ'
                          : 'ບໍ່ມີສິດ — ກົດເພື່ອເພີ່ມສິດ (ALLOW)';

                      return (
                        <div
                          key={action}
                          className="flex items-center justify-center"
                        >
                          <label
                            title={tooltip}
                            className={cn(
                              'relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer select-none',
                              isFromRole
                                ? isDenied
                                  ? 'bg-rose-50 border-rose-400 text-rose-600 hover:bg-rose-100'
                                  : 'bg-emerald-50 border-emerald-400 text-emerald-600 hover:border-emerald-500'
                                : isAllowed
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs scale-105'
                                  : 'bg-white border-slate-200/80 hover:border-slate-300 text-transparent hover:text-slate-200'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isEffective}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="sr-only"
                            />
                            {isFromRole && isDenied ? (
                              <Ban className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <Check
                                className={cn(
                                  'w-4 h-4 stroke-[3]',
                                  isEffective ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            )}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </FormModal>
  );
}
