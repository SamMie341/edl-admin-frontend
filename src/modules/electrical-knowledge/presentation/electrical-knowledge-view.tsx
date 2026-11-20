'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Lightbulb,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Video,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  DataTable,
  StatusBadge,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useElectricalKnowledgeList,
  useDeleteElectricalKnowledge,
} from '../application/use-electrical-knowledge.hook';
import { usePermission } from '@/core/application/use-permission.hook';
import { ElectricalKnowledgeFormModal } from './components/electrical-knowledge-form-modal';
import { ElectricalKnowledgeDetailModal } from './components/electrical-knowledge-detail-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import {
  ELECTRICAL_KNOWLEDGE_STATUS_LABELS,
  type ElectricalKnowledgeItem,
  type ElectricalKnowledgeStatus,
} from '../domain/electrical-knowledge.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function ElectricalKnowledgeView() {
  const { can } = usePermission();
  const canCreate = can('ELECTRICAL_KNOWLEDGE', 'CREATE');
  const canUpdate = can('ELECTRICAL_KNOWLEDGE', 'UPDATE');
  const canDelete = can('ELECTRICAL_KNOWLEDGE', 'DELETE');

  const [selectedStatus, setSelectedStatus] = useState<
    ElectricalKnowledgeStatus | 'ALL'
  >('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<ElectricalKnowledgeItem | null>(null);
  const [viewingItem, setViewingItem] =
    useState<ElectricalKnowledgeItem | null>(null);
  const [deletingItem, setDeletingItem] =
    useState<ElectricalKnowledgeItem | null>(null);

  const { data: listData, isLoading, refetch, isRefetching } =
    useElectricalKnowledgeList();
  const deleteMutation = useDeleteElectricalKnowledge();

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedItem(null);
    setFormModalOpen(true);
  };

  const handleEdit = (item: ElectricalKnowledgeItem) => {
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

  // Summary statistics derived from fetched list
  const stats = useMemo(() => {
    const items = listData?.items ?? [];
    return {
      total: items.length,
      activeCount: items.filter((item) => item.status === 'ACTIVE').length,
      videoCount: items.filter((item) => Boolean(item.videoUrl)).length,
      totalViews: items.reduce((sum, item) => sum + (item.viewCount || 0), 0),
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
      const contentMatch = stripHtmlTags(item.content)
        .toLowerCase()
        .includes(term);
      return titleMatch || contentMatch;
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

  const columns: ColumnDef<ElectricalKnowledgeItem>[] = [
    {
      header: 'ຮູບໜ້າປົກ',
      className: 'w-[90px]',
      cell: (row) => (
        <div
          onClick={() => setViewingItem(row)}
          className="relative h-12 w-16 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:opacity-85 transition"
          title="ກົດເພື່ອເບິ່ງລາຍລະອຽດ"
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
            <Lightbulb className="h-5 w-5 text-amber-500" />
          )}

          {row.videoUrl && (
            <span className="absolute bottom-1 right-1 p-0.5 rounded bg-black/65 text-white">
              <Video className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'ຫົວຂໍ້ & ເນື້ອໃນຫຍໍ້',
      cell: (row) => {
        const excerpt = stripHtmlTags(row.content);
        return (
          <div className="space-y-1 max-w-[380px]">
            <p className="font-bold text-slate-800 text-xs line-clamp-1">
              {row.title}
            </p>
            {excerpt && (
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {excerpt}
              </p>
            )}
            {row.videoUrl && (
              <a
                href={row.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:underline"
              >
                <Video className="h-2.5 w-2.5" />
                <span>ມີວິດີໂອປະກອບ</span>
              </a>
            )}
          </div>
        );
      },
    },
    {
      header: 'ສະຖານະ',
      className: 'w-[150px]',
      cell: (row) => (
        <StatusBadge
          status={row.status}
          label={ELECTRICAL_KNOWLEDGE_STATUS_LABELS[row.status] || row.status}
        />
      ),
    },
    {
      header: 'ຍອດເບິ່ງ',
      className: 'w-[90px]',
      cell: (row) => (
        <span className="text-[11px] font-mono font-semibold text-slate-600">
          {row.viewCount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'ອັບເດດລ່າສຸດ',
      className: 'w-[120px]',
      cell: (row) => (
        <span className="text-[11px] text-slate-400">
          {row.updatedAt
            ? format(new Date(row.updatedAt), 'dd/MM/yyyy')
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
            onClick={() => setViewingItem(row)}
            title="ເບິ່ງເນື້ອໃນບົດຄວາມ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canUpdate && (
            <button
              type="button"
              onClick={() => handleEdit(row)}
              title="ແກ້ໄຂບົດຄວາມ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeletingItem(row)}
              title="ລຶບບົດຄວາມ"
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
    value: ElectricalKnowledgeStatus | 'ALL';
    label: string;
  }> = [
    { value: 'ALL', label: 'ທຸກສະຖານະ' },
    { value: 'ACTIVE', label: 'ເຜີຍແຜ່ (Active)' },
    { value: 'DRAFT', label: 'ສະບັບຮ່າງ (Draft)' },
    { value: 'ARCHIVED', label: 'ເກັບຖາວອນ (Archived)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ບົດຄວາມທັງໝົດ
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
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ມີຄລິບວິດີໂອ
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.videoCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              ຍອດເຂົ້າຊົມລວມ
            </p>
            <p className="text-xl font-bold text-slate-800">
              {stats.totalViews.toLocaleString()}
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
          ສະແດງ {filteredItems.length} ຈາກ {stats.total} ລາຍການ
        </span>
      </div>

      {/* 3. Main Data Table */}
      <DataTable
        title="ຄວາມຮູ້ດ້ານໄຟຟ້າ (Electrical Knowledge)"
        description="ຄຸ້ມຄອງບົດຄວາມຄວາມຮູ້ດ້ານໄຟຟ້າ, ຄວາມປອດໄພໃນການນຳໃຊ້ໄຟຟ້າ, ຮູບໜ້າປົກ ແລະ ຄລິບວິດີໂອ"
        columns={columns}
        data={paginatedItems}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຫົວຂໍ້ ຫຼື ເນື້ອໃນບົດຄວາມ..."
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
                label: 'ເພີ່ມບົດຄວາມໃໝ່',
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
        <ElectricalKnowledgeFormModal
          key={selectedItem?.id ?? 'new'}
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          item={selectedItem}
        />
      )}

      {/* 5. Detail Preview Modal */}
      {Boolean(viewingItem) && (
        <ElectricalKnowledgeDetailModal
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
        title="ຢືນຢັນການລຶບບົດຄວາມ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບບົດຄວາມ "${deletingItem?.title}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບບົດຄວາມ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
