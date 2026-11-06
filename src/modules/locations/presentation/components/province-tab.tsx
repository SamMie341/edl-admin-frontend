'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import {
  MapPin,
  RefreshCw,
  ExternalLink,
  Building,
  Layers,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useProvinces,
  useSyncProvinces,
} from '../../application/use-locations.hook';
import { SyncConfirmModal } from './sync-confirm-modal';
import type { ProvinceItem } from '../../domain/location.types';

interface ProvinceTabProps {
  onViewDistricts: (provinceId: number) => void;
}

export function ProvinceTab({ onViewDistricts }: ProvinceTabProps) {
  const { data: provinces = [], isLoading, refetch, isRefetching } = useProvinces();
  const syncMutation = useSyncProvinces();

  const [searchTerm, setSearchTerm] = useState('');
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return provinces;
    const term = searchTerm.toLowerCase();
    return provinces.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term) ||
        p.shortName?.toLowerCase().includes(term) ||
        p.branchCode?.toLowerCase().includes(term)
    );
  }, [provinces, searchTerm]);

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

  const columns: ColumnDef<ProvinceItem>[] = [
    {
      header: 'ລຳດັບ',
      className: 'w-[90px]',
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'ຊື່ແຂວງ',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-xs block">
              {row.name}
            </span>
            <span className="text-[11px] text-slate-400">
              ລະຫັດແຂວງ: {row.code || '-'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'ຊື່ຫຍໍ້',
      className: 'w-[100px]',
      cell: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
          {row.shortName || '-'}
        </span>
      ),
    },
    {
      header: 'ລະຫັດສາຂາ ຟຟລ',
      className: 'w-[140px]',
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Building className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-mono">{row.branchCode || '-'}</span>
        </div>
      ),
    },
    {
      header: 'ວັນທີອັບເດດ',
      className: 'w-[160px]',
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {row.updatedAt
            ? format(new Date(row.updatedAt), 'dd/MM/yyyy HH:mm')
            : '-'}
        </span>
      ),
    },
    {
      header: 'ການຈັດການ',
      className: 'w-[140px] text-right',
      cell: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDistricts(row.id)}
          className="cursor-pointer text-xs h-7 px-2.5 gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>ເບິ່ງເມືອງ</span>
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </Button>
      ),
    },
  ];

  return (
    <>
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
        searchPlaceholder="ຄົ້ນຫາຊື່ແຂວງ, ລະຫັດ, ຊື່ຫຍໍ້..."
        title="ລາຍການແຂວງທັງໝົດ"
        description={`ທັງໝົດ ${provinces.length} ແຂວງທົ່ວປະເທດ`}
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
              <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">ໂຫຼດຄືນໃໝ່</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setSyncModalOpen(true)}
              disabled={syncMutation.isPending}
              className="cursor-pointer gap-1.5 text-xs h-8.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${syncMutation.isPending ? 'animate-spin' : ''
                  }`}
              />
              <span>ຊິ້ງຂໍ້ມູນແຂວງ</span>
            </Button>
          </div>
        }
      />

      <SyncConfirmModal
        isOpen={syncModalOpen}
        onClose={() => setSyncModalOpen(false)}
        onConfirm={handleSyncConfirm}
        isLoading={syncMutation.isPending}
        title="ຊິ້ງຂໍ້ມູນແຂວງຈາກລະບົບ HRM"
        description="ທ່ານຕ້ອງການດຶງຂໍ້ມູນແຂວງທັງໝົດຈາກ HRM Service ມາອັບເດດລົງຖານຂໍ້ມູນແທ້ຫຼືບໍ່?"
      />
    </>
  );
}
