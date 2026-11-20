'use client';

import React, { useState } from 'react';
import { Video } from 'lucide-react';
import {
  FormModal,
  FileUploader,
  RichTextEditor,
} from '@/core/presentation/components/shared';
import {
  useCreateElectricalKnowledge,
  useUpdateElectricalKnowledge,
  useUploadElectricalKnowledgeCover,
} from '../../application/use-electrical-knowledge.hook';
import {
  ELECTRICAL_KNOWLEDGE_STATUS_LABELS,
  type ElectricalKnowledgeItem,
  type ElectricalKnowledgeStatus,
} from '../../domain/electrical-knowledge.types';
import { cn } from '@/lib/utils';

interface ElectricalKnowledgeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: ElectricalKnowledgeItem | null;
}

const EMPTY_HTML_VALUES = new Set(['', '<p></p>', '<p><br></p>', '<p><br/></p>']);

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ElectricalKnowledgeFormModal({
  isOpen,
  onClose,
  item,
}: ElectricalKnowledgeFormModalProps) {
  const isEdit = Boolean(item);

  const createMutation = useCreateElectricalKnowledge();
  const updateMutation = useUpdateElectricalKnowledge();
  const uploadCoverMutation = useUploadElectricalKnowledgeCover();

  const [title, setTitle] = useState(item?.title ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [videoUrl, setVideoUrl] = useState(item?.videoUrl ?? '');
  const [status, setStatus] = useState<ElectricalKnowledgeStatus>(
    item?.status ?? 'ACTIVE'
  );
  const [coverFile, setCoverFile] = useState<File | string | null>(
    item?.coverImage ?? null
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
    const trimmedContent = content.trim();
    const trimmedVideo = videoUrl.trim();

    if (!trimmedTitle) {
      newErrors.title = 'ກະລຸນາປ້ອນຫົວຂໍ້ບົດຄວາມຄວາມຮູ້';
    }
    if (EMPTY_HTML_VALUES.has(trimmedContent)) {
      newErrors.content = 'ກະລຸນາປ້ອນເນື້ອໃນບົດຄວາມ';
    }
    if (trimmedVideo && !isValidHttpUrl(trimmedVideo)) {
      newErrors.videoUrl =
        'ຮູບແບບ URL ວິດີໂອບໍ່ຖືກຕ້ອງ (ຕ້ອງເລີ່ມດ້ວຍ http:// ຫຼື https://)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let savedId = item?.id;

      const payload = {
        title: trimmedTitle,
        content: trimmedContent,
        videoUrl: trimmedVideo || undefined,
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

      onClose();
    } catch {
      // Handled by React Query mutation toast handlers
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadCoverMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit
          ? 'ແກ້ໄຂບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ'
          : 'ເພີ່ມບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າໃໝ່'
      }
      description="ຈັດການບົດຄວາມຄວາມຮູ້, ຄວາມປອດໄພໃນການນຳໃຊ້ໄຟຟ້າ, ຮູບໜ້າປົກ ແລະ ຄລິບວິດີໂອສຶກສາ"
      size="xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກການແກ້ໄຂ' : 'ສ້າງບົດຄວາມ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {/* Title & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ຫົວຂໍ້ບົດຄວາມ (Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                clearError('title');
              }}
              placeholder="ຕົວຢ່າງ: ວິທີການນຳໃຊ້ໄຟຟ້າຢ່າງປອດໄພໃນລະດູຝົນ"
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
              ສະຖານະການເຜີຍແຜ່
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as ElectricalKnowledgeStatus)
              }
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              {(
                Object.keys(
                  ELECTRICAL_KNOWLEDGE_STATUS_LABELS
                ) as ElectricalKnowledgeStatus[]
              ).map((key) => (
                <option key={key} value={key}>
                  {ELECTRICAL_KNOWLEDGE_STATUS_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cover Image & Video URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FileUploader
            type="image"
            label="ຮູບໜ້າປົກບົດຄວາມ (Cover Image)"
            value={coverFile}
            onChange={(file: File | string | null) => setCoverFile(file)}
            helperText="ຮອງຮັບ JPG, PNG, WEBP ຂະໜາດແນະນຳ 16:9"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ລິ້ງວິດີໂອປະກອບ (Video URL)
            </label>
            <div className="relative flex items-center">
              <Video className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => {
                  setVideoUrl(e.target.value);
                  clearError('videoUrl');
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500',
                  errors.videoUrl ? 'border-rose-400' : 'border-slate-200'
                )}
              />
            </div>
            {errors.videoUrl && (
              <p className="text-[11px] font-medium text-rose-500">
                {errors.videoUrl}
              </p>
            )}
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ສາມາດໃສ່ລິ້ງ YouTube (watch / share / shorts / embed) ຫຼື URL ໄຟລ໌ວິດີໂອ MP4
            </p>
          </div>
        </div>

        {/* Rich Text Content */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ເນື້ອໃນບົດຄວາມ (Rich Text Content){' '}
            <span className="text-rose-500">*</span>
          </label>
          <RichTextEditor
            value={content}
            onChange={(html) => {
              setContent(html);
              clearError('content');
            }}
            placeholder="ຂຽນເນື້ອໃນໃຫ້ຄວາມຮູ້ກ່ຽວກັບໄຟຟ້າ ແລະ ຄວາມປອດໄພ..."
            minHeight="220px"
            error={errors.content}
          />
        </div>
      </div>
    </FormModal>
  );
}
