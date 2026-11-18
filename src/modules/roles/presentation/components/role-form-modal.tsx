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
} from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import { usePermissionsList } from '@/modules/users/application/use-users.hook';
import {
  useCreateRole,
  useUpdateRole,
} from '../../application/use-roles.hook';
import {
  MODULE_METAS,
  type ModuleMeta,
} from '@/modules/users/presentation/components/assign-permissions-modal';
import type { RoleItem } from '../../domain/role.types';
import type { PermissionItem, PermissionAction } from '@/modules/users/domain/user.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RoleFormModalProps {
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

export function RoleFormModal({
  role,
  isOpen,
  onClose,
}: RoleFormModalProps) {
  const isEdit = Boolean(role);
  const isSuperAdmin = role?.name === 'SUPERADMIN';

  const { data: allPermissions = [], isLoading: isLoadingPerms } = usePermissionsList();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('ALL');

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setName(role.name || '');
        setDescription(role.description || '');
        const pIds = new Set<number>();
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach((p) => pIds.add(p.id));
        }
        setSelectedIds(pIds);
      } else {
        setName('');
        setDescription('');
        setSelectedIds(new Set());
      }
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

  // ລາຍການ Module ທັງໝົດ
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
    setSelectedIds(new Set(allPermissions.map((p) => p.id)));
  };

  const handleClearAll = () => {
    setSelectedIds(new Set());
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

    setSelectedIds(next);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim().toUpperCase();
    if (!trimmedName) {
      toast.error('ກະລຸນາປ້ອນຊື່ບົດບາດ (Role Name)');
      return;
    }

    try {
      if (isEdit && role) {
        await updateMutation.mutateAsync({
          id: role.id,
          payload: {
            name: isSuperAdmin ? role.name : trimmedName,
            description: description.trim() || undefined,
            permissionIds: Array.from(selectedIds),
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: trimmedName,
          description: description.trim() || undefined,
          permissionIds: Array.from(selectedIds),
        });
      }
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂຂໍ້ມູນບົດບາດ (Edit Role)' : 'ສ້າງບົດບາດໃໝ່ (Create Role)'}
      description={
        isEdit
          ? `ແກ້ໄຂຊື່, ຄຳອະທິບາຍ ແລະ ສິດທິສຳລັບບົດບາດ: ${role?.name}`
          : 'ກຳນົດຊື່ບົດບາດ, ລາຍລະອຽດໜ້າທີ່ ແລະ ຜູກໂຍງສິດທິການເຂົ້າເຖິງລະບົບ'
      }
      size="2xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງບົດບາດ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-5">
        {/* Basic Info: Name & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              ຊື່ບົດບາດ (Role Name) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ຕົວຢ່າງ: CONTENT_EDITOR, HR_ADMIN"
                value={name}
                disabled={isSuperAdmin}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                  'w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-semibold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition',
                  isSuperAdmin && 'bg-slate-100 text-slate-500 cursor-not-allowed pr-8'
                )}
              />
              {isSuperAdmin && (
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>
            {isSuperAdmin && (
              <p className="text-[11px] text-amber-600 font-medium">
                ບົດບາດ SUPERADMIN ເປັນລະບົບຫຼັກ ບໍ່ສາມາດປ່ຽນຊື່ໄດ້
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              ຄຳອະທິບາຍ (Description)
            </label>
            <input
              type="text"
              placeholder="ອະທິບາຍໜ້າທີ່ ຫຼື ຂອບເຂດຂອງບົດບາດນີ້"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Permissions Matrix Header & Presets */}
        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                ສິດທິທີ່ເລືອກ:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-2xs">
                {selectedIds.size} / {allPermissions.length} ສິດ
              </span>
            </div>

            {/* Presets */}
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

          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-slate-200/50">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ຄົ້ນຫາຊື່ໂມດູນ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

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

        {/* Matrix Table */}
        {isLoadingPerms ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <p className="text-xs">ກຳລັງດຶງຂໍ້ມູນສິດທິຈາກລະບົບ...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            ບໍ່ພົບໂມດູນທີ່ກົງກັບເງື່ອນໄຂ
          </div>
        ) : (
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {/* Header */}
            <div className="grid grid-cols-12 bg-slate-100/80 px-4 py-2.5 text-[11px] font-bold text-slate-700 sticky top-0 z-10 backdrop-blur-md border-b border-slate-200">
              <div className="col-span-6 sm:col-span-5">ໂມດູນ (Module)</div>
              <div className="col-span-6 sm:col-span-7 grid grid-cols-4 text-center">
                {ACTIONS.map((a) => (
                  <span key={a.key} className="truncate">
                    {a.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Rows */}
            {filteredModules.map((moduleName) => {
              const meta = MODULE_METAS[moduleName] || {
                module: moduleName,
                nameLa: moduleName,
                group: 'ORGANIZATION',
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
                  className="grid grid-cols-12 px-4 py-3 items-center hover:bg-blue-50/30 transition-colors"
                >
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

                  <div className="col-span-6 sm:col-span-7 grid grid-cols-4 gap-1 text-center">
                    {[
                      { action: 'READ', perm: readPerm },
                      { action: 'CREATE', perm: createPerm },
                      { action: 'UPDATE', perm: updatePerm },
                      { action: 'DELETE', perm: deletePerm },
                    ].map(({ action, perm }) => {
                      if (!perm) {
                        return (
                          <div key={action} className="text-[11px] text-slate-300">
                            -
                          </div>
                        );
                      }

                      const isChecked = selectedIds.has(perm.id);

                      return (
                        <div key={action} className="flex items-center justify-center">
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
