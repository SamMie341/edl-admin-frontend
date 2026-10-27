'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import { useUpdateUserRole } from '../../application/use-users.hook';
import type { UserItem, UserRole, UserStatus } from '../../domain/user.types';
import { cn } from '@/lib/utils';

interface EditRoleModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ROLES: { role: UserRole; title: string; desc: string }[] = [
  {
    role: 'SUPERADMIN',
    title: 'Super Admin',
    desc: 'ສິດທິສູງສຸດ ຄຸ້ມຄອງທຸກລະບົບ ແລະ ຈັດການຜູ້ໃຊ້ທັງໝົດ',
  },
  {
    role: 'ADMIN',
    title: 'Administrator',
    desc: 'ຜູ້ບໍລິຫານລະບົບ ຄຸ້ມຄອງເນື້ອຫາ ແລະ ໂມດູນຕ່າງໆ',
  },
  {
    role: 'EDITOR',
    title: 'Editor',
    desc: 'ຜູ້ສ້າງ ແລະ ແກ້ໄຂເນື້ອຫາຂ່າວສານ, ວາລະສານ ແລະ ບົດຄວາມ',
  },
  {
    role: 'STAFF',
    title: 'Staff',
    desc: 'ພະນັກງານທົ່ວໄປ ສາມາດເບິ່ງຂໍ້ມູນ ແລະ ຈັດການບາງສ່ວນ',
  },
];

const STATUSES: { status: UserStatus; label: string; color: string }[] = [
  { status: 'ACTIVE', label: 'ເປີດໃຊ້ງານ (Active)', color: 'text-emerald-700' },
  { status: 'INACTIVE', label: 'ປິດການໃຊ້ງານ (Inactive)', color: 'text-slate-600' },
  { status: 'SUSPENDED', label: 'ລະງັບການໃຊ້ງານ (Suspended)', color: 'text-rose-600' },
];

export function EditRoleModal({ user, isOpen, onClose }: EditRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('ACTIVE');
  const updateMutation = useUpdateUserRole();

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedStatus(user.status);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    try {
      await updateMutation.mutateAsync({
        id: user.id,
        payload: {
          role: selectedRole,
          status: selectedStatus,
        },
      });
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  if (!user) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="ປ່ຽນສິດທິ ແລະ ສະຖານະຜູ້ໃຊ້ງານ"
      description={`ຈັດການສິດທິສຳລັບ ${user.firstName} ${user.lastName} (${user.employeeCode})`}
      size="md"
      onSubmit={handleSubmit}
      submitLabel="ບັນທຶກການປ່ຽນແປງ"
      isSubmitting={updateMutation.isPending}
    >
      <div className="space-y-5">
        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ເລືອກສິດທິການເຂົ້າເຖິງ (User Role)
          </label>
          <div className="space-y-2">
            {ROLES.map((r) => {
              const isSelected = selectedRole === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => setSelectedRole(r.role)}
                  className={cn(
                    'p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between',
                    isSelected
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/10'
                      : 'border-slate-200/80 hover:bg-slate-50/70 bg-white'
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <Shield
                        className={cn(
                          'h-3.5 w-3.5',
                          isSelected ? 'text-blue-600' : 'text-slate-400'
                        )}
                      />
                      <span>{r.title}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{r.desc}</p>
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
