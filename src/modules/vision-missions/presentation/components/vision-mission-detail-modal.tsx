'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Target,
  Sparkles,
  Quote,
  Clock,
  Edit,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { VisionMissionItem } from '../../domain/vision-mission.types';
import { VISION_MISSION_TYPE_CONFIG } from '../../domain/vision-mission.types';
import { StatusBadge, RichTextRenderer } from '@/core/presentation/components/shared';
import { format } from 'date-fns';

interface VisionMissionDetailModalProps {
  item: VisionMissionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: VisionMissionItem) => void;
}

export function VisionMissionDetailModal({
  item,
  isOpen,
  onClose,
  onEdit,
}: VisionMissionDetailModalProps) {
  if (!isOpen || !item) return null;

  const config = VISION_MISSION_TYPE_CONFIG[item.entryType] || {
    label: item.entryType,
    color: 'from-blue-600 to-indigo-600',
    badgeColor: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header Gradient */}
        <div
          className={`relative h-28 w-full bg-gradient-to-r ${config.color} p-6 flex items-end justify-between text-white shrink-0`}
        >
          <div className="relative z-10 flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/80">
                {config.labelEn}
              </span>
              <h3 className="text-base font-bold truncate">{item.title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/35 text-white backdrop-blur-md transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Status & Index Ribbon */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md font-bold text-xs border ${config.badgeColor}`}
              >
                {config.label}
              </span>
              <StatusBadge status={item.status} />
            </div>
            <span className="font-mono text-slate-400">
              ລຳດັບ: #{item.orderIndex}
            </span>
          </div>

          {/* Slogan Quote Box */}
          {item.slogan && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-900 flex items-start gap-3">
              <Quote className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="font-bold text-xs leading-relaxed italic">
                &ldquo;{item.slogan}&rdquo;
              </p>
            </div>
          )}

          {/* Illustration Image */}
          {item.imageUrl && (
            <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
              <Image
                src={getStorageUrl(item.imageUrl)}
                alt={item.title}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ລາຍລະອຽດເນື້ອໃນ
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <RichTextRenderer
                content={item.description}
                emptyPlaceholder="ຍັງບໍ່ມີລາຍລະອຽດເນື້ອໃນ"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {item.updatedAt &&
              `ອັບເດດ: ${format(new Date(item.updatedAt), 'dd/MM/yyyy HH:mm')}`}
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
                <span>ແກ້ໄຂ</span>
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
