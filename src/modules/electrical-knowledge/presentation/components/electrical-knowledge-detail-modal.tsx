'use client';

import React from 'react';
import Image from 'next/image';
import {
  X,
  Eye,
  Video,
  ExternalLink,
  Edit,
  Calendar,
  Lightbulb,
  PlusCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  RichTextRenderer,
  StatusBadge,
} from '@/core/presentation/components/shared';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import {
  useElectricalKnowledgeById,
  useIncrementElectricalKnowledgeView,
} from '../../application/use-electrical-knowledge.hook';
import {
  ELECTRICAL_KNOWLEDGE_STATUS_LABELS,
  type ElectricalKnowledgeItem,
} from '../../domain/electrical-knowledge.types';
import { format } from 'date-fns';

interface ElectricalKnowledgeDetailModalProps {
  item: ElectricalKnowledgeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (item: ElectricalKnowledgeItem) => void;
}

function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (
        parsed.pathname.startsWith('/embed/') ||
        parsed.pathname.startsWith('/shorts/')
      ) {
        const id = parsed.pathname.split('/').filter(Boolean)[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function ElectricalKnowledgeDetailModal({
  item,
  isOpen,
  onClose,
  onEdit,
}: ElectricalKnowledgeDetailModalProps) {
  const { data: detailData } = useElectricalKnowledgeById(
    isOpen && item ? item.id : undefined
  );
  const incrementViewMutation = useIncrementElectricalKnowledgeView();

  if (!isOpen || !item) return null;

  const currentItem = detailData || item;
  const embedUrl = getYouTubeEmbedUrl(currentItem.videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Cover Banner */}
        <div className="relative h-56 w-full bg-slate-900 shrink-0">
          {currentItem.coverImage ? (
            <Image
              src={getStorageUrl(currentItem.coverImage)}
              alt={currentItem.title}
              fill
              unoptimized
              className="object-cover opacity-85"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-blue-700 via-indigo-700 to-sky-600 flex flex-col items-center justify-center gap-2 text-white/70">
              <Lightbulb className="h-10 w-10" />
              <span className="text-xs font-medium">
                ບໍ່ມີຮູບໜ້າປົກບົດຄວາມ
              </span>
            </div>
          )}

          {/* Close Button */}
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-md transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Bottom Overlay Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-md">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>ຄວາມຮູ້ດ້ານໄຟຟ້າ</span>
            </span>
            <StatusBadge
              status={currentItem.status}
              label={
                ELECTRICAL_KNOWLEDGE_STATUS_LABELS[currentItem.status] ||
                currentItem.status
              }
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 divide-y divide-slate-100">
          {/* Header Info */}
          <div className="space-y-3 pt-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {currentItem.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  ສ້າງເມື່ອ:{' '}
                  {currentItem.createdAt
                    ? format(new Date(currentItem.createdAt), 'dd/MM/yyyy HH:mm')
                    : '-'}
                </span>
              </span>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Eye className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    ເຂົ້າຊົມ {currentItem.viewCount.toLocaleString()} ຄັ້ງ
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => incrementViewMutation.mutate(currentItem.id)}
                  disabled={incrementViewMutation.isPending}
                  title="ເພີ່ມຍອດເຂົ້າຊົມ (+1)"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 text-[11px] font-medium transition cursor-pointer disabled:opacity-50"
                >
                  <PlusCircle className="h-3 w-3" />
                  <span>+1 View</span>
                </button>
              </div>

              {currentItem.videoUrl && (
                <a
                  href={currentItem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>ເປີດລິ້ງວິດີໂອ</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Embedded Video Preview */}
          {currentItem.videoUrl && (
            <div className="pt-5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ວິດີໂອປະກອບຄວາມຮູ້ (Video)
              </h4>
              {embedUrl ? (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-black shadow-2xs">
                  <iframe
                    src={embedUrl}
                    title={currentItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <a
                  href={currentItem.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
                >
                  <Video className="h-4 w-4" />
                  <span className="truncate max-w-md">
                    {currentItem.videoUrl}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              )}
            </div>
          )}

          {/* Rich Text Body */}
          <div className="pt-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ເນື້ອໃນບົດຄວາມ
            </h4>
            <RichTextRenderer
              content={currentItem.content}
              emptyPlaceholder="ບໍ່ມີເນື້ອໃນບົດຄວາມ"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
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
                <span>ແກ້ໄຂບົດຄວາມ</span>
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
