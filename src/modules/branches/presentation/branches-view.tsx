'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  GitBranch,
  MapPin,
  Phone,
  Mail,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import {
  DataTable,
  StatusBadge,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useBranches,
  useDeleteBranch,
  useSyncBranches,
} from '../application/use-branches.hook';
import { useDepartments } from '@/modules/departments/application/use-departments.hook';
import { BranchFormModal } from './components/branch-form-modal';
import { BranchDetailModal } from './components/branch-detail-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { BranchItem } from '../domain/branch.types';
import { cn } from '@/lib/utils';

// Helper ສໍາລັບກວດສອບ ແລະ ສ້າງ URL ທີ່ຖືກຕ້ອງສຳລັບ Google Maps
function getGoogleMapsUrl(coord?: string | null): string | null {
  if (!coord) return null;
  const trimmed = coord.trim();

  // ຖ້າເປັນ dummy text ຈາກລະບົບເກົ່າເຊັ່ນ '.', '..', '...', '-' ຖືວ່າບໍ່ມີພິກັດ
  if (!trimmed || /^[.\-_*#\s]+$/.test(trimmed) || trimmed.length < 3) {
    return null;
  }

  // ຖ້າເປັນ link ເຕັມຢູ່ແລ້ວ (ເຊັ່ນ https://maps.app.goo.gl/...) ໃຫ້ໃຊ້ link ນັ້ນເລີຍ
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // ຖ້າເປັນຄູ່ພິກັດ Latitude, Longitude (ເຊັ່ນ 17.9757, 102.6331)
  const match = trimmed.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (match) {
    const lat = match[1];
    const lng = match[2];
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  // ຖ້າມີຕົວເລກພິກັດ
  if (/\d/.test(trimmed)) {
    return `https://www.google.com/maps?q=${encodeURIComponent(trimmed)}`;
  }

  return null;
}

export function BranchesView() {
  const [selectedDeptId, setSelectedDeptId] = useState<number | undefined>(undefined);
  const { data: departments = [] } = useDepartments();
  const { data: branches = [], isLoading, refetch, isRefetching } = useBranches(selectedDeptId);
  const deleteMutation = useDeleteBranch();
  const syncMutation = useSyncBranches();

  // Search & Modals state
  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchItem | null>(null);
  const [viewingBranch, setViewingBranch] = useState<BranchItem | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchItem | null>(null);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  // Filtered branches by search
  const filteredData = useMemo(() => {
    if (!searchTerm) return branches;
    const term = searchTerm.toLowerCase();
    return branches.filter((b) => {
      const name = (b.branchName || '').toLowerCase();
      const addr = (b.address || '').toLowerCase();
      const deptName = (b.department?.name || '').toLowerCase();
      const phone = (b.phoneNumber || '').toLowerCase();
      return (
        name.includes(term) ||
        addr.includes(term) ||
        deptName.includes(term) ||
        phone.includes(term)
      );
    });
  }, [branches, searchTerm]);

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

  const handleEdit = (branch: BranchItem) => {
    setSelectedBranch(branch);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedBranch(null);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBranch) return;
    try {
      await deleteMutation.mutateAsync(deletingBranch.id);
      setDeletingBranch(null);
    } catch {
      // Handled by hook
    }
  };

  const handleSyncConfirm = async () => {
    try {
      await syncMutation.mutateAsync();
      setIsSyncConfirmOpen(false);
    } catch {
      // Handled by hook
    }
  };

  const columns: ColumnDef<BranchItem>[] = [
    {
      header: 'ຮູບສາຂາ',
      className: 'w-[80px]',
      cell: (row) => (
        <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
          {row.branchImage ? (
            <Image
              src={getStorageUrl(row.branchImage)}
              alt={row.branchName}
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
      header: 'ຊື່ສາຂາ & ຝ່າຍສັງກັດ',
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-slate-800 text-xs">{row.branchName}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
            <Layers className="h-3 w-3" />
            <span>{row.department?.name || 'ບໍ່ມີຂໍ້ມູນຝ່າຍ'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'ຂໍ້ມູນຕິດຕໍ່ & ທີ່ຢູ່',
      cell: (row) => (
        <div className="space-y-0.5 max-w-[240px]">
          {row.address && (
            <p className="text-[11px] text-slate-600 truncate">{row.address}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
            {row.phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {row.phoneNumber}
              </span>
            )}
            {row.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" />
                {row.email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'ພິກັດແຜນທີ່ GPS',
      cell: (row) => {
        const raw = row.locationCoordinates?.trim();
        const mapUrl = getGoogleMapsUrl(raw);

        if (!mapUrl) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
              <MapPin className="h-3 w-3 opacity-40" />
              <span>ຍັງບໍ່ມີພິກັດ</span>
            </span>
          );
        }

        const isShortLink = raw?.startsWith('http');
        const displayLabel = isShortLink ? 'Google Maps' : raw;

        return (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 text-blue-700 hover:bg-blue-100/90 text-[11px] font-mono font-medium transition cursor-pointer shadow-2xs"
            title="ເປີດເບິ່ງເທິງ Google Maps"
          >
            <MapPin className="h-3 w-3 text-blue-600" />
            <span className="truncate max-w-[120px]">{displayLabel}</span>
            <ExternalLink className="h-2.5 w-2.5 opacity-60" />
          </a>
        );
      },
    },
    {
      header: 'ສະຖານະ',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: <span className="text-right block pr-2">ຈັດການ</span>,
      className: 'w-[120px] text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setViewingBranch(row)}
            title="ເບິ່ງລາຍລະອຽດສາຂາ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(row)}
            title="ແກ້ໄຂສາຂາ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingBranch(row)}
            title="ລຶບສາຂາ"
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
      {/* 1. Department Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-200/50">
        <button
          onClick={() => {
            setSelectedDeptId(undefined);
            setPage(1);
          }}
          className={cn(
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
            selectedDeptId === undefined
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          )}
        >
          ທຸກສາຂາ
        </button>

        {departments.map((dept) => {
          const isActive = selectedDeptId === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => {
                setSelectedDeptId(dept.id);
                setPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              )}
            >
              {dept.name}
            </button>
          );
        })}
      </div>

      {/* 2. Main Data Table */}
      <DataTable
        title="ຂໍ້ມູນສາຂາໄຟຟ້າລາວ (Branches Management)"
        description="ຄຸ້ມຄອງສາຂາ ຟຟລ ທົ່ວປະເທດ, ພິກັດແຜນທີ່ GPS, ຮູບພາບສາຂາ ແລະ ຊິ້ງຂໍ້ມູນຈາກ Inside API"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາສາຂາ, ທີ່ຢູ່, ເບີໂທ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ເພີ່ມສາຂາໃໝ່',
          icon: <Plus className="h-4 w-4" />,
          onClick: handleCreate,
        }}
        extraActions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSyncConfirmOpen(true)}
              disabled={syncMutation.isPending}
              className="h-9 px-3.5 rounded-xl text-xs gap-1.5 border-slate-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/60 cursor-pointer"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', syncMutation.isPending && 'animate-spin')}
              />
              <span>ຊິ້ງຈາກ Inside API</span>
            </Button>

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
          </>
        }
      />

      {/* 2.5 Branch Detail Modal */}
      {viewingBranch && (
        <BranchDetailModal
          branch={viewingBranch}
          isOpen={Boolean(viewingBranch)}
          onClose={() => setViewingBranch(null)}
          onEdit={(b) => handleEdit(b)}
        />
      )}

      {/* 3. Form Modal */}
      {formModalOpen && (
        <BranchFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          branch={selectedBranch}
          defaultDepartmentId={selectedDeptId}
        />
      )}

      {/* 4. Sync Confirm Modal */}
      <ConfirmModal
        isOpen={isSyncConfirmOpen}
        onClose={() => setIsSyncConfirmOpen(false)}
        onConfirm={handleSyncConfirm}
        title="ຊິ້ງຂໍ້ມູນສາຂາຈາກ Legacy Inside API"
        description="ລະບົບຈະດຶງຂໍ້ມູນສາຂາ, ທີ່ຢູ່, ພິກັດ ແລະ ດາວໂຫຼດຮູບພາບສາຂາຈາກ Inside API ມາຍັງຖານຂໍ້ມູນ EDL Admin ອັດຕະໂນມັດ."
        confirmLabel="ເລີ່ມຊິ້ງຂໍ້ມູນ"
        variant="info"
        isLoading={syncMutation.isPending}
      />

      {/* 5. Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingBranch)}
        onClose={() => setDeletingBranch(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບຂໍ້ມູນສາຂາ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${deletingBranch?.branchName}"? ຖ້າມີສູນບໍລິການສັງກັດຢູ່ ຈະບໍ່ສາມາດລຶບໄດ້.`}
        confirmLabel="ລຶບສາຂາ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
