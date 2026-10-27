'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import { useChangePassword } from '../../application/use-users.hook';
import type { UserItem } from '../../domain/user.types';

interface ChangePasswordModalProps {
  user: UserItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({
  user,
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const changePasswordMutation = useChangePassword();

  const handleReset = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (newPassword.length < 6) {
      setError('ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('ລະຫັດຜ່ານຢືນຢັນບໍ່ກົງກັນ');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        id: user.id,
        payload: {
          newPassword,
          confirmPassword,
        },
      });
      handleReset();
    } catch {
      // Error handled by hook
    }
  };

  if (!user) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleReset}
      title="Reset ລະຫັດຜ່ານຜູ້ໃຊ້ງານ"
      description={`ຕັ້ງລະຫັດຜ່ານໃໝ່ສຳລັບ ${user.firstName} ${user.lastName} (${user.employeeCode})`}
      size="md"
      onSubmit={handleSubmit}
      submitLabel="ປ່ຽນລະຫັດຜ່ານ"
      isSubmitting={changePasswordMutation.isPending}
    >
      <div className="space-y-4">
        {/* Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 flex items-start gap-3 text-xs text-amber-800">
          <KeyRound className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            ການ Reset ລະຫັດຜ່ານຈະມີຜົນທັນທີ. ຫຼັງຈາກປ່ຽນແລ້ວ
            ກະລຸນາແຈ້ງລະຫັດໃໝ່ໃຫ້ພະນັກງານເຈົ້າຂອງບັນຊີ.
          </p>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ລະຫັດຜ່ານໃໝ່ (New Password) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="ປ້ອນຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ..."
              className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຢືນຢັນລະຫັດຜ່ານໃໝ່ (Confirm Password) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="ປ້ອນລະຫັດຜ່ານອີກຄັ້ງ..."
              className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </FormModal>
  );
}
