'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateNewsTag,
  useUpdateNewsTag,
} from '../../application/use-news.hook';
import type { NewsTagItem } from '../../domain/news.types';

interface NewsTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: NewsTagItem | null;
}

export function NewsTagModal({ isOpen, onClose, tag }: NewsTagModalProps) {
  const isEdit = Boolean(tag);
  const createMutation = useCreateNewsTag();
  const updateMutation = useUpdateNewsTag();

  const [tagName, setTagName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (tag) {
      setTagName(tag.tagName || '');
    } else {
      setTagName('');
    }
    setErrors({});
  }, [tag, isOpen]);

  const handleSubmit = async () => {
    const trimmed = tagName.trim().replace(/^#/, '');
    if (!trimmed) {
      setErrors({ tagName: 'ກະລຸນາປ້ອນຊື່ແທັກ' });
      return;
    }

    try {
      const payload = { tagName: trimmed };

      if (isEdit && tag) {
        await updateMutation.mutateAsync({
          id: tag.id,
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
      title={isEdit ? 'ແກ້ໄຂແທັກຂ່າວສານ' : 'ສ້າງແທັກຂ່າວສານໃໝ່'}
      description="ເພີ່ມແທັກ (Tags) ເພື່ອຊ່ວຍໃນການຄົ້ນຫາ ແລະ ຈັດໝວດໝູ່ຂ່າວ"
      size="sm"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກ' : 'ສ້າງແທັກ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຊື່ແທັກ (Tag Name) <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-xs font-bold text-slate-400">
              #
            </span>
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="ໄຟຟ້າລາວ, ພະລັງງານສະອາດ, ..."
              className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>
          {errors.tagName && (
            <p className="text-[11px] text-rose-500">{errors.tagName}</p>
          )}
        </div>
      </div>
    </FormModal>
  );
}
