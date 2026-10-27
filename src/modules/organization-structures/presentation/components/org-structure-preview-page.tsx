'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Network,
  Image as ImageIcon,
  Layout,
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

interface OrgStructurePreviewPageProps {
  item: OrgStructureItem;
  onBack: () => void;
  onEdit: (item: OrgStructureItem) => void;
}

export function OrgStructurePreviewPage({
  item,
  onBack,
  onEdit,
}: OrgStructurePreviewPageProps) {
  const [viewTab, setViewTab] = useState<'interactive' | 'image'>('interactive');
  const [chartData, setChartData] = useState<OrgChartStructure | null>(null);

  useEffect(() => {
    // Check localStorage for interactive chart data
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
  }, [item]);

  const typeConfig = STRUCTURE_TYPE_LABELS[item.structureType] || {
    label: item.structureType,
    color: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] space-y-3 animate-in fade-in-50 duration-200">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 px-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-9 px-3 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-1.5 cursor-pointer font-semibold text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ກັບຄືນໜ້າລາຍການ</span>
          </Button>

          <span className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  {item.structureName}
                </h1>
                <span
                  className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${typeConfig.color}`}
                >
                  {typeConfig.label}
                </span>
                <StatusBadge status={item.status} />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                ລຳດັບ: #{item.orderIndex}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {chartData && item.imageUrl && (
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewTab('interactive')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer',
                  viewTab === 'interactive'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <Layout className="h-3.5 w-3.5" />
                <span>ແຜນຜັງໂຕ້ຕອບ</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab('image')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition cursor-pointer',
                  viewTab === 'image'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>ຮູບພາບຕົ້ນສະບັບ</span>
              </button>
            </div>
          )}

          {item.imageUrl && (
            <a
              href={getStorageUrl(item.imageUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium shadow-2xs transition"
              title="ເປີດຮູບພາບຕົ້ນສະບັບ"
            >
              <span>ເບິ່ງຮູບເຕັມ</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-sm"
          >
            <Edit className="h-3.5 w-3.5" />
            <span>ແກ້ໄຂໂຄງຮ່າງນີ້</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Full-Screen Display Area */}
      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
        {viewTab === 'interactive' && chartData ? (
          <OrgChartDesigner
            structure={chartData}
            onChange={() => {}}
            readOnly={true}
          />
        ) : item.imageUrl ? (
          <div className="relative w-full h-full p-4 flex items-center justify-center bg-slate-50/60">
            <Image
              src={getStorageUrl(item.imageUrl)}
              alt={item.structureName}
              fill
              unoptimized
              className="object-contain p-4"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-400 h-full">
            <ImageIcon className="h-16 w-16 stroke-[1.2]" />
            <p className="text-sm font-medium">ຍັງບໍ່ມີຮູບພາບແຜນຜັງໂຄງຮ່າງ</p>
          </div>
        )}
      </div>
    </div>
  );
}
