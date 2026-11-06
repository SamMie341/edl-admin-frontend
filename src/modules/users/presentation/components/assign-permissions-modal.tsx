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
} from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  usePermissionsList,
  useAssignPermissions,
} from '../../application/use-users.hook';
import type { UserItem, PermissionItem, PermissionAction } from '../../domain/user.types';
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
};

const ACTIONS: { key: PermissionAction; label: string; color: string }[] = [
  { key: 'READ', label: 'ເບິ່ງ (Read)', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { key: 'CREATE', label: 'ສ້າງ (Create)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'UPDATE', label: 'ແກ້ໄຂ (Update)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'DELETE', label: 'ລຶບ (Delete)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
];

export function AssignPermissionsModal({
  user,
  isOpen,
  onClose,
}: AssignPermissionsModalProps) {
  const { data: allPermissions = [], isLoading: isLoadingPerms } = usePermissionsList();
  const assignMutation = useAssignPermissions();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');

  // ເມື່ອເປີດ Modal ຫຼືປ່ຽນ User ໃຫ້ໂຫຼດສິດປະຈຸບັນຂອງ User ນັ້ນໆ
  useEffect(() => {
    if (user && isOpen) {
      const initialSet = new Set<number>();
      if (user.userPermissions && Array.isArray(user.userPermissions)) {
        user.userPermissions.forEach((up) => {
          if (up.permission?.id) {
            initialSet.add(up.permission.id);
          }
        });
      }
      setSelectedIds(initialSet);
      setSearchTerm('');
      setSelectedGroupFilter('ALL');
    }
  }, [user, isOpen]);

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

  // Function Toggle ສິດແຕ່ລະອັນ
  const handleTogglePermission = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Function Toggle ທຸກສິດໃນ 1 Module
  const handleToggleModuleAll = (moduleName: string) => {
    const modPerms = permissionsByModule.get(moduleName);
    if (!modPerms) return;

    const ids = Array.from(modPerms.values()).map((p) => p.id);
    const allSelected = ids.every((id) => selectedIds.has(id));

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // Presets
  const handleSelectAll = () => {
    const all = new Set(allPermissions.map((p) => p.id));
    setSelectedIds(all);
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
  };

  const handleApplyPreset = (preset: 'EDITOR' | 'HR' | 'READONLY') => {
    const next = new Set<number>();

    if (preset === 'READONLY') {
      allPermissions.forEach((p) => {
        if (p.action === 'READ') next.add(p.id);
      });
    } else if (preset === 'EDITOR') {
      const contentModules = [
        'NEWS',
        'NEWS_CATEGORIES',
        'NEWS_TAGS',
        'ELECTRICAL_KNOWLEDGE',
        'MAGAZINES',
      ];
      allPermissions.forEach((p) => {
        if (contentModules.includes(p.module)) {
          next.add(p.id);
        } else if (p.action === 'READ') {
          next.add(p.id);
        }
      });
    } else if (preset === 'HR') {
      const hrModules = ['JOB_POSTINGS', 'POSITIONS', 'DEPARTMENTS'];
      allPermissions.forEach((p) => {
        if (hrModules.includes(p.module)) {
          next.add(p.id);
        } else if (p.action === 'READ') {
          next.add(p.id);
        }
      });
    }

    setSelectedIds(next);
  };

  // ບັນທຶກສິດທິ
  const handleSubmit = async () => {
    if (!user) return;
    try {
      await assignMutation.mutateAsync({
        id: user.id,
        payload: {
          permissionIds: Array.from(selectedIds),
        },
      });
      onClose();
    } catch {
      // Error is handled by hook toast
    }
  };

  if (!user) return null;

  const totalCount = allPermissions.length;
  const selectedCount = selectedIds.size;
  const isSuperAdmin = user.role === 'SUPERADMIN';

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="ກຳນົດສິດການນຳໃຊ້ (Permissions Management)"
      description={`ກຳນົດສິດລະອຽດແຕ່ລະໂມດູນສຳລັບ: ${user.firstName} ${user.lastName} (${user.employeeCode}) [Role: ${user.role}]`}
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
              <p className="font-bold">ຜູ້ໃຊ້ນີ້ມີ Role SUPERADMIN</p>
              <p className="text-amber-800/90 leading-relaxed text-[11px]">
                ລະບົບ Backend ກຳນົດໃຫ້ບັນຊີ Super Admin ສາມາດເຂົ້າເຖິງ ແລະ ຈັດການໄດ້ທຸກໆຟັງຊັນໂດຍອັດຕະໂນມັດ (Bypass Permission Checks).
                ການກຳນົດສິດເພີ່ມເຕີມໃນຕາຕະລາງນີ້ຈະຊ່ວຍຮັກສາຂໍ້ມູນສິດທິຕາມມາດຕະຖານຖານຂໍ້ມູນ.
              </p>
            </div>
          </div>
        )}

        {/* Action Controls & Presets Header */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                ເລືອກແລ້ວ:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-2xs">
                {selectedCount} / {totalCount} ສິດ
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer text-[11px]"
              >
                ເລືອກທັງໝົດ
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition cursor-pointer text-[11px]"
              >
                ລຶ້າງທັງໝົດ
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('EDITOR')}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 hover:bg-indigo-100/80 font-medium transition cursor-pointer text-[11px] flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Preset: Editor
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('HR')}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/60 text-emerald-700 hover:bg-emerald-100/80 font-medium transition cursor-pointer text-[11px] flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Preset: HR
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('READONLY')}
                className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200/60 text-sky-700 hover:bg-sky-100/80 font-medium transition cursor-pointer text-[11px]"
              >
                Preset: Read-Only
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
        </div>

        {/* Permissions Matrix Content */}
        {isLoadingPerms ? (
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
                modPermList.every((p) => selectedIds.has(p.id));
              const someModSelected =
                modPermList.some((p) => selectedIds.has(p.id)) && !allModSelected;

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

                      const isChecked = selectedIds.has(perm.id);

                      return (
                        <div
                          key={action}
                          className="flex items-center justify-center"
                        >
                          <label
                            className={cn(
                              'relative flex items-center justify-center w-8 h-8 rounded-xl border transition-all cursor-pointer select-none',
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white shadow-2xs scale-105'
                                : 'bg-white border-slate-200/80 hover:border-slate-300 text-transparent hover:text-slate-200'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.id)}
                              className="sr-only"
                            />
                            <Check className={cn('w-4 h-4 stroke-[3]', isChecked ? 'opacity-100' : 'opacity-0')} />
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
