'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  User,
  Eye,
  Layers,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  OrgChartStructure,
  OrgChartPersonNode,
  OrgChartTier,
} from '../../domain/org-chart-designer.types';
import {
  DEFAULT_EDL_BOARD_PRESET,
  DEFAULT_EXECUTIVE_PRESET,
  DEFAULT_BLANK_PRESET,
  normalizeChartTiers,
} from '../../domain/org-chart-designer.types';
import { compressAvatarImage } from '../../application/org-chart-canvas-exporter';
import { OrgChartNodeEditorModal } from './org-chart-node-editor-modal';
import { cn } from '@/lib/utils';

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

  // Quick photo upload ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetUploadNodeRef = useRef<string | null>(null);

  // Auto-detect mobile screen on mount to provide comfortable initial zoom
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setZoom(0.65);
    }
  }, []);

  const handleZoomIn = () => setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 1.5));
  const handleZoomOut = () => setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.4));
  const handleZoomReset = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setZoom(0.65);
    } else {
      setZoom(1);
    }
  };

  const tiers = normalizeChartTiers(structure);

  const updateTiers = (newTiers: OrgChartTier[]) => {
    onChange({
      ...structure,
      tiers: newTiers,
      leader: newTiers[0]?.nodes[0] || structure.leader,
      members: newTiers.slice(1).flatMap((t) => t.nodes),
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

  // Move Member Up / Down between tiers
  const handleTransferNode = (
    fromTierIndex: number,
    nodeIndex: number,
    direction: 'up' | 'down'
  ) => {
    const toTierIndex = direction === 'up' ? fromTierIndex - 1 : fromTierIndex + 1;
    if (toTierIndex < 0 || toTierIndex >= tiers.length) return;

    const movingNode = tiers[fromTierIndex].nodes[nodeIndex];
    const newTiers = tiers.map((t, idx) => {
      if (idx === fromTierIndex) {
        return { ...t, nodes: t.nodes.filter((_, i) => i !== nodeIndex) };
      }
      if (idx === toTierIndex) {
        return { ...t, nodes: [...t.nodes, movingNode] };
      }
      return t;
    });
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
      const compressedUrl = await compressAvatarImage(file);
      const newTiers = tiers.map((t) => ({
        ...t,
        nodes: t.nodes.map((n) =>
          n.id === targetId ? { ...n, photoUrl: compressedUrl } : n
        ),
      }));
      updateTiers(newTiers);
    } catch (err) {
      console.warn('Failed to upload compressed photo:', err);
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
    <div className="flex flex-col h-full w-full bg-slate-50/70 rounded-2xl border border-slate-200/80 overflow-hidden">
      {/* Hidden file input for fast 1-click photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

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
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAddTier}
              className="h-8 px-2.5 sm:px-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold gap-1 text-xs cursor-pointer shadow-2xs"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>+ ເພີ່ມຊັ້ນ/ແຖວ ({tiers.length})</span>
            </Button>

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

            {/* Zoom Controls */}
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
                title="ຂະໜາດພໍດີ"
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
          </div>
        </div>
      )}

      {/* Main Canvas Workspace (Scrollable with pan & zoom) */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8 flex items-start justify-center min-h-[420px] md:min-h-[550px] relative select-none">
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden absolute top-2 left-2 z-10 bg-slate-900/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-full shadow-md pointer-events-none flex items-center gap-1">
          <span>💡 ເລື່ອນຊ້າຍ-ຂວາ ຫຼື ຫຍໍ້-ຂະຫຍາຍ</span>
        </div>

        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className="flex flex-col items-center py-6 px-10 bg-white rounded-3xl shadow-sm border border-slate-200/80 min-w-max"
        >
          {/* 1. Top Header Pill */}
          <div className="relative group mb-8">
            <div className="px-6 sm:px-10 py-3 rounded-2xl border-2 border-blue-900 bg-white shadow-xs text-center min-w-[280px] sm:min-w-[380px]">
              {isEditing ? (
                <div className="space-y-0.5">
                  <input
                    type="text"
                    value={structure.chartTitleLao}
                    onChange={(e) =>
                      onChange({ ...structure, chartTitleLao: e.target.value })
                    }
                    placeholder="ຫົວຂໍ້ໂຄງຮ່າງ (ລາວ)"
                    className="text-lg font-bold text-blue-950 text-center w-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                  <input
                    type="text"
                    value={structure.chartTitleEn}
                    onChange={(e) =>
                      onChange({ ...structure, chartTitleEn: e.target.value })
                    }
                    placeholder="CHART TITLE (EN)"
                    className="text-[11px] font-bold tracking-wider text-blue-600 uppercase text-center w-full focus:outline-none focus:ring-1 focus:ring-blue-400 rounded px-1"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-blue-950">
                    {structure.chartTitleLao || 'ໂຄງຮ່າງການຈັດຕັ້ງ'}
                  </h2>
                  <p className="text-[11px] font-bold tracking-wider text-blue-600 uppercase mt-0.5">
                    {structure.chartTitleEn || 'ORGANIZATION STRUCTURE'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 2. Multi-Tier Rendering */}
          <div className="flex flex-col items-center space-y-10 w-full">
            {tiers.map((tier, tIdx) => {
              const nodeCount = tier.nodes.length;

              return (
                <div key={tier.id} className="relative flex flex-col items-center w-full">
                  {/* Stem from previous tier */}
                  {tIdx > 0 && (
                    <div className="w-0.5 h-8 bg-slate-400/80 -mt-10 mb-2" />
                  )}

                  {/* Tier Bar Header */}
                  {isEditing && (
                    <div className="flex items-center gap-2 mb-3 bg-slate-100/80 px-3 py-1 rounded-xl border border-slate-200/60 text-xs">
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

                      <span className="h-3 w-px bg-slate-300 mx-1" />

                      <button
                        type="button"
                        onClick={() => handleAddNodeToTier(tier.id)}
                        className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        title="ເພີ່ມຄົນໃນແຖວນີ້"
                      >
                        <Plus className="h-3 w-3" />
                        <span>ເພີ່ມຄົນ ({nodeCount})</span>
                      </button>

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

                  {/* Horizontal Crossbar line if multiple nodes */}
                  {nodeCount > 1 && (
                    <div
                      style={{
                        width: `${Math.max((nodeCount - 1) * 208, 0)}px`,
                      }}
                      className="h-0.5 bg-slate-400/80 mb-0"
                    />
                  )}

                  {/* Nodes in this tier */}
                  <div className="flex items-start justify-center gap-4 mt-0">
                    {tier.nodes.map((node, nIdx) => (
                      <div
                        key={node.id}
                        className="flex flex-col items-center relative group w-48"
                      >
                        {/* Vertical stem from crossbar to card/pill */}
                        {nodeCount > 1 && (
                          <div className="w-0.5 h-5 bg-slate-400/80" />
                        )}

                        {/* Department Badge Pill */}
                        {node.departmentBadge && (
                          <>
                            <div
                              onClick={() =>
                                isEditing &&
                                setEditingNode({ node, tierIndex: tIdx })
                              }
                              className={cn(
                                'w-full min-h-[44px] p-1.5 px-2 rounded-xl border border-blue-200 bg-white shadow-2xs flex items-center justify-center text-center transition cursor-pointer',
                                isEditing && 'hover:border-blue-400 hover:bg-blue-50/40 active:scale-[0.98]'
                              )}
                              title={isEditing ? 'ກົດເພື່ອແກ້ໄຂ' : undefined}
                            >
                              <p className="font-bold text-blue-950 text-[10px] leading-snug line-clamp-2">
                                {node.departmentBadge}
                              </p>
                            </div>
                            <div className="w-0.5 h-3 bg-slate-400/80" />
                          </>
                        )}

                        {/* Card Box */}
                        <div
                          className={cn(
                            'relative w-full p-2.5 pb-3.5 rounded-2xl border-2 bg-white shadow-sm hover:shadow-md transition-all',
                            tIdx === 0
                              ? 'border-amber-400/90'
                              : 'border-amber-300/80'
                          )}
                        >
                          {/* Photo */}
                          <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                            {node.photoUrl ? (
                              <Image
                                src={node.photoUrl}
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
                          <div className="mt-2 text-center space-y-0.5">
                            <p className="font-bold text-blue-950 text-[11px] truncate">
                              {node.nameLao || 'ຊື່ ແລະ ນາມສະກຸນ'}
                            </p>
                            <p className="font-semibold text-slate-500 text-[9px] truncate">
                              {node.nameEn || 'Name & Surname'}
                            </p>
                            <div className="pt-1.5 border-t border-slate-100 mt-1">
                              <p className="font-bold text-blue-950 text-xs">
                                {node.roleLao || 'ຕຳແໜ່ງ'}
                              </p>
                              <p className="text-slate-500 text-[10px]">
                                {node.roleEn || 'Position'}
                              </p>
                            </div>
                          </div>

                          {/* Card Control Bar */}
                          {isEditing && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-slate-200 px-1.5 py-0.5 rounded-full shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveNode(tier.id, nIdx, 'left')
                                }
                                disabled={nIdx === 0}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                title="ຍ້າຍຊ້າຍ"
                              >
                                <ArrowLeft className="h-2.5 w-2.5" />
                              </button>

                              {/* Transfer Up */}
                              {tIdx > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTransferNode(tIdx, nIdx, 'up')
                                  }
                                  className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                                  title="ຍ້າຍຂຶ້ນແຖວເທິງ"
                                >
                                  <ArrowUp className="h-2.5 w-2.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setEditingNode({ node, tierIndex: tIdx })
                                }
                                className="p-1 rounded-full text-blue-600 hover:bg-blue-50 cursor-pointer"
                                title="ແກ້ໄຂ"
                              >
                                <Edit2 className="h-2.5 w-2.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteNode(node.id)}
                                className="p-1 rounded-full text-rose-500 hover:bg-rose-50 cursor-pointer"
                                title="ລຶບຄົນນີ້"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>

                              {/* Transfer Down */}
                              {tIdx < tiers.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTransferNode(tIdx, nIdx, 'down')
                                  }
                                  className="p-1 rounded-full text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                                  title="ຍ້າຍລົງແຖວລຸ່ມ"
                                >
                                  <ArrowDown className="h-2.5 w-2.5" />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveNode(tier.id, nIdx, 'right')
                                }
                                disabled={nIdx === nodeCount - 1}
                                className="p-1 rounded-full text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                title="ຍ້າຍຂວາ"
                              >
                                <ArrowRight className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
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
