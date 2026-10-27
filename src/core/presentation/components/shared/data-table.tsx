'use client';

import React from 'react';
import { Loader2, Inbox, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from './search-input';
import { PaginationControl } from './pagination-control';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/core/domain/api-response.entity';

export interface ColumnDef<T> {
  header: React.ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  // Search
  searchPlaceholder?: string;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  // Toolbar Actions
  title?: string;
  description?: string;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  extraActions?: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading = false,
  meta,
  onPageChange,
  onLimitChange,
  searchPlaceholder = 'ຄົ້ນຫາ...',
  onSearchChange,
  searchValue,
  title,
  description,
  actionButton,
  extraActions,
  emptyMessage = 'ບໍ່ພົບຂໍ້ມູນໃນລະບົບ',
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* 1. Header & Actions Toolbar */}
      {(title || actionButton || onSearchChange || extraActions) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white/75 backdrop-blur-xl border border-slate-200/50 shadow-2xs">
          <div>
            {title && (
              <h2 className="text-base font-bold text-slate-800 tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onSearchChange && (
              <SearchInput
                placeholder={searchPlaceholder}
                onChange={onSearchChange}
                value={searchValue}
              />
            )}

            {extraActions}

            {actionButton && (
              <Button
                onClick={actionButton.onClick}
                className="h-9 px-4 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-500/20 cursor-pointer transition-all active:scale-[0.98]"
              >
                {actionButton.icon || <Plus className="h-4 w-4" />}
                <span>{actionButton.label}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Table Card */}
      <div className="overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      'py-3.5 px-4 font-semibold text-slate-600',
                      col.headerClassName
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100/80 text-slate-700">
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-4 px-4">
                        <div className="h-4 bg-slate-200/60 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty State
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 px-4 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100/80 flex items-center justify-center text-slate-400">
                        <Inbox className="h-6 w-6 stroke-[1.5]" />
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-1">
                        {emptyMessage}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        ບໍ່ມີລາຍການຂໍ້ມູນ ຫຼື ລອງປ່ຽนຄຳຄົ້ນຫາໃໝ່
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Real Data Rows
                data.map((row, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    className="hover:bg-slate-50/60 transition-colors duration-150"
                  >
                    {columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className={cn('py-3.5 px-4 align-middle', col.className)}
                      >
                        {col.cell
                          ? col.cell(row, rIdx)
                          : col.accessorKey
                          ? (row[col.accessorKey] as any)
                          : null}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Pagination Control */}
      {meta && onPageChange && (
        <PaginationControl
          meta={meta}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}
