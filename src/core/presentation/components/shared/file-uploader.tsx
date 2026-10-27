'use client';

import React, { useCallback } from 'react';
import Image from 'next/image';
import { useDropzone, type Accept } from 'react-dropzone';
import { UploadCloud, FileText, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStorageUrl } from '@/core/infrastructure/http/axios-client';

export type UploaderType = 'image' | 'gallery' | 'document';

interface FileUploaderProps {
  type?: UploaderType;
  value?: File | File[] | string | string[] | null;
  onChange: (file: any) => void;
  maxSizeMb?: number;
  label?: string;
  helperText?: string;
  error?: string;
  className?: string;
}

export function FileUploader({
  type = 'image',
  value,
  onChange,
  maxSizeMb = 10,
  label,
  helperText,
  error,
  className,
}: FileUploaderProps) {
  const isMultiple = type === 'gallery';

  // File MIME Type Accept rules
  const acceptRules: Record<UploaderType, Accept> = {
    image: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    gallery: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    document: {
      'application/pdf': ['.pdf'],
    },
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      if (type === 'gallery') {
        const currentFiles = Array.isArray(value) ? value : [];
        onChange([...currentFiles, ...acceptedFiles]);
      } else {
        onChange(acceptedFiles[0]);
      }
    },
    [type, value, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptRules[type],
    multiple: isMultiple,
    maxSize: maxSizeMb * 1024 * 1024,
  });

  // Remove single or item from array
  const handleRemove = (e: React.MouseEvent, indexToRemove?: number) => {
    e.stopPropagation();
    if (type === 'gallery' && Array.isArray(value)) {
      onChange(value.filter((_, idx) => idx !== indexToRemove));
    } else {
      onChange(null);
    }
  };

  // Resolve Preview URL for an item (File or String)
  const getPreviewUrl = (item: any): string => {
    if (!item) return '';
    if (item instanceof File) {
      return URL.createObjectURL(item);
    }
    if (typeof item === 'string') {
      return getStorageUrl(item);
    }
    return '';
  };

  // Resolve File Name for Documents
  const getFileName = (item: any): string => {
    if (!item) return '';
    if (item instanceof File) {
      return item.name;
    }
    if (typeof item === 'string') {
      return item.split('/').pop() || 'document.pdf';
    }
    return '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      {/* 1. Single Image Preview Mode */}
      {type === 'image' && value && (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 w-full max-w-sm h-48 flex items-center justify-center shadow-xs">
          <Image
            src={getPreviewUrl(value)}
            alt="Upload Preview"
            fill
            unoptimized
            className="object-contain p-2"
          />
          <button
            type="button"
            onClick={(e) => handleRemove(e)}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white transition-colors shadow-md cursor-pointer"
            title="ລຶບຮູບພາບ"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. Document Preview Mode */}
      {type === 'document' && value && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/80 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {getFileName(value)}
              </p>
              <p className="text-[11px] text-slate-400">ເອກະສານ PDF ພ້ອມອັບໂຫຼດ</p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => handleRemove(e)}
            className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="ຍົກເລີກເອກະສານ"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. Gallery Multi-Image Grid Preview Mode */}
      {type === 'gallery' && Array.isArray(value) && value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-2">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs group"
            >
              <Image
                src={getPreviewUrl(item)}
                alt={`Gallery ${idx}`}
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={(e) => handleRemove(e, idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/60 hover:bg-rose-600 text-white transition cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4. Dropzone Box (Show if empty or if gallery) */}
      {(!value || type === 'gallery') && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2',
            isDragActive
              ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-blue-400/80 hover:bg-slate-50/60 bg-white/50'
          )}
        >
          <input {...getInputProps()} />
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
            {type === 'document' ? (
              <FileText className="h-5 w-5" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-700">
              {isDragActive
                ? 'ປ່ອຍໄຟລ໌ລົງທີ່ນີ້...'
                : type === 'document'
                ? 'ຄລິກ ຫຼື ລາກໄຟລ໌ PDF ມາວາງທີ່ນີ້'
                : isMultiple
                ? 'ຄລິກ ຫຼື ລາກຮູບພາບຫຼາຍຮູບມາວາງ'
                : 'ຄລິກ ຫຼື ລາກຮູບພາບມາວາງທີ່ນີ້'}
            </p>
            <p className="text-[11px] text-slate-400">
              {helperText ||
                (type === 'document'
                  ? `ຮອງຮັບໄຟລ໌ PDF ຂະໜາດສູງສຸດ ${maxSizeMb}MB`
                  : `ຮອງຮັບ PNG, JPG, WEBP ຂະໜາດສູງສຸດ ${maxSizeMb}MB`)}
            </p>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}
