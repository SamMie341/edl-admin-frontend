'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Info, Trash2, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'ຢືນຢັນ',
  cancelLabel = 'ຍົກເລີກ',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-50 text-rose-600',
      icon: Trash2,
      button:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600',
      icon: AlertTriangle,
      button:
        'bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-500/20',
    },
    info: {
      iconBg: 'bg-blue-50 text-blue-600',
      icon: Info,
      button:
        'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20',
    },
  };

  const current = variantStyles[variant];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => !isLoading && onClose()}
      />

      {/* 2. Modal Container */}
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200/80 transition-all animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-5 top-5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon Badge */}
          <div
            className={cn(
              'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0',
              current.iconBg
            )}
          >
            <Icon className="h-6 w-6" />
          </div>

          {/* Details */}
          <div className="space-y-1.5 pt-0.5">
            <h3 className="text-base font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="h-9 px-4 rounded-xl text-xs font-medium text-slate-600 border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              'h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all active:scale-[0.98]',
              current.button
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>ກຳລັງດຳເນີນການ...</span>
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
