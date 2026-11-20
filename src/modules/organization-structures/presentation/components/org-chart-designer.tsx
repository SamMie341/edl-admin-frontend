'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Camera,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Scan,
  User,
  Eye,
  Layers,
  ChevronUp,
  ChevronDown,
  SlidersHorizontal,
  Download,
  Loader2,
  Type,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  OrgChartStructure,
  OrgChartPersonNode,
  OrgChartTier,
  OrgChartStyleConfig,
  OrgChartFontId,
} from '../../domain/org-chart-designer.types';
import {
  DEFAULT_EDL_BOARD_PRESET,
  DEFAULT_EXECUTIVE_PRESET,
  DEFAULT_BLANK_PRESET,
  ORG_CHART_FONT_OPTIONS,
  normalizeChartTiers,
  resolveOrgChartStyle,
  resolveOrgChartCssFont,
  resolveTierMaxColumns,
  chunkTierNodes,
  splitTextByScript,
} from '../../domain/org-chart-designer.types';
import {
  resolveAvatarUrl,
  uploadOrProcessAvatar,
  exportOrgChartToImageFile,
} from '../../application/org-chart-canvas-exporter';
import { OrgChartNodeEditorModal } from './org-chart-node-editor-modal';
import { OrgChartStylePanel } from './org-chart-style-panel';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function generateChartElementId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function renderScaledBadgeRuns(text: string, enScale: number) {
  if (!enScale || enScale === 1) return text;
  return splitTextByScript(text).map((run, idx) =>
    run.isLatin ? (
      <span
        key={idx}
        style={{ fontSize: `${enScale}em` }}
        className="tracking-tight"
      >
        {run.text}
      </span>
    ) : (
      <React.Fragment key={idx}>{run.text}</React.Fragment>
    )
  );
}

/**
 * Renders badge text preserving ONLY explicit Enter (\n) line breaks and smoothly
 * scaling font down via transform when a single line is wider than the pill box.
 */
function StrictLineBadgeText({
  text,
  fontSize,
  color,
  enScale,
  fontWeight = 700,
}: {
  text: string;
  fontSize: number;
  color: string;
  enScale: number;
  fontWeight?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [fittedHeight, setFittedHeight] = useState<number | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;

    const measure = () => {
      const availW = box.clientWidth;
      const naturalW = el.scrollWidth;
      const naturalH = el.scrollHeight;
      if (availW <= 0 || naturalW <= 0) return;

      if (naturalW > availW) {
        const ratio = Math.max(0.42, Number((availW / naturalW).toFixed(3)));
        setFitScale(ratio);
        setFittedHeight(Math.ceil(naturalH * ratio));
      } else {
        setFitScale(1);
        setFittedHeight(null);
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(box);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, fontSize, enScale, fontWeight]);

  return (
    <div
      ref={boxRef}
      style={fittedHeight ? { height: `${fittedHeight}px` } : undefined}
      className="w-full overflow-hidden flex items-center justify-center"
    >
      <p
        ref={textRef}
        style={{
          fontSize: `${fontSize}px`,
          color,
          fontWeight,
          transform: fitScale < 1 ? `scale(${fitScale})` : undefined,
          transformOrigin: 'center center',
        }}
        className="whitespace-pre leading-snug text-center shrink-0"
      >
        {renderScaledBadgeRuns(text, enScale)}
      </p>
    </div>
  );
}

interface OrgChartDesignerProps {
  structure: OrgChartStructure;
  onChange: (structure: OrgChartStructure) => void;
  readOnly?: boolean;
}

export function OrgChartDesigner({
  structure,
  onChange,
  readOnly = false,
}: OrgChartDesignerProps) {
  const [zoom, setZoom] = useState(1);
  const [editingNode, setEditingNode] = useState<{
    node: OrgChartPersonNode;
    tierIndex: number;
  } | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>('board');
  const [previewMode, setPreviewMode] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentSize, setContentSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Viewport & Chart refs for responsive measurement + accurate zoom scaling
  const viewportRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const hasAutoFittedRef = useRef(false);

  // Quick photo upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetUploadNodeRef = useRef<string | null>(null);

  const computeFitZoom = useCallback((minZoom = 0.3, maxZoom = 1.25) => {
    const vp = viewportRef.current;
    const chart = chartRef.current;
    if (!vp || !chart) return 1;
    const cs = window.getComputedStyle(vp);
    const padX =
      parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
    const padY =
      parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');
    const availW = Math.max(240, vp.clientWidth - padX - 8);
    const availH = Math.max(240, vp.clientHeight - padY - 8);
    const naturalW = chart.offsetWidth;
    const naturalH = chart.offsetHeight;
    if (naturalW <= 0 || naturalH <= 0) return 1;
    const fit = Math.min(availW / naturalW, availH / naturalH, maxZoom);
    return Math.max(minZoom, Number(fit.toFixed(2)));
  }, []);

  // Measure natural chart dimensions & auto-fit cleanly once on initial mount
  useEffect(() => {
    const chart = chartRef.current;
    const vp = viewportRef.current;
    if (!chart) return;

    const measure = () => {
      const naturalW = chart.offsetWidth;
      const naturalH = chart.offsetHeight;
      setContentSize((prev) =>
        prev.width === naturalW && prev.height === naturalH
          ? prev
          : { width: naturalW, height: naturalH }
      );

      if (!hasAutoFittedRef.current && vp && naturalW > 0 && naturalH > 0) {
        hasAutoFittedRef.current = true;
        const cs = window.getComputedStyle(vp);
        const padX =
          parseFloat(cs.paddingLeft || '0') + parseFloat(cs.paddingRight || '0');
        const padY =
          parseFloat(cs.paddingTop || '0') + parseFloat(cs.paddingBottom || '0');
        const availW = Math.max(240, vp.clientWidth - padX - 8);
        const availH = Math.max(240, vp.clientHeight - padY - 8);
        if (naturalW > availW || naturalH > availH) {
          const fit = Math.max(
            0.42,
            Math.min(availW / naturalW, availH / naturalH, 1)
          );
          setZoom(Number(fit.toFixed(2)));
        }
      }
    };

    const ro = new ResizeObserver(measure);
    ro.observe(chart);
    if (vp) ro.observe(vp);
    return () => ro.disconnect();
  }, []);

  // ESC exits fullscreen when modal is not open
  useEffect(() => {
    if (!isFullscreen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !editingNode) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, editingNode]);

  const handleZoomIn = () =>
    setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 1.8));
  const handleZoomOut = () =>
    setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.3));
  const handleZoomReset = () => setZoom(1);
  const handleFitToScreen = useCallback(() => {
    setZoom(computeFitZoom(0.3, 1.25));
  }, [computeFitZoom]);

  const tiers = normalizeChartTiers(structure);
  const chartStyle = resolveOrgChartStyle(structure.style);
  const chartFontCss = resolveOrgChartCssFont(chartStyle.fontFamily);

  const handleStyleChange = (nextStyle: OrgChartStyleConfig) => {
    onChange({
      ...structure,
      style: nextStyle,
    });
  };

  const handleDownloadPng = async () => {
    try {
      setIsDownloadingPng(true);
      const file = await exportOrgChartToImageFile(
        structure,
        `org-chart-${Date.now()}.png`
      );
      const objectUrl = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success('ສ້າງ ແລະ ດາວໂຫຼດຮູບ PNG ສຳເລັດ');
    } catch (err) {
      console.warn('Download PNG error:', err);
      toast.error('ບໍ່ສາມາດດາວໂຫຼດຮູບ PNG ໄດ້');
    } finally {
      setIsDownloadingPng(false);
    }
  };

  const updateTiers = (newTiers: OrgChartTier[]) => {
    onChange({
      ...structure,
      tiers: newTiers,
      leader: undefined,
      members: undefined,
    });
  };

  // Template switch
  const handleSelectTemplate = (type: 'board' | 'executive' | 'blank') => {
    setActiveTemplate(type);
    if (type === 'board') {
      onChange(JSON.parse(JSON.stringify(DEFAULT_EDL_BOARD_PRESET)));
    } else if (type === 'executive') {
      onChange(JSON.parse(JSON.stringify(DEFAULT_EXECUTIVE_PRESET)));
    } else {
      onChange(JSON.parse(JSON.stringify(DEFAULT_BLANK_PRESET)));
    }
  };

  // Add a new tier / row
  const handleAddTier = () => {
    const newTierNum = tiers.length + 1;
    const newTier: OrgChartTier = {
      id: `tier-${Date.now()}`,
      tierTitleLao: `ລະດັບ ${newTierNum}`,
      tierTitleEn: `LEVEL ${newTierNum}`,
      nodes: [
        {
          id: `node-${Date.now()}`,
          nameLao: 'ຊື່ ແລະ ນາມສະກຸນ',
          nameEn: 'Member Name',
          roleLao: 'ກຳມະການ',
          roleEn: 'Committee',
          departmentBadge: 'ສັງກັດ / ໜ່ວຍງານ',
        },
      ],
    };
    updateTiers([...tiers, newTier]);
  };

  // Delete a tier
  const handleDeleteTier = (tierId: string) => {
    if (tiers.length <= 1) return;
    updateTiers(tiers.filter((t) => t.id !== tierId));
  };

  // Move Tier Up / Down
  const handleMoveTier = (tIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? tIndex - 1 : tIndex + 1;
    if (targetIndex < 0 || targetIndex >= tiers.length) return;
    const newTiers = [...tiers];
    const temp = newTiers[tIndex];
    newTiers[tIndex] = newTiers[targetIndex];
    newTiers[targetIndex] = temp;
    updateTiers(newTiers);
  };

  // Add a new badge-only tier / row (no photo or person card)
  const handleAddBadgeTier = () => {
    const newTierNum = tiers.length + 1;
    const newTier: OrgChartTier = {
      id: generateChartElementId('tier'),
      tierTitleLao: `ໜ່ວຍງານ / ພະແນກ ${newTierNum}`,
      tierTitleEn: `UNIT / DEPARTMENT ${newTierNum}`,
      nodes: [
        {
          id: generateChartElementId('badge'),
          nodeType: 'badge',
          nameLao: 'ຊື່ພະແນກ / ໜ່ວຍງານ',
          nameEn: '',
          roleLao: '',
          roleEn: '',
          departmentBadge: 'ຊື່ພະແນກ / ໜ່ວຍງານ / ສາຂາ',
        },
      ],
    };
    updateTiers([...tiers, newTier]);
  };

  // Add badge-only item into a specific tier
  const handleAddBadgeToTier = (tierId: string) => {
    const newBadgeNode: OrgChartPersonNode = {
      id: generateChartElementId('badge'),
      nodeType: 'badge',
      departmentBadge: 'ຊື່ພະແນກ / ໜ່ວຍງານໃໝ່',
      nameLao: 'ຊື່ພະແນກ / ໜ່ວຍງານໃໝ່',
      nameEn: '',
      roleLao: '',
      roleEn: '',
    };
    const newTiers = tiers.map((t) => {
      if (t.id === tierId) {
        return { ...t, nodes: [...t.nodes, newBadgeNode] };
      }
      return t;
    });
    updateTiers(newTiers);
  };

  // Add person into a specific tier
  const handleAddNodeToTier = (tierId: string) => {
    const newNode: OrgChartPersonNode = {
      id: `node-${Date.now()}`,
      departmentBadge: 'ໜ່ວຍງານ / ພະແນກ / ສັງກັດໃໝ່',
      nameLao: 'ຊື່ ແລະ ນາມສະກຸນໃໝ່',
      nameEn: 'New Member Name',
      roleLao: 'ກຳມະການ',
      roleEn: 'Committee',
    };
    const newTiers = tiers.map((t) => {
      if (t.id === tierId) {
        return { ...t, nodes: [...t.nodes, newNode] };
      }
      return t;
    });
    updateTiers(newTiers);
  };

  // Delete a person node
  const handleDeleteNode = (nodeId: string) => {
    const newTiers = tiers.map((t) => ({
      ...t,
      nodes: t.nodes.filter((n) => n.id !== nodeId),
    }));
    updateTiers(newTiers);
  };

  // Move Member Left / Right within the same tier
  const handleMoveNode = (
    tierId: string,
    index: number,
    direction: 'left' | 'right'
  ) => {
    const newTiers = tiers.map((t) => {
      if (t.id !== tierId) return t;
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= t.nodes.length) return t;
      const newNodes = [...t.nodes];
      const temp = newNodes[index];
      newNodes[index] = newNodes[targetIndex];
      newNodes[targetIndex] = temp;
      return { ...t, nodes: newNodes };
    });
    updateTiers(newTiers);
  };

  // Move Member Up / Down between tiers (spawns new tier below if pushing down from last tier)
  const handleTransferNode = (
    fromTierIndex: number,
    nodeIndex: number,
    direction: 'up' | 'down'
  ) => {
    const fromTier = tiers[fromTierIndex];
    const movingNode = fromTier?.nodes[nodeIndex];
    if (!movingNode) return;

    if (direction === 'down' && fromTierIndex === tiers.length - 1) {
      if (fromTier.nodes.length <= 1) return;
      const updated = tiers.map((t, idx) =>
        idx === fromTierIndex
          ? { ...t, nodes: t.nodes.filter((_, i) => i !== nodeIndex) }
          : t
      );
      const newTier: OrgChartTier = {
        id: generateChartElementId('tier'),
        tierTitleLao: `ລະດັບ ${tiers.length + 1}`,
        tierTitleEn: `LEVEL ${tiers.length + 1}`,
        nodes: [movingNode],
      };
      updateTiers([...updated, newTier]);
      return;
    }

    const toTierIndex = direction === 'up' ? fromTierIndex - 1 : fromTierIndex + 1;
    if (toTierIndex < 0 || toTierIndex >= tiers.length) return;

    const rawTiers = tiers.map((t, idx) => {
      if (idx === fromTierIndex) {
        return { ...t, nodes: t.nodes.filter((_, i) => i !== nodeIndex) };
      }
      if (idx === toTierIndex) {
        return { ...t, nodes: [...t.nodes, movingNode] };
      }
      return t;
    });
    const cleaned = rawTiers.filter(
      (t, idx) => t.nodes.length > 0 || idx === toTierIndex || rawTiers.length === 1
    );
    updateTiers(cleaned.length > 0 ? cleaned : rawTiers);
  };

  // Set per-tier max columns per row
  const handleTierMaxColumnsChange = (tierId: string, maxCols?: number) => {
    const newTiers = tiers.map((t) =>
      t.id === tierId ? { ...t, maxColumns: maxCols } : t
    );
    updateTiers(newTiers);
  };

  // Update tier title
  const handleTierTitleChange = (tierId: string, lao: string, en?: string) => {
    const newTiers = tiers.map((t) => {
      if (t.id === tierId) {
        return {
          ...t,
          tierTitleLao: lao,
          tierTitleEn: en !== undefined ? en : t.tierTitleEn,
        };
      }
      return t;
    });
    updateTiers(newTiers);
  };

  // Trigger file upload for a specific card
  const handleTriggerUpload = (nodeId: string) => {
    targetUploadNodeRef.current = nodeId;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = targetUploadNodeRef.current;
    if (!file || !targetId) return;

    try {
      const photoPath = await uploadOrProcessAvatar(file);
      const newTiers = tiers.map((t) => ({
        ...t,
        nodes: t.nodes.map((n) =>
          n.id === targetId ? { ...n, photoUrl: photoPath } : n
        ),
      }));
      updateTiers(newTiers);
      toast.success('ອັບໂຫຼດຮູບພາບສຳເລັດ');
    } catch (err) {
      console.warn('Failed to upload photo:', err);
      toast.error('ອັບໂຫຼດຮູບພາບບໍ່ສຳເລັດ');
    }
    e.target.value = '';
  };

  // Save from node modal
  const handleSaveNode = (updated: OrgChartPersonNode) => {
    const newTiers = tiers.map((t) => ({
      ...t,
      nodes: t.nodes.map((n) => (n.id === updated.id ? updated : n)),
    }));
    updateTiers(newTiers);
  };

  const totalMembers = tiers.reduce((acc, t) => acc + t.nodes.length, 0);
  const isEditing = !readOnly && !previewMode;

  return (
    <div
      className={cn(
        'flex flex-col w-full bg-slate-50/70 border border-slate-200/80 overflow-hidden',
        isFullscreen
          ? 'fixed inset-0 z-[60] h-screen w-screen rounded-none border-0 bg-slate-100'
          : 'h-full min-h-[520px] rounded-2xl'
      )}
    >
      {/* Hidden file input for fast 1-click photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ReadOnly Preview Control Bar (Zoom, Fit, PNG & Fullscreen) */}
      {readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-white border-b border-slate-200/70 text-xs shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
            <span>{tiers.length} ຊັ້ນຂັ້ນ</span>
            <span className="h-3 w-px bg-slate-200" />
            <span>{totalMembers} ຕຳແໜ່ງ</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloadingPng}
              className="h-8 px-2.5 sm:px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 font-medium transition cursor-pointer text-xs disabled:opacity-50"
              title="ດາວໂຫຼດຮູບ PNG"
            >
              {isDownloadingPng ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              ) : (
                <Download className="h-3.5 w-3.5 text-blue-600" />
              )}
              <span>PNG</span>
            </button>

            <div className="flex items-center gap-0.5 border border-slate-200 rounded-xl bg-white p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="ຫຍໍ້"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-1.5 text-[11px] font-mono text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                title="100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="ຂະຫຍາຍ"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleFitToScreen}
              className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition cursor-pointer text-xs"
              title="ປັບຂະໜາດໃຫ້ພໍດີກັບໜ້າຈໍ"
            >
              <Scan className="h-3.5 w-3.5" />
              <span>ພໍດີຈໍ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              className={cn(
                'h-8 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 font-medium transition cursor-pointer text-xs',
                isFullscreen
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              )}
              title={isFullscreen ? 'ອອກຈາກໂໝດເຕັມຈໍ (ESC)' : 'ເບິ່ງແບບເຕັມຈໍ'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              <span>{isFullscreen ? 'ຫຍໍ້ຈໍ' : 'ເຕັມຈໍ'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-2.5 sm:p-3 sm:px-4 bg-white border-b border-slate-200/70 text-xs shrink-0">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            <span className="text-[11px] font-bold text-slate-500 px-1.5 shrink-0">
              ແມ່ແບບ:
            </span>
            <button
              type="button"
              onClick={() => handleSelectTemplate('board')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap text-xs',
                activeTemplate === 'board'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              ສະພາຜູ້ບໍລິຫານ
            </button>
            <button
              type="button"
              onClick={() => handleSelectTemplate('executive')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap text-xs',
                activeTemplate === 'executive'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              ຄະນະຜູ້ອຳນວຍການ
            </button>
            <button
              type="button"
              onClick={() => handleSelectTemplate('blank')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-medium transition cursor-pointer whitespace-nowrap text-xs',
                activeTemplate === 'blank'
                  ? 'bg-blue-600 text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              ເລີ່ມຕົ້ນເປົ່າ
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddTier}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold gap-1 text-xs cursor-pointer shadow-2xs"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>+ ເພີ່ມຊັ້ນຄົນ ({tiers.length})</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleAddBadgeTier}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 font-semibold gap-1 text-xs cursor-pointer shadow-2xs"
              title="ເພີ່ມແຖວໃໝ່ທີ່ມີສະເພາະກ່ອງປ້າຍ (ບໍ່ມີຮູບ ແລະ ຊື່ຄົນ)"
            >
              <Tag className="h-3.5 w-3.5" />
              <span>+ ເພີ່ມຊັ້ນປ້າຍ</span>
            </Button>

            {/* Quick Font Family Switcher */}
            <div
              className="h-8 px-2 rounded-xl border border-slate-200 bg-white flex items-center gap-1.5 text-xs"
              title="ປ່ຽນຮູບແບບຟ້ອນຂອງໂຄງຮ່າງ"
            >
              <Type className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <select
                value={chartStyle.fontFamily}
                onChange={(e) =>
                  handleStyleChange({
                    ...chartStyle,
                    fontFamily: e.target.value as OrgChartFontId,
                  })
                }
                aria-label="ເລືອກຟ້ອນໂຄງຮ່າງ"
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1 max-w-[140px] truncate"
              >
                {ORG_CHART_FONT_OPTIONS.map((fontOpt) => (
                  <option key={fontOpt.id} value={fontOpt.id}>
                    {fontOpt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowStylePanel((v) => !v)}
              className={cn(
                'h-8 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 font-medium transition cursor-pointer text-xs',
                showStylePanel
                  ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              )}
              title="ປັບຟ້ອນ, ຂະໜາດຕົວອັກສອນ, ກາດ ແລະ ສີ"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>ຂະໜາດ & ສີ</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloadingPng}
              className="h-8 px-2.5 sm:px-3 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 font-medium transition cursor-pointer text-xs disabled:opacity-50"
              title="ທົດສອບດາວໂຫຼດຮູບ PNG"
            >
              {isDownloadingPng ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
              ) : (
                <Download className="h-3.5 w-3.5 text-blue-600" />
              )}
              <span className="hidden md:inline">PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={cn(
                'h-8 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 font-medium transition cursor-pointer text-xs',
                previewMode
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{previewMode ? 'ແກ້ໄຂ' : 'ຕົວຢ່າງ'}</span>
            </button>

            {/* Zoom, Fit & Fullscreen Controls */}
            <div className="flex items-center gap-0.5 border border-slate-200 rounded-xl bg-white p-0.5">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="ຫຍໍ້"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="px-1.5 text-[11px] font-mono text-slate-600 hover:bg-slate-100 rounded transition cursor-pointer"
                title="ຂະໜາດ 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                title="ຂະຫຍາຍ"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleFitToScreen}
              className="h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition cursor-pointer text-xs"
              title="ປັບຂະໜາດໃຫ້ພໍດີກັບໜ້າຈໍ"
            >
              <Scan className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">ພໍດີຈໍ</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((v) => !v)}
              className={cn(
                'h-8 px-2.5 sm:px-3 rounded-xl border flex items-center gap-1.5 font-medium transition cursor-pointer text-xs',
                isFullscreen
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
              )}
              title={isFullscreen ? 'ອອກຈາກໂໝດເຕັມຈໍ (ESC)' : 'ຂະຫຍາຍເຕັມຈໍ'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {isFullscreen ? 'ຫຍໍ້ຈໍ' : 'ເຕັມຈໍ'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Style Inspector (Fonts, Card Size, Gaps, Colors) */}
      {!readOnly && showStylePanel && (
        <OrgChartStylePanel style={chartStyle} onChange={handleStyleChange} />
      )}

      {/* Main Canvas Workspace (Scrollable with pan & zoom, scaled box tracking) */}
      <div
        ref={viewportRef}
        className="flex-1 overflow-auto p-3 sm:p-5 flex min-h-[500px] relative select-none"
      >
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden absolute top-2 left-2 z-10 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full shadow-md pointer-events-none flex items-center gap-1">
          <span>💡 ເລື່ອນຊ້າຍ-ຂວາ ຫຼື ກົດ ພໍດີຈໍ</span>
        </div>

        <div
          style={
            contentSize.width > 0
              ? {
                  width: Math.ceil(contentSize.width * zoom),
                  height: Math.ceil(contentSize.height * zoom),
                }
              : undefined
          }
          className="m-auto relative shrink-0 transition-[width,height] duration-150 ease-out"
        >
          <div
            ref={chartRef}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.15s ease-out',
              backgroundColor: chartStyle.backgroundColor,
              fontFamily: chartFontCss,
            }}
            className={cn(
              'flex flex-col items-center py-6 px-8 rounded-3xl shadow-sm border border-slate-200/80 w-max',
              contentSize.width > 0 && 'absolute top-0 left-0'
            )}
          >
          {/* 1. Top Header Pill */}
          <div className="relative group mb-8">
            <div
              style={{
                borderColor: chartStyle.headerBorderColor,
                borderRadius: `${Math.min(chartStyle.cardRadius, 16)}px`,
              }}
              className="px-6 sm:px-10 py-3 border-2 bg-white shadow-xs text-center min-w-[280px] sm:min-w-[380px]"
            >
              {isEditing ? (
                <div className="flex flex-col items-center space-y-0.5">
                  <div className="inline-grid items-center justify-items-center max-w-[min(780px,85vw)]">
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: `${chartStyle.headerTitleLaoSize}px`,
                        fontFamily: 'inherit',
                      }}
                      className="col-start-1 row-start-1 invisible whitespace-pre px-2 font-bold leading-snug pointer-events-none"
                    >
                      {(structure.chartTitleLao || 'ຫົວຂໍ້ໂຄງຮ່າງ (ລາວ)') + ' '}
                    </span>
                    <textarea
                      rows={Math.min(
                        4,
                        Math.max(
                          1,
                          (structure.chartTitleLao || '').split(/\r?\n/).length
                        )
                      )}
                      value={structure.chartTitleLao}
                      onChange={(e) =>
                        onChange({ ...structure, chartTitleLao: e.target.value })
                      }
                      placeholder="ຫົວຂໍ້ໂຄງຮ່າງ (ລາວ)"
                      style={{
                        fontSize: `${chartStyle.headerTitleLaoSize}px`,
                        color: chartStyle.primaryTextColor,
                        fontFamily: 'inherit',
                      }}
                      className="col-start-1 row-start-1 font-bold text-center w-full h-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 resize-none overflow-hidden bg-transparent leading-snug whitespace-pre"
                    />
                  </div>
                  <div className="inline-grid items-center justify-items-center max-w-[min(780px,85vw)]">
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: `${chartStyle.headerTitleEnSize}px`,
                        fontFamily: 'inherit',
                      }}
                      className="col-start-1 row-start-1 invisible whitespace-pre px-2 font-bold tracking-wider uppercase leading-snug pointer-events-none"
                    >
                      {(structure.chartTitleEn || 'CHART TITLE (EN)') + ' '}
                    </span>
                    <textarea
                      rows={Math.min(
                        4,
                        Math.max(
                          1,
                          (structure.chartTitleEn || '').split(/\r?\n/).length
                        )
                      )}
                      value={structure.chartTitleEn}
                      onChange={(e) =>
                        onChange({ ...structure, chartTitleEn: e.target.value })
                      }
                      placeholder="CHART TITLE (EN)"
                      style={{
                        fontSize: `${chartStyle.headerTitleEnSize}px`,
                        fontFamily: 'inherit',
                      }}
                      className="col-start-1 row-start-1 font-bold tracking-wider text-blue-600 uppercase text-center w-full h-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-2 resize-none overflow-hidden bg-transparent leading-snug whitespace-pre"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2
                    style={{
                      fontSize: `${chartStyle.headerTitleLaoSize}px`,
                      color: chartStyle.primaryTextColor,
                    }}
                    className="font-bold whitespace-pre leading-snug"
                  >
                    {structure.chartTitleLao || 'ໂຄງຮ່າງການຈັດຕັ້ງ'}
                  </h2>
                  <p
                    style={{
                      fontSize: `${chartStyle.headerTitleEnSize}px`,
                    }}
                    className="font-bold tracking-wider text-blue-600 uppercase mt-0.5 whitespace-pre leading-snug"
                  >
                    {structure.chartTitleEn || 'ORGANIZATION STRUCTURE'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 2. Multi-Tier Rendering */}
          <div
            style={{ gap: `${chartStyle.tierGap}px` }}
            className="flex flex-col items-center w-full"
          >
            {tiers.map((tier, tIdx) => {
              const nodeCount = tier.nodes.length;
              const effectiveCols = resolveTierMaxColumns(
                tier,
                chartStyle.maxColumnsPerRow
              );
              const nodeRows = chunkTierNodes(tier.nodes, effectiveCols);

              return (
                <div key={tier.id} className="relative flex flex-col items-center w-full">
                  {/* Stem from previous tier */}
                  {tIdx > 0 && (
                    <div
                      style={{
                        backgroundColor: chartStyle.lineColor,
                        height: `${Math.max(chartStyle.tierGap - 10, 16)}px`,
                        marginTop: `-${chartStyle.tierGap}px`,
                      }}
                      className="w-0.5 mb-2"
                    />
                  )}

                  {/* Tier Bar Header */}
                  {isEditing && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-3 bg-slate-100/80 px-3 py-1 rounded-xl border border-slate-200/60 text-xs">
                      <span className="font-bold text-slate-500 text-[10px]">
                        ແຖວທີ {tIdx + 1}:
                      </span>
                      <input
                        type="text"
                        value={tier.tierTitleLao || ''}
                        onChange={(e) =>
                          handleTierTitleChange(tier.id, e.target.value)
                        }
                        placeholder={`ລະດັບ ${tIdx + 1}`}
                        className="font-bold text-blue-950 bg-transparent px-1.5 py-0.5 rounded focus:bg-white text-xs border-b border-transparent focus:border-blue-400 focus:outline-none"
                      />

                      <span className="h-3 w-px bg-slate-300 mx-0.5" />

                      <button
                        type="button"
                        onClick={() => handleAddNodeToTier(tier.id)}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        title="ເພີ່ມກາດບຸກຄະລາກອນ (ມີຮູບ + ຊື່) ໃນແຖວນີ້"
                      >
                        <Plus className="h-3 w-3" />
                        <span>ເພີ່ມຄົນ ({nodeCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddBadgeToTier(tier.id)}
                        className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        title="ເພີ່ມສະເພາະປ້າຍ / ໜ່ວຍງານ (ບໍ່ມີຮູບ + ຊື່) ໃນແຖວນີ້"
                      >
                        <Tag className="h-3 w-3" />
                        <span>+ ປ້າຍ</span>
                      </button>

                      {/* Per-tier columns / row wrapping control */}
                      <label
                        className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                        title="ກຳນົດຈຳນວນກາດຕໍ່ແຖວ (ລົງແຖວອັດຕະໂນມັດ)"
                      >
                        <span className="text-slate-400">ລົງແຖວ:</span>
                        <select
                          value={
                            typeof tier.maxColumns === 'number'
                              ? String(tier.maxColumns)
                              : ''
                          }
                          onChange={(e) => {
                            const raw = e.target.value;
                            handleTierMaxColumnsChange(
                              tier.id,
                              raw === '' ? undefined : Number(raw)
                            );
                          }}
                          className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="">
                            {chartStyle.maxColumnsPerRow > 0
                              ? `ຕາມຄ່າຫຼັກ (${chartStyle.maxColumnsPerRow})`
                              : 'ຕາມຄ່າຫຼັກ (1 ແຖວ)'}
                          </option>
                          <option value="0">ທັງໝົດ 1 ແຖວ</option>
                          <option value="1">1 ຄົນ/ແຖວ</option>
                          <option value="2">2 ຄົນ/ແຖວ</option>
                          <option value="3">3 ຄົນ/ແຖວ</option>
                          <option value="4">4 ຄົນ/ແຖວ</option>
                          <option value="5">5 ຄົນ/ແຖວ</option>
                          <option value="6">6 ຄົນ/ແຖວ</option>
                        </select>
                      </label>

                      {tiers.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMoveTier(tIdx, 'up')}
                            disabled={tIdx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="ຍ້າຍແຖວຂຶ້ນ"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTier(tIdx, 'down')}
                            disabled={tIdx === tiers.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                            title="ຍ້າຍແຖວລົງ"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(tier.id)}
                            className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="ລຶບແຖວນີ້"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Multi-row cards inside this tier */}
                  <div className="flex flex-col items-center w-full">
                    {nodeRows.map((rowNodes, rIdx) => {
                      const rowStartIdx =
                        rIdx * (effectiveCols > 0 ? effectiveCols : nodeCount);

                      return (
                        <div
                          key={`${tier.id}-row-${rIdx}`}
                          className={cn(
                            'relative flex flex-col items-center w-full',
                            rIdx > 0 && 'mt-6'
                          )}
                        >
                          {/* Continuous center trunk connecting wrapped rows behind opaque cards */}
                          {rIdx < nodeRows.length - 1 && (
                            <div
                              style={{ backgroundColor: chartStyle.lineColor }}
                              className="pointer-events-none absolute top-0 -bottom-6 left-1/2 -translate-x-1/2 w-0.5 z-0"
                            />
                          )}

                          {/* Connector stem from previous wrapped row within same tier */}
                          {rIdx > 0 && (
                            <div
                              style={{ backgroundColor: chartStyle.lineColor }}
                              className="relative z-10 w-0.5 h-5"
                            />
                          )}

                          {/* Horizontal Crossbar line for this row */}
                          {rowNodes.length > 1 && (
                            <div
                              style={{
                                width: `${Math.max(
                                  (rowNodes.length - 1) *
                                    (chartStyle.cardWidth + chartStyle.cardGap),
                                  0
                                )}px`,
                                backgroundColor: chartStyle.lineColor,
                              }}
                              className="relative z-10 h-0.5 mb-0"
                            />
                          )}

                          {/* Cards in this sub-row */}
                          <div
                            style={{ gap: `${chartStyle.cardGap}px` }}
                            className="relative z-10 flex items-start justify-center mt-0"
                          >
                            {rowNodes.map((node, colIdx) => {
                              const nIdx = rowStartIdx + colIdx;
                              const isBadgeOnly = node.nodeType === 'badge';
                              const badgeText =
                                node.departmentBadge ||
                                (isBadgeOnly
                                  ? node.nameLao || 'ປ້າຍ / ໜ່ວຍງານ'
                                  : '');
                              const ov = node.fontOverride;
                              const badgeFontSize =
                                ov?.badgeFontSize ?? chartStyle.badgeFontSize;
                              const nameLaoSize =
                                ov?.nameLaoSize ?? chartStyle.nameLaoSize;
                              const nameEnSize =
                                ov?.nameEnSize ?? chartStyle.nameEnSize;
                              const roleLaoSize =
                                ov?.roleLaoSize ?? chartStyle.roleLaoSize;
                              const roleEnSize =
                                ov?.roleEnSize ?? chartStyle.roleEnSize;
                              const badgeWeight =
                                ov?.badgeWeight ?? chartStyle.badgeWeight;
                              const nameLaoWeight =
                                ov?.nameLaoWeight ?? chartStyle.nameLaoWeight;
                              const nameEnWeight =
                                ov?.nameEnWeight ?? chartStyle.nameEnWeight;
                              const roleLaoWeight =
                                ov?.roleLaoWeight ?? chartStyle.roleLaoWeight;
                              const roleEnWeight =
                                ov?.roleEnWeight ?? chartStyle.roleEnWeight;

                              const controlBar = isEditing ? (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveNode(tier.id, nIdx, 'left');
                                    }}
                                    disabled={nIdx === 0}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                    title="ຍ້າຍຊ້າຍ"
                                  >
                                    <ArrowLeft className="h-2.5 w-2.5" />
                                  </button>

                                  {tIdx > 0 && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTransferNode(tIdx, nIdx, 'up');
                                      }}
                                      className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                                      title="ຍ້າຍຂຶ້ນແຖວເທິງ"
                                    >
                                      <ArrowUp className="h-2.5 w-2.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingNode({ node, tierIndex: tIdx });
                                    }}
                                    className="p-1 rounded-full text-blue-600 hover:bg-blue-50 cursor-pointer"
                                    title="ແກ້ໄຂ"
                                  >
                                    <Edit2 className="h-2.5 w-2.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNode(node.id);
                                    }}
                                    className="p-1 rounded-full text-rose-500 hover:bg-rose-50 cursor-pointer"
                                    title="ລຶບລາຍການນີ້"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </button>

                                  {(tIdx < tiers.length - 1 || nodeCount > 1) && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTransferNode(tIdx, nIdx, 'down');
                                      }}
                                      className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                                      title={
                                        tIdx < tiers.length - 1
                                          ? 'ຍ້າຍລົງແຖວລຸ່ມ'
                                          : 'ຍ້າຍລົງແຖວໃໝ່ດ້ານລຸ່ມ'
                                      }
                                    >
                                      <ArrowDown className="h-2.5 w-2.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveNode(tier.id, nIdx, 'right');
                                    }}
                                    disabled={nIdx === nodeCount - 1}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                    title="ຍ້າຍຂວາ"
                                  >
                                    <ArrowRight className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              ) : null;

                              return (
                              <div
                                key={node.id}
                                style={{
                                  width: `${chartStyle.cardWidth}px`,
                                  fontFamily: ov?.fontFamily
                                    ? resolveOrgChartCssFont(ov.fontFamily)
                                    : undefined,
                                }}
                                className="flex flex-col items-center relative group shrink-0"
                              >
                                {/* Vertical stem from crossbar to card/pill */}
                                {rowNodes.length > 1 && (
                                  <div
                                    style={{ backgroundColor: chartStyle.lineColor }}
                                    className="w-0.5 h-5"
                                  />
                                )}

                        {/* Department Badge Pill */}
                        {badgeText && (
                          <>
                            <div
                              onClick={() =>
                                isEditing &&
                                setEditingNode({ node, tierIndex: tIdx })
                              }
                              style={{
                                borderColor: chartStyle.badgeBorderColor,
                                borderRadius: `${Math.min(chartStyle.cardRadius, 12)}px`,
                              }}
                              className={cn(
                                'relative min-h-[44px] py-2 bg-white shadow-2xs flex items-center justify-center text-center transition cursor-pointer',
                                isBadgeOnly ? 'border-2 py-2.5 min-h-[48px]' : 'border',
                                rowNodes.length === 1
                                  ? 'min-w-full w-max max-w-[min(560px,85vw)] px-4'
                                  : 'w-full px-2',
                                isEditing && 'hover:bg-blue-50/40 active:scale-[0.98]'
                              )}
                              title={isEditing ? 'ກົດເພື່ອແກ້ໄຂ' : undefined}
                            >
                              {(ov?.badgeNoAutoWrap ?? chartStyle.badgeNoAutoWrap) ? (
                                <StrictLineBadgeText
                                  text={badgeText}
                                  fontSize={badgeFontSize}
                                  color={chartStyle.primaryTextColor}
                                  enScale={chartStyle.badgeEnScale}
                                  fontWeight={badgeWeight}
                                />
                              ) : (
                                <p
                                  style={{
                                    fontSize: `${badgeFontSize}px`,
                                    color: chartStyle.primaryTextColor,
                                    fontWeight: badgeWeight,
                                  }}
                                  className="w-full whitespace-pre-line break-words overflow-hidden leading-snug"
                                >
                                  {renderScaledBadgeRuns(
                                    badgeText,
                                    chartStyle.badgeEnScale
                                  )}
                                </p>
                              )}

                              {isBadgeOnly && controlBar}
                            </div>
                            {!isBadgeOnly && (
                              <div
                                style={{ backgroundColor: chartStyle.lineColor }}
                                className="w-0.5 h-3"
                              />
                            )}
                          </>
                        )}

                        {/* Card Box (Person nodes only) */}
                        {!isBadgeOnly && (
                        <div
                          style={{
                            borderColor:
                              tIdx === 0
                                ? chartStyle.leaderBorderColor
                                : chartStyle.memberBorderColor,
                            borderRadius: `${chartStyle.cardRadius}px`,
                          }}
                          className="relative w-full p-2.5 pb-3.5 border-2 bg-white shadow-sm hover:shadow-md transition-all"
                        >
                          {/* Photo */}
                          <div
                            style={{
                              height: `${chartStyle.photoHeight}px`,
                              borderRadius: `${Math.max(chartStyle.cardRadius - 6, 6)}px`,
                            }}
                            className="relative w-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center"
                          >
                            {node.photoUrl ? (
                              <Image
                                src={resolveAvatarUrl(node.photoUrl)}
                                alt={node.nameLao}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-slate-300 gap-1">
                                <User className="h-12 w-12" />
                                <span className="text-[10px]">ຍັງບໍ່ມີຮູບ</span>
                              </div>
                            )}

                            {/* Mobile direct edit buttons */}
                            {isEditing && (
                              <div className="sm:hidden absolute top-1.5 right-1.5 flex items-center gap-1 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTriggerUpload(node.id);
                                  }}
                                  className="p-1.5 rounded-lg bg-white/95 text-blue-600 shadow-md border border-slate-200 cursor-pointer active:scale-95"
                                  title="ປ່ຽນຮູບພາບ"
                                >
                                  <Camera className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingNode({ node, tierIndex: tIdx });
                                  }}
                                  className="p-1.5 rounded-lg bg-white/95 text-amber-600 shadow-md border border-slate-200 cursor-pointer active:scale-95"
                                  title="ແກ້ໄຂ"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}

                            {/* Desktop hover action */}
                            {isEditing && (
                              <div className="hidden sm:flex absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-1.5 backdrop-blur-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleTriggerUpload(node.id)}
                                  className="p-1.5 rounded-lg bg-white text-slate-800 hover:bg-slate-100 shadow-md transition cursor-pointer text-[11px] font-semibold flex items-center gap-1"
                                  title="ປ່ຽນຮູບພາບ"
                                >
                                  <Camera className="h-3 w-3 text-blue-600" />
                                  <span>ປ່ຽນຮູບ</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingNode({ node, tierIndex: tIdx })
                                  }
                                  className="p-1.5 rounded-lg bg-white text-slate-800 hover:bg-slate-100 shadow-md transition cursor-pointer"
                                  title="ແກ້ໄຂຂໍ້ມູນ"
                                >
                                  <Edit2 className="h-3 w-3 text-amber-600" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Member Info */}
                          <div
                            onClick={() =>
                              isEditing &&
                              setEditingNode({ node, tierIndex: tIdx })
                            }
                            title={isEditing ? 'ກົດເພື່ອແກ້ໄຂຂໍ້ມູນ' : undefined}
                            className={cn(
                              'mt-2.5 text-center space-y-0.5 px-0.5',
                              isEditing && 'cursor-pointer hover:opacity-80 transition-opacity'
                            )}
                          >
                            <p
                              style={{
                                fontSize: `${nameLaoSize}px`,
                                color: chartStyle.primaryTextColor,
                                fontWeight: nameLaoWeight,
                              }}
                              className="leading-snug whitespace-pre-line break-words"
                            >
                              {node.nameLao || 'ຊື່ ແລະ ນາມສະກຸນ'}
                            </p>
                            <p
                              style={{
                                fontSize: `${nameEnSize}px`,
                                color: chartStyle.secondaryTextColor,
                                fontWeight: nameEnWeight,
                              }}
                              className="leading-snug whitespace-pre-line break-words"
                            >
                              {node.nameEn || 'Name & Surname'}
                            </p>
                            <div className="pt-1.5 border-t border-slate-100 mt-1.5 space-y-0.5">
                              <p
                                style={{
                                  fontSize: `${roleLaoSize}px`,
                                  color: chartStyle.primaryTextColor,
                                  fontWeight: roleLaoWeight,
                                }}
                                className="leading-snug whitespace-pre-line break-words"
                              >
                                {node.roleLao || 'ຕຳແໜ່ງ'}
                              </p>
                              <p
                                style={{
                                  fontSize: `${roleEnSize}px`,
                                  color: chartStyle.secondaryTextColor,
                                  fontWeight: roleEnWeight,
                                }}
                                className="leading-snug whitespace-pre-line break-words"
                              >
                                {node.roleEn || 'Position'}
                              </p>
                            </div>
                          </div>

                          {/* Card Control Bar */}
                          {controlBar}
                        </div>
                        )}
                      </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>

      {/* 3. Node Edit Modal */}
      {editingNode && (
        <OrgChartNodeEditorModal
          isOpen={Boolean(editingNode)}
          node={editingNode.node}
          isLeader={editingNode.tierIndex === 0}
          onClose={() => setEditingNode(null)}
          onSave={handleSaveNode}
        />
      )}
    </div>
  );
}
