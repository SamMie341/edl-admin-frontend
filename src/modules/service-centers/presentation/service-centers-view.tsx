'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  GitBranch,
  Building2,
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
  useServiceCenters,
  useDeleteServiceCenter,
  useSyncServiceCenters,
  useProvinces,
} from '../application/use-service-centers.hook';
import { ServiceCenterFormModal } from './components/service-center-form-modal';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type { ServiceCenterItem } from '../domain/service-center.types';
import { cn } from '@/lib/utils';

// Helper ສໍາລັບກວດສອບ ແລະ ສ້າງ URL ທີ່ຖືກຕ້ອງສຳລັບ Google Maps
function getServiceCenterMapUrl(
  lat?: number | string | null,
  lng?: number | string | null
): string | null {
  if (lat == null || lng == null) return null;
  const latStr = String(lat).trim();
  const lngStr = String(lng).trim();

  // ຖ້າເປັນ dummy text ຈາກລະບົບເກົ່າເຊັ່ນ '.', '..', '...', '-'
  if (
    !latStr ||
    !lngStr ||
    /^[.\-_*#\s]+$/.test(latStr) ||
    /^[.\-_*#\s]+$/.test(lngStr)
  ) {
    return null;
  }

  const numLat = Number(latStr);
  const numLng = Number(lngStr);

  if (isNaN(numLat) || isNaN(numLng) || (numLat === 0 && numLng === 0)) {
    return null;
  }

  return `https://www.google.com/maps?q=${numLat},${numLng}`;
}

export function ServiceCentersView() {
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);
  const { data: provinces = [] } = useProvinces();
  const {
    data: centers = [],
    isLoading,
    refetch,
    isRefetching,
  } = useServiceCenters(selectedProvinceId);

  const deleteMutation = useDeleteServiceCenter();
  const syncMutation = useSyncServiceCenters();

  // Search & Modals state
  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenterItem | null>(null);
  const [deletingCenter, setDeletingCenter] = useState<ServiceCenterItem | null>(null);
  const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  // Filtered centers by province and search
  const filteredData = useMemo(() => {
    const selectedProv = provinces.find((p) => p.id === selectedProvinceId);

    return centers.filter((c) => {
      // 1. ກັ່ນຕອງຕາມແຂວງ
      if (selectedProvinceId !== undefined) {
        const matchesId =
          c.provinceId === selectedProvinceId ||
          c.province?.id === selectedProvinceId ||
          Number(c.provinceId) === Number(selectedProvinceId) ||
          Number(c.province?.id) === Number(selectedProvinceId);

        const matchesName =
          Boolean(selectedProv?.name) &&
          Boolean(c.province?.name) &&
          c.province!.name.trim().toLowerCase() === selectedProv!.name.trim().toLowerCase();

        if (!matchesId && !matchesName) {
          return false;
        }
      }

      // 2. ຄົ້ນຫາຕາມຄຳສັບ
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = (c.centerName || '').toLowerCase();
      const branchName = (c.branch?.branchName || '').toLowerCase();
      const prov = (c.province?.name || '').toLowerCase();
      const dist = (c.district?.name || '').toLowerCase();
      const vill = (c.village?.name || '').toLowerCase();
      const phone = (c.phoneNumber || '').toLowerCase();

      return (
        name.includes(term) ||
        branchName.includes(term) ||
        prov.includes(term) ||
        dist.includes(term) ||
        vill.includes(term) ||
        phone.includes(term)
      );
    });
  }, [centers, searchTerm, selectedProvinceId, provinces]);

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

  const handleEdit = (center: ServiceCenterItem) => {
    setSelectedCenter(center);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCenter(null);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCenter) return;
    try {
      await deleteMutation.mutateAsync(deletingCenter.id);
      setDeletingCenter(null);
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

  const columns: ColumnDef<ServiceCenterItem>[] = [
    {
      header: 'ຮູບສູນ',
      className: 'w-[75px]',
      cell: (row) => (
        <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs">
          {row.imageUrl ? (
            <Image
              src={getStorageUrl(row.imageUrl)}
              alt={row.centerName}
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
      header: 'ຊື່ສູນບໍລິການ & ສາຂາຕົ້ນສັງກັດ',
      cell: (row) => (
        <div className="space-y-1">
          <p className="font-bold text-slate-800 text-xs">{row.centerName}</p>
          <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
            <GitBranch className="h-3 w-3" />
            <span>{row.branch?.branchName || 'ບໍ່ມີຂໍ້ມູນສາຂາ'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'ທີ່ຕັ້ງ (ແຂວງ / ເມືອງ / ບ້ານ)',
      cell: (row) => {
        const parts = [
          row.village?.name ? `ບ.${row.village.name}` : null,
          row.district?.name ? `ມ.${row.district.name}` : null,
          row.province?.name ? `ຂ.${row.province.name}` : null,
        ].filter(Boolean);

        return (
          <div className="space-y-0.5 max-w-[220px]">
            <p className="text-xs font-semibold text-slate-700 truncate">
              {parts.length > 0 ? parts.join(', ') : 'ບໍ່ມີຂໍ້ມູນທີ່ຕັ້ງ'}
            </p>
            {row.phoneNumber && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400" />
                {row.phoneNumber}
              </p>
            )}
          </div>
        );
      },
    },
    {
      header: 'ພິກັດແຜນທີ່ GPS',
      cell: (row) => {
        const mapUrl = getServiceCenterMapUrl(row.latitude, row.longitude);
        if (!mapUrl) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 italic">
              <MapPin className="h-3 w-3 opacity-40" />
              <span>ຍັງບໍ່ມີພິກັດ</span>
            </span>
          );
        }

        return (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 text-blue-700 hover:bg-blue-100/90 text-[11px] font-mono font-medium transition cursor-pointer shadow-2xs"
            title="ເປີດເບິ່ງເທິງ Google Maps"
          >
            <MapPin className="h-3 w-3 text-blue-600" />
            <span>
              {Number(row.latitude).toFixed(4)}, {Number(row.longitude).toFixed(4)}
            </span>
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
            onClick={() => handleEdit(row)}
            title="ແກ້ໄຂສູນບໍລິການ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingCenter(row)}
            title="ລຶບສູນບໍລິການ"
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
      {/* 1. Provinces Dropdown Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-slate-200/50 shadow-2xs">
        <div className="flex items-center gap-3 text-xs">
          <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <MapPin className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-bold text-slate-800">ກັ່ນຕອງຂໍ້ມູນຕາມແຂວງ</p>
            <p className="text-[11px] text-slate-400">
              ເລືອກແຂວງເພື່ອສະແດງສູນບໍລິການສະເພາະພື້ນທີ່ (ທັງໝົດ {provinces.length} ແຂວງ)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProvinceId !== undefined ? selectedProvinceId : ''}
            onChange={(e) => {
              const val = e.target.value !== '' ? Number(e.target.value) : undefined;
              setSelectedProvinceId(val);
              setPage(1);
            }}
            className="w-full sm:w-64 h-9 px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 cursor-pointer"
          >
            <option value="">-- ທຸກແຂວງ (ສະແດງທັງໝົດ) --</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name}
              </option>
            ))}
          </select>

          {selectedProvinceId !== undefined && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedProvinceId(undefined);
                setPage(1);
              }}
              className="h-9 px-3 rounded-xl text-xs text-slate-500 hover:text-slate-800 border-slate-200 cursor-pointer shrink-0"
              title="ລ້າງຕົວກອງ"
            >
              ລ້າງຕົວກອງ
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Data Table */}
      <DataTable
        title="ສູນບໍລິການລູກຄ້າ ຟຟລ (Service Centers)"
        description="ຄຸ້ມຄອງສູນບໍລິການລູກຄ້າໄຟຟ້າຂັ້ນເມືອງ/ບ້ານ, ພິກັດແຜນທີ່ GPS ແລະ ຊິ້ງຂໍ້ມູນຈາກ Inside API"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາສູນ, ສາຂາ, ແຂວງ, ເມືອງ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ເພີ່ມສູນບໍລິການໃໝ່',
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

      {/* 3. Form Modal */}
      {formModalOpen && (
        <ServiceCenterFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          center={selectedCenter}
          defaultProvinceId={selectedProvinceId}
        />
      )}

      {/* 4. Sync Confirm Modal */}
      <ConfirmModal
        isOpen={isSyncConfirmOpen}
        onClose={() => setIsSyncConfirmOpen(false)}
        onConfirm={handleSyncConfirm}
        title="ຊິ້ງຂໍ້ມູນສູນບໍລິການຈາກ Inside API"
        description="ລະບົບຈະດຶງຂໍ້ມູນສູນບໍລິການ, ຜູກໂຍງທີ່ຕັ້ງ (ແຂວງ, ເມືອງ, ບ້ານ) ແລະ ດາວໂຫຼດຮູບພາບຈາກ Inside API ອັດຕະໂນມັດ."
        confirmLabel="ເລີ່ມຊິ້ງຂໍ້ມູນ"
        variant="info"
        isLoading={syncMutation.isPending}
      />

      {/* 5. Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingCenter)}
        onClose={() => setDeletingCenter(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບສູນບໍລິການ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບສູນບໍລິການ "${deletingCenter?.centerName}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບສູນບໍລິການ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
