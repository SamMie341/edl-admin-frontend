'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateSavingTemplate,
  useUpdateSavingTemplate,
  useApplianceCategories,
} from '../../application/use-electricity-calculator.hook';
import type {
  SavingActionTemplate,
  EffortLevel,
  SavingRuleType,
} from '../../domain/electricity-calculator.types';

interface SavingTemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: SavingActionTemplate | null;
  defaultCategoryId?: number;
}

export function SavingTemplateFormModal({
  isOpen,
  onClose,
  template,
  defaultCategoryId,
}: SavingTemplateFormModalProps) {
  const { data: categories = [] } = useApplianceCategories();

  const [categoryId, setCategoryId] = useState<number>(defaultCategoryId || 1);
  const [titleLa, setTitleLa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [descriptionLa, setDescriptionLa] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('EASY');
  const [ruleType, setRuleType] = useState<SavingRuleType>('FIXED_FRACTION');

  // Rule specific fields
  const [fixedPercent, setFixedPercent] = useState<number>(15); // e.g. 15% -> 0.15
  const [reduceHoursBy, setReduceHoursBy] = useState<number>(2);
  const [targetWattLow, setTargetWattLow] = useState<number>(9);
  const [targetWattHigh, setTargetWattHigh] = useState<number>(16);

  const [defaultSelected, setDefaultSelected] = useState(false);
  const [orderIndex, setOrderIndex] = useState(1);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState('');

  const isEdit = Boolean(template);
  const createMutation = useCreateSavingTemplate();
  const updateMutation = useUpdateSavingTemplate();

  useEffect(() => {
    if (!isOpen) return;

    if (template) {
      setCategoryId(template.categoryId);
      setTitleLa(template.titleLa || '');
      setTitleEn(template.titleEn || '');
      setDescriptionLa(template.descriptionLa || '');
      setDescriptionEn(template.descriptionEn || '');
      setEffortLevel(template.effortLevel || 'EASY');
      setRuleType(template.ruleType || 'FIXED_FRACTION');

      setFixedPercent(
        template.fixedFraction != null
          ? Math.round(Number(template.fixedFraction) * 100)
          : 15
      );
      setReduceHoursBy(Number(template.reduceHoursBy) || 2);
      setTargetWattLow(Number(template.targetWattLow) || 9);
      setTargetWattHigh(Number(template.targetWattHigh) || 16);

      setDefaultSelected(Boolean(template.defaultSelected));
      setOrderIndex(template.orderIndex ?? 1);
      setStatus(template.status || 'ACTIVE');
    } else {
      if (defaultCategoryId) {
        setCategoryId(defaultCategoryId);
      } else if (categories.length > 0) {
        setCategoryId(categories[0].id);
      }
      setTitleLa('');
      setTitleEn('');
      setDescriptionLa('');
      setDescriptionEn('');
      setEffortLevel('EASY');
      setRuleType('FIXED_FRACTION');
      setFixedPercent(15);
      setReduceHoursBy(2);
      setTargetWattLow(9);
      setTargetWattHigh(16);
      setDefaultSelected(false);
      setOrderIndex(1);
      setStatus('ACTIVE');
    }
    setError('');
  }, [template, isOpen, defaultCategoryId, categories]);

  const handleSubmit = async () => {
    const trimmedTitleLa = titleLa.trim();
    const trimmedDescLa = descriptionLa.trim();

    if (!categoryId) {
      setError('ກະລຸນາເລືອກໝວດໝູ່ເຄື່ອງໃຊ້ໄຟຟ້າ');
      return;
    }
    if (!trimmedTitleLa) {
      setError('ກະລຸນາປ້ອນຫົວຂໍ້ວິທີປະຢັດໄຟພາສາລາວ');
      return;
    }
    if (!trimmedDescLa) {
      setError('ກະລຸນາປ້ອນຄຳອະທິບາຍວິທີປະຢັດໄຟພາສາລາວ');
      return;
    }

    const payloadData = {
      categoryId: Number(categoryId),
      titleLa: trimmedTitleLa,
      titleEn: titleEn.trim() || undefined,
      descriptionLa: trimmedDescLa,
      descriptionEn: descriptionEn.trim() || undefined,
      effortLevel,
      ruleType,
      fixedFraction:
        ruleType === 'FIXED_FRACTION' ? Number(fixedPercent) / 100 : null,
      reduceHoursBy: ruleType === 'REDUCE_HOURS' ? Number(reduceHoursBy) : null,
      targetWattLow:
        ruleType === 'REPLACE_WATTAGE' ? Number(targetWattLow) : null,
      targetWattHigh:
        ruleType === 'REPLACE_WATTAGE' ? Number(targetWattHigh) : null,
      defaultSelected,
      orderIndex: Number(orderIndex),
      status,
    };

    try {
      if (isEdit && template) {
        await updateMutation.mutateAsync({
          id: template.id,
          payload: payloadData,
        });
      } else {
        await createMutation.mutateAsync(payloadData);
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
      title={isEdit ? 'ແກ້ໄຂແມ່ແບບວິທີປະຢັດໄຟ' : 'ເພີ່ມແມ່ແບບວິທີປະຢັດໄຟໃໝ່'}
      description="ກຳນົດເງື່ອນໄຂສູດການຄິດໄລ່ ແລະ ປະເມີນພະລັງງານໄຟຟ້າທີ່ປະຢັດໄດ້"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມແມ່ແບບ'}
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
            ໝວດໝູ່ທີ່ກ່ຽວຂ້ອງ <span className="text-rose-500">*</span>
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
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
              ຫົວຂໍ້ພາສາລາວ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={titleLa}
              onChange={(e) => {
                setTitleLa(e.target.value);
                if (error) setError('');
              }}
              placeholder="ຕັ້ງອຸນຫະພູມແອ 26°C, ປ່ຽນເປັນດອກໄຟ LED"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຫົວຂໍ້ພາສາອັງກິດ (Title EN)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Set AC temperature to 26°C, Switch to LED"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຄຳອະທິບາຍພາສາລາວ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={descriptionLa}
              onChange={(e) => {
                setDescriptionLa(e.target.value);
                if (error) setError('');
              }}
              placeholder="ອະທິບາຍວິທີປະຕິບັດ ແລະ ປະສິດທິຜົນ..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຄຳອະທິບາຍພາສາອັງກິດ
            </label>
            <textarea
              rows={2}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Action details and benefits in English..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 resize-none"
            />
          </div>
        </div>

        {/* Calculation Rule Configuration */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100/80 space-y-3">
          <span className="text-xs font-bold text-indigo-900 block">
            ຮູບແບບການປະເມີນ ແລະ ສູດຄິດໄລ່ (Calculation Rule & Formula)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ລະດັບຄວາມພະຍາຍາມ (Effort Level)
              </label>
              <select
                value={effortLevel}
                onChange={(e) => setEffortLevel(e.target.value as EffortLevel)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="EASY">ງ່າຍ / ປັບພຶດຕິກຳ (Easy - ບໍ່ມີຄ່າໃຊ້ຈ່າຍ)</option>
                <option value="LOW_COST">ລົງທຶນໜ້ອຍ (Low Cost - ເຊັ່ນ ປ່ຽນດອກໄຟ LED)</option>
                <option value="INVESTMENT">ລົງທຶນສູງ (Investment - ເຊັ່ນ ປ່ຽນແອ Inverter)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ປະເພດສູດຄິດໄລ່ (Rule Type)
              </label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as SavingRuleType)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="FIXED_FRACTION">ຫຼຸດຕາມເປີເຊັນຄົງທີ່ (Fixed Percentage %)</option>
                <option value="REDUCE_HOURS">ຫຼຸດຊົ່ວໂມງໃຊ້ງານຕໍ່ມື້ (Reduce Hours)</option>
                <option value="REPLACE_WATTAGE">ປ່ຽນກຳລັງໄຟຟ້າວັດ (Replace Wattage)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Rule Parameters */}
          {ruleType === 'FIXED_FRACTION' && (
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ເປີເຊັນພະລັງງານທີ່ປະຢັດໄດ້ (% Saving Fraction)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={fixedPercent}
                  onChange={(e) => setFixedPercent(Number(e.target.value))}
                  min={1}
                  max={90}
                  className="w-32 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                />
                <span className="text-xs font-semibold text-indigo-700">% ຂອງພະລັງງານທີ່ເຄື່ອງໃຊ້ນັ້ນໃຊ້</span>
              </div>
            </div>
          )}

          {ruleType === 'REDUCE_HOURS' && (
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] font-semibold text-slate-700">
                ຫຼຸດຊົ່ວໂມງໃຊ້ງານລົງ (ຊົ່ວໂມງ/ມື້)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  value={reduceHoursBy}
                  onChange={(e) => setReduceHoursBy(Number(e.target.value))}
                  min={0.1}
                  max={24}
                  className="w-32 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                />
                <span className="text-xs font-semibold text-indigo-700">ຊົ່ວໂມງຕໍ່ມື້</span>
              </div>
            </div>
          )}

          {ruleType === 'REPLACE_WATTAGE' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  ກຳລັງວັດເປົ້າໝາຍຕໍ່າ (Target Watt Low)
                </label>
                <input
                  type="number"
                  value={targetWattLow}
                  onChange={(e) => setTargetWattLow(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700">
                  ກຳລັງວັດເປົ້າໝາຍສູງ (Target Watt High)
                </label>
                <input
                  type="number"
                  value={targetWattHigh}
                  onChange={(e) => setTargetWattHigh(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800"
                />
              </div>
            </div>
          )}
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
                checked={defaultSelected}
                onChange={(e) => setDefaultSelected(e.target.checked)}
                className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-700">
                ເລືອກອັດຕະໂນມັດ (Default Checked)
              </span>
            </label>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
