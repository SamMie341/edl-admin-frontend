'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  FolderKanban,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Hash,
} from 'lucide-react';
import {
  DataTable,
  StatusBadge,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useNewsCategories,
  useDeleteNewsCategory,
} from '../application/use-news.hook';
import { NewsCategoryModal } from './components/news-category-modal';
import type { NewsCategoryItem } from '../domain/news.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function NewsCategoriesView() {
  const { data: categories = [], isLoading, refetch, isRefetching } = useNewsCategories();
  const deleteMutation = useDeleteNewsCategory();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategoryItem | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<NewsCategoryItem | null>(null);

  // Pagination Client-side
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormModalOpen(true);
  };

  const handleEdit = (category: NewsCategoryItem) => {
    setSelectedCategory(category);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    try {
      await deleteMutation.mutateAsync(deletingCategory.id);
      setDeletingCategory(null);
    } catch {
      // Handled by hook toasts
    }
  };

  // Filtered categories
  const filteredData = useMemo(() => {
    if (!searchTerm) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        c.categoryName.toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

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

  const columns: ColumnDef<NewsCategoryItem>[] = [
    {
      header: 'ລຳດັບ',
      className: 'w-[75px]',
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
          #{row.orderIndex || row.id}
        </span>
      ),
    },
    {
      header: 'ຊື່ໝວດໝູ່ (Category Name)',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-xs">{row.categoryName}</p>
            {row.description && (
              <p className="text-[11px] text-slate-400 line-clamp-1">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'ສະຖານະ',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'ວັນທີສ້າງ',
      className: 'w-[140px]',
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy') : '-'}
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
            title="ແກ້ໄຂໝວດໝູ່"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingCategory(row)}
            title="ລຶບໝວດໝູ່"
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
        title="ໝວດໝູ່ຂ່າວສານປະຊາສຳພັນ (News Categories)"
        description="ຄຸ້ມຄອງໝວດໝູ່ຂ່າວສານ, ລຳດັບການສະແດງຜົນ ແລະ ສະຖານະ"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຊື່ໝວດໝູ່..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ສ້າງໝວດໝູ່ໃໝ່',
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
        <NewsCategoryModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          category={selectedCategory}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບໝວດໝູ່ຂ່າວ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບໝວດໝູ່ "${deletingCategory?.categoryName}"? ຖ້າມີຂ່າວສັງກັດຢູ່ ຈະບໍ່ສາມາດລຶບໄດ້.`}
        confirmLabel="ລຶບໝວດໝູ່"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
