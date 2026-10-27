'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaginationMeta } from '@/core/domain/api-response.entity';

interface PaginationControlProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function PaginationControl({
  meta,
  onPageChange,
  onLimitChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationControlProps) {
  const { page, totalPages, total, limit } = meta;

  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 text-xs text-slate-500 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-2xs',
        className
      )}
    >
      {/* Items count summary */}
      <div className="flex items-center gap-3">
        <span>
          ສະແດງ{' '}
          <strong className="font-semibold text-slate-700">{startItem}</strong> -{' '}
          <strong className="font-semibold text-slate-700">{endItem}</strong> ຈາກ{' '}
          <strong className="font-semibold text-slate-700">{total}</strong> ລາຍການ
        </span>

        {/* Page size selector */}
        {onLimitChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span>ຈຳນວນຕໍ່ໜ້າ:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="py-1 px-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-30 cursor-pointer"
          aria-label="First page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-30 cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-slate-400">
                  ...
                </span>
              );
            }

            const isCurrent = p === page;
            return (
              <Button
                key={`page-${p}`}
                variant={isCurrent ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  'h-8 min-w-[32px] px-2 rounded-lg font-medium text-xs cursor-pointer transition-all',
                  isCurrent
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                )}
              >
                {p}
              </Button>
            );
          })}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-30 cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-30 cursor-pointer"
          aria-label="Last page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
