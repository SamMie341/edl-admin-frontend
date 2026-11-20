'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Zap,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle2,
  Home,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import {
  DataTable,
  StatusBadge,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useElectricityTariffs,
  useDeleteElectricityTariff,
} from '../application/use-electricity-tariffs.hook';
import { usePermission } from '@/core/application/use-permission.hook';
import { ElectricityTariffFormModal } from './components/electricity-tariff-form-modal';
import { ElectricityTariffDetailModal } from './components/electricity-tariff-detail-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import {
  TARIFF_TYPE_CONFIG,
  TARIFF_STATUS_LABELS,
  type ElectricityTariffItem,
  type ElectricityTariffType,
  type ElectricityTariffStatus,
} from '../domain/electricity-tariff.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ElectricityTariffsView() {
  const { can } = usePermission();
  const canCreate = can('ELECTRICITY_TARIFFS', 'CREATE');
  const canUpdate = can('ELECTRICITY_TARIFFS', 'UPDATE');
  const canDelete = can('ELECTRICITY_TARIFFS', 'DELETE');

  const [selectedType, setSelectedType] = useState<
    ElectricityTariffType | 'ALL'
  >('ALL');
  const [selectedStatus, setSelectedStatus] = useState<
    ElectricityTariffStatus | 'ALL'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ElectricityTariffItem | null>(null);
  const [viewingItem, setViewingItem] = useState<ElectricityTariffItem | null>(
    null
  );
  const [deletingItem, setDeletingItem] =
    useState<ElectricityTariffItem | null>(null);

  const { data: listData, isLoading, refetch, isRefetching } =
    useElectricityTariffs({
      search: searchTerm || undefined,
      tariffType: selectedType !== 'ALL' ? selectedType : undefined,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      page,
      limit,
    });
  const deleteMutation = useDeleteElectricityTariff();

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedItem(null);
    setFormModalOpen(true);
  };

  const handleEdit = (item: ElectricityTariffItem) => {
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
      if (selectedType !== 'ALL' && item.tariffType !== selectedType) {
        return false;
      }
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      if (!listData?.isServerPaginated && term) {
        return item.title.toLowerCase().includes(term);
      }
      return true;
    });
  }, [listData, selectedType, selectedStatus, searchTerm]);

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

  // Summary statistics derived from list items
  const stats = useMemo(() => {
    const rawItems = listData?.items ?? [];
    return {
      total: listData?.isServerPaginated ? listData.meta.total : rawItems.length,
      activeCount: rawItems.filter((item) => item.status === 'ACTIVE').length,
      residentialCount: rawItems.filter(
        (item) => item.tariffType === 'RESIDENTIAL'
      ).length,
      withFilesCount: rawItems.filter(
        (item) => Boolean(item.pdfUrl) || Boolean(item.imageUrl)
      ).length,
    };
  }, [listData]);

  const columns: ColumnDef<ElectricityTariffItem>[] = [
    {
      header: 'ຮູບຕາຕະລາງ',
      className: 'w-[84px]',
      cell: (row) => (
        <div
          onClick={() => setViewingItem(row)}
          className="relative h-12 w-16 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:opacity-85 transition"
          title="ກົດເພື່ອເບິ່ງລາຍລະອຽດ"
        >
          {row.imageUrl ? (
            <Image
              src={getStorageUrl(row.imageUrl)}
              alt={row.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <Zap className="h-5 w-5 text-amber-500" />
          )}
        </div>
      ),
    },
    {
      header: 'ຫົວຂໍ້ປະກາດ & ວັນທີມີຜົນ',
      cell: (row) => (
        <div className="space-y-1 max-w-[360px]">
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
              ມີຜົນວັນທີ:{' '}
              {row.effectiveDate
                ? format(new Date(row.effectiveDate), 'dd/MM/yyyy')
                : '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'ປະເພດຜູ້ຊົມໃຊ້',
      className: 'w-[180px]',
      cell: (row) => {
        const typeCfg = TARIFF_TYPE_CONFIG[row.tariffType];
        return (
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border',
              typeCfg?.badgeClass ||
                'bg-slate-50 text-slate-700 border-slate-200'
            )}
          >
            {typeCfg?.label || row.tariffType}
          </span>
        );
      },
    },
    {
      header: 'ໄຟລ໌ປະກອບ',
      className: 'w-[140px]',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          {row.pdfUrl && (
            <a
              href={getStorageUrl(row.pdfUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/70 text-[11px] font-semibold transition"
              title="ເປີດໄຟລ໌ PDF"
            >
              <FileText className="h-3 w-3" />
              <span>PDF</span>
            </a>
          )}
          {row.imageUrl && (
            <button
              type="button"
              onClick={() => setViewingItem(row)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 text-[11px] font-semibold transition cursor-pointer"
              title="ເບິ່ງຮູບຕາຕະລາງ"
            >
              <ImageIcon className="h-3 w-3" />
              <span>ຮູບ</span>
            </button>
          )}
          {!row.pdfUrl && !row.imageUrl && (
            <span className="text-[11px] text-slate-400 italic">ບໍ່ມີໄຟລ໌</span>
          )}
        </div>
      ),
    },
    {
      header: 'ສະຖານະ',
      className: 'w-[185px]',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={TARIFF_STATUS_LABELS[row.status] || row.status}
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
            title="ເບິ່ງລາຍລະອຽດ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canUpdate && (
            <button
              type="button"
              onClick={() => handleEdit(row)}
              title="ແກ້ໄຂອັດຕາຄ່າໄຟຟ້າ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeletingItem(row)}
              title="ລຶບອັດຕາຄ່າໄຟຟ້າ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const typeFilters: Array<{
    value: ElectricityTariffType | 'ALL';
    label: string;
  }> = [
    { value: 'ALL', label: 'ທຸກປະເພດ' },
    { value: 'RESIDENTIAL', label: 'ທີ່ຢູ່ອາໄສ (Residential)' },
    { value: 'COMMERCIAL', label: 'ທຸລະກິດ (Commercial)' },
    { value: 'INDUSTRIAL', label: 'ອຸດສາຫະກຳ (Industrial)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ໂຄງສ້າງທັງໝົດ
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
              ກຳລັງມີຜົນໃຊ້
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.activeCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ປະເພດທີ່ຢູ່ອາໄສ
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.residentialCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ມີເອກະສານ/ຮູບພາບ
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.withFilesCount.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setSelectedType(filter.value);
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer',
                selectedType === filter.value
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(
              e.target.value as ElectricityTariffStatus | 'ALL'
            );
            setPage(1);
          }}
          className="w-full sm:w-52 h-9 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer shrink-0"
        >
          <option value="ALL">ທຸກສະຖານະ</option>
          {(
            Object.keys(TARIFF_STATUS_LABELS) as ElectricityTariffStatus[]
          ).map((key) => (
            <option key={key} value={key}>
              {TARIFF_STATUS_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Main Data Table */}
      <DataTable
        title="ໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ (Electricity Tariffs)"
        description="ຄຸ້ມຄອງປະກາດໂຄງສ້າງລາຄາໄຟຟ້າຕາມປະເພດຜູ້ຊົມໃຊ້, ຮູບພາບຕາຕະລາງ ແລະ ໄຟລ໌ PDF ທາງການ"
        columns={columns}
        data={displayItems}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຫົວຂໍ້ໂຄງສ້າງອັດຕາຄ່າໄຟ..."
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
                label: 'ເພີ່ມອັດຕາຄ່າໄຟໃໝ່',
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
        <ElectricityTariffFormModal
          key={selectedItem?.id ?? 'new'}
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          item={selectedItem}
        />
      )}

      {/* 5. Detail & Preview Modal */}
      {Boolean(viewingItem) && (
        <ElectricityTariffDetailModal
          key={`detail-${viewingItem?.id ?? 'none'}`}
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
        title="ຢືນຢັນການລຶບໂຄງສ້າງອັດຕາຄ່າໄຟຟ້າ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${deletingItem?.title}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບຂໍ້ມູນ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
