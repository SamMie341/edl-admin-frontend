'use client';

import React, { useState } from 'react';
import { UserPlus, Sparkles, AlertCircle } from 'lucide-react';
import { FormModal } from '@/core/presentation/components/shared';
import { useSyncUser } from '../../application/use-users.hook';

interface SyncUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncUserModal({ isOpen, onClose }: SyncUserModalProps) {
  const [empCode, setEmpCode] = useState('');
  const [error, setError] = useState('');
  const syncUserMutation = useSyncUser();

  const handleSync = async () => {
    const trimmed = empCode.trim();
    if (!trimmed) {
      setError('ກະລຸນາປ້ອນລະຫັດພະນັກງານ');
      return;
    }

    try {
      await syncUserMutation.mutateAsync(trimmed);
      setEmpCode('');
      setError('');
      onClose();
    } catch {
      // Error handled by hook toast
    }
  };

  const handleClose = () => {
    setEmpCode('');
    setError('');
    onClose();
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="ຊິ້ງຂໍ້ມູນພະນັກງານຈາກ HRM"
      description="ດຶງຂໍ້ມູນພະນັກງານຈາກລະບົບ HRM ຟຟລ ເພື່ອສ້າງບັນຊີເຂົ້າໃຊ້ງານລະບົບ Admin"
      size="md"
      onSubmit={handleSync}
      submitLabel="ເລີ່ມຊິ້ງຂໍ້ມູນ"
      isSubmitting={syncUserMutation.isPending}
    >
      <div className="space-y-4">
        {/* Notice Card */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-blue-800">
          <Sparkles className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">ຂໍ້ແນະນຳການສ້າງບັນຊີໃໝ່:</p>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              ຖ້າພະນັກງານຍັງບໍ່ມີບັນຊີໃນລະບົບ, ລະບົບຈະສ້າງບັນຊີໃໝ່ໂດຍຕັ້ງລະຫັດຜ່ານເລີ່ມຕົ້ນເປັນ{' '}
              <code className="px-1 py-0.5 rounded bg-blue-100 font-mono font-bold">
                edl[ລະຫັດພະນັກງານ]
              </code>{' '}
              ແລະ ກຳນົດສິດເລີ່ມຕົ້ນເປັນ <strong>ADMIN</strong>
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-1.5">
          <label
            htmlFor="sync-emp-code"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
          >
            ລະຫັດພະນັກງານ (Employee Code) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="sync-emp-code"
              type="text"
              value={empCode}
              onChange={(e) => {
                setEmpCode(e.target.value);
                if (error) setError('');
              }}
              placeholder="ຕົວຢ່າງ: 10001, 10002"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-rose-500">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}
