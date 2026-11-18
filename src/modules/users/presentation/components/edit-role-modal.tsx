'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Shield, Check, AlertTriangle, Sparkles, Lock, RotateCcw } from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import { useUpdateUserRole } from '../../application/use-users.hook';
import { useRolesDropdown } from '@/modules/roles/application/use-roles.hook';
import { userApi } from '../../infrastructure/user.api';
import { getUserRoleName, type UserItem, type UserRole, type UserStatus } from '../../domain/user.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { USERS_QUERY_KEY } from '../../application/use-users.hook';
import { PROFILE_QUERY_KEY } from '@/modules/auth/application/use-profile.hook';

interface EditRoleModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_ROLE_METAS: Record<string, { title: string; desc: string; isSystem?: boolean }> = {
  SUPERADMIN: {
    title: 'Super Admin',
    desc: 'ສິດທິສູງສຸດ ຄຸ້ມຄອງທຸກລະບົບ ແລະ ຈັດການຜູ້ໃຊ້ທັງໝົດ (Bypass Permission Checks)',
    isSystem: true,
  },
  ADMIN: {
    title: 'Administrator',
    desc: 'ຜູ້ບໍລິຫານລະບົບ ຄຸ້ມຄອງຂໍ້ມູນທຸລະກິດ, ເນື້ອຫາ ແລະ ໂຄງສ້າງອົງກອນທັງໝົດ',
    isSystem: true,
  },
  EDITOR: {
    title: 'Editor (Content Manager)',
    desc: 'ຜູ້ສ້າງ ແລະ ແກ້ໄຂເນື້ອຫາຂ່າວສານ, ວາລະສານ, ບົດຄວາມ ແລະ ປະກາດສາທາລະນະ',
    isSystem: true,
  },
  STAFF: {
    title: 'Staff (General Viewer)',
    desc: 'ພະນັກງານທົ່ວໄປ ເບິ່ງຂໍ້ມູນອ້າງອີງ ແລະ ລາຍການຕ່າງໆ ແບບອ່ານຢ່າງດຽວ (Read-Only)',
    isSystem: true,
  },
};

const STATUSES: { status: UserStatus; label: string; color: string }[] = [
  { status: 'ACTIVE', label: 'ເປີດໃຊ້ງານ (Active)', color: 'text-emerald-700' },
  { status: 'INACTIVE', label: 'ປິດການໃຊ້ງານ (Inactive)', color: 'text-slate-600' },
  { status: 'SUSPENDED', label: 'ລະງັບການໃຊ້ງານ (Suspended)', color: 'text-rose-600' },
];

export function EditRoleModal({ user, isOpen, onClose }: EditRoleModalProps) {
  const queryClient = useQueryClient();
  const { data: dynamicRoles = [], isLoading: isLoadingRoles } = useRolesDropdown();
  const updateMutation = useUpdateUserRole();

  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('ACTIVE');
  const [resetCustomPermissions, setResetCustomPermissions] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialRoleName = user ? (getUserRoleName(user.role) as UserRole) || 'STAFF' : 'STAFF';
  const customPermCount = user?.userPermissions?.length || 0;
  const isRoleChanged = selectedRole !== initialRoleName;

  useEffect(() => {
    if (user) {
      const roleName = (getUserRoleName(user.role) as UserRole) || 'STAFF';
      setSelectedRole(roleName);
      setSelectedStatus(user.status);
      setResetCustomPermissions(true);
    }
  }, [user]);

  // ລວມລາຍຊື່ Roles ທັງ Standard ແລະ Dynamic ຈາກ Backend
  const availableRoles = useMemo(() => {
    const list: { role: UserRole; title: string; desc: string; isSystem?: boolean }[] = [];
    const seen = new Set<string>();

    // 1. Roles ຈາກ Backend API Dropdown (ຖ້າມີ)
    dynamicRoles.forEach((r) => {
      const meta = DEFAULT_ROLE_METAS[r.name] || {
        title: r.name,
        desc: r.description || 'ບົດບາດກຳນົດເອງໃນລະບົບ',
        isSystem: false,
      };
      seen.add(r.name);
      list.push({
        role: r.name as UserRole,
        title: meta.title,
        desc: r.description || meta.desc,
        isSystem: meta.isSystem,
      });
    });

    // 2. Fallback Standard Roles ຖ້າ Backend Dropdown ຍັງບໍ່ສົ່ງມາ
    Object.entries(DEFAULT_ROLE_METAS).forEach(([roleKey, meta]) => {
      if (!seen.has(roleKey)) {
        list.push({
          role: roleKey as UserRole,
          title: meta.title,
          desc: meta.desc,
          isSystem: meta.isSystem,
        });
      }
    });

    return list;
  }, [dynamicRoles]);

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. ອັບເດດ Role & Status ຂອງຜູ້ໃຊ້
      await updateMutation.mutateAsync({
        id: user.id,
        payload: {
          role: selectedRole,
          status: selectedStatus,
        },
      });

      // 2. ຖ້າມີການປ່ຽນ Role ແລະ ເລືອກ Reset Custom Permissions (ລົບ Override ALLOW / DENY ເກົ່າອອກ)
      if (isRoleChanged && resetCustomPermissions && customPermCount > 0) {
        try {
          await userApi.assignPermissions(user.id, {
            permissionIds: [],
            deniedPermissionIds: [],
          });
        } catch {
          // Non-blocking fallback
        }
      }

      // 3. Invalidate Queries ເພື່ອດຶງຂໍ້ມູນສິດທິໃໝ່
      await queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });

      toast.success('ອັບເດດສິດທິບົດບາດຜູ້ໃຊ້ງານສຳເລັດແລ້ວ');
      onClose();
    } catch {
      // Error handled by mutation hook toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="ປ່ຽນສິດທິ ແລະ ສະຖານະຜູ້ໃຊ້ງານ"
      description={`ຈັດການບົດບາດສິດທິສຳລັບ ${user.firstName} ${user.lastName} (${user.employeeCode})`}
      size="md"
      onSubmit={handleSubmit}
      submitLabel="ບັນທຶກການປ່ຽນແປງ"
      isSubmitting={isSubmitting || updateMutation.isPending}
    >
      <div className="space-y-5">
        {/* Role Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ເລືອກສິດທິບົດບາດຫຼັກ (User Role)
            </label>
            {customPermCount > 0 && (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                ມີ {customPermCount} ສິດທິພິເສດ (Overrides)
              </span>
            )}
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {availableRoles.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={cn(
                    'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/10'
                      : 'border-slate-200/80 hover:bg-slate-50/70 bg-white'
                  )}
                >
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <Shield
                        className={cn(
                          'h-3.5 w-3.5 shrink-0',
                          isSelected ? 'text-blue-600' : 'text-slate-400'
                        )}
                      />
                      <span className="text-xs font-bold text-slate-800">
                        {r.title}
                      </span>
                      {r.isSystem && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200/60">
                          System
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {r.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Warning & Reset Override Checkbox when changing Role */}
        {isRoleChanged && customPermCount > 0 && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">ກວດພົບສິດທິພິເສດ (Custom Overrides) ເກົ່າຕົກຄ້າງ</p>
                <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                  ຜູ້ໃຊ້ນີ້ເຄີຍຖືກກຳນົດສິດຍ່ອຍໄວ້ {customPermCount} ສິດທິ. ເມື່ອປ່ຽນໄປບົດບາດໃໝ່ ({selectedRole}) ຄວນຣີເຊັດສິດເກົ່າອອກ ເພື່ອປ້ອງກັນບໍ່ໃຫ້ສິດເກົ່າຍັງສາມາດເຫັນ ຫຼື ເຂົ້າເຖິງໄດ້.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1.5 border-t border-amber-200/60 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={resetCustomPermissions}
                onChange={(e) => setResetCustomPermissions(e.target.checked)}
                className="rounded border-amber-300 text-blue-600 focus:ring-blue-500/20 h-4 w-4"
              />
              <span className="text-xs">
                ຣີເຊັດສິດທິພິເສດເກົ່າ (Reset custom overrides to match new role)
              </span>
            </label>
          </div>
        )}

        {/* Status Selection */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ສະຖານະບັນຊີ (Account Status)
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
          >
            {STATUSES.map((s) => (
              <option key={s.status} value={s.status} className={s.color}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </FormModal>
  );
}
