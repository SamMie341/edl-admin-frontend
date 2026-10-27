'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  FileText,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, RichTextRenderer } from '@/core/presentation/components/shared';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { BranchItem } from '../../domain/branch.types';
import { format } from 'date-fns';

interface BranchDetailModalProps {
  branch: BranchItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (branch: BranchItem) => void;
}

export function BranchDetailModal({
  branch,
  isOpen,
  onClose,
  onEdit,
}: BranchDetailModalProps) {
  if (!isOpen || !branch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Cover Header Banner */}
        <div className="relative h-36 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 shrink-0">
          {branch.coverImage && (
            <Image
              src={getStorageUrl(branch.coverImage)}
              alt="Cover"
              fill
              unoptimized
              className="object-cover opacity-60 mix-blend-overlay"
            />
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Branch Profile Avatar & Header */}
        <div className="px-6 pb-2 -mt-12 relative flex items-end justify-between gap-4">
          <div className="flex items-end gap-3.5">
            <div className="relative h-20 w-20 rounded-2xl bg-white p-1 border-2 border-white shadow-md overflow-hidden shrink-0">
              {branch.branchImage ? (
                <Image
                  src={getStorageUrl(branch.branchImage)}
                  alt={branch.branchName}
                  fill
                  unoptimized
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="h-full w-full rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="pb-1 min-w-0">
              <h3 className="text-base font-bold text-slate-800 truncate">
                {branch.branchName}
              </h3>
              <p className="text-xs text-blue-700 font-medium flex items-center gap-1.5 mt-0.5">
                <Layers className="h-3 w-3" />
                <span>{branch.department?.name || 'ບໍ່ມີຂໍ້ມູນຝ່າຍ'}</span>
              </p>
            </div>
          </div>

          <div className="pb-2 shrink-0">
            <StatusBadge status={branch.status} />
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 divide-y divide-slate-100">
          {/* Contact & Location Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {branch.phoneNumber && (
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <Phone className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="truncate">{branch.phoneNumber}</span>
              </div>
            )}

            {branch.email && (
              <div className="flex items-center gap-2 text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="truncate">{branch.email}</span>
              </div>
            )}

            {branch.address && (
              <div className="sm:col-span-2 flex items-start gap-2 text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <span>{branch.address}</span>
              </div>
            )}

            {branch.locationCoordinates && (
              <div className="sm:col-span-2 flex items-center justify-between text-slate-600 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/70">
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-mono text-[11px] truncate">
                    {branch.locationCoordinates}
                  </span>
                </div>
                {branch.locationCoordinates.startsWith('http') ? (
                  <a
                    href={branch.locationCoordinates}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium text-[11px] flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>ເປີດແຜນທີ່</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                      branch.locationCoordinates
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium text-[11px] flex items-center gap-1 shrink-0 ml-2"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Role & Responsibilities (Rich Text) */}
          <div className="pt-4 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-blue-600" />
              <span>ພາລະບົດບາດ ແລະ ໜ້າທີ່ (Role & Responsibilities)</span>
            </h4>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 max-h-56 overflow-y-auto">
              <RichTextRenderer
                content={branch.roleResponsibilities}
                emptyPlaceholder="ຍັງບໍ່ມີຂໍ້ມູນພາລະບົດບາດ ແລະ ໜ້າທີ່"
              />
            </div>
          </div>

          {/* Org Chart Image */}
          {branch.orgChartImage && (
            <div className="pt-4 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-blue-600" />
                <span>ແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງ (Org Chart)</span>
              </h4>
              <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <Image
                  src={getStorageUrl(branch.orgChartImage)}
                  alt="Org Chart"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {branch.updatedAt &&
              `ອັບເດດລ່າສຸດ: ${format(new Date(branch.updatedAt), 'dd/MM/yyyy HH:mm')}`}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(branch);
                }}
                className="h-8 px-3 rounded-xl text-xs cursor-pointer"
              >
                ແກ້ໄຂສາຂານີ້
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
