'use client';

import React, { useState, useEffect } from 'react';
import {
  FormModal,
  FileUploader,
  RichTextEditor,
} from '@/core/presentation/components/shared';
import {
  useCreateVisionMission,
  useUpdateVisionMission,
  useUploadVisionMissionImage,
} from '../../application/use-vision-missions.hook';
import type {
  VisionMissionItem,
  VisionMissionType,
  CommonStatus,
} from '../../domain/vision-mission.types';
import { VISION_MISSION_TYPE_CONFIG } from '../../domain/vision-mission.types';

interface VisionMissionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: VisionMissionItem | null;
  defaultType?: VisionMissionType;
}

export function VisionMissionFormModal({
  isOpen,
  onClose,
  item,
  defaultType = 'VISION',
}: VisionMissionFormModalProps) {
  const isEdit = Boolean(item);

  const createMutation = useCreateVisionMission();
  const updateMutation = useUpdateVisionMission();
  const uploadImageMutation = useUploadVisionMissionImage();

  // Form states
  const [entryType, setEntryType] = useState<VisionMissionType>(defaultType);
  const [title, setTitle] = useState('');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [status, setStatus] = useState<CommonStatus>('ACTIVE');
  const [imageFile, setImageFile] = useState<File | string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (item) {
      setEntryType(item.entryType);
      setTitle(item.title || '');
      setSlogan(item.slogan || '');
      setDescription(item.description || '');
      setOrderIndex(item.orderIndex || 0);
      setStatus(item.status || 'ACTIVE');
      setImageFile(item.imageUrl || null);
    } else {
      setEntryType(defaultType);
      setTitle('');
      setSlogan('');
      setDescription('');
      setOrderIndex(0);
      setStatus('ACTIVE');
      setImageFile(null);
    }
    setErrors({});
  }, [item, isOpen, defaultType]);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'ກະລຸນາປ້ອນຫົວຂໍ້';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let savedId = item?.id;

      const payload = {
        entryType,
        title: title.trim(),
        slogan: slogan.trim() || undefined,
        description: description.trim() || undefined,
        orderIndex: Number(orderIndex) || 0,
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

      // Upload image if a new File was provided
      if (savedId && imageFile instanceof File) {
        await uploadImageMutation.mutateAsync({
          id: savedId,
          file: imageFile,
        });
      }

      onClose();
    } catch {
      // Handled by hook toasts
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂຂໍ້ມູນ' : 'ສ້າງຂໍ້ມູນໃໝ່'}
      description="ຄຸ້ມຄອງວິໄສທັດ, ພາລະກິດ, ຄ່ານິຍົມ ແລະ ຄຳຂວັນ ຟຟລ"
      size="xl"
      onSubmit={handleSubmit}
      submitLabel={isEdit ? 'ບັນທຶກ' : 'ສ້າງຂໍ້ມູນ'}
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {/* Entry Type */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ປະເພດຂໍ້ມູນ <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(VISION_MISSION_TYPE_CONFIG) as VisionMissionType[]).map(
              (type) => {
                const isSelected = entryType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEntryType(type)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {VISION_MISSION_TYPE_CONFIG[type].label}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຫົວຂໍ້ (Title) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ເຊັ່ນ: ວິໄສທັດການພັດທະນາ ຟຟລ, ພາລະກິດຕົ້ນຕໍ..."
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
          {errors.title && (
            <p className="text-[11px] text-rose-500">{errors.title}</p>
          )}
        </div>

        {/* Slogan */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ຄຳຂວັນ / ຂໍ້ຄວາມເນັ້ນ (Slogan / Motto)
          </label>
          <input
            type="text"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder="ເຊັ່ນ: ໄຟຟ້າລາວ ເພື່ອການພັດທະນາປະເທດຊາດ ແລະ ຄວາມຢູ່ດີກິນດີຂອງປະຊາຊົນ"
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
        </div>

        {/* Description Rich Text */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            ລາຍລະອຽດເນື້ອໃນ (Description)
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="ຂຽນລາຍລະອຽດວິໄສທັດ, ພາລະກິດ ຫຼື ຄ່ານິຍົມອົງກອນ..."
            minHeight="160px"
          />
        </div>

        {/* Image Uploader */}
        <div className="space-y-1.5 pt-1">
          <FileUploader
            type="image"
            label="ຮູບພາບປະກອບ (Illustration / Banner)"
            value={imageFile}
            onChange={setImageFile}
            helperText="ຮູບພາບປະກອບທີ່ກ່ຽວຂ້ອງກັບວິໄສທັດ ຫຼື ພາລະກິດ (JPG, PNG, WebP)"
          />
        </div>

        {/* Order Index & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ລຳດັບການສະແດງຜົນ (Order Index)
            </label>
            <input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              ສະຖານະ
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CommonStatus)}
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              <option value="ACTIVE">ເປີດໃຊ້ງານ (Active)</option>
              <option value="INACTIVE">ປິດໃຊ້ງານ (Inactive)</option>
            </select>
          </div>
        </div>
      </div>
    </FormModal>
  );
}
