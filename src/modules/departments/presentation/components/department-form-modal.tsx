'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateDepartment,
  useUpdateDepartment,
} from '../../application/use-departments.hook';
import type { DepartmentItem } from '../../domain/department.types';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: DepartmentItem | null;
}

export function DepartmentFormModal({
  isOpen,
  onClose,
  department,
}: DepartmentFormModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const isEdit = Boolean(department);
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  useEffect(() => {
    if (!isOpen) return;

    if (department) {
      setName(department.name || '');
    } else {
      setName('');
    }
    setError('');
  }, [department, isOpen]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('ກະລຸນາປ້ອນຊື່ຝ່າຍ');
      return;
    }

    try {
      if (isEdit && department) {
        await updateMutation.mutateAsync({
          id: department.id,
          payload: { name: trimmed },
        });
      } else {
        await createMutation.mutateAsync({ name: trimmed });
      }
      onClose();
    } catch {
      // Handled by hook
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂຂໍ້ມູນຝ່າຍ' : 'ເພີ່ມຂໍ້ມູນຝ່າຍໃໝ່'}
      description="ຄຸ້ມຄອງຂໍ້ມູນຝ່າຍໃນໂຄງສ້າງການບໍລິຫານຂອງ ຟຟລ"
      size="md"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມຝ່າຍໃໝ່'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຊື່ຝ່າຍ (Department Name) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="ຕົວຢ່າງ: ຝ່າຍເຕັກໂນໂລຢີຂໍ້ມູນຂ່າວສານ, ຝ່າຍຈັດຕັ້ງ ແລະ ບໍລິຫານ"
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
            autoFocus
          />
          {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        </div>
      </div>
    </FormModal>
  );
}
