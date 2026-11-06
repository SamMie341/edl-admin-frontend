'use client';

import React from 'react';
import { RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SyncConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
}

export function SyncConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
}: SyncConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 z-10 animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <RefreshCw className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-amber-50/70 border border-amber-200/60 p-3 flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <p>
            ການຊິ້ງຂໍ້ມູນຈະດຶງຂໍ້ມູນລ່າສຸດຈາກລະບົບ HRM ຂອງລັດວິສາຫະກິດໄຟຟ້າລາວ
            ມາອັບເດດລົງຖານຂໍ້ມູນ, ອາດໃຊ້ເວລາ 2-5 ວິນາທີ.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="cursor-pointer font-medium text-xs px-4"
          >
            ຍົກເລີກ
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 gap-1.5 shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>ກຳລັງຊິ້ງຂໍ້ມູນ...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>ຢືນຢັນການຊິ້ງ</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
