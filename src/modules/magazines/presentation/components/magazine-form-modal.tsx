'use client';

import React, { useState } from 'react';
import {
  FormModal,
  FileUploader,
} from '@/core/presentation/components/shared';
import {
  useCreateMagazine,
  useUpdateMagazine,
  useUploadMagazineCover,
  useUploadMagazineDocument,
} from '../../application/use-magazines.hook';
import {
  MAGAZINE_STATUS_LABELS,
  type MagazineItem,
  type MagazineStatus,
} from '../../domain/magazine.types';
import { cn } from '@/lib/utils';

interface MagazineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MagazineItem | null;
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

export function MagazineFormModal({
  isOpen,
  onClose,
  item,
}: MagazineFormModalProps) {
  const isEdit = Boolean(item);

  const createMutation = useCreateMagazine();
  const updateMutation = useUpdateMagazine();
  const uploadCoverMutation = useUploadMagazineCover();
  const uploadDocumentMutation = useUploadMagazineDocument();

  const [title, setTitle] = useState(item?.title ?? '');
  const [issueNumber, setIssueNumber] = useState(item?.issueNumber ?? '');
  const [publishedDate, setPublishedDate] = useState(() =>
    toDateInputValue(item?.publishedDate)
  );
  const [status, setStatus] = useState<MagazineStatus>(
    item?.status ?? 'ACTIVE'
  );
  const [coverFile, setCoverFile] = useState<File | string | null>(
    item?.coverImage ?? null
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
      newErrors.title = 'ກະລຸນາປ້ອນຊື່ວາລະສານ';
    }
    if (!publishedDate) {
      newErrors.publishedDate = 'ກະລຸນາເລືອກວັນທີຕີພິມວາລະສານ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let savedId = item?.id;

      const payload = {
        title: trimmedTitle,
        issueNumber: issueNumber.trim() || undefined,
        publishedDate: new Date(`${publishedDate}T00:00:00.000Z`).toISOString(),
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

      if (savedId && coverFile instanceof File) {
        await uploadCoverMutation.mutateAsync({
          id: savedId,
          file: coverFile,
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
    uploadCoverMutation.isPending ||
    uploadDocumentMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? 'ແກ້ໄຂຂໍ້ມູນວາລະສານ (Edit E-Magazine)'
          : 'ເພີ່ມວາລະສານໃໝ່ (New E-Magazine)'
      }
      description="ຈັດການຂໍ້ມູນວາລະສານດິຈິຕອນ ຟຟລ ພ້ອມອັບໂຫຼດຮູບໜ້າປົກ ແລະ ໄຟລ໌ເອກະສານ PDF"
      size="xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງວາລະສານ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {/* Title & Issue Number */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຊື່ວາລະສານ (Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError('title');
              }}
              placeholder="ຕົວຢ່າງ: ວາລະສານ ໄຟຟ້າລາວ ສະບັບທີ 45"
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະບັບທີ / ເຫຼັ້ມທີ (Issue No.)
            </label>
            <input
              type="text"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              placeholder="Vol. 45 - 2026"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Published Date & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ວັນທີຕີພິມ (Published Date){' '}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={publishedDate}
              onChange={(e) => {
                setPublishedDate(e.target.value);
                clearError('publishedDate');
              }}
              className={cn(
                'w-full px-4 py-2.5 text-xs rounded-xl border bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500',
                errors.publishedDate ? 'border-rose-400' : 'border-slate-200'
              )}
            />
            {errors.publishedDate && (
              <p className="text-[11px] font-medium text-rose-500">
                {errors.publishedDate}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະຖານະການເຜີຍແຜ່
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MagazineStatus)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              {(
                Object.keys(MAGAZINE_STATUS_LABELS) as MagazineStatus[]
              ).map((key) => (
                <option key={key} value={key}>
                  {MAGAZINE_STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cover Image & PDF Document Upload */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-start">
          <FileUploader
            type="image"
            label="ຮູບໜ້າປົກວາລະສານ (Cover Image)"
            value={coverFile}
            onChange={(file: File | string | null) => setCoverFile(file)}
            helperText="ຮອງຮັບ PNG, JPG, WEBP ແນະນຳຂະໜາດຕັ້ງ (A4 / 3:4)"
          />

          <FileUploader
            type="document"
            label="ໄຟລ໌ເອກະສານວາລະສານ (PDF)"
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
