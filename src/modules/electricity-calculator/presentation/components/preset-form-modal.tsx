'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateAppliancePreset,
  useUpdateAppliancePreset,
  useApplianceCategories,
} from '../../application/use-electricity-calculator.hook';
import type { AppliancePreset } from '../../domain/electricity-calculator.types';

interface PresetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset?: AppliancePreset | null;
  defaultCategoryId?: number;
}

export function PresetFormModal({
  isOpen,
  onClose,
  preset,
  defaultCategoryId,
}: PresetFormModalProps) {
  const { data: categories = [] } = useApplianceCategories();

  const [categoryId, setCategoryId] = useState<number>(defaultCategoryId || 1);
  const [nameLa, setNameLa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [defaultWatt, setDefaultWatt] = useState<number>(1000);
  const [defaultQuantity, setDefaultQuantity] = useState<number>(1);
  const [defaultHoursPerDay, setDefaultHoursPerDay] = useState<number>(8);
  const [defaultDaysPerMonth, setDefaultDaysPerMonth] = useState<number>(30);
  const [isSampleDefault, setIsSampleDefault] = useState(false);
  const [orderIndex, setOrderIndex] = useState(1);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState('');

  const isEdit = Boolean(preset);
  const createMutation = useCreateAppliancePreset();
  const updateMutation = useUpdateAppliancePreset();

  useEffect(() => {
    if (!isOpen) return;

    if (preset) {
      setCategoryId(preset.categoryId);
      setNameLa(preset.nameLa || '');
      setNameEn(preset.nameEn || '');
      setDefaultWatt(preset.defaultWatt || 100);
      setDefaultQuantity(preset.defaultQuantity || 1);
      setDefaultHoursPerDay(Number(preset.defaultHoursPerDay) || 8);
      setDefaultDaysPerMonth(preset.defaultDaysPerMonth || 30);
      setIsSampleDefault(Boolean(preset.isSampleDefault));
      setOrderIndex(preset.orderIndex ?? 1);
      setStatus(preset.status || 'ACTIVE');
    } else {
      if (defaultCategoryId) {
        setCategoryId(defaultCategoryId);
      } else if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      setNameLa('');
      setNameEn('');
      setDefaultWatt(1000);
      setDefaultQuantity(1);
      setDefaultHoursPerDay(8);
      setDefaultDaysPerMonth(30);
      setIsSampleDefault(false);
      setOrderIndex(1);
      setStatus('ACTIVE');
    }
    setError('');
  }, [preset, isOpen, defaultCategoryId, categories]);

  const handleSubmit = async () => {
    const trimmedNameLa = nameLa.trim();

    if (!categoryId) {
      setError('ກະລຸນາເລືອກໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ');
      return;
    }
    if (!trimmedNameLa) {
      setError('ກະລຸນາປ້ອນຊື່ເຄື່ອງໃຊ້ໄຟຟ້າພາສາລາວ');
      return;
    }
    if (!defaultWatt || defaultWatt <= 0) {
      setError('ກະລຸນາລະບຸກຳລັງໄຟຟ້າ (Watt) ທີ່ຖືກຕ້ອງ');
      return;
    }

    try {
      if (isEdit && preset) {
        await updateMutation.mutateAsync({
          id: preset.id,
          payload: {
            categoryId: Number(categoryId),
            nameLa: trimmedNameLa,
            nameEn: nameEn.trim() || undefined,
            defaultWatt: Number(defaultWatt),
            defaultQuantity: Number(defaultQuantity),
            defaultHoursPerDay: Number(defaultHoursPerDay),
            defaultDaysPerMonth: Number(defaultDaysPerMonth),
            isSampleDefault,
            orderIndex: Number(orderIndex),
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          categoryId: Number(categoryId),
          nameLa: trimmedNameLa,
          nameEn: nameEn.trim() || undefined,
          defaultWatt: Number(defaultWatt),
          defaultQuantity: Number(defaultQuantity),
          defaultHoursPerDay: Number(defaultHoursPerDay),
          defaultDaysPerMonth: Number(defaultDaysPerMonth),
          isSampleDefault,
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
      title={isEdit ? 'ແກ້ໄຂເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບ' : 'ເພີ່ມເຄື່ອງໃຊ້ໄຟຟ້າຕົ້ນແບບໃໝ່'}
      description="ກຳນົດຄ່າເລີ່ມຕົ້ນຂອງກຳລັງໄຟ (W) ແລະ ຊົ່ວໂມງໃຊ້ງານສຳລັບເຄື່ອງໃຊ້ໄຟຟ້າ"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມຕົ້ນແບບ'}
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
            ໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ <span className="text-rose-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameLa}{c.nameEn ? ` (${c.nameEn})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
              placeholder="ແອ 12,000 BTU, ຕູ້ເຢັນ 2 ປະຕູ, etc."
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
              placeholder="Air Conditioner 12,000 BTU"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Electrical & Usage Presets */}
        <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100/80 space-y-3">
          <span className="text-xs font-bold text-blue-900 block">
            ຄ່າເລີ່ມຕົ້ນການໃຊ້ພະລັງງານໄຟຟ້າ (Default Usage Parameters)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ກຳລັງໄຟ (Watt) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={defaultWatt}
                onChange={(e) => setDefaultWatt(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ຈຳນວນເລີ່ມຕົ້ນ (ເຄື່ອງ)
              </label>
              <input
                type="number"
                value={defaultQuantity}
                onChange={(e) => setDefaultQuantity(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ຊົ່ວໂມງ/ມື້
              </label>
              <input
                type="number"
                step="0.5"
                value={defaultHoursPerDay}
                onChange={(e) => setDefaultHoursPerDay(Number(e.target.value))}
                min={0.1}
                max={24}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ມື້/ເດືອນ
              </label>
              <input
                type="number"
                value={defaultDaysPerMonth}
                onChange={(e) => setDefaultDaysPerMonth(Number(e.target.value))}
                min={1}
                max={31}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="text-[11px] text-blue-700/80 font-medium pt-1">
            ⚡ ຄຳນວນຄາດຄະເນ: {((defaultWatt * defaultQuantity * defaultHoursPerDay * defaultDaysPerMonth) / 1000).toFixed(1)} kWh / ເດືອນ
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-center">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ລຳດັບ (Order Index)
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              min={1}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະຖານະ (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            >
              <option value="ACTIVE">ເປີດໃຊ້ງານ (ACTIVE)</option>
              <option value="INACTIVE">ປິດໃຊ້ງານ (INACTIVE)</option>
            </select>
          </div>

          <div className="pt-5 sm:pt-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSampleDefault}
                onChange={(e) => setIsSampleDefault(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                ໂຫຼດເປັນລາຍການຕົວຢ່າງ (Sample Default)
              </span>
            </label>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
