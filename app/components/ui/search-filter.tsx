'use client';

import React from 'react';

type FilterOption = {
  label: string;
  value: string;
};

type SearchFilterProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  secondaryFilterValue?: string;
  onSecondaryFilterChange?: (value: string) => void;
  secondaryFilterOptions?: FilterOption[];
  secondaryFilterLabel?: string;
  children?: React.ReactNode;
};

export function SearchFilter({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cari...',
  filterValue,
  onFilterChange,
  filterOptions,
  filterLabel = 'Filter',
  secondaryFilterValue,
  onSecondaryFilterChange,
  secondaryFilterOptions,
  secondaryFilterLabel = 'Filter Lain',
  children,
}: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white"
          />
        </div>

        {filterOptions && onFilterChange && (
          <select
            value={filterValue}
            onChange={(e) => onFilterChange(e.target.value)}
            aria-label={filterLabel}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            {filterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {secondaryFilterOptions && onSecondaryFilterChange && (
          <select
            value={secondaryFilterValue}
            onChange={(e) => onSecondaryFilterChange(e.target.value)}
            aria-label={secondaryFilterLabel}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700"
          >
            {secondaryFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
