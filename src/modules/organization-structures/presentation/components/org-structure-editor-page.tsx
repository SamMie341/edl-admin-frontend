'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Layout,
  Upload,
  Save,
  Loader2,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/core/presentation/components/shared';
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

interface OrgStructureEditorPageProps {
  orgStructure?: OrgStructureItem | null;
  defaultType?: StructureType;
  onBack: () => void;
  onSaved?: () => void;
}

export function OrgStructureEditorPage({
  orgStructure,
  defaultType = 'ORG_STRUCTURE',
  onBack,
  onSaved,
}: OrgStructureEditorPageProps) {
  const isEdit = Boolean(orgStructure);

  const createMutation = useCreateOrgStructure();
  const updateMutation = useUpdateOrgStructure();
  const uploadImageMutation = useUploadOrgStructureImage();

  // Mode: 'designer' (interactive full canvas) vs 'upload' (upload static image)
  const [mode, setMode] = useState<'designer' | 'upload'>('designer');

  // Metadata form states
  const [structureType, setStructureType] = useState<StructureType>(defaultType);
  const [structureName, setStructureName] = useState('');
  const [orderIndex, setOrderIndex] = useState(0);
  const [status, setStatus] = useState<CommonStatus>('ACTIVE');
  const [imageFile, setImageFile] = useState<File | string | null>(null);

  // Interactive Chart Structure
  const [chartStructure, setChartStructure] = useState<OrgChartStructure>(
    DEFAULT_EDL_BOARD_PRESET
  );
  const [isExporting, setIsExporting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orgStructure) {
      setStructureType(orgStructure.structureType);
      setStructureName(orgStructure.structureName || '');
      setOrderIndex(orgStructure.orderIndex || 0);
      setStatus(orgStructure.status || 'ACTIVE');
      setImageFile(orgStructure.imageUrl || null);

      // Check if interactive chart data exists
      const savedChart =
        loadOrgChartFromStorage(orgStructure.id) ||
        loadOrgChartFromStorage(orgStructure.structureName);

      if (savedChart) {
        setChartStructure(savedChart);
        setMode('designer');
      } else {
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
  }, [orgStructure, defaultType]);

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

  const handleSave = async () => {
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

      onSaved?.();
      onBack();
    } catch (err: any) {
      console.error('Failed to save organization structure:', err);
      toast.error(err?.message || 'ບັນທຶກໂຄງຮ່າງການຈັດຕັ້ງບໍ່ສຳເລັດ');
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
    <div className="flex flex-col min-h-[calc(100vh-90px)] md:h-[calc(100vh-130px)] space-y-3 animate-in fade-in-50 duration-200">
      {/* 1. Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 sm:px-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1.5 cursor-pointer font-semibold text-xs shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">ກັບຄືນ</span>
          </Button>

          <span className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
              {isEdit
                ? `ແກ້ໄຂໂຄງຮ່າງ: ${structureName || orgStructure?.structureName}`
                : 'ສ້າງໂຄງຮ່າງການຈັດຕັ້ງໃໝ່ (Designer)'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block truncate">
              ອອກແບບໂຄງຮ່າງແບບເຕັມຈໍ, ແກ້ໄຂຊື່, ຕຳແໜ່ງ, ແລະ ປ່ຽນຮູບພາບໄດ້ຕາມໃຈ
            </p>
          </div>
        </div>

        {/* Mode Switcher + Actions */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Mode Tabs */}
          <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 rounded-xl sm:rounded-2xl border border-slate-200/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('designer')}
              className={cn(
                'flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl transition cursor-pointer text-xs',
                mode === 'designer'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Layout className="h-3.5 w-3.5 text-blue-600" />
              <span>ອອກແບບ</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={cn(
                'flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl transition cursor-pointer text-xs',
                mode === 'upload'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>ອັບໂຫຼດ</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto sm:ml-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={isSubmitting}
              className="h-8 sm:h-9 px-3 sm:px-4 rounded-xl text-xs text-slate-600 border-slate-200 hover:bg-slate-100 cursor-pointer"
            >
              ຍົກເລີກ
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSubmitting}
              className="h-8 sm:h-9 px-3.5 sm:px-5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {isExporting ? 'ສ້າງຮູບ...' : 'ກຳລັງບັນທຶກ...'}
                  </span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>ບັນທຶກ</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Metadata Settings Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3 bg-white p-3 sm:p-3.5 sm:px-6 rounded-2xl border border-slate-200/80 shadow-2xs shrink-0 text-xs">
        {/* Structure Type */}
        <div className="md:col-span-3 space-y-1">
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
        <div className="md:col-span-6 space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
            ຊື່ໂຄງຮ່າງການຈັດຕັ້ງ <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={structureName}
            onChange={(e) => setStructureName(e.target.value)}
            placeholder="ເຊັ່ນ: ສະພາຜູ້ບໍລິຫານ ຟຟລ, ຄະນະຜູ້ອຳນວຍການໃຫຍ່..."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500"
          />
          {errors.structureName && (
            <p className="text-[10px] text-rose-500">{errors.structureName}</p>
          )}
        </div>

        {/* Order Index & Status */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              ລຳດັບ (Index)
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
              <option value="ACTIVE">Active (ເປີດ)</option>
              <option value="INACTIVE">Inactive (ປິດ)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Full-Screen Canvas Area */}
      <div className="flex-1 min-h-[420px] md:min-h-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        {mode === 'designer' ? (
          <OrgChartDesigner
            structure={chartStructure}
            onChange={setChartStructure}
          />
        ) : (
          <div className="p-4 sm:p-10 flex items-center justify-center h-full">
            <div className="max-w-xl w-full">
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
                <p className="text-[11px] font-medium text-rose-500 mt-2">
                  {errors.imageFile}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
