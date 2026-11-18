'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateTariffCategory,
  useUpdateTariffCategory,
} from '../../application/use-electricity-calculator.hook';
import type { TariffCategory } from '../../domain/electricity-calculator.types';

interface TariffCategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: TariffCategory | null;
}

export function TariffCategoryFormModal({
  isOpen,
  onClose,
  category,
}: TariffCategoryFormModalProps) {
  const [nameLa, setNameLa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [categoryGroup, setCategoryGroup] = useState<string>('RESIDENTIAL');
  const [voltageLevel, setVoltageLevel] = useState<string>('0.4 kV');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState('');

  const isEdit = Boolean(category);
  const createMutation = useCreateTariffCategory();
  const updateMutation = useUpdateTariffCategory();

  useEffect(() => {
    if (!isOpen) return;

    if (category) {
      setNameLa(category.nameLa || '');
      setNameEn(category.nameEn || '');
      setCategoryGroup(category.categoryGroup || 'RESIDENTIAL');
      setVoltageLevel(category.voltageLevel || '0.4 kV');
      setDescription(category.description || '');
      setOrderIndex(category.orderIndex ?? 0);
      setStatus(category.status || 'ACTIVE');
    } else {
      setNameLa('');
      setNameEn('');
      setCategoryGroup('RESIDENTIAL');
      setVoltageLevel('0.4 kV');
      setDescription('');
      setOrderIndex(0);
      setStatus('ACTIVE');
    }
    setError('');
  }, [category, isOpen]);

  const handleSubmit = async () => {
    const trimmedNameLa = nameLa.trim();

    if (!trimmedNameLa) {
      setError('ກະລຸນາປ້ອນຊື່ປະເພດອັດຕາຄ່າໄຟຟ້າ (ພາສາລາວ)');
      return;
    }

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            nameLa: trimmedNameLa,
            nameEn: nameEn.trim() || undefined,
            categoryGroup: categoryGroup || undefined,
            voltageLevel: voltageLevel.trim() || undefined,
            description: description.trim() || undefined,
            orderIndex: Number(orderIndex),
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          nameLa: trimmedNameLa,
          nameEn: nameEn.trim() || undefined,
          categoryGroup: categoryGroup || undefined,
          voltageLevel: voltageLevel.trim() || undefined,
          description: description.trim() || undefined,
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
      title={isEdit ? 'ແກ້ໄຂປະເພດອັດຕາຄ່າໄຟຟ້າ' : 'ເພີ່ມປະເພດອັດຕາຄ່າໄຟຟ້າໃໝ່'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      size="md"
    >
      <div className="space-y-4 text-sm">
        {error && (
          <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Name Lao */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            ຊື່ປະເພດອັດຕາຄ່າໄຟ (ພາສາລາວ) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="ເຊັ່ນ: ປະເພດທີ່ຢູ່ອາໄສ (Residential)"
            value={nameLa}
            onChange={(e) => {
              setNameLa(e.target.value);
              setError('');
            }}
          />
        </div>

        {/* Name English */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            ຊື່ປະເພດອັດຕາຄ່າໄຟ (ພາສາອັງກິດ)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            placeholder="ເຊັ່ນ: Residential / Household"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
          />
        </div>

        {/* Category Group & Voltage Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              ກຸ່ມປະເພດ (Category Group)
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              value={categoryGroup}
              onChange={(e) => setCategoryGroup(e.target.value)}
            >
              <option value="RESIDENTIAL">🏠 ທີ່ຢູ່ອາໄສ (RESIDENTIAL)</option>
              <option value="NON_RESIDENTIAL">🏢 ບໍ່ແມ່ນທີ່ຢູ່ອາໄສ (NON_RESIDENTIAL)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              ລະດັບແຮງດັນ (Voltage Level)
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              value={voltageLevel}
              onChange={(e) => setVoltageLevel(e.target.value)}
            >
              <option value="0.4 kV">⚡ 0.4 kV (ແຮງດັນຕ່ຳ Low Voltage)</option>
              <option value="22 kV">⚡ 22 kV (ແຮງດັນກາງ Medium Voltage)</option>
              <option value="115 kV">⚡ 115 kV (ແຮງດັນສູງ High Voltage)</option>
              <option value="230 kV">⚡ 230 kV (ແຮງດັນສູງພິເສດ Extra High)</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            ຄຳອະທິບາຍລາຍລະອຽດ
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            placeholder="ເຊັ່ນ: ໄຟຟ້າຮັບໃຊ້ຊີວິດການເປັນຢູ່ຂອງຄົວເຮືອນ ທົ່ວໄປ"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Order Index & Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              ລຳດັບການສະແດງຜົນ
            </label>
            <input
              type="number"
              min={0}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              ສະຖານະ
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
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
