'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import {
  Network,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
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
  useOrgStructures,
  useDeleteOrgStructure,
} from '../application/use-org-structures.hook';
import { OrgStructureEditorPage } from './components/org-structure-editor-page';
import { OrgStructurePreviewPage } from './components/org-structure-preview-page';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';
import type {
  OrgStructureItem,
  StructureType,
} from '../domain/org-structure.types';
import { STRUCTURE_TYPE_LABELS } from '../domain/org-structure.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function OrgStructuresView() {
  const { data: structures = [], isLoading, refetch, isRefetching } = useOrgStructures();
  const deleteMutation = useDeleteOrgStructure();

  // Active View mode: 'list' (Table) | 'editor' (Full Page Designer) | 'preview' (Full Page Viewer)
  const [activeView, setActiveView] = useState<'list' | 'editor' | 'preview'>('list');

  const [selectedType, setSelectedType] = useState<StructureType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected item states
  const [selectedStructure, setSelectedStructure] = useState<OrgStructureItem | null>(null);
  const [previewStructure, setPreviewStructure] = useState<OrgStructureItem | null>(null);
  const [deletingStructure, setDeletingStructure] = useState<OrgStructureItem | null>(null);

  // Pagination Client-side
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const handleCreate = () => {
    setSelectedStructure(null);
    setActiveView('editor');
  };

  const handleEdit = (item: OrgStructureItem) => {
    setSelectedStructure(item);
    setActiveView('editor');
  };

  const handlePreview = (item: OrgStructureItem) => {
    setPreviewStructure(item);
    setActiveView('preview');
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStructure) return;
    try {
      await deleteMutation.mutateAsync(deletingStructure.id);
      setDeletingStructure(null);
    } catch {
      // Handled by hook toasts
    }
  };

  // Filter structures by type and search term
  const filteredData = useMemo(() => {
    return structures.filter((item) => {
      // Type Filter
      if (selectedType !== 'ALL' && item.structureType !== selectedType) {
        return false;
      }

      // Search Query
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const name = item.structureName.toLowerCase();
      const typeLabel = (
        STRUCTURE_TYPE_LABELS[item.structureType]?.label || ''
      ).toLowerCase();

      return name.includes(term) || typeLabel.includes(term);
    });
  }, [structures, selectedType, searchTerm]);

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

  // If in Full Page Editor View
  if (activeView === 'editor') {
    return (
      <OrgStructureEditorPage
        orgStructure={selectedStructure}
        defaultType={selectedType !== 'ALL' ? selectedType : 'ORG_STRUCTURE'}
        onBack={() => setActiveView('list')}
        onSaved={() => refetch()}
      />
    );
  }

  // If in Full Page Preview View
  if (activeView === 'preview' && previewStructure) {
    return (
      <OrgStructurePreviewPage
        item={previewStructure}
        onBack={() => setActiveView('list')}
        onEdit={(item) => {
          setSelectedStructure(item);
          setActiveView('editor');
        }}
      />
    );
  }

  const columns: ColumnDef<OrgStructureItem>[] = [
    {
      header: 'ຮູບແຜນຜັງ',
      className: 'w-[85px]',
      cell: (row) => (
        <div
          onClick={() => handlePreview(row)}
          className="relative h-12 w-14 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-100 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer hover:opacity-85 transition"
          title="ກົດເພື່ອເບິ່ງໂຄງຮ່າງແບບເຕັມຈໍ"
        >
          {row.imageUrl ? (
            <Image
              src={getStorageUrl(row.imageUrl)}
              alt={row.structureName}
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
      header: 'ຊື່ໂຄງຮ່າງການຈັດຕັ້ງ',
      cell: (row) => (
        <div className="space-y-1">
          <p
            onClick={() => handlePreview(row)}
            className="font-bold text-slate-800 text-xs hover:text-blue-600 transition cursor-pointer"
          >
            {row.structureName}
          </p>
          <span
            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              STRUCTURE_TYPE_LABELS[row.structureType]?.color || 'bg-slate-100 text-slate-700'
            }`}
          >
            {STRUCTURE_TYPE_LABELS[row.structureType]?.label || row.structureType}
          </span>
        </div>
      ),
    },
    {
      header: 'ລຳດັບ (Index)',
      className: 'w-[100px]',
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60 shadow-2xs">
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
            onClick={() => handlePreview(row)}
            title="ເບິ່ງແຜນຜັງເຕັມຈໍ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(row)}
            title="ແກ້ໄຂໂຄງຮ່າງ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingStructure(row)}
            title="ລຶບໂຄງຮ່າງ"
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
      {/* 1. Filter Tabs by Structure Type */}
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
          ທຸກປະເພດໂຄງຮ່າງ
        </button>

        {(Object.keys(STRUCTURE_TYPE_LABELS) as StructureType[]).map((type) => {
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
              {STRUCTURE_TYPE_LABELS[type].label}
            </button>
          );
        })}
      </div>

      {/* 2. Main Data Table */}
      <DataTable
        title="ໂຄງຮ່າງການຈັດຕັ້ງ ຟຟລ (Organization Structures)"
        description="ຄຸ້ມຄອງແຜນຜັງໂຄງຮ່າງການຈັດຕັ້ງລວມ, ສະພາຜູ້ອຳນວຍການ ແລະ ຄະນະຜູ້ບໍລິຫານ ລັດວິສາຫະກິດໄຟຟ້າລາວ"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຊື່ໂຄງຮ່າງ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ສ້າງໂຄງຮ່າງໃໝ່',
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

      {/* 3. Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingStructure)}
        onClose={() => setDeletingStructure(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບໂຄງຮ່າງການຈັດຕັ້ງ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${deletingStructure?.structureName}"? ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້.`}
        confirmLabel="ລຶບໂຄງຮ່າງ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
