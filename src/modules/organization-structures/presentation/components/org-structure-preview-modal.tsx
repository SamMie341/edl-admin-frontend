'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  Network,
  Image as ImageIcon,
  Layout,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { OrgStructureItem } from '../../domain/org-structure.types';
import { STRUCTURE_TYPE_LABELS } from '../../domain/org-structure.types';
import type { OrgChartStructure } from '../../domain/org-chart-designer.types';
import {
  DEFAULT_EDL_BOARD_PRESET,
  DEFAULT_EXECUTIVE_PRESET,
} from '../../domain/org-chart-designer.types';
import { loadOrgChartFromStorage } from '../../application/org-chart-canvas-exporter';
import { OrgChartDesigner } from './org-chart-designer';
import { StatusBadge } from '@/core/presentation/components/shared';
import { cn } from '@/lib/utils';

interface OrgStructurePreviewModalProps {
  item: OrgStructureItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: OrgStructureItem) => void;
}

export function OrgStructurePreviewModal({
  item,
  isOpen,
  onClose,
  onEdit,
}: OrgStructurePreviewModalProps) {
  const [viewTab, setViewTab] = useState<'interactive' | 'image'>('interactive');
  const [chartData, setChartData] = useState<OrgChartStructure | null>(null);

  useEffect(() => {
    if (!isOpen || !item) return;

    // Check localStorage
    const saved =
      loadOrgChartFromStorage(item.id) ||
      loadOrgChartFromStorage(item.structureName);

    if (saved) {
      setChartData(saved);
      setViewTab('interactive');
    } else if (item.structureType === 'BOARD_OF_DIRECTORS') {
      setChartData(DEFAULT_EDL_BOARD_PRESET);
      setViewTab('interactive');
    } else if (item.structureType === 'EXECUTIVE_BOARD') {
      setChartData(DEFAULT_EXECUTIVE_PRESET);
      setViewTab('interactive');
    } else {
      setChartData(null);
      setViewTab('image');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const typeConfig = STRUCTURE_TYPE_LABELS[item.structureType] || {
    label: item.structureType,
    color: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
              <Network className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-800 text-sm truncate">
                {item.structureName}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeConfig.color}`}
                >
                  {typeConfig.label}
                </span>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>

          {/* Tab switchers + actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {chartData && item.imageUrl && (
              <div className="flex items-center bg-slate-200/60 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setViewTab('interactive')}
                  className={cn(
                    'px-3 py-1 rounded-lg transition cursor-pointer',
                    viewTab === 'interactive'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  ແຜນຜັງໂຕ້ຕອບ
                </button>
                <button
                  type="button"
                  onClick={() => setViewTab('image')}
                  className={cn(
                    'px-3 py-1 rounded-lg transition cursor-pointer',
                    viewTab === 'image'
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  ຮູບພາບຕົ້ນສະບັບ
                </button>
              </div>
            )}

            {item.imageUrl && (
              <a
                href={getStorageUrl(item.imageUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium shadow-2xs transition"
                title="ເປີດຮູບພາບຕົ້ນສະບັບ"
              >
                <span>ຮູບເຕັມ</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto p-4 bg-slate-100/70 min-h-[500px]">
          {viewTab === 'interactive' && chartData ? (
            <div className="h-[65vh] w-full">
              <OrgChartDesigner
                structure={chartData}
                onChange={() => {}}
                readOnly={true}
              />
            </div>
          ) : item.imageUrl ? (
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-sm flex items-center justify-center p-2">
              <Image
                src={getStorageUrl(item.imageUrl)}
                alt={item.structureName}
                fill
                unoptimized
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-24">
              <ImageIcon className="h-12 w-12 stroke-[1.2]" />
              <p className="text-xs font-medium">ຍັງບໍ່ມີຮູບພາບແຜນຜັງໂຄງຮ່າງ</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            ລຳດັບ: #{item.orderIndex}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="h-8 px-3 rounded-xl text-xs gap-1.5 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 text-blue-600" />
                <span>ແກ້ໄຂໂຄງຮ່າງນີ້</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={onClose}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs cursor-pointer"
            >
              ປິດ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
