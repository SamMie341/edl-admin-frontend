'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Home, RefreshCw, Filter, AlertCircle } from 'lucide-react';
import { DataTable, type ColumnDef } from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useProvinces,
  useDistricts,
  useVillages,
  useSyncVillages,
} from '../../application/use-locations.hook';
import { SyncConfirmModal } from './sync-confirm-modal';
import type { VillageItem } from '../../domain/location.types';

interface VillageTabProps {
  initialProvinceId?: number;
  initialDistrictId?: number;
}

export function VillageTab({
  initialProvinceId,
  initialDistrictId,
}: VillageTabProps) {
  const { data: provinces = [] } = useProvinces();

  // Selected Province & District state for cascading filters
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(
    initialProvinceId || 1 // Default to Vientiane Capital (ID 1)
  );

  const { data: districtsInProvince = [] } = useDistricts(selectedProvinceId);

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | undefined>(
    initialDistrictId || 1 // Default to Chanthabouly (ID 1)
  );

  // Sync state if props change from outside
  useEffect(() => {
    if (initialProvinceId) setSelectedProvinceId(initialProvinceId);
    if (initialDistrictId) setSelectedDistrictId(initialDistrictId);
  }, [initialProvinceId, initialDistrictId]);

  // When province changes, if current district does not belong to new province, pick first district
  const handleProvinceChange = (newProvId?: number) => {
    setSelectedProvinceId(newProvId);
    setSearchTerm('');
    setPage(1);
  };

  useEffect(() => {
    if (districtsInProvince.length > 0) {
      const exists = districtsInProvince.some((d) => d.id === selectedDistrictId);
      if (!exists) {
        setSelectedDistrictId(districtsInProvince[0].id);
      }
    }
  }, [districtsInProvince, selectedDistrictId]);

  const {
    data: villages = [],
    isLoading,
    refetch,
    isRefetching,
  } = useVillages(selectedDistrictId);

  const syncMutation = useSyncVillages();

  const [searchTerm, setSearchTerm] = useState('');
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return villages;
    const term = searchTerm.toLowerCase();
    return villages.filter(
      (v) =>
        v.name?.toLowerCase().includes(term) ||
        v.nameEn?.toLowerCase().includes(term) ||
        v.code?.toLowerCase().includes(term)
    );
  }, [villages, searchTerm]);

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

  const handleSyncConfirm = async () => {
    try {
      await syncMutation.mutateAsync();
      setSyncModalOpen(false);
    } catch {
      // Handled in mutation hook
    }
  };

  const currentDistrictName = useMemo(() => {
    if (!selectedDistrictId) return 'ທຸກເມືອງ';
    return (
      districtsInProvince.find((d) => d.id === selectedDistrictId)?.name ||
      `ເມືອງ #${selectedDistrictId}`
    );
  }, [selectedDistrictId, districtsInProvince]);

  const columns: ColumnDef<VillageItem>[] = [
    {
      header: 'ລະຫັດ',
      className: 'w-[90px]',
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'ຊື່ບ້ານ (Village Name)',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Home className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block">
              {row.name || 'ບໍ່ມີຊື່'}
            </span>
            <span className="text-[11px] text-slate-400">
              ລະຫັດບ້ານ: {row.code || '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'ຊື່ພາສາອັງກິດ',
      className: 'w-[180px]',
      cell: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.nameEn || '-'}
        </span>
      ),
    },
    {
      header: 'ເມືອງທີ່ສັງກັດ',
      className: 'w-[180px]',
      cell: (row) => {
        const distName =
          row.district?.name ||
          districtsInProvince.find((d) => d.id === row.districtId)?.name ||
          `ເມືອງ #${row.districtId}`;
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {distName}
          </span>
        );
      },
    },
    {
      header: 'ສະຖານະ',
      className: 'w-[120px]',
      cell: (row) => {
        const isActive = row.status === 'A' || row.status === 'ACTIVE' || !row.status;
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isActive ? 'ໃຊ້ງານຢູ່' : row.status}
          </span>
        );
      },
    },
  ];

  return (
    <>
      {/* Cascading Filter Controls */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Province Select */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            1. ເລືອກແຂວງ:
          </span>
          <select
            value={selectedProvinceId || ''}
            onChange={(e) =>
              handleProvinceChange(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">ເລືອກແຂວງ</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name} ({prov.shortName || `#${prov.id}`})
              </option>
            ))}
          </select>
        </div>

        {/* District Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            2. ເລືອກເມືອງ:
          </span>
          <select
            value={selectedDistrictId || ''}
            onChange={(e) => {
              setSelectedDistrictId(
                e.target.value ? Number(e.target.value) : undefined
              );
              setPage(1);
            }}
            disabled={!selectedProvinceId || districtsInProvince.length === 0}
            className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
          >
            {districtsInProvince.length === 0 ? (
              <option value="">ບໍ່ມີຂໍ້ມູນເມືອງໃນແຂວງນີ້</option>
            ) : (
              districtsInProvince.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {dist.name} ({dist.nameEn || dist.code || `#${dist.id}`})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        isLoading={isLoading || isRefetching}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        searchPlaceholder="ຄົ້ນຫາຊື່ບ້ານ (ລາວ/ອັງກິດ), ລະຫັດ..."
        title={`ລາຍການບ້ານ (ເມືອງ ${currentDistrictName})`}
        description={
          selectedDistrictId
            ? `ພົບທັງໝົດ ${villages.length} ບ້ານໃນເມືອງນີ້`
            : 'ກະລຸນາເລືອກເມືອງເພື່ອສະແດງລາຍຊື່ບ້ານ'
        }
        extraActions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching || !selectedDistrictId}
              className="cursor-pointer gap-1.5 text-xs h-8.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">ໂຫຼດຄືນໃໝ່</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setSyncModalOpen(true)}
              disabled={syncMutation.isPending}
              className="cursor-pointer gap-1.5 text-xs h-8.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  syncMutation.isPending ? 'animate-spin' : ''
                }`}
              />
              <span>ຊິ້ງຂໍ້ມູນບ້ານ (Sync HRM)</span>
            </Button>
          </div>
        }
      />

      <SyncConfirmModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        onConfirm={handleSyncConfirm}
        isLoading={syncMutation.isPending}
        title="ຊິ້ງຂໍ້ມູນບ້ານຈາກລະບົບ HRM"
        description="ທ່ານຕ້ອງການດຶງຂໍ້ມູນບ້ານທັງໝົດຈາກ HRM Service ມາອັບເດດລົງຖານຂໍ້ມູນແທ້ຫຼືບໍ່? (ການຊິ້ງຂໍ້ມູນບ້ານອາດໃຊ້ເວລາສອງສາມວິນາທີເນື່ອງຈາກມີຈຳນວນຫຼາຍພັນບ້ານ)"
      />
    </>
  );
}
