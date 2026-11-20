'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Scale,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  Archive,
  Calendar,
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
  useLegislations,
  useDeleteLegislation,
} from '../application/use-legislations.hook';
import { usePermission } from '@/core/application/use-permission.hook';
import { LegislationFormModal } from './components/legislation-form-modal';
import { LegislationDetailModal } from './components/legislation-detail-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import {
  LEGISLATION_STATUS_LABELS,
  type LegislationItem,
  type LegislationStatus,
} from '../domain/legislation.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function LegislationsView() {
  const { can } = usePermission();
  const canCreate = can('LEGISLATIONS', 'CREATE');
  const canUpdate = can('LEGISLATIONS', 'UPDATE');
  const canDelete = can('LEGISLATIONS', 'DELETE');

  const [selectedStatus, setSelectedStatus] = useState<
    LegislationStatus | 'ALL'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LegislationItem | null>(
    null
  );
  const [viewingItem, setViewingItem] = useState<LegislationItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LegislationItem | null>(
    null
  );

  const { data: listData, isLoading, refetch, isRefetching } = useLegislations({
    search: searchTerm || undefined,
    page,
    limit,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
  });
  const deleteMutation = useDeleteLegislation();

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedItem(null);
    setFormModalOpen(true);
  };

  const handleEdit = (item: LegislationItem) => {
    setSelectedItem(item);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await deleteMutation.mutateAsync(deletingItem.id);
      setDeletingItem(null);
    } catch {
      // Handled by hook toasts
    }
  };

  // Client-side filter & pagination fallback when backend does not paginate
  const filteredItems = useMemo(() => {
    const rawItems = listData?.items ?? [];
    const term = searchTerm.trim().toLowerCase();

    return rawItems.filter((item) => {
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      if (!listData?.isServerPaginated && term) {
        const titleMatch = item.title.toLowerCase().includes(term);
        const docNumMatch = (item.documentNumber || '')
          .toLowerCase()
          .includes(term);
        return titleMatch || docNumMatch;
      }
      return true;
    });
  }, [listData, selectedStatus, searchTerm]);

  const totalPages = listData?.isServerPaginated
    ? listData.meta.totalPages
    : Math.ceil(filteredItems.length / limit) || 1;

  const currentPage = Math.min(page, totalPages);

  const displayItems = useMemo(() => {
    if (listData?.isServerPaginated) {
      return filteredItems;
    }
    const start = (currentPage - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [filteredItems, listData?.isServerPaginated, currentPage, limit]);

  const paginationMeta = listData?.isServerPaginated
    ? listData.meta
    : {
        total: filteredItems.length,
        page: currentPage,
        limit,
        totalPages,
      };

  // Summary statistics derived from visible list items
  const stats = useMemo(() => {
    const rawItems = listData?.items ?? [];
    return {
      total: listData?.isServerPaginated ? listData.meta.total : rawItems.length,
      activeCount: rawItems.filter((item) => item.status === 'ACTIVE').length,
      archivedCount: rawItems.filter((item) => item.status === 'ARCHIVED')
        .length,
      withPdfCount: rawItems.filter((item) => Boolean(item.fileUrl)).length,
    };
  }, [listData]);

  const columns: ColumnDef<LegislationItem>[] = [
    {
      header: 'ເລກທີເອກະສານ',
      className: 'w-[150px]',
      cell: (row) =>
        row.documentNumber ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-mono font-bold">
            <Hash className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[110px]">
              {row.documentNumber}
            </span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
    {
      header: 'ຊື່ເອກະສານນິຕິກຳ',
      cell: (row) => (
        <div className="space-y-1 max-w-[400px]">
          <button
            type="button"
            onClick={() => setViewingItem(row)}
            className="font-bold text-slate-800 hover:text-blue-700 text-xs text-left line-clamp-2 transition cursor-pointer"
          >
            {row.title}
          </button>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>
              ວັນທີອອກ:{' '}
              {row.issueDate
                ? format(new Date(row.issueDate), 'dd/MM/yyyy')
                : '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'ໄຟລ໌ PDF',
      className: 'w-[140px]',
      cell: (row) =>
        row.fileUrl ? (
          <a
            href={getStorageUrl(row.fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70 text-[11px] font-semibold transition"
            title="ເປີດເບິ່ງ / ດາວໂຫຼດໄຟລ໌ PDF"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>ເປີດ PDF</span>
          </a>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            ຍັງບໍ່ມີໄຟລ໌
          </span>
        ),
    },
    {
      header: 'ສະຖານະ',
      className: 'w-[180px]',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={LEGISLATION_STATUS_LABELS[row.status] || row.status}
        />
      ),
    },
    {
      header: <span className="text-right block pr-2">ຈັດການ</span>,
      className: 'w-[120px] text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setViewingItem(row)}
            title="ເບິ່ງລາຍລະອຽດ ແລະ ຕົວຢ່າງ PDF"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canUpdate && (
            <button
              type="button"
              onClick={() => handleEdit(row)}
              title="ແກ້ໄຂເອກະສານນິຕິກຳ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeletingItem(row)}
              title="ລຶບເອກະສານນິຕິກຳ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const statusFilters: Array<{
    value: LegislationStatus | 'ALL';
    label: string;
  }> = [
    { value: 'ALL', label: 'ທຸກສະຖານະ' },
    { value: 'ACTIVE', label: 'ມີຜົນບັງຄັບໃຊ້ (Active)' },
    { value: 'INACTIVE', label: 'ປິດການນຳໃຊ້ (Inactive)' },
    { value: 'ARCHIVED', label: 'ເກັບຖາວອນ (Archived)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ນິຕິກຳທັງໝົດ
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.total.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ມີຜົນບັງຄັບໃຊ້
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.activeCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ມີໄຟລ໌ PDF
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.withPdfCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Archive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ເກັບຖາວອນ
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.archivedCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setSelectedStatus(filter.value);
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
                selectedStatus === filter.value
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-slate-400">
          ສະແດງ {displayItems.length} ຈາກ {paginationMeta.total} ລາຍການ
        </span>
      </div>

      {/* 3. Main Data Table */}
      <DataTable
        title="ເອກະສານນິຕິກຳ (Legislations & Laws)"
        description="ຄຸ້ມຄອງກົດໝາຍ, ດຳລັດ, ຂໍ້ຕົກລົງ, ລະບຽບການດ້ານໄຟຟ້າ ແລະ ໄຟລ໌ເອກະສານ PDF"
        columns={columns}
        data={displayItems}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາເລກທີ ຫຼື ຊື່ເອກະສານນິຕິກຳ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={
          canCreate
            ? {
                label: 'ເພີ່ມນິຕິກຳໃໝ່',
                icon: <Plus className="h-4 w-4" />,
                onClick: handleCreate,
              }
            : undefined
        }
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

      {/* 4. Form Modal */}
      {formModalOpen && (
        <LegislationFormModal
          key={selectedItem?.id ?? 'new'}
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          item={selectedItem}
        />
      )}

      {/* 5. Detail & PDF Preview Modal */}
      {Boolean(viewingItem) && (
        <LegislationDetailModal
          item={viewingItem}
          isOpen={Boolean(viewingItem)}
          onClose={() => setViewingItem(null)}
          onEdit={canUpdate ? handleEdit : undefined}
        />
      )}

      {/* 6. Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບເອກະສານນິຕິກຳ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບເອກະສານ "${deletingItem?.title}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບເອກະສານ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
