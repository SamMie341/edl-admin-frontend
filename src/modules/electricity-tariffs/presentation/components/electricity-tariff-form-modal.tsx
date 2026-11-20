'use client';

import React, { useState } from 'react';
import {
  FormModal,
  FileUploader,
} from '@/core/presentation/components/shared';
import {
  useCreateElectricityTariff,
  useUpdateElectricityTariff,
  useUploadElectricityTariffImage,
  useUploadElectricityTariffDocument,
} from '../../application/use-electricity-tariffs.hook';
import {
  TARIFF_TYPE_CONFIG,
  TARIFF_STATUS_LABELS,
  type ElectricityTariffItem,
  type ElectricityTariffType,
  type ElectricityTariffStatus,
} from '../../domain/electricity-tariff.types';
import { cn } from '@/lib/utils';

interface ElectricityTariffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ElectricityTariffItem | null;
}

function toDateInputValue(isoString?: string | null): string {
  if (!isoString) {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return parsed.toISOString().slice(0, 10);
}

export function ElectricityTariffFormModal({
  isOpen,
  onClose,
  item,
}: ElectricityTariffFormModalProps) {
  const isEdit = Boolean(item);

  const createMutation = useCreateElectricityTariff();
  const updateMutation = useUpdateElectricityTariff();
  const uploadImageMutation = useUploadElectricityTariffImage();
  const uploadDocumentMutation = useUploadElectricityTariffDocument();

  const [title, setTitle] = useState(item?.title ?? '');
  const [tariffType, setTariffType] = useState<ElectricityTariffType>(
    item?.tariffType ?? 'RESIDENTIAL'
  );
  const [effectiveDate, setEffectiveDate] = useState(() =>
    toDateInputValue(item?.effectiveDate)
  );
  const [status, setStatus] = useState<ElectricityTariffStatus>(
    item?.status ?? 'ACTIVE'
  );
  const [imageFile, setImageFile] = useState<File | string | null>(
    item?.imageUrl ?? null
  );
  const [documentFile, setDocumentFile] = useState<File | string | null>(
    item?.pdfUrl ?? null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      newErrors.title = 'ກະລຸນາປ້ອນຫົວຂໍ້ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ';
    }
    if (!effectiveDate) {
      newErrors.effectiveDate = 'ກະລຸນາເລືອກວັນທີເລີ່ມມີຜົນບັງຄັບໃຊ້';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let savedId = item?.id;

      const payload = {
        title: trimmedTitle,
        tariffType,
        effectiveDate: new Date(`${effectiveDate}T00:00:00.000Z`).toISOString(),
        status,
      };

      if (isEdit && item) {
        await updateMutation.mutateAsync({
          id: item.id,
          payload,
        });
      } else {
        const created = await createMutation.mutateAsync(payload);
        savedId = created.id;
      }

      if (savedId && imageFile instanceof File) {
        await uploadImageMutation.mutateAsync({
          id: savedId,
          file: imageFile,
        });
      }

      if (savedId && documentFile instanceof File) {
        await uploadDocumentMutation.mutateAsync({
          id: savedId,
          file: documentFile,
        });
      }

      onClose();
    } catch {
      // Handled by React Query mutation toast handlers
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending ||
    uploadDocumentMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? 'ແກ້ໄຂໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ'
          : 'ເພີ່ມໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າໃໝ່'
      }
      description="ຈັດການປະກາດໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າຕາມປະເພດຜູ້ຊົມໃຊ້, ວັນທີມີຜົນບັງຄັບ, ຮູບພາບຕາຕະລາງ ແລະ ໄຟລ໌ PDF"
      size="xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງອັດຕາຄ່າໄຟ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຫົວຂໍ້ປະກາດອັດຕາຄ່າໄຟຟ້າ (Title){' '}
            <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              clearError('title');
            }}
            placeholder="ຕົວຢ່າງ: ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ ສຳລັບທີ່ຢູ່ອາໄສ ປີ 2026"
            className={cn(
              'w-full px-4 py-2.5 text-xs rounded-xl border bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all',
              errors.title ? 'border-rose-400' : 'border-slate-200'
            )}
          />
          {errors.title && (
            <p className="text-[11px] font-medium text-rose-500">
              {errors.title}
            </p>
          )}
        </div>

        {/* Tariff Type, Effective Date, Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ປະເພດຜູ້ຊົມໃຊ້ <span className="text-rose-500">*</span>
            </label>
            <select
              value={tariffType}
              onChange={(e) =>
                setTariffType(e.target.value as ElectricityTariffType)
              }
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              {(
                Object.keys(TARIFF_TYPE_CONFIG) as ElectricityTariffType[]
              ).map((key) => (
                <option key={key} value={key}>
                  {TARIFF_TYPE_CONFIG[key].label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ວັນທີມີຜົນບັງຄັບໃຊ້ <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => {
                setEffectiveDate(e.target.value);
                clearError('effectiveDate');
              }}
              className={cn(
                'w-full px-4 py-2.5 text-xs rounded-xl border bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500',
                errors.effectiveDate ? 'border-rose-400' : 'border-slate-200'
              )}
            />
            {errors.effectiveDate && (
              <p className="text-[11px] font-medium text-rose-500">
                {errors.effectiveDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະຖານະປະກາດ
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as ElectricityTariffStatus)
              }
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              {(
                Object.keys(TARIFF_STATUS_LABELS) as ElectricityTariffStatus[]
              ).map((key) => (
                <option key={key} value={key}>
                  {TARIFF_STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tariff Table Image & PDF Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-start">
          <FileUploader
            type="image"
            label="ຮູບພາບຕາຕະລາງອັດຕາຄ່າໄຟ (Image)"
            value={imageFile}
            onChange={(file: File | string | null) => setImageFile(file)}
            helperText="ຮອງຮັບ PNG, JPG, WEBP ສຳລັບຕາຕະລາງສະແດງອັດຕາ"
          />

          <FileUploader
            type="document"
            label="ໄຟລ໌ເອກະສານອັດຕາຄ່າໄຟ (PDF)"
            value={documentFile}
            onChange={(file: File | string | null) => setDocumentFile(file)}
            maxSizeMb={50}
            helperText="ຮອງຮັບໄຟລ໌ PDF ຂະໜາດສູງສຸດ 50MB"
          />
        </div>
      </div>
    </FormModal>
  );
}
