'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Target,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  Quote,
} from 'lucide-react';
import {
  DataTable,
  StatusBadge,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useVisionMissions,
  useDeleteVisionMission,
} from '../application/use-vision-missions.hook';
import { VisionMissionFormModal } from './components/vision-mission-form-modal';
import { VisionMissionDetailModal } from './components/vision-mission-detail-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type {
  VisionMissionItem,
  VisionMissionType,
} from '../domain/vision-mission.types';
import { VISION_MISSION_TYPE_CONFIG } from '../domain/vision-mission.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function VisionMissionsView() {
  const { data: items = [], isLoading, refetch, isRefetching } = useVisionMissions();
  const deleteMutation = useDeleteVisionMission();

  const [selectedType, setSelectedType] = useState<VisionMissionType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VisionMissionItem | null>(null);
  const [viewingItem, setViewingItem] = useState<VisionMissionItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<VisionMissionItem | null>(null);

  // Pagination Client-side
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedItem(null);
    setFormModalOpen(true);
  };

  const handleEdit = (item: VisionMissionItem) => {
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

  // Filter items
  const filteredData = useMemo(() => {
    return items.filter((item) => {
      // Type Filter
      if (selectedType !== 'ALL' && item.entryType !== selectedType) {
        return false;
      }

      // Search Query
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const title = item.title.toLowerCase();
      const slogan = (item.slogan || '').toLowerCase();
      const typeLabel = (
        VISION_MISSION_TYPE_CONFIG[item.entryType]?.label || ''
      ).toLowerCase();

      return (
        title.includes(term) || slogan.includes(term) || typeLabel.includes(term)
      );
    });
  }, [items, selectedType, searchTerm]);

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

  const columns: ColumnDef<VisionMissionItem>[] = [
    {
      header: 'ຮູບປະກອບ',
      className: 'w-[80px]',
      cell: (row) => (
        <div
          onClick={() => setViewingItem(row)}
          className="relative h-11 w-14 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:opacity-85 transition"
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
            <ImageIcon className="h-5 w-5 text-slate-400" />
          )}
        </div>
      ),
    },
    {
      header: 'ຫົວຂໍ້ & ຄຳຂວັນ',
      cell: (row) => (
        <div className="space-y-1 max-w-[320px]">
          <p className="font-bold text-slate-800 text-xs">{row.title}</p>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                VISION_MISSION_TYPE_CONFIG[row.entryType]?.badgeColor ||
                'bg-slate-100 text-slate-700'
              }`}
            >
              {VISION_MISSION_TYPE_CONFIG[row.entryType]?.label || row.entryType}
            </span>
            {row.slogan && (
              <span className="text-[11px] text-slate-500 italic truncate max-w-[200px]">
                &ldquo;{row.slogan}&rdquo;
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'ລຳດັບ (Index)',
      className: 'w-[100px]',
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shadow-2xs">
          #{row.orderIndex}
        </span>
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
            onClick={() => setViewingItem(row)}
            title="ເບິ່ງລາຍລະອຽດ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(row)}
            title="ແກ້ໄຂຂໍ້ມູນ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingItem(row)}
            title="ລຶບຂໍ້ມູນ"
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
      {/* 1. Filter Tabs by Type */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200/50">
        <button
          type="button"
          onClick={() => {
            setSelectedType('ALL');
            setPage(1);
          }}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            selectedType === 'ALL'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          )}
        >
          ທຸກປະເພດ
        </button>

        {(Object.keys(VISION_MISSION_TYPE_CONFIG) as VisionMissionType[]).map((type) => {
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                setSelectedType(type);
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              )}
            >
              {VISION_MISSION_TYPE_CONFIG[type].label}
            </button>
          );
        })}
      </div>

      {/* 2. Main Data Table */}
      <DataTable
        title="ວິໄສທັດ ແລະ ພາລະກິດ (Vision & Mission)"
        description="ຄຸ້ມຄອງວິໄສທັດ, ພາລະກິດຕົ້ນຕໍ, ຄ່ານິຍົມຫຼັກ ແລະ ຄຳຂວັນ ຂອງລັດວິສາຫະກິດໄຟຟ້າລາວ"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຫົວຂໍ້, ຄຳຂວັນ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ສ້າງຂໍ້ມູນໃໝ່',
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

      {/* 3. Detail Modal */}
      {viewingItem && (
        <VisionMissionDetailModal
          item={viewingItem}
          isOpen={Boolean(viewingItem)}
          onClose={() => setViewingItem(null)}
          onEdit={(item) => handleEdit(item)}
        />
      )}

      {/* 4. Form Modal */}
      {formModalOpen && (
        <VisionMissionFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          item={selectedItem}
          defaultType={selectedType !== 'ALL' ? selectedType : 'VISION'}
        />
      )}

      {/* 5. Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບຂໍ້ມູນ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${deletingItem?.title}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບຂໍ້ມູນ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
