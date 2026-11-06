'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Building2,
  RefreshCw,
  ExternalLink,
  Layers,
  Filter,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useProvinces,
  useDistricts,
  useSyncDistricts,
} from '../../application/use-locations.hook';
import { SyncConfirmModal } from './sync-confirm-modal';
import type { DistrictItem } from '../../domain/location.types';

interface DistrictTabProps {
  selectedProvinceId?: number;
  onProvinceChange: (provinceId?: number) => void;
  onViewVillages: (districtId: number, provinceId?: number) => void;
}

export function DistrictTab({
  selectedProvinceId,
  onProvinceChange,
  onViewVillages,
}: DistrictTabProps) {
  const { data: provinces = [] } = useProvinces();
  const {
    data: districts = [],
    isLoading,
    refetch,
    isRefetching,
  } = useDistricts(selectedProvinceId);
  const syncMutation = useSyncDistricts();

  const [searchTerm, setSearchTerm] = useState('');
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return districts;
    const term = searchTerm.toLowerCase();
    return districts.filter(
      (d) =>
        d.name?.toLowerCase().includes(term) ||
        d.nameEn?.toLowerCase().includes(term) ||
        d.code?.toLowerCase().includes(term) ||
        d.province?.name.toLowerCase().includes(term)
    );
  }, [districts, searchTerm]);

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

  const currentProvinceName = useMemo(() => {
    if (!selectedProvinceId) return 'ທຸກແຂວງ';
    return (
      provinces.find((p) => p.id === selectedProvinceId)?.name || 'ແຂວງທີ່ເລືອກ'
    );
  }, [selectedProvinceId, provinces]);

  const columns: ColumnDef<DistrictItem>[] = [
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
      header: 'ຊື່ເມືອງ (District Name)',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block">
              {row.name || 'ບໍ່ມີຊື່'}
            </span>
            <span className="text-[11px] text-slate-400">
              ລະຫັດເມືອງ: {row.code || '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'ຊື່ພາສາອັງກິດ',
      className: 'w-[160px]',
      cell: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.nameEn || '-'}
        </span>
      ),
    },
    {
      header: 'ແຂວງທີ່ສັງກັດ',
      className: 'w-[180px]',
      cell: (row) => {
        const provName =
          row.province?.name ||
          provinces.find((p) => p.id === row.provinceId)?.name ||
          `ແຂວງ #${row.provinceId}`;
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {provName}
          </span>
        );
      },
    },
    {
      header: 'ສະຖານະ',
      className: 'w-[100px]',
      cell: (row) => {
        const isActive = row.status === 'A' || row.status === 'ACTIVE';
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {isActive ? 'ໃຊ້ງານຢູ່' : row.status || 'ປົກກະຕິ'}
          </span>
        );
      },
    },
    {
      header: 'ການຈັດການ',
      className: 'w-[140px] text-right',
      cell: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewVillages(row.id, row.provinceId)}
          className="cursor-pointer text-xs h-7 px-2.5 gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>ເບິ່ງບ້ານ</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">
            ກັ່ນຕອງຕາມແຂວງ:
          </span>
          <select
            value={selectedProvinceId || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onProvinceChange(val);
              setPage(1);
            }}
            className="text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">ທຸກແຂວງ (ທັງໝົດ 18 ແຂວງ)</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.name} ({prov.shortName || `#${prov.id}`})
              </option>
            ))}
          </select>
        </div>

        {selectedProvinceId && (
          <button
            type="button"
            onClick={() => {
              onProvinceChange(undefined);
              setPage(1);
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer self-start sm:self-auto"
          >
            ລ້າງຕົວກັ່ນຕອງ
          </button>
        )}
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
        searchPlaceholder="ຄົ້ນຫາຊື່ເມືອງ (ລາວ/ອັງກິດ), ລະຫັດ..."
        title={`ລາຍການເມືອງ (${currentProvinceName})`}
        description={`ພົບທັງໝົດ ${districts.length} ເມືອງ`}
        extraActions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
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
              className="cursor-pointer gap-1.5 text-xs h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  syncMutation.isPending ? 'animate-spin' : ''
                }`}
              />
              <span>ຊິ້ງຂໍ້ມູນເມືອງ (Sync HRM)</span>
            </Button>
          </div>
        }
      />

      <SyncConfirmModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        onConfirm={handleSyncConfirm}
        isLoading={syncMutation.isPending}
        title="ຊິ້ງຂໍ້ມູນເມືອງຈາກລະບົບ HRM"
        description="ທ່ານຕ້ອງການດຶງຂໍ້ມູນເມືອງທັງໝົດຈາກ HRM Service ມາອັບເດດລົງຖານຂໍ້ມູນແທ້ຫຼືບໍ່?"
      />
    </>
  );
}
