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
  Lock,
  Layers,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import { usePermissionsList } from '@/modules/users/application/use-users.hook';
import { useUpdateRole } from '../../application/use-roles.hook';
import {
  MODULE_METAS,
  MODULE_GROUPS,
  type ModuleMeta,
} from '@/modules/users/presentation/components/assign-permissions-modal';
import type { RoleItem } from '../../domain/role.types';
import type { PermissionItem, PermissionAction } from '@/modules/users/domain/user.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AssignRolePermissionsModalProps {
  role: RoleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ACTIONS: { key: PermissionAction; label: string; color: string }[] = [
  { key: 'READ', label: 'ເບິ່ງ (Read)', color: 'text-sky-700 bg-sky-50 border-sky-200' },
  { key: 'CREATE', label: 'ສ້າງ (Create)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'UPDATE', label: 'ແກ້ໄຂ (Update)', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'DELETE', label: 'ລຶບ (Delete)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
];

export type RolePresetType =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'STAFF'
  | 'HR'
  | 'READONLY';

export function AssignRolePermissionsModal({
  role,
  isOpen,
  onClose,
}: AssignRolePermissionsModalProps) {
  const isSuperAdmin = role?.name === 'SUPERADMIN';

  const { data: allPermissions = [], isLoading: isLoadingPerms } = usePermissionsList();
  const updateMutation = useUpdateRole();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && role) {
      const pIds = new Set<number>();
      if (role.permissions && Array.isArray(role.permissions)) {
        role.permissions.forEach((p) => pIds.add(p.id));
      }
      setSelectedIds(pIds);
      setSearchTerm('');
      setSelectedGroupFilter('ALL');
    }
  }, [role, isOpen]);

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

  // ລາຍການ Module ທັງໝົດ 21 ໂມດູນ
  const moduleList = useMemo(() => {
    const list: string[] = [];
    Object.keys(MODULE_METAS).forEach((mod) => {
      if (permissionsByModule.has(mod)) {
        list.push(mod);
      }
    });
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

  // Toggle permission
  const handleTogglePermission = (id: number) => {
    if (isSuperAdmin) return;
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

  // Toggle all in module
  const handleToggleModuleAll = (moduleName: string) => {
    if (isSuperAdmin) return;
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

  // Select all / Clear all
  const handleSelectAll = () => {
    if (isSuperAdmin) return;
    setSelectedIds(new Set(allPermissions.map((p) => p.id)));
  };

  const handleClearAll = () => {
    if (isSuperAdmin) return;
    setSelectedIds(new Set());
  };

  // Apply Presets ທີ່ກົງກັບຖານຂໍ້ມູນ Backend (seed.ts)
  const handleApplyPreset = (preset: RolePresetType) => {
    if (isSuperAdmin) return;
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

    setSelectedIds(next);
  };

  const handleSubmit = async () => {
    if (!role) return;
    if (isSuperAdmin) {
      toast.info('ບົດບາດ SUPERADMIN ມີສິດເຕັມ 100% ໂດຍອັດຕະໂນມັດ ບໍ່ຈຳເປັນຕ້ອງປັບປ່ຽນ');
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: role.id,
        payload: {
          name: role.name,
          description: role.description || undefined,
          permissionIds: Array.from(selectedIds),
        },
      });
      toast.success(`ກຳນົດສິດທິໃຫ້ກັບບົດບາດ "${role.name}" ສຳເລັດແລ້ວ (${selectedIds.size} ສິດທິ)`);
      onClose();
    } catch {
      // Error handled by hook toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`ກຳນົດສິດທິບົດບາດ: ${role.name}`}
      description={role.description || 'ກຳນົດຂອບເຂດສິດທິການເຂົ້າເຖິງລະບົບ ແລະ ຈັດການແຕ່ລະໂມດູນ (PBAC / RBAC)'}
      size="xl"
      onSubmit={handleSubmit}
      submitLabel={isSuperAdmin ? 'ຮັບຊາບ' : 'ບັນທຶກການກຳນົດສິດທິ'}
      isSubmitting={isSubmitting || updateMutation.isPending}
    >
      <div className="space-y-4">
        {/* Role Meta Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-slate-50 border border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{role.name}</span>
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    <Lock className="h-2.5 w-2.5" />
                    System Role
                  </span>
                )}
                <span className="text-[11px] font-mono text-slate-400">#{role.id}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {role.description || 'ບໍ່ມີຄຳອະທິບາຍບົດບາດ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-right shadow-2xs">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                ສິດທິທີ່ເລືອກ
              </p>
              <p className="text-xs font-bold text-indigo-600">
                {selectedIds.size} / {allPermissions.length} ສິດທິ
              </p>
            </div>
          </div>
        </div>

        {/* SuperAdmin Lock Warning */}
        {isSuperAdmin && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold">ບົດບາດ Super Admin (System Role)</p>
              <p className="text-amber-700 mt-0.5 leading-relaxed">
                ບົດບາດນີ້ມີສິດທິສູງສຸດຂອງລະບົບ ແລະ ໄດ້ຮັບສິດເຂົ້າເຖິງ 100% ທຸກໆໂມດູນໂດຍອັດຕະໂນມັດ ຜ່ານລະບົບ Backend Bypass Permissions Guard.
              </p>
            </div>
          </div>
        )}

        {/* Quick Presets Bar */}
        {!isSuperAdmin && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                ແມ່ແບບສິດທິມາດຕະຖານ (Role Presets ຕາມ Backend):
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                >
                  ເລືອກທັງໝົດ ({allPermissions.length})
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-2 py-0.5 text-[11px] font-semibold rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  ລ້າງທັງໝົດ
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset('ADMIN')}
                className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                title="19 ໂມດູນ CRUD ເຕັມ + ຈັດການຜູ້ໃຊ້ 3 ສິດ + ອ່ານບົດບາດ 1 ສິດ"
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>Admin (80 ສິດ)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('EDITOR')}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                title="12 ໂມດູນເນື້ອຫາດິຈິຕອນ CRUD + 7 ໂມດູນອ້າງອີງ Read-only"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Editor (55 ສິດ)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('STAFF')}
                className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                title="ອ່ານຢ່າງດຽວ 19 ໂມດູນ (ຍົກເວັ້ນ USERS/ROLES)"
              >
                <Sparkles className="w-3 h-3 text-sky-500" />
                <span>Staff / Viewer (19 ສິດ)</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('HR')}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                title="ຈັດການບຸກຄະລາກອນ, ຕຳແໜ່ງງານ ແລະ ຂໍ້ມູນຝ່າຍ"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>HR Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('READONLY')}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-300 text-slate-700 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
                title="ສິດອ່ານ (READ) ທຸກໆໂມດູນໃນລະບົບ"
              >
                <span>Read-Only ທັງໝົດ (21 ສິດ)</span>
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-200/60">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາຊື່ໂມດູນ (Module name / Lao label)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedGroupFilter('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 cursor-pointer',
                selectedGroupFilter === 'ALL'
                  ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              )}
            >
              ທັງໝົດ ({moduleList.length})
            </button>
            {Object.entries(MODULE_GROUPS).map(([key, group]) => {
              const count = moduleList.filter((m) => MODULE_METAS[m]?.group === key).length;
              const isSelected = selectedGroupFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedGroupFilter(key)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[11px] font-medium transition shrink-0 cursor-pointer',
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  )}
                >
                  {group.title.split(' (')[0]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Modules Permissions Grid */}
        <div className="max-h-[460px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {isLoadingPerms ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs">ກຳລັງໂຫຼດລາຍການສິດທິທັງໝົດ...</span>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-1">
              <p className="text-xs font-semibold">ບໍ່ພົບໂມດູນທີ່ກົງກັບການຄົ້ນຫາ</p>
              <p className="text-[11px]">ລອງປ່ຽນຄຳຄົ້ນຫາ ຫຼື ເລືອກແທັບໝວດໝູ່ອື່ນ</p>
            </div>
          ) : (
            filteredModules.map((moduleName) => {
              const meta = MODULE_METAS[moduleName] || {
                module: moduleName,
                nameLa: moduleName,
                group: 'ORGANIZATION',
                icon: Layers,
              };
              const Icon = meta.icon || Layers;
              const modPerms = permissionsByModule.get(moduleName);
              if (!modPerms) return null;

              const ids = Array.from(modPerms.values()).map((p) => p.id);
              const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
              const someSelected = ids.some((id) => selectedIds.has(id)) && !allSelected;

              return (
                <div
                  key={moduleName}
                  className={cn(
                    'p-3 rounded-2xl border transition-all duration-150',
                    allSelected
                      ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                      : someSelected
                      ? 'bg-slate-50/60 border-slate-300/80 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          'h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-2xs',
                          allSelected
                            ? 'bg-blue-600 text-white'
                            : someSelected
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 text-xs">
                            {meta.nameLa}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {moduleName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => handleToggleModuleAll(moduleName)}
                        className={cn(
                          'text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 transition cursor-pointer shrink-0 self-start sm:self-auto',
                          allSelected
                            ? 'bg-blue-100 border-blue-200 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        )}
                      >
                        {allSelected ? (
                          <>
                            <CheckSquare className="w-3 h-3 text-blue-600" />
                            ເລືອກແລ້ວທັງໝົດ
                          </>
                        ) : (
                          <>
                            <Square className="w-3 h-3 text-slate-400" />
                            ເລືອກທັງໝົດໃນໂມດູນ
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Actions Checkboxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
                    {ACTIONS.map((action) => {
                      const perm = modPerms.get(action.key);
                      if (!perm) {
                        return (
                          <div
                            key={action.key}
                            className="px-2.5 py-1.5 rounded-xl border border-dashed border-slate-200 text-slate-300 text-[11px] font-medium text-center opacity-60"
                          >
                            {action.label.split(' (')[0]} -
                          </div>
                        );
                      }

                      const isChecked = selectedIds.has(perm.id) || isSuperAdmin;

                      return (
                        <div
                          key={action.key}
                          onClick={() => !isSuperAdmin && handleTogglePermission(perm.id)}
                          className={cn(
                            'flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition select-none',
                            isSuperAdmin
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 cursor-default'
                              : isChecked
                              ? 'bg-white border-blue-500 shadow-2xs cursor-pointer text-slate-800 ring-1 ring-blue-500/20'
                              : 'bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300 cursor-pointer'
                          )}
                        >
                          <div
                            className={cn(
                              'w-4 h-4 rounded-md border flex items-center justify-center transition shrink-0',
                              isChecked
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                            )}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span className="truncate text-[11px]">{action.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </FormModal>
  );
}
