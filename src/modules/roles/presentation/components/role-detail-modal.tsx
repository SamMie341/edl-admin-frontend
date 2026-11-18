'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Shield,
  Users,
  KeyRound,
  Calendar,
  Lock,
  Edit,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRoleById } from '../../application/use-roles.hook';
import {
  MODULE_METAS,
  MODULE_GROUPS,
  type ModuleMeta,
} from '@/modules/users/presentation/components/assign-permissions-modal';
import type { RoleItem } from '../../domain/role.types';
import type { PermissionAction } from '@/modules/users/domain/user.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RoleDetailModalProps {
  role: RoleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (role: RoleItem) => void;
  onAssignPermissions?: (role: RoleItem) => void;
  canEdit?: boolean;
}

const ACTION_COLORS: Record<PermissionAction, { bg: string; text: string; border: string; label: string }> = {
  READ: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', label: 'ເບິ່ງ (Read)' },
  CREATE: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'ສ້າງ (Create)' },
  UPDATE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'ແກ້ໄຂ (Update)' },
  DELETE: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'ລຶບ (Delete)' },
};

export function RoleDetailModal({
  role,
  isOpen,
  onClose,
  onEdit,
  onAssignPermissions,
  canEdit = true,
}: RoleDetailModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // ດຶງຂໍ້ມູນບົດບາດແບບເຕັມພ້ອມ Relations
  const { data: detailData, isLoading } = useRoleById(isOpen ? role?.id : null);
  const activeRole = detailData || role;

  const isSuperAdmin = activeRole?.name === 'SUPERADMIN';
  const permissions = activeRole?.permissions || [];

  // Group permissions by module
  const modulePermissionsMap = useMemo(() => {
    const map = new Map<string, Set<PermissionAction>>();
    permissions.forEach((p) => {
      if (!map.has(p.module)) {
        map.set(p.module, new Set<PermissionAction>());
      }
      map.get(p.module)!.add(p.action as PermissionAction);
    });
    return map;
  }, [permissions]);

  // Group modules by category/group
  const groupedModules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result: Record<string, { meta: ModuleMeta; actions: PermissionAction[] }[]> = {
      ORGANIZATION: [],
      CONTENT: [],
      PUBLIC_SERVICES: [],
      HR_IAM: [],
    };

    modulePermissionsMap.forEach((actionsSet, moduleKey) => {
      const meta = MODULE_METAS[moduleKey] || {
        module: moduleKey,
        nameLa: moduleKey,
        group: 'HR_IAM' as const,
        icon: Layers,
      };

      const actions = Array.from(actionsSet).sort((a, b) => {
        const order: Record<string, number> = { READ: 1, CREATE: 2, UPDATE: 3, DELETE: 4 };
        return (order[a] || 5) - (order[b] || 5);
      });

      if (term) {
        const matchName = meta.nameLa.toLowerCase().includes(term);
        const matchKey = moduleKey.toLowerCase().includes(term);
        const matchAction = actions.some((a) => a.toLowerCase().includes(term));
        if (!matchName && !matchKey && !matchAction) return;
      }

      const groupKey = meta.group || 'HR_IAM';
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push({ meta, actions });
    });

    return result;
  }, [modulePermissionsMap, searchTerm]);

  const hasAnyPermission = permissions.length > 0;

  if (!isOpen || !role || !activeRole) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shrink-0">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 border border-white/20">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <div className="min-w-0 pr-8">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-200 border border-white/10">
                  ID: #{activeRole.id}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  {activeRole.name}
                </h2>
                {isSuperAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    <Lock className="h-3 w-3" />
                    ລະບົບປົກປ້ອງ (System Locked)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 line-clamp-2">
                {activeRole.description || 'ບໍ່ມີຄຳອະທິບາຍເພີ່ມເຕີມ'}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-indigo-300 shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  ຜູ້ໃຊ້ງານສັງກັດ
                </p>
                <p className="text-sm font-bold text-white">
                  {activeRole.userCount ?? 0} ຄົນ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  ສິດທິທັງໝົດ
                </p>
                <p className="text-sm font-bold text-emerald-300">
                  {permissions.length} ສິດທິ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  ວັນທີສ້າງ
                </p>
                <p className="text-xs font-semibold text-white">
                  {activeRole.createdAt
                    ? format(new Date(activeRole.createdAt), 'dd/MM/yyyy HH:mm')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Search bar inside details */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                ລາຍການສິດທິທີ່ຖືກກຳນົດ ({permissions.length})
              </h3>
            </div>

            {hasAnyPermission && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ຄົ້ນຫາໂມດູນ ຫຼື ສິດທິ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              ກຳລັງໂຫຼດລາຍລະອຽດສິດທິ...
            </div>
          ) : !hasAnyPermission ? (
            <div className="py-14 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <KeyRound className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                ຍັງບໍ່ທັນມີສິດທິຖືກກຳນົດໃຫ້ບົດບາດນີ້
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                ຜູ້ໃຊ້ທີ່ຢູ່ໃນບົດບາດນີ້ຈະບໍ່ສາມາດເຂົ້າເຖິງໂມດູນຕ່າງໆ ໄດ້ ຈົນກວ່າຈະມີການກຳນົດສິດທິ.
              </p>
              {canEdit && onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(activeRole)}
                  className="mt-4 text-xs rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  ກຳນົດສິດທິຕອນນີ້
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedModules).map(([groupKey, moduleEntries]) => {
                if (moduleEntries.length === 0) return null;
                const groupInfo = MODULE_GROUPS[groupKey];

                return (
                  <div
                    key={groupKey}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50/40 space-y-3"
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200/80">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        {groupInfo?.title || groupKey}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-semibold">
                        {moduleEntries.length} ໂມດູນ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {moduleEntries.map(({ meta, actions }) => {
                        const Icon = meta.icon || Layers;
                        return (
                          <div
                            key={meta.module}
                            className="bg-white rounded-xl border border-slate-200/70 p-3 shadow-2xs hover:border-slate-300 transition"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <span className="font-semibold text-slate-800 text-xs truncate">
                                {meta.nameLa}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {actions.map((act) => {
                                const conf = ACTION_COLORS[act] || {
                                  bg: 'bg-slate-100',
                                  text: 'text-slate-700',
                                  border: 'border-slate-200',
                                  label: act,
                                };
                                return (
                                  <span
                                    key={act}
                                    className={cn(
                                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                                      conf.bg,
                                      conf.text,
                                      conf.border
                                    )}
                                  >
                                    <CheckCircle2 className="h-2.5 w-2.5" />
                                    {conf.label}
                                  </span>
                                );
                              })}
                            </div>
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

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            ອັບເດດຫຼ້າສຸດ:{' '}
            {activeRole.updatedAt
              ? format(new Date(activeRole.updatedAt), 'dd/MM/yyyy HH:mm')
              : '-'}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              ປິດໜ້າຕ່າງ
            </Button>
            {canEdit && onAssignPermissions && !isSuperAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onAssignPermissions(activeRole);
                }}
                className="text-xs rounded-xl border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                ກຳນົດສິດທິບົດບາດ
              </Button>
            )}
            {canEdit && onEdit && (
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(activeRole);
                }}
                className="text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                ແກ້ໄຂບົດບາດ & ສິດທິ
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
