'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Zap,
  Calendar,
  ExternalLink,
  Download,
  Edit,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/core/presentation/components/shared';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import { useElectricityTariffById } from '../../application/use-electricity-tariffs.hook';
import {
  TARIFF_TYPE_CONFIG,
  TARIFF_STATUS_LABELS,
  type ElectricityTariffItem,
} from '../../domain/electricity-tariff.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ElectricityTariffDetailModalProps {
  item: ElectricityTariffItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: ElectricityTariffItem) => void;
}

export function ElectricityTariffDetailModal({
  item,
  isOpen,
  onClose,
  onEdit,
}: ElectricityTariffDetailModalProps) {
  const { data: detailData } = useElectricityTariffById(
    isOpen && item ? item.id : undefined
  );
  const [previewTab, setPreviewTab] = useState<'image' | 'pdf'>(() =>
    item?.imageUrl ? 'image' : 'pdf'
  );

  if (!isOpen || !item) return null;

  const currentItem = detailData || item;
  const imageUrl = currentItem.imageUrl
    ? getStorageUrl(currentItem.imageUrl)
    : '';
  const pdfUrl = currentItem.pdfUrl
    ? getStorageUrl(currentItem.pdfUrl)
    : '';
  const typeMeta = TARIFF_TYPE_CONFIG[currentItem.tariffType];

  const activeTab =
    previewTab === 'image' && imageUrl
      ? 'image'
      : previewTab === 'pdf' && pdfUrl
      ? 'pdf'
      : imageUrl
      ? 'image'
      : pdfUrl
      ? 'pdf'
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="p-5 sm:px-6 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 text-white flex items-start justify-between gap-4 shrink-0">
          <div className="flex items-start gap-4 min-w-0">
            <div className="h-14 w-14 rounded-2xl border border-white/25 bg-white/15 shrink-0 shadow-md flex items-center justify-center">
              <Zap className="h-7 w-7 text-amber-300" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-bold">
                  {typeMeta?.label || currentItem.tariffType}
                </span>
                <StatusBadge
                  status={currentItem.status}
                  label={
                    TARIFF_STATUS_LABELS[currentItem.status] ||
                    currentItem.status
                  }
                />
              </div>

              <h2 className="text-base sm:text-lg font-bold leading-snug">
                {currentItem.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-blue-100/90">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-300" />
                  <span>
                    ວັນທີມີຜົນບັງຄັບໃຊ້:{' '}
                    {currentItem.effectiveDate
                      ? format(new Date(currentItem.effectiveDate), 'dd/MM/yyyy')
                      : '-'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-black/25 hover:bg-black/45 text-white transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Media Switcher Tabs */}
        {(imageUrl || pdfUrl) && (
          <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewTab('image')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
                    activeTab === 'image'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>ຮູບພາບຕາຕະລາງ</span>
                </button>
              )}
              {pdfUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewTab('pdf')}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
                    activeTab === 'pdf'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>ເອກະສານ PDF</span>
                </button>
              )}
            </div>

            {pdfUrl && (
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>ເປີດ PDF ແຖບໃໝ່</span>
                </a>
                <a
                  href={pdfUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>ດາວໂຫຼດ PDF</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/60">
          {activeTab === 'image' && imageUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-end">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>ເປີດຮູບຂະໜາດເຕັມ</span>
                </a>
              </div>
              <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                <Image
                  src={imageUrl}
                  alt={currentItem.title}
                  fill
                  unoptimized
                  className="object-contain p-3"
                />
              </div>
            </div>
          )}

          {activeTab === 'pdf' && pdfUrl && (
            <div className="w-full h-[480px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
              <iframe
                src={pdfUrl}
                title={currentItem.title}
                className="w-full h-full"
              />
            </div>
          )}

          {!activeTab && (
            <div className="py-14 px-6 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                ຍັງບໍ່ມີຮູບພາບຕາຕະລາງ ຫຼື ໄຟລ໌ PDF
              </p>
              <p className="text-[11px] text-slate-400">
                ກະລຸນາກົດ &quot;ແກ້ໄຂ&quot; ເພື່ອອັບໂຫຼດຮູບພາບ ຫຼື ໄຟລ໌ PDF
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {currentItem.updatedAt &&
              `ອັບເດດລ່າສຸດ: ${format(new Date(currentItem.updatedAt), 'dd/MM/yyyy HH:mm')}`}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(currentItem);
                }}
                className="h-8 px-3 rounded-xl text-xs gap-1.5 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 text-blue-600" />
                <span>ແກ້ໄຂອັດຕາຄ່າໄຟ</span>
              </Button>
            )}
            <Button
              size="sm"
              onClick={onClose}
              className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs cursor-pointer"
            >
              ປິດໜ້າຕ່າງ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
