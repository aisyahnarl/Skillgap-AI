'use client';

import React from 'react';

type LoadingStateProps = {
  message?: string;
  rows?: number;
};

export function LoadingState({
  message = 'Memuat data...',
  rows = 3,
}: LoadingStateProps) {
  return (
    <div className="w-full space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <span className="text-sm font-semibold text-slate-700">{message}</span>
      </div>

      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-2">
            <div className="h-4 w-3/4 rounded-md bg-slate-100" />
            <div className="h-3 w-1/2 rounded-md bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
