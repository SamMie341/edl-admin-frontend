'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Building2, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import {
  DataTable,
  ConfirmModal,
  type ColumnDef,
} from '@/core/presentation/components/shared';
import { Button } from '@/components/ui/button';
import {
  useDepartments,
  useDeleteDepartment,
} from '../application/use-departments.hook';
import { DepartmentFormModal } from './components/department-form-modal';
import type { DepartmentItem } from '../domain/department.types';
import { cn } from '@/lib/utils';

export function DepartmentsView() {
  const { data: departments = [], isLoading, refetch, isRefetching } = useDepartments();
  const deleteMutation = useDeleteDepartment();

  const [searchTerm, setSearchTerm] = useState('');
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentItem | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);

  // Pagination Client-side fallback
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handleSearchChange = useCallback((val: string) => {
    setSearchTerm(val);
    setPage(1);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm) return departments;
    const term = searchTerm.toLowerCase();
    return departments.filter((d) => d.name.toLowerCase().includes(term));
  }, [departments, searchTerm]);

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

  const handleEdit = (dept: DepartmentItem) => {
    setSelectedDept(dept);
    setFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedDept(null);
    setFormModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingDept) return;
    try {
      await deleteMutation.mutateAsync(deletingDept.id);
      setDeletingDept(null);
    } catch {
      // Handled by hook
    }
  };

  const columns: ColumnDef<DepartmentItem>[] = [
    {
      header: 'ລະຫັດ',
      className: 'w-[90px]',
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-700 border border-slate-200/60 shadow-2xs">
          #{row.id}
        </span>
      ),
    },
    {
      header: 'ຊື່ຝ່າຍ (Department Name)',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-800 text-xs">{row.name}</span>
        </div>
      ),
    },
    {
      header: 'ວັນທີສ້າງ',
      className: 'w-[160px]',
      cell: (row) => (
        <span className="text-xs text-slate-400">
          {row.createdAt ? format(new Date(row.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
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
            onClick={() => handleEdit(row)}
            title="ແກ້ໄຂຊື່ຝ່າຍ"
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingDept(row)}
            title="ລຶບຝ່າຍ"
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
      <DataTable
        title="ຂໍ້ມູນຝ່າຍຕ່າງໆ (Departments Management)"
        description="ຄຸ້ມຄອງຂໍ້ມູນຝ່າຍທັງໝົດໃນໂຄງສ້າງການບໍລິຫານຂອງ ລັດວິສາຫະກິດໄຟຟ້າລາວ"
        columns={columns}
        data={paginatedData}
        isLoading={isLoading}
        searchPlaceholder="ຄົ້ນຫາຊື່ຝ່າຍ..."
        searchValue={searchTerm}
        onSearchChange={handleSearchChange}
        meta={paginationMeta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        actionButton={{
          label: 'ເພີ່ມຝ່າຍໃໝ່',
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

      {/* Form Modal */}
      {formModalOpen && (
        <DepartmentFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          department={selectedDept}
        />
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingDept)}
        onClose={() => setDeletingDept(null)}
        onConfirm={handleDeleteConfirm}
        title="ຢືນຢັນການລຶບຂໍ້ມູນຝ່າຍ"
        description={`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບ "${deletingDept?.name}"? ຖ້າມີສາຂາ ຫຼື ຜູ້ໃຊ້ງານສັງກັດຢູ່ ຈະບໍ່ສາມາດລຶບໄດ້.`}
        confirmLabel="ລຶບຝ່າຍ"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
