'use client';

import React, { useState } from 'react';
import {
  FormModal,
  FileUploader,
} from '@/core/presentation/components/shared';
import {
  useCreateLegislation,
  useUpdateLegislation,
  useUploadLegislationDocument,
} from '../../application/use-legislations.hook';
import {
  LEGISLATION_STATUS_LABELS,
  type LegislationItem,
  type LegislationStatus,
} from '../../domain/legislation.types';
import { cn } from '@/lib/utils';

interface LegislationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: LegislationItem | null;
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

export function LegislationFormModal({
  isOpen,
  onClose,
  item,
}: LegislationFormModalProps) {
  const isEdit = Boolean(item);

  const createMutation = useCreateLegislation();
  const updateMutation = useUpdateLegislation();
  const uploadDocumentMutation = useUploadLegislationDocument();

  const [documentNumber, setDocumentNumber] = useState(
    item?.documentNumber ?? ''
  );
  const [title, setTitle] = useState(item?.title ?? '');
  const [issueDate, setIssueDate] = useState(() =>
    item ? (item.issueDate ? toDateInputValue(item.issueDate) : '') : toDateInputValue()
  );
  const [status, setStatus] = useState<LegislationStatus>(
    item?.status ?? 'ACTIVE'
  );
  const [documentFile, setDocumentFile] = useState<File | string | null>(
    item?.fileUrl ?? null
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
      newErrors.title = 'ກະລຸນາປ້ອນຊື່ເອກະສານນິຕິກຳ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let savedId = item?.id;

      const payload = {
        documentNumber: documentNumber.trim() || undefined,
        title: trimmedTitle,
        issueDate: issueDate
          ? new Date(`${issueDate}T00:00:00.000Z`).toISOString()
          : undefined,
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
    uploadDocumentMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? 'ແກ້ໄຂເອກະສານນິຕິກຳ (Edit Legislation)'
          : 'ເພີ່ມເອກະສານນິຕິກຳໃໝ່ (New Legislation)'
      }
      description="ຈັດການເອກະສານນິຕິກຳ, ດຳລັດ, ຂໍ້ຕົກລົງ ແລະ ລະບຽບການ ພ້ອມອັບໂຫຼດໄຟລ໌ PDF"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງເອກະສານນິຕິກຳ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {/* Document Number & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ເລກທີເອກະສານ (Doc No.)
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder="ຕົວຢ່າງ: 012/ຟຟລ"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຊື່ເອກະສານນິຕິກຳ (Title){' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError('title');
              }}
              placeholder="ຕົວຢ່າງ: ຂໍ້ຕົກລົງວ່າດ້ວຍການຄຸ້ມຄອງ ແລະ ນຳໃຊ້ຕາຂ່າຍໄຟຟ້າ"
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
        </div>

        {/* Issue Date & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ວັນທີອອກເອກະສານ (Issue Date)
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະຖານະເອກະສານ
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LegislationStatus)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              {(
                Object.keys(LEGISLATION_STATUS_LABELS) as LegislationStatus[]
              ).map((key) => (
                <option key={key} value={key}>
                  {LEGISLATION_STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PDF Document Upload */}
        <div className="pt-1">
          <FileUploader
            type="document"
            label="ໄຟລ໌ເອກະສານນິຕິກຳ (PDF)"
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
