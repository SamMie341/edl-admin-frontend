import React from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default';

interface StatusBadgeProps {
  status?: string | null;
  label?: React.ReactNode;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  variant,
  className,
}: StatusBadgeProps) {
  let resolvedLabel = label;
  if (resolvedLabel && typeof resolvedLabel === 'object' && !React.isValidElement(resolvedLabel)) {
    if ('label' in (resolvedLabel as any) && typeof (resolvedLabel as any).label === 'string') {
      resolvedLabel = (resolvedLabel as any).label;
    } else if ('name' in (resolvedLabel as any) && typeof (resolvedLabel as any).name === 'string') {
      resolvedLabel = (resolvedLabel as any).name;
    } else {
      resolvedLabel = String(resolvedLabel);
    }
  }

  const normalizedStatus = (typeof status === 'string' ? status : '').toUpperCase();

  // Automatic variant detection if not explicitly passed
  let resolvedVariant: StatusVariant = variant || 'default';
  if (!variant) {
    if (['ACTIVE', 'PUBLISHED', 'OPEN', 'AWARDED', 'COMPLETED', 'SUCCESS', 'APPROVED'].includes(normalizedStatus)) {
      resolvedVariant = 'active';
    } else if (['INACTIVE', 'SUSPENDED', 'CANCELLED', 'REJECTED', 'DISABLED', 'EXPIRED'].includes(normalizedStatus)) {
      resolvedVariant = 'danger';
    } else if (['PENDING', 'DRAFT', 'UNDER_MAINTENANCE', 'TEMPORARILY_CLOSED', 'PROCESSING'].includes(normalizedStatus)) {
      resolvedVariant = 'warning';
    } else if (['INFO', 'NEW', 'CLOSED', 'ARCHIVED', 'HISTORICAL'].includes(normalizedStatus)) {
      resolvedVariant = 'info';
    }
  }

  const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
    active: {
      badge: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60',
      dot: 'bg-emerald-500',
    },
    inactive: {
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
    danger: {
      badge: 'bg-rose-50/90 text-rose-700 border-rose-200/60',
      dot: 'bg-rose-500',
    },
    warning: {
      badge: 'bg-amber-50/90 text-amber-700 border-amber-200/60',
      dot: 'bg-amber-500',
    },
    info: {
      badge: 'bg-blue-50/90 text-blue-700 border-blue-200/60',
      dot: 'bg-blue-500',
    },
    pending: {
      badge: 'bg-violet-50/90 text-violet-700 border-violet-200/60',
      dot: 'bg-violet-500',
    },
    default: {
      badge: 'bg-slate-50 text-slate-600 border-slate-200/70',
      dot: 'bg-slate-400',
    },
  };

  const style = variantStyles[resolvedVariant];
  const displayLabel = resolvedLabel ?? (status || '-');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-2xs transition-colors',
        style.badge,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', style.dot)} />
      <span className="truncate">{displayLabel}</span>
    </span>
  );
}
