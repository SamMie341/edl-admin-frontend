'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateNewsCategory,
  useUpdateNewsCategory,
} from '../../application/use-news.hook';
import type {
  NewsCategoryItem,
  CommonStatus,
} from '../../domain/news.types';

interface NewsCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: NewsCategoryItem | null;
}

export function NewsCategoryModal({
  isOpen,
  onClose,
  category,
}: NewsCategoryModalProps) {
  const isEdit = Boolean(category);
  const createMutation = useCreateNewsCategory();
  const updateMutation = useUpdateNewsCategory();

  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [status, setStatus] = useState<CommonStatus>('ACTIVE');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (category) {
      setCategoryName(category.categoryName || '');
      setDescription(category.description || '');
      setOrderIndex(category.orderIndex || 0);
      setStatus(category.status || 'ACTIVE');
    } else {
      setCategoryName('');
      setDescription('');
      setOrderIndex(0);
      setStatus('ACTIVE');
    }
    setErrors({});
  }, [category, isOpen]);

  const handleSubmit = async () => {
    if (!categoryName.trim()) {
      setErrors({ categoryName: 'ກະລຸນາປ້ອນຊື່ໝວດໝູ່' });
      return;
    }

    try {
      const payload = {
        categoryName: categoryName.trim(),
        description: description.trim() || undefined,
        orderIndex: Number(orderIndex) || 0,
        status,
      };

      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch {
      // Handled by hook toasts
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂໝວດໝູ່ຂ່າວສານ' : 'ສ້າງໝວດໝູ່ຂ່າວສານໃໝ່'}
      description="ຈັດໝວດໝູ່ຂ່າວສານເພື່ອຄວາມເປັນລະບຽບຮຽບຮ້ອຍ"
      size="md"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກ' : 'ສ້າງໝວດໝູ່'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {/* Category Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຊື່ໝວດໝູ່ຂ່າວ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="ເຊັ່ນ: ຂ່າວການເຄື່ອນໄຫວ, ຂ່າວສັງຄົມ..."
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
          {errors.categoryName && (
            <p className="text-[11px] text-rose-500">{errors.categoryName}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຄຳອະທິບາຍເພີ່ມເຕີມ
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ລາຍລະອຽດຫຍໍ້ກ່ຽວກັບໝວດໝູ່ນີ້..."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Order Index */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ລຳດັບ (Order Index)
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະຖານະ
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CommonStatus)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              <option value="ACTIVE">ເປີດໃຊ້ງານ (Active)</option>
              <option value="INACTIVE">ປິດໃຊ້ງານ (Inactive)</option>
            </select>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
