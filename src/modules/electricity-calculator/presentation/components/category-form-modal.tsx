'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateApplianceCategory,
  useUpdateApplianceCategory,
} from '../../application/use-electricity-calculator.hook';
import type { ApplianceCategory } from '../../domain/electricity-calculator.types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ApplianceCategory | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
}: CategoryFormModalProps) {
  const [nameLa, setNameLa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState('');

  const isEdit = Boolean(category);
  const createMutation = useCreateApplianceCategory();
  const updateMutation = useUpdateApplianceCategory();

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      setNameLa(category.nameLa || '');
      setNameEn(category.nameEn || '');
      setOrderIndex(category.orderIndex ?? 1);
      setStatus(category.status || 'ACTIVE');
    } else {
      setNameLa('');
      setNameEn('');
      setOrderIndex(1);
      setStatus('ACTIVE');
    }
    setError('');
  }, [category, isOpen]);

  const handleSubmit = async () => {
    const trimmedNameLa = nameLa.trim();

    if (!trimmedNameLa) {
      setError('ກະລຸນາປ້ອນຊື່ໝວດໝູ່ພາສາລາວ');
      return;
    }

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            nameLa: trimmedNameLa,
            nameEn: nameEn.trim() || undefined,
            orderIndex: Number(orderIndex),
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          nameLa: trimmedNameLa,
          nameEn: nameEn.trim() || undefined,
          orderIndex: Number(orderIndex),
          status,
        });
      }
      onClose();
    } catch {
      // Handled by hook toast
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ' : 'ເພີ່ມໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າໃໝ່'}
      description="ຄຸ້ມຄອງໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າສຳລັບລະບົບປະເມີນ ແລະ ຄິດໄລ່ຄ່າໄຟ"
      size="md"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມໝວດໝູ່'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຊື່ພາສາລາວ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={nameLa}
            onChange={(e) => {
              setNameLa(e.target.value);
              if (error) setError('');
            }}
            placeholder="ເຄື່ອງປັບອາກາດ (ແອ), ຕູ້ເຢັນ, ດອກໄຟ, etc."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຊື່ພາສາອັງກິດ (Name EN)
          </label>
          <input
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Air Conditioner, Refrigerator, etc."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ລຳດັບການສະແດງ
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              min={1}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະຖານະ (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
            >
              <option value="ACTIVE">ເປີດໃຊ້ງານ (ACTIVE)</option>
              <option value="INACTIVE">ປິດໃຊ້ງານ (INACTIVE)</option>
            </select>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
