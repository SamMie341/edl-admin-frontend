'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useUpsertSchedule,
  useTariffCategories,
} from '../../application/use-electricity-calculator.hook';
import type {
  TariffNotice,
  TariffSchedule,
  TariffTierInput,
} from '../../domain/electricity-calculator.types';
import { Sparkles, Calendar, Zap, AlertCircle } from 'lucide-react';

interface MonthlyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice: TariffNotice | null;
  schedule?: TariffSchedule | null;
  defaultYear?: number;
  defaultMonth?: number;
  defaultCategoryId?: number;
}

const DEFAULT_TIERS_2026: TariffTierInput[] = [
  { tierOrder: 1, label: '0–25', minKwh: 0, maxKwh: 25, rateKipPerKwh: 355 },
  { tierOrder: 2, label: '26–150', minKwh: 26, maxKwh: 150, rateKipPerKwh: 422 },
  { tierOrder: 3, label: '151–300', minKwh: 151, maxKwh: 300, rateKipPerKwh: 999 },
  { tierOrder: 4, label: '301–400', minKwh: 301, maxKwh: 400, rateKipPerKwh: 1200 },
  { tierOrder: 5, label: '401–500', minKwh: 401, maxKwh: 500, rateKipPerKwh: 1450 },
  { tierOrder: 6, label: '501–1,000', minKwh: 501, maxKwh: 1000, rateKipPerKwh: 1750 },
  { tierOrder: 7, label: '1,001–1,500', minKwh: 1001, maxKwh: 1500, rateKipPerKwh: 2050 },
  { tierOrder: 8, label: '> 1,500', minKwh: 1501, maxKwh: null, rateKipPerKwh: 2350 },
];

export function MonthlyScheduleModal({
  isOpen,
  onClose,
  notice,
  schedule,
  defaultYear = 2026,
  defaultMonth = 11,
  defaultCategoryId,
}: MonthlyScheduleModalProps) {
  const { data: tariffCategories = [] } = useTariffCategories();
  const [categoryId, setCategoryId] = useState<number | undefined>(
    schedule?.categoryId ?? defaultCategoryId
  );
  const [year, setYear] = useState<number>(defaultYear);
  const [month, setMonth] = useState<number>(defaultMonth);
  const [isHotSeason, setIsHotSeason] = useState<boolean>(false);
  const [maintenanceFeeKip, setMaintenanceFeeKip] = useState<number | ''>(5000);
  const [tiers, setTiers] = useState<TariffTierInput[]>(DEFAULT_TIERS_2026);
  const [error, setError] = useState('');

  const isEdit = Boolean(schedule);
  const upsertMutation = useUpsertSchedule();

  useEffect(() => {
    if (!isOpen) return;

    if (schedule) {
      setCategoryId(
        schedule.categoryId ||
          defaultCategoryId ||
          (tariffCategories.length > 0 ? tariffCategories[0].id : undefined)
      );
      setYear(schedule.year);
      setMonth(schedule.month);
      setIsHotSeason(Boolean(schedule.isHotSeason));
      setMaintenanceFeeKip(
        schedule.maintenanceFeeKip !== null && schedule.maintenanceFeeKip !== undefined
          ? Number(schedule.maintenanceFeeKip)
          : notice?.maintenanceFeeKip != null
          ? Number(notice.maintenanceFeeKip)
          : 5000
      );
      if (schedule.tiers && schedule.tiers.length > 0) {
        const sorted = [...schedule.tiers].sort((a, b) => a.tierOrder - b.tierOrder);
        setTiers(
          sorted.map((t) => ({
            tierOrder: t.tierOrder,
            label: t.label,
            minKwh: t.minKwh,
            maxKwh: t.maxKwh ?? null,
            rateKipPerKwh: Number(t.rateKipPerKwh),
          }))
        );
      } else {
        setTiers(DEFAULT_TIERS_2026);
      }
    } else {
      setCategoryId(
        defaultCategoryId ??
          (tariffCategories.length > 0 ? tariffCategories[0].id : undefined)
      );
      setYear(defaultYear);
      setMonth(defaultMonth);
      // Auto-detect hot season (e.g. months 3, 4, 5)
      setIsHotSeason([3, 4, 5].includes(defaultMonth));
      setMaintenanceFeeKip(
        notice?.maintenanceFeeKip != null ? Number(notice.maintenanceFeeKip) : 5000
      );
      setTiers(DEFAULT_TIERS_2026);
    }
    setError('');
  }, [schedule, isOpen, defaultYear, defaultMonth, defaultCategoryId, notice, tariffCategories]);

  const handleTierRateChange = (tierOrder: number, value: string) => {
    const num = Number(value);
    setTiers((prev) =>
      prev.map((t) =>
        t.tierOrder === tierOrder
          ? { ...t, rateKipPerKwh: isNaN(num) ? 0 : Math.max(0, num) }
          : t
      )
    );
  };

  const handleQuickFill = () => {
    setTiers(DEFAULT_TIERS_2026);
  };

  const handleSubmit = async () => {
    if (!notice) {
      setError('ບໍ່ພົບຂໍ້ມູນປະກາດອັດຕາຄ່າໄຟຟ້າ');
      return;
    }
    if (!year || year < 2020 || year > 2040) {
      setError('ກະລຸນາລະບຸປີໃຫ້ຖືກຕ້ອງ (2020–2040)');
      return;
    }
    if (!month || month < 1 || month > 12) {
      setError('ກະລຸນາລະບຸເດືອນໃຫ້ຖືກຕ້ອງ (1–12)');
      return;
    }

    // Validate all tiers have non-negative rates
    const invalidTier = tiers.find((t) => t.rateKipPerKwh < 0 || isNaN(t.rateKipPerKwh));
    if (invalidTier) {
      setError(`ອັດຕາຄ່າໄຟຂັ້ນ ${invalidTier.tierOrder} ບໍ່ຖືກຕ້ອງ`);
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        noticeId: notice.id,
        categoryId: categoryId ? Number(categoryId) : undefined,
        year: Number(year),
        month: Number(month),
        isHotSeason,
        maintenanceFeeKip: maintenanceFeeKip === '' ? null : Number(maintenanceFeeKip),
        tiers,
      });
      onClose();
    } catch {
      // Handled by hook toast
    }
  };

  const monthNames = [
    'ມັງກອນ (1)',
    'ກຸມພາ (2)',
    'ມີນາ (3)',
    'ເມສາ (4)',
    'ພຶດສະພາ (5)',
    'ມິຖຸນາ (6)',
    'ກໍລະກົດ (7)',
    'ສິງຫາ (8)',
    'ກັນຍາ (9)',
    'ຕຸລາ (10)',
    'ພະຈິກ (11)',
    'ທັນວາ (12)',
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂຕາຕະລາງອັດຕາຄ່າໄຟ 8 ຂັ້ນບັນໄດ' : 'ກຳນົດຕາຕະລາງອັດຕາຄ່າໄຟ 8 ຂັ້ນບັນໄດລາຍເດືອນ'}
      description={`ຕາຕະລາງຂັ້ນບັນໄດພາຍໃຕ້ປະກາດ: ${notice?.noticeNumber || ''} - ${notice?.title || ''}`}
      size="xl"
      onSubmit={handleSubmit}
      submitLabel="ບັນທຶກຕາຕະລາງຄ່າໄຟ"
      isSubmitting={upsertMutation.isPending}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Schedule Period Header */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 border border-blue-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 block">
                ງວດການຄິດໄລ່ (Billing Period)
              </span>
              <span className="text-xs font-medium text-slate-600">
                ກຳນົດອັດຕາຄ່າໄຟລາຍເດືອນສຳລັບປະເພດທີ່ຢູ່ອາໄສ
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs hover:bg-blue-50 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>ໃສ່ຄ່າເລີ່ມຕົ້ນ 2026 (Quick Fill)</span>
          </button>
        </div>

        {/* Period, Category, Maintenance Fee & Hot Season Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-center">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ປະເພດອັດຕາຄ່າໄຟ <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            >
              {tariffCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameLa} {cat.voltageLevel ? ` [${cat.voltageLevel}]` : ''}{' '}
                  {cat.categoryGroup === 'RESIDENTIAL'
                    ? ' (🏠 ທີ່ຢູ່ອາໄສ)'
                    : cat.categoryGroup === 'NON_RESIDENTIAL'
                    ? ' (🏢 ບໍ່ແມ່ນທີ່ຢູ່ອາໄສ)'
                    : ''}{' '}
                  {cat.nameEn ? `- ${cat.nameEn}` : ''}
                </option>
              ))}
              {tariffCategories.length === 0 && (
                <option value="">ຄ່າເລີ່ມຕົ້ນ (Default)</option>
              )}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ປີ (Year) <span className="text-rose-500">*</span>
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  ປີ ຄ.ສ {y}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ເດືອນ (Month) <span className="text-rose-500">*</span>
            </label>
            <select
              value={month}
              onChange={(e) => {
                const m = Number(e.target.value);
                setMonth(m);
                // Suggest hot season if March-May
                if ([3, 4, 5].includes(m)) setIsHotSeason(true);
              }}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            >
              {monthNames.map((name, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  ເດືອນ {name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຄ່າຊ່ອມບຳລຸງ (₭/ເດືອນ)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={maintenanceFeeKip}
                onChange={(e) =>
                  setMaintenanceFeeKip(
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                min={0}
                step={500}
                placeholder={String(notice?.maintenanceFeeKip ?? 5000)}
                className="w-full px-3 py-2 text-xs font-bold text-right rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
              <span className="text-xs font-bold text-slate-600">₭</span>
            </div>
          </div>
        </div>

        {/* Hot season banner / checkbox */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-amber-200 bg-amber-50/60">
          <div className="flex items-center gap-2">
            <span className="text-sm">☀️</span>
            <div>
              <span className="text-xs font-bold text-amber-900 block">
                ລະດູຮ້ອນ (Hot Season Discount)
              </span>
              <span className="text-[11px] text-amber-700">
                ຫຼຸດລາຄາພິເສດສຳລັບຄົວເຮືອນທີ່ໃຊ້ໄຟບໍ່ເກີນ 300 kWh (ເດືອນ 3, 4, 5)
              </span>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isHotSeason}
              onChange={(e) => setIsHotSeason(e.target.checked)}
              className="h-4 w-4 rounded text-amber-600 border-amber-300 focus:ring-amber-500"
            />
            <span className="text-xs font-bold text-amber-900">
              {isHotSeason ? 'ເປີດໃຊ້ສ່ວນຫຼຸດ' : 'ປິດສ່ວນຫຼຸດ'}
            </span>
          </label>
        </div>

        {/* 8 Progressive Tiers Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              ອັດຕາຄ່າໄຟຂັ້ນບັນໄດ 8 ຂັ້ນ (8 Progressive Tariff Tiers)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              ຫົວໜ່ວຍ: ກີບ / kWh (ກ່ອນອາກອນ VAT)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3 text-center w-14">ຂັ້ນທີ</th>
                  <th className="py-2.5 px-3 w-28">ຊ່ວງໜ່ວຍໄຟ</th>
                  <th className="py-2.5 px-3 text-center">ຂັ້ນຕໍ່າ (Min)</th>
                  <th className="py-2.5 px-3 text-center">ຂັ້ນສູງ (Max)</th>
                  <th className="py-2.5 px-4 text-right">ອັດຕາຄ່າໄຟ (ກີບ/kWh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tiers.map((t) => (
                  <tr
                    key={t.tierOrder}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2 px-3 text-center font-bold text-slate-500">
                      #{t.tierOrder}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      {t.label} kWh
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">
                      {t.minKwh}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500 font-mono">
                      {t.maxKwh !== null && t.maxKwh !== undefined
                        ? t.maxKwh
                        : 'ບໍ່ຈຳກັດ (∞)'}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <input
                          type="number"
                          value={t.rateKipPerKwh}
                          onChange={(e) =>
                            handleTierRateChange(t.tierOrder, e.target.value)
                          }
                          min={0}
                          step={1}
                          className="w-32 px-3 py-1.5 text-xs font-bold text-right rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                        <span className="text-[11px] font-medium text-slate-500 w-8 text-left">
                          ₭/kWh
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
