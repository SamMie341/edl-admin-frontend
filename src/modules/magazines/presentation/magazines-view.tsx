'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  BookOpen,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import {
  DataTable,
  StatusBadge,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useMagazines,
  useDeleteMagazine,
  useIncrementMagazineDownload,
} from '../application/use-magazines.hook';
import { usePermission } from '@/core/application/use-permission.hook';
import { MagazineFormModal } from './components/magazine-form-modal';
import { MagazineDetailModal } from './components/magazine-detail-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import {
  MAGAZINE_STATUS_LABELS,
  type MagazineItem,
  type MagazineStatus,
} from '../domain/magazine.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function MagazinesView() {
  const { can } = usePermission();
  const canCreate = can('MAGAZINES', 'CREATE');
  const canUpdate = can('MAGAZINES', 'UPDATE');
  const canDelete = can('MAGAZINES', 'DELETE');

  const [selectedStatus, setSelectedStatus] = useState<
    MagazineStatus | 'ALL'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedMagazine, setSelectedMagazine] =
    useState<MagazineItem | null>(null);
  const [viewingMagazine, setViewingMagazine] =
    useState<MagazineItem | null>(null);
  const [deletingMagazine, setDeletingMagazine] =
    useState<MagazineItem | null>(null);

  const { data: listData, isLoading, refetch, isRefetching } = useMagazines();
  const deleteMutation = useDeleteMagazine();
  const incrementDownloadMutation = useIncrementMagazineDownload();

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedMagazine(null);
    setFormModalOpen(true);
  };

  const handleEdit = (item: MagazineItem) => {
    setSelectedMagazine(item);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMagazine) return;
    try {
      await deleteMutation.mutateAsync(deletingMagazine.id);
      setDeletingMagazine(null);
    } catch {
      // Handled by hook toasts
    }
  };

  const handleQuickDownload = async (item: MagazineItem) => {
    if (!item.fileUrl) return;
    try {
      await incrementDownloadMutation.mutateAsync(item.id);
    } catch {
      // Mutation toast handles API errors
    }
    window.open(getStorageUrl(item.fileUrl), '_blank', 'noopener,noreferrer');
  };

  // Summary statistics derived from fetched magazines
  const stats = useMemo(() => {
    const items = listData?.items ?? [];
    return {
      total: items.length,
      activeCount: items.filter((item) => item.status === 'ACTIVE').length,
      withPdfCount: items.filter((item) => Boolean(item.fileUrl)).length,
      totalDownloads: items.reduce(
        (sum, item) => sum + (item.downloadCount || 0),
        0
      ),
    };
  }, [listData]);

  // Client-side filter & pagination
  const filteredItems = useMemo(() => {
    const items = listData?.items ?? [];
    const term = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      if (!term) return true;

      const titleMatch = item.title.toLowerCase().includes(term);
      const issueMatch = (item.issueNumber || '').toLowerCase().includes(term);
      return titleMatch || issueMatch;
    });
  }, [listData, selectedStatus, searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / limit) || 1;
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return filteredItems.slice(start, start + limit);
  }, [filteredItems, currentPage, limit]);

  const paginationMeta = {
    total: filteredItems.length,
    page: currentPage,
    limit,
    totalPages,
  };

  const columns: ColumnDef<MagazineItem>[] = [
    {
      header: 'ໜ້າປົກ',
      className: 'w-[76px]',
      cell: (row) => (
        <div
          onClick={() => setViewingMagazine(row)}
          className="relative h-14 w-11 rounded-lg overflow-hidden border border-slate-200/90 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:opacity-85 transition"
          title="ກົດເພື່ອເບິ່ງລາຍລະອຽດ ແລະ PDF"
        >
          {row.coverImage ? (
            <Image
              src={getStorageUrl(row.coverImage)}
              alt={row.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <BookOpen className="h-4.5 w-4.5 text-blue-500" />
          )}
        </div>
      ),
    },
    {
      header: 'ຊື່ວາລະສານ & ສະບັບທີ',
      cell: (row) => (
        <div className="space-y-1 max-w-[360px]">
          <p className="font-bold text-slate-800 text-xs line-clamp-1">
            {row.title}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {row.issueNumber && (
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-100">
                {row.issueNumber}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="h-3 w-3" />
              {row.publishedDate
                ? format(new Date(row.publishedDate), 'dd/MM/yyyy')
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
          <button
            type="button"
            onClick={() => handleQuickDownload(row)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70 text-[11px] font-semibold transition cursor-pointer"
            title="ເປີດ / ດາວໂຫຼດໄຟລ໌ PDF"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>ດາວໂຫຼດ PDF</span>
          </button>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            ຍັງບໍ່ມີໄຟລ໌
          </span>
        ),
    },
    {
      header: 'ຍອດດາວໂຫຼດ',
      className: 'w-[105px]',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-700">
          <Download className="h-3 w-3 text-slate-400" />
          {row.downloadCount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'ສະຖານະ',
      className: 'w-[165px]',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={MAGAZINE_STATUS_LABELS[row.status] || row.status}
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
            onClick={() => setViewingMagazine(row)}
            title="ອ່ານ / ເບິ່ງຕົວຢ່າງ PDF"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canUpdate && (
            <button
              type="button"
              onClick={() => handleEdit(row)}
              title="ແກ້ໄຂວາລະສານ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeletingMagazine(row)}
              title="ລຶບວາລະສານ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const statusFilters: Array<{ value: MagazineStatus | 'ALL'; label: string }> = [
    { value: 'ALL', label: 'ທຸກສະຖານະ' },
    { value: 'ACTIVE', label: 'ເຜີຍແຜ່ (Active)' },
    { value: 'INACTIVE', label: 'ປິດການເຜີຍແຜ່ (Inactive)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ວາລະສານທັງໝົດ
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
              ກຳລັງເຜີຍແຜ່
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
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ຍອດດາວໂຫຼດລວມ
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.totalDownloads.toLocaleString()}
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
          ສະແດງ {filteredItems.length} ຈາກ {stats.total} ສະບັບ
        </span>
      </div>

      {/* 3. Main Data Table */}
      <DataTable
        title="ວາລະສານດິຈິຕອນ ຟຟລ (E-Magazines)"
        description="ຄຸ້ມຄອງວາລະສານອີເລັກໂທຣນິກ, ຮູບໜ້າປົກ, ໄຟລ໌ PDF ແລະ ສະຖິຕິການດາວໂຫຼດ"
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຊື່ວາລະສານ ຫຼື ເລກທີສະບັບ..."
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
                label: 'ເພີ່ມວາລະສານໃໝ່',
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
        <MagazineFormModal
          key={selectedMagazine?.id ?? 'new'}
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          item={selectedMagazine}
        />
      )}

      {/* 5. Detail & PDF Preview Modal */}
      {Boolean(viewingMagazine) && (
        <MagazineDetailModal
          item={viewingMagazine}
          isOpen={Boolean(viewingMagazine)}
          onClose={() => setViewingMagazine(null)}
          onEdit={canUpdate ? handleEdit : undefined}
        />
      )}

      {/* 6. Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingMagazine)}
        onClose={() => setDeletingMagazine(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບວາລະສານ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບວາລະສານ "${deletingMagazine?.title}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບວາລະສານ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
