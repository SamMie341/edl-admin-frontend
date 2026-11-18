'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/core/presentation/components/shared';
import {
  useCreateTariffNotice,
  useUpdateTariffNotice,
} from '../../application/use-electricity-calculator.hook';
import type { TariffNotice } from '../../domain/electricity-calculator.types';

interface TariffNoticeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  notice?: TariffNotice | null;
}

export function TariffNoticeFormModal({
  isOpen,
  onClose,
  notice,
}: TariffNoticeFormModalProps) {
  const [noticeNumber, setNoticeNumber] = useState('');
  const [title, setTitle] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');
  const [vatRatePercent, setVatRatePercent] = useState<number>(10);
  const [hotSeasonCapKwh, setHotSeasonCapKwh] = useState<number>(300);
  const [maintenanceFeeKip, setMaintenanceFeeKip] = useState<number>(5000);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState('');

  const isEdit = Boolean(notice);
  const createMutation = useCreateTariffNotice();
  const updateMutation = useUpdateTariffNotice();

  const formatDateForInput = (d?: string | null) => {
    if (!d) return '';
    try {
      return new Date(d).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (notice) {
      setNoticeNumber(notice.noticeNumber || '');
      setTitle(notice.title || '');
      setIssuedDate(formatDateForInput(notice.issuedDate));
      setEffectiveFrom(formatDateForInput(notice.effectiveFrom));
      setEffectiveTo(formatDateForInput(notice.effectiveTo));
      setVatRatePercent(
        notice.vatRate != null ? Math.round(Number(notice.vatRate) * 100) : 10
      );
      setHotSeasonCapKwh(Number(notice.hotSeasonDiscountCapKwh) || 300);
      setMaintenanceFeeKip(
        notice.maintenanceFeeKip != null ? Number(notice.maintenanceFeeKip) : 5000
      );
      setStatus(notice.status || 'ACTIVE');
    } else {
      setNoticeNumber('');
      setTitle('ແຈ້ງການ ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າປະເພດທີ່ຢູ່ອາໄສ');
      setIssuedDate(new Date().toISOString().split('T')[0]);
      setEffectiveFrom('2026-06-01');
      setEffectiveTo('2029-12-31');
      setVatRatePercent(10);
      setHotSeasonCapKwh(300);
      setMaintenanceFeeKip(5000);
      setStatus('ACTIVE');
    }
    setError('');
  }, [notice, isOpen]);

  const handleSubmit = async () => {
    const trimmedNumber = noticeNumber.trim();
    const trimmedTitle = title.trim();

    if (!trimmedNumber) {
      setError('ກະລຸນາປ້ອນເລກທີປະກາດ (Notice Number)');
      return;
    }
    if (!trimmedTitle) {
      setError('ກະລຸນາປ້ອນຫົວຂໍ້ປະກາດ (Title)');
      return;
    }
    if (!issuedDate || !effectiveFrom || !effectiveTo) {
      setError('ກະລຸນາເລືອກວັນທີໃຫ້ຄົບຖ້ວນ (ວັນທີອອກແຈ້ງການ, ວັນທີເລີ່ມ ແລະ ສິ້ນສຸດ)');
      return;
    }

    const payload = {
      noticeNumber: trimmedNumber,
      title: trimmedTitle,
      issuedDate: new Date(issuedDate).toISOString(),
      effectiveFrom: new Date(effectiveFrom).toISOString(),
      effectiveTo: new Date(effectiveTo).toISOString(),
      vatRate: Number(vatRatePercent) / 100,
      hotSeasonDiscountCapKwh: Number(hotSeasonCapKwh),
      maintenanceFeeKip: Number(maintenanceFeeKip) || 0,
      status,
    };

    try {
      if (isEdit && notice) {
        await updateMutation.mutateAsync({
          id: notice.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
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
      title={isEdit ? 'ແກ້ໄຂປະກາດອັດຕາຄ່າໄຟຟ້າ' : 'ເພີ່ມປະກາດອັດຕາຄ່າໄຟຟ້າໃໝ່'}
      description="ຄຸ້ມຄອງເອກະສານປະກາດອັດຕາຄ່າໄຟຟ້າ ແລະ ໄລຍະເວລາທີ່ມີຜົນບັງຄັບໃຊ້"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ເພີ່ມປະກາດ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ເລກທີປະກາດ (Notice Number) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={noticeNumber}
              onChange={(e) => {
                setNoticeNumber(e.target.value);
                if (error) setError('');
              }}
              placeholder="2026/ຟຟລ.ຝທຜ"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ວັນທີອອກແຈ້ງການ (Issued Date) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={issuedDate}
              onChange={(e) => setIssuedDate(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຫົວຂໍ້ປະກາດ (Notice Title) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError('');
            }}
            placeholder="ແຈ້ງການ ປັບປຸງໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ ສະບັບໃໝ່ (2026–2029)"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ມີຜົນບັງຄັບໃຊ້ນັບແຕ່ (Effective From) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ເຖິງວັນທີ (Effective To) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ອາກອນມູນຄ່າເພີ່ມ VAT (%)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={vatRatePercent}
                onChange={(e) => setVatRatePercent(Number(e.target.value))}
                min={0}
                max={100}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
              <span className="text-xs font-bold text-slate-600">%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ເພດານລະດູຮ້ອນ (kWh)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={hotSeasonCapKwh}
                onChange={(e) => setHotSeasonCapKwh(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
              <span className="text-xs font-bold text-slate-600">kWh</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຄ່າຊ່ອມບຳລຸງ (₭ / ເດືອນ)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={maintenanceFeeKip}
                onChange={(e) => setMaintenanceFeeKip(Number(e.target.value))}
                min={0}
                step={500}
                placeholder="5000"
                className="w-full px-3.5 py-2 text-xs font-bold text-right rounded-xl border border-slate-200 bg-slate-50/60 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15"
              />
              <span className="text-xs font-bold text-slate-600">₭</span>
            </div>
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
        </div>
      </div>
    </FormModal>
  );
}
