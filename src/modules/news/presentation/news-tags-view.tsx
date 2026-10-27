'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Tags,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Hash,
} from 'lucide-react';
import {
  DataTable,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useNewsTags,
  useDeleteNewsTag,
} from '../application/use-news.hook';
import { NewsTagModal } from './components/news-tag-modal';
import type { NewsTagItem } from '../domain/news.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function NewsTagsView() {
  const { data: tags = [], isLoading, refetch, isRefetching } = useNewsTags();
  const deleteMutation = useDeleteNewsTag();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<NewsTagItem | null>(null);
  const [deletingTag, setDeletingTag] = useState<NewsTagItem | null>(null);

  // Pagination Client-side
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedTag(null);
    setFormModalOpen(true);
  };

  const handleEdit = (tag: NewsTagItem) => {
    setSelectedTag(tag);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTag) return;
    try {
      await deleteMutation.mutateAsync(deletingTag.id);
      setDeletingTag(null);
    } catch {
      // Handled by hook toasts
    }
  };

  // Filtered tags
  const filteredData = useMemo(() => {
    if (!searchTerm) return tags;
    const term = searchTerm.toLowerCase().replace(/^#/, '');
    return tags.filter((t) => t.tagName.toLowerCase().includes(term));
  }, [tags, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page, limit]);

  const paginationMeta = {
    total: filteredData.length,
    page,
    limit,
    totalPages: Math.ceil(filteredData.length / limit) || 1,
  };

  const columns: ColumnDef<NewsTagItem>[] = [
    {
      header: 'ລະຫັດ',
      className: 'w-[75px]',
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'ຊື່ແທັກຂ່າວສານ (Tag Name)',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100 shadow-2xs">
            <Hash className="h-3 w-3 text-blue-500" />
            <span>{row.tagName}</span>
          </span>
        </div>
      ),
    },
    {
      header: 'ວັນທີສ້າງ',
      className: 'w-[160px]',
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
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
            onClick={() => handleEdit(row)}
            title="ແກ້ໄຂແທັກ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingTag(row)}
            title="ລຶບແທັກ"
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
      {/* Main Data Table */}
      <DataTable
        title="ແທັກຂ່າວສານປະຊາສຳພັນ (News Tags)"
        description="ຄຸ້ມຄອງແທັກສຳລັບຕິດໃສ່ຂ່າວສານ ເພື່ອຄວາມວ່ອງໄວໃນການຄົ້ນຫາ"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຊື່ແທັກ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ສ້າງແທັກໃໝ່',
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

      {/* Form Modal */}
      {formModalOpen && (
        <NewsTagModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          tag={selectedTag}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTag)}
        onClose={() => setDeletingTag(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບແທັກຂ່າວ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບແທັກ "#${deletingTag?.tagName}"? ການເຊື່ອມຕໍ່ແທັກນີ້ກັບຂ່າວສານຈະຖືກຍົກເລີກ.`}
        confirmLabel="ລຶບແທັກ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
