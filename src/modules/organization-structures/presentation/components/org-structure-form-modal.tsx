'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Layout,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { FormModal, FileUploader } from '@/core/presentation/components/shared';
import {
  useCreateOrgStructure,
  useUpdateOrgStructure,
  useUploadOrgStructureImage,
} from '../../application/use-org-structures.hook';
import type {
  OrgStructureItem,
  StructureType,
  CommonStatus,
  CreateOrgStructurePayload,
} from '../../domain/org-structure.types';
import { STRUCTURE_TYPE_LABELS } from '../../domain/org-structure.types';
import type { OrgChartStructure } from '../../domain/org-chart-designer.types';
import {
  DEFAULT_EDL_BOARD_PRESET,
  DEFAULT_EXECUTIVE_PRESET,
  DEFAULT_BLANK_PRESET,
} from '../../domain/org-chart-designer.types';
import {
  exportOrgChartToImageFile,
  saveOrgChartToStorage,
  loadOrgChartFromStorage,
} from '../../application/org-chart-canvas-exporter';
import { OrgChartDesigner } from './org-chart-designer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface OrgStructureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgStructure?: OrgStructureItem | null;
  defaultType?: StructureType;
}

export function OrgStructureFormModal({
  isOpen,
  onClose,
  orgStructure,
  defaultType = 'ORG_STRUCTURE',
}: OrgStructureFormModalProps) {
  const isEdit = Boolean(orgStructure);

  const createMutation = useCreateOrgStructure();
  const updateMutation = useUpdateOrgStructure();
  const uploadImageMutation = useUploadOrgStructureImage();

  // Mode switcher: 'designer' (interactive builder) vs 'upload' (upload static image)
  const [mode, setMode] = useState<'designer' | 'upload'>('designer');

  // Form states
  const [structureType, setStructureType] = useState<StructureType>(defaultType);
  const [structureName, setStructureName] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [status, setStatus] = useState<CommonStatus>('ACTIVE');
  const [imageFile, setImageFile] = useState<File | string | null>(null);

  // Interactive Designer state
  const [chartStructure, setChartStructure] = useState<OrgChartStructure>(
    DEFAULT_EDL_BOARD_PRESET
  );
  const [isExporting, setIsExporting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (orgStructure) {
      setStructureType(orgStructure.structureType);
      setStructureName(orgStructure.structureName || '');
      setOrderIndex(orgStructure.orderIndex || 0);
      setStatus(orgStructure.status || 'ACTIVE');
      setImageFile(orgStructure.imageUrl || null);

      // Try loading existing interactive chart from storage
      const savedChart =
        loadOrgChartFromStorage(orgStructure.id) ||
        loadOrgChartFromStorage(orgStructure.structureName);

      if (savedChart) {
        setChartStructure(savedChart);
        setMode('designer');
      } else {
        // If no saved interactive chart, default to upload or load template
        if (orgStructure.structureType === 'BOARD_OF_DIRECTORS') {
          setChartStructure(JSON.parse(JSON.stringify(DEFAULT_EDL_BOARD_PRESET)));
        } else if (orgStructure.structureType === 'EXECUTIVE_BOARD') {
          setChartStructure(JSON.parse(JSON.stringify(DEFAULT_EXECUTIVE_PRESET)));
        }
        setMode(orgStructure.imageUrl ? 'upload' : 'designer');
      }
    } else {
      setStructureType(defaultType);
      setOrderIndex(0);
      setStatus('ACTIVE');
      setImageFile(null);
      setMode('designer');

      if (defaultType === 'BOARD_OF_DIRECTORS') {
        setStructureName('ສະພາຜູ້ບໍລິຫານ ຟຟລ (Board of Directors)');
        setChartStructure(JSON.parse(JSON.stringify(DEFAULT_EDL_BOARD_PRESET)));
      } else if (defaultType === 'EXECUTIVE_BOARD') {
        setStructureName('ຄະນະຜູ້ອຳນວຍການ ຟຟລ (Executive Board)');
        setChartStructure(JSON.parse(JSON.stringify(DEFAULT_EXECUTIVE_PRESET)));
      } else {
        setStructureName('ແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງລວມ ຟຟລ');
        setChartStructure(JSON.parse(JSON.stringify(DEFAULT_BLANK_PRESET)));
      }
    }
    setErrors({});
  }, [orgStructure, isOpen, defaultType]);

  // When structureType changes in create mode, suggest title & preset
  const handleTypeChange = (newType: StructureType) => {
    setStructureType(newType);
    if (!isEdit) {
      if (newType === 'BOARD_OF_DIRECTORS') {
        setStructureName('ສະພາຜູ້ບໍລິຫານ ຟຟລ (Board of Directors)');
        setChartStructure(JSON.parse(JSON.stringify(DEFAULT_EDL_BOARD_PRESET)));
      } else if (newType === 'EXECUTIVE_BOARD') {
        setStructureName('ຄະນະຜູ້ອຳນວຍການ ຟຟລ (Executive Board)');
        setChartStructure(JSON.parse(JSON.stringify(DEFAULT_EXECUTIVE_PRESET)));
      } else {
        setStructureName('ແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງລວມ ຟຟລ');
        setChartStructure(JSON.parse(JSON.stringify(DEFAULT_BLANK_PRESET)));
      }
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!structureName.trim()) {
      newErrors.structureName = 'ກະລຸນາປ້ອນຊື່ໂຄງຮ່າງການຈັດຕັ້ງ';
    }

    if (mode === 'upload' && !isEdit && !imageFile) {
      newErrors.imageFile = 'ກະລຸນາເລືອກໄຟລ໌ຮູບພາບ';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsExporting(true);
      let savedId = orgStructure?.id;

      // 1. Prepare image file to upload
      let fileToUpload: File | null = null;
      if (mode === 'designer') {
        try {
          fileToUpload = await exportOrgChartToImageFile(
            chartStructure,
            `org-chart-${Date.now()}.png`
          );
        } catch (exportErr) {
          console.warn('Canvas export warning:', exportErr);
        }
      } else if (mode === 'upload' && imageFile instanceof File) {
        fileToUpload = imageFile;
      }

      // 2. Prepare payload - ensure imageUrl is at least '' so backend Prisma NOT NULL constraint succeeds
      const payload: CreateOrgStructurePayload = {
        structureType,
        structureName: structureName.trim(),
        imageUrl: orgStructure?.imageUrl || '',
        orderIndex: Number(orderIndex) || 0,
        status,
      };

      if (isEdit && orgStructure) {
        await updateMutation.mutateAsync({
          id: orgStructure.id,
          payload,
        });
      } else {
        const created = await createMutation.mutateAsync(payload);
        savedId = created?.id;
      }

      // 3. Save chart data to localStorage & upload image to server
      if (savedId) {
        if (mode === 'designer') {
          saveOrgChartToStorage(savedId, chartStructure);
          saveOrgChartToStorage(structureName.trim(), chartStructure);
        }

        if (fileToUpload) {
          await uploadImageMutation.mutateAsync({
            id: savedId,
            file: fileToUpload,
          });
        }
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to submit form:', err);
      toast.error(err?.message || 'ບັນທຶກບໍ່ສຳເລັດ');
    } finally {
      setIsExporting(false);
    }
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending ||
    isExporting;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'ແກ້ໄຂໂຄງຮ່າງການຈັດຕັ້ງ' : 'ສ້າງໂຄງຮ່າງການຈັດຕັ້ງໃໝ່'}
      description="ອອກແບບໂຄງຮ່າງແບບໂຕ້ຕອບ, ແກ້ໄຂຊື່, ຮູບພາບ ແລະ ຕຳແໜ່ງໄດ້ຕາມໃຈ"
      size="full"
      onSubmit={handleSubmit}
      submitLabel={
        isExporting
          ? 'ກຳລັງສ້າງຮູບແຜນຜັງ...'
          : isEdit
          ? 'ບັນທຶກໂຄງຮ່າງ'
          : 'ສ້າງໂຄງຮ່າງ'
      }
      isSubmitting={isSubmitting}
    >
      <div className="space-y-4">
        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-between p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode('designer')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer',
                mode === 'designer'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Layout className="h-4 w-4 text-blue-600" />
              <span>🎨 ອອກແບບໂຄງຮ່າງແບບໂຕ້ຕອບ (Interactive Designer)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer',
                mode === 'upload'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Upload className="h-4 w-4 text-slate-500" />
              <span>🖼️ ອັບໂຫຼດຮູບພາບປົກກະຕິ (Upload Static Image)</span>
            </button>
          </div>

          <span className="text-[11px] font-medium text-slate-500 pr-3 hidden sm:inline">
            {mode === 'designer'
              ? '✨ ຄລິກໃສ່ກ່ອງເພື່ອແກ້ໄຂຊື່ ຫຼື ປ່ຽນຮູບພາບໄດ້ທັນທີ'
              : 'ເລືອກໄຟລ໌ຮູບພາບຈາກເຄື່ອງ'}
          </span>
        </div>

        {/* Basic Metadata Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/70">
          {/* Structure Type */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              ປະເພດໂຄງຮ່າງ <span className="text-rose-500">*</span>
            </label>
            <select
              value={structureType}
              onChange={(e) => handleTypeChange(e.target.value as StructureType)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
            >
              {(Object.keys(STRUCTURE_TYPE_LABELS) as StructureType[]).map((type) => (
                <option key={type} value={type}>
                  {STRUCTURE_TYPE_LABELS[type].label}
                </option>
              ))}
            </select>
          </div>

          {/* Structure Name */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              ຊື່ໂຄງຮ່າງການຈັດຕັ້ງ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={structureName}
              onChange={(e) => setStructureName(e.target.value)}
              placeholder="ເຊັ່ນ: ສະພາຜູ້ບໍລິຫານ ຟຟລ, ຄະນະຜູ້ອຳນວຍການ..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
            />
            {errors.structureName && (
              <p className="text-[10px] text-rose-500">{errors.structureName}</p>
            )}
          </div>

          {/* Order Index & Status */}
          <div className="md:col-span-3 grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                ລຳດັບ
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                ສະຖານະ
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CommonStatus)}
                className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area according to Mode */}
        {mode === 'designer' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                ພື້ນທີ່ອອກແບບໂຄງຮ່າງ (Interactive Canvas)
              </span>
              <span className="text-[11px] text-slate-400">
                ລະບົບຈະສ້າງເປັນໄຟລ໌ຮູບພາບຄຸນນະພາບສູງ ແລະ ບັນທຶກໂຄງສ້າງໄວ້ໃຫ້ອັດຕະໂນມັດ
              </span>
            </div>

            <div className="h-[580px] w-full">
              <OrgChartDesigner
                structure={chartStructure}
                onChange={setChartStructure}
              />
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white rounded-2xl border border-slate-200/80 space-y-4">
            <FileUploader
              type="image"
              label="ຮູບພາບແຜນຜັງໂຄງຮ່າງ (Org Chart Image)"
              value={imageFile}
              onChange={(file) => {
                setImageFile(file);
                if (file && errors.imageFile) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.imageFile;
                    return next;
                  });
                }
              }}
              helperText="ຮູບພາບແຜນຜັງຂະໜາດໃຫຍ່, ຄວາມລະອຽດສູງ (JPG, PNG, WebP)"
            />
            {errors.imageFile && (
              <p className="text-[11px] font-medium text-rose-500">
                {errors.imageFile}
              </p>
            )}
          </div>
        )}
      </div>
    </FormModal>
  );
}
