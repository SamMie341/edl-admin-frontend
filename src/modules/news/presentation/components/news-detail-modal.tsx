'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Calendar,
  Eye,
  FolderKanban,
  Tags,
  Video,
  Languages,
  ExternalLink,
  Edit,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextRenderer } from '@/core/presentation/components/shared';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { NewsItem, NewsStatus } from '../../domain/news.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface NewsDetailModalProps {
  news: NewsItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (news: NewsItem) => void;
}

export function NewsDetailModal({
  news,
  isOpen,
  onClose,
  onEdit,
}: NewsDetailModalProps) {
  const [lang, setLang] = useState<'la' | 'en'>('la');

  if (!isOpen || !news) return null;

  const title = lang === 'la' ? news.titleLa : news.titleEn || news.titleLa;
  const subtitle =
    lang === 'la' ? news.subtitleLa : news.subtitleEn || news.subtitleLa;
  const content =
    lang === 'la' ? news.contentLa : news.contentEn || news.contentLa;

  const galleryList = Array.isArray(news.galleryImages)
    ? news.galleryImages
    : [];

  const getStatusBadge = (status: NewsStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            ເຜີຍແຜ່ແລ້ວ (Published)
          </span>
        );
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
            ສະບັບຮ່າງ (Draft)
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold">
            ເກັບຖາວອນ (Archived)
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/60 overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Cover Image Header */}
        <div className="relative h-56 w-full bg-slate-900 shrink-0">
          {news.coverImage ? (
            <Image
              src={getStorageUrl(news.coverImage)}
              alt={news.titleLa}
              fill
              unoptimized
              className="object-cover opacity-85"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-center text-white/50 text-xs">
              ບໍ່ມີຮູບປົກ
            </div>
          )}

          {/* Top Bar Floating Controls */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
              <button
                type="button"
                onClick={() => setLang('la')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer',
                  lang === 'la'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-white/80 hover:text-white'
                )}
              >
                🇱🇦 ລາວ
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer',
                  lang === 'en'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-white/80 hover:text-white'
                )}
              >
                🇬🇧 English
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md transition cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Category & Status Overlay */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md">
              {news.category?.categoryName || 'ໝວດໝູ່ທົ່ວໄປ'}
            </span>
            <div>{getStatusBadge(news.status)}</div>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 divide-y divide-slate-100">
          {/* Header Info */}
          <div className="space-y-3 pt-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {title}
            </h2>

            {subtitle && (
              <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                {subtitle}
              </p>
            )}

            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  {news.publishedAt
                    ? format(new Date(news.publishedAt), 'dd/MM/yyyy HH:mm')
                    : 'ຍັງບໍ່ໄດ້ກຳນົດວັນທີ'}
                </span>
              </span>

              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-blue-600" />
                <span>ເຂົ້າຊົມ {news.viewCount.toLocaleString()} ຄັ້ງ</span>
              </span>

              {news.videoUrl && (
                <a
                  href={news.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:underline font-medium"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>ເບິ່ງວິດີໂອ</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>

            {/* Tags Pills */}
            {news.tags && news.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <Tags className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                {news.tags.map((t) => (
                  <span
                    key={t.tagId}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-medium"
                  >
                    #{t.tag?.tagName || t.tagId}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Formatted Rich Text Content */}
          <div className="pt-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              ເນື້ອໃນຂ່າວສານ
            </h4>
            <RichTextRenderer
              content={content}
              emptyPlaceholder="ຍັງບໍ່ມີເນື້ອໃນຂ່າວສານສຳລັບພາສານີ້"
            />
          </div>

          {/* Gallery Images Section */}
          {galleryList.length > 0 && (
            <div className="pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ຮູບພາບ Gallery ປະກອບ ({galleryList.length} ຮູບ)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryList.map((url, idx) => (
                  <a
                    key={idx}
                    href={getStorageUrl(url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs group"
                  >
                    <Image
                      src={getStorageUrl(url)}
                      alt={`Gallery ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {news.updatedAt &&
              `ອັບເດດລ່າສຸດ: ${format(new Date(news.updatedAt), 'dd/MM/yyyy HH:mm')}`}
          </span>
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onEdit(news);
                }}
                className="h-8 px-3 rounded-xl text-xs gap-1.5 cursor-pointer"
              >
                <Edit className="h-3.5 w-3.5 text-blue-600" />
                <span>ແກ້ໄຂຂ່າວນີ້</span>
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
