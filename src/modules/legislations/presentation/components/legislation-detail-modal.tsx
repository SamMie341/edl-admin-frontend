'use client';

import React from 'react';
import {
  X,
  Scale,
  Calendar,
  ExternalLink,
  Download,
  Edit,
  FileText,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/core/presentation/components/shared';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import { useLegislationById } from '../../application/use-legislations.hook';
import {
  LEGISLATION_STATUS_LABELS,
  type LegislationItem,
} from '../../domain/legislation.types';
import { format } from 'date-fns';

interface LegislationDetailModalProps {
  item: LegislationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: LegislationItem) => void;
}

export function LegislationDetailModal({
  item,
  isOpen,
  onClose,
  onEdit,
}: LegislationDetailModalProps) {
  const { data: detailData } = useLegislationById(
    isOpen && item ? item.id : undefined
  );

  if (!isOpen || !item) return null;

  const currentItem = detailData || item;
  const pdfUrl = currentItem.fileUrl
    ? getStorageUrl(currentItem.fileUrl)
    : '';

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
              <Scale className="h-7 w-7 text-amber-300" />
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {currentItem.documentNumber && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold">
                    <Hash className="h-3 w-3" />
                    <span>{currentItem.documentNumber}</span>
                  </span>
                )}
                <StatusBadge
                  status={currentItem.status}
                  label={
                    LEGISLATION_STATUS_LABELS[currentItem.status] ||
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
                    ວັນທີອອກເອກະສານ:{' '}
                    {currentItem.issueDate
                      ? format(new Date(currentItem.issueDate), 'dd/MM/yyyy')
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

        {/* Body: PDF Viewer */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/60">
          {pdfUrl ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FileText className="h-4 w-4 text-rose-600" />
                  <span>ຕົວຢ່າງເອກະສານນິຕິກຳ (PDF Preview)</span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>ເປີດແຖບໃໝ່</span>
                  </a>

                  <a
                    href={pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-2xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>ດາວໂຫຼດ PDF</span>
                  </a>
                </div>
              </div>

              <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
                <iframe
                  src={pdfUrl}
                  title={currentItem.title}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="py-14 px-6 rounded-2xl border border-dashed border-slate-300 bg-white text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-700">
                ຍັງບໍ່ມີໄຟລ໌ PDF ສຳລັບເອກະສານນິຕິກຳສະບັບນີ້
              </p>
              <p className="text-[11px] text-slate-400">
                ກະລຸນາກົດ &quot;ແກ້ໄຂ&quot; ເພື່ອອັບໂຫຼດໄຟລ໌ PDF
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
                <span>ແກ້ໄຂເອກະສານ</span>
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
