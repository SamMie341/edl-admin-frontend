'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Newspaper,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Image as ImageIcon,
  FolderKanban,
  Tags,
  Video,
} from 'lucide-react';
import {
  DataTable,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useNews,
  useDeleteNews,
  useNewsCategories,
} from '../application/use-news.hook';
import { NewsFormModal } from './components/news-form-modal';
import { NewsDetailModal } from './components/news-detail-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { NewsItem, NewsStatus } from '../domain/news.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function NewsView() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<NewsStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [viewingNews, setViewingNews] = useState<NewsItem | null>(null);
  const [deletingNews, setDeletingNews] = useState<NewsItem | null>(null);

  const { data: categories = [] } = useNewsCategories();
  const { data: newsData, isLoading, refetch, isRefetching } = useNews({
    search: searchTerm || undefined,
    page,
    limit,
    categoryId: selectedCategoryId,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });

  const deleteMutation = useDeleteNews();

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedNews(null);
    setFormModalOpen(true);
  };

  const handleEdit = (item: NewsItem) => {
    setSelectedNews(item);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingNews) return;
    try {
      await deleteMutation.mutateAsync(deletingNews.id);
      setDeletingNews(null);
    } catch {
      // Handled by hook toasts
    }
  };

  // Filter client-side when needed
  const rawItems = newsData?.items || [];
  const filteredItems = useMemo(() => {
    return rawItems.filter((item) => {
      if (selectedCategoryId !== undefined && item.categoryId !== selectedCategoryId) {
        return false;
      }
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [rawItems, selectedCategoryId, selectedStatus]);

  const columns: ColumnDef<NewsItem>[] = [
    {
      header: 'ຮູບປົກ',
      className: 'w-[90px]',
      cell: (row) => (
        <div className="relative h-12 w-16 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
          {row.coverImage ? (
            <Image
              src={getStorageUrl(row.coverImage)}
              alt={row.titleLa}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-400" />
          )}
          {row.videoUrl && (
            <span className="absolute bottom-1 right-1 p-0.5 rounded bg-black/60 text-white">
              <Video className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'ຫົວຂໍ້ຂ່າວສານ & ເນື້ອໃນຫຍໍ້',
      cell: (row) => (
        <div className="space-y-1 max-w-[340px]">
          <p className="font-bold text-slate-800 text-xs line-clamp-1">
            {row.titleLa}
          </p>
          {row.titleEn && (
            <p className="text-[11px] text-slate-400 font-normal line-clamp-1 italic">
              {row.titleEn}
            </p>
          )}
          {row.subtitleLa && (
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {row.subtitleLa}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'ໝວດໝູ່ & ແທັກ',
      cell: (row) => (
        <div className="space-y-1 max-w-[160px]">
          <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-100/80">
            {row.category?.categoryName || 'ທົ່ວໄປ'}
          </span>
          {row.tags && row.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
              {row.tags.slice(0, 2).map((t) => (
                <span key={t.tagId} className="bg-slate-100 px-1.5 py-0.5 rounded">
                  #{t.tag?.tagName || t.tagId}
                </span>
              ))}
              {row.tags.length > 2 && (
                <span className="text-slate-400">+{row.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'ສະຖານະ',
      cell: (row) => {
        switch (row.status) {
          case 'PUBLISHED':
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ເຜີຍແຜ່ແລ້ວ
              </span>
            );
          case 'DRAFT':
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                ສະບັບຮ່າງ
              </span>
            );
          case 'ARCHIVED':
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                ເກັບຖາວອນ
              </span>
            );
        }
      },
    },
    {
      header: 'ຍອດເບິ່ງ',
      className: 'w-[80px]',
      cell: (row) => (
        <span className="text-[11px] font-mono font-medium text-slate-600">
          {row.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'ວັນທີເຜີຍແຜ່',
      className: 'w-[120px]',
      cell: (row) => (
        <span className="text-[11px] text-slate-400">
          {row.publishedAt
            ? format(new Date(row.publishedAt), 'dd/MM/yyyy')
            : '-'}
        </span>
      ),
    },
    {
      header: <span className="text-right block pr-2">ຈັດການ</span>,
      className: 'w-[120px] text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setViewingNews(row)}
            title="ເບິ່ງເນື້ອຫາຂ່າວ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(row)}
            title="ແກ້ໄຂຂ່າວ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingNews(row)}
            title="ລຶບຂ່າວ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Filter Bar (Category Tabs & Status Dropdown) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId(undefined);
              setPage(1);
            }}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
              selectedCategoryId === undefined
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            ທຸກໝວດໝູ່
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategoryId(cat.id);
                setPage(1);
              }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
                selectedCategoryId === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {cat.categoryName}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value as any);
              setPage(1);
            }}
            className="w-full sm:w-44 h-9 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">ທຸກສະຖານະ</option>
            <option value="PUBLISHED">ເຜີຍແຜ່ແລ້ວ (Published)</option>
            <option value="DRAFT">ສະບັບຮ່າງ (Draft)</option>
            <option value="ARCHIVED">ເກັບຖາວອນ (Archived)</option>
          </select>
        </div>
      </div>

      {/* 2. Main Data Table */}
      <DataTable
        title="ຂ່າວສານປະຊາສຳພັນ ຟຟລ (News & Media)"
        description="ຄຸ້ມຄອງຂ່າວສານ 2 ພາສາ, ຮູບພາບປົກ, Gallery ແລະ ວິດີໂອປະຊາສຳພັນ"
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຫົວຂໍ້ຂ່າວສານ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={newsData?.meta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ສ້າງຂ່າວສານໃໝ່',
          icon: <Plus className="h-4 w-4" />,
          onClick: handleCreate,
        }}
        extraActions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9 px-3 rounded-xl text-xs border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="ດຶງຂໍ້ມູນໃໝ່"
          >
            <RefreshCw
              className={cn('h-3.5 w-3.5', isRefetching && 'animate-spin')}
            />
          </Button>
        }
      />

      {/* 3. Detail View Modal */}
      {viewingNews && (
        <NewsDetailModal
          news={viewingNews}
          isOpen={Boolean(viewingNews)}
          onClose={() => setViewingNews(null)}
          onEdit={(item) => handleEdit(item)}
        />
      )}

      {/* 4. Form Create/Edit Modal */}
      {formModalOpen && (
        <NewsFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          news={selectedNews}
        />
      )}

      {/* 5. Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingNews)}
        onClose={() => setDeletingNews(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບຂ່າວສານ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂ່າວ "${deletingNews?.titleLa}"? ຮູບພາບປົກ ແລະ Gallery ທີ່ກ່ຽວຂ້ອງຈະຖືກລຶບອອກເຊັ່ນກັນ.`}
        confirmLabel="ລຶບຂ່າວສານ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
