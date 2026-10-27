'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  value: initialValue = '',
  onChange,
  placeholder = 'ຄົ້ນຫາ...',
  debounceMs = 350,
  className,
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const isFirstMount = useRef(true);
  const prevReportedValue = useRef(initialValue);
  const onChangeRef = useRef(onChange);

  // Keep latest onChange callback without re-triggering effects
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync external value changes (e.g. parent resets search)
  useEffect(() => {
    if (initialValue !== prevReportedValue.current) {
      setSearchTerm(initialValue);
      prevReportedValue.current = initialValue;
    }
  }, [initialValue]);

  // Debounced callback triggered ONLY when user types new input
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (searchTerm === prevReportedValue.current) {
      return;
    }

    const timer = setTimeout(() => {
      prevReportedValue.current = searchTerm;
      onChangeRef.current(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  const handleClear = () => {
    setSearchTerm('');
    prevReportedValue.current = '';
    onChangeRef.current('');
  };

  return (
    <div className={cn('relative flex items-center min-w-[240px]', className)}>
      <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9.5 pr-8 py-2 text-xs rounded-xl border border-slate-200/90 bg-white/80 text-slate-800 placeholder-slate-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all duration-200"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
