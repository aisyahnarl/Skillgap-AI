'use client';

import React, { useState } from 'react';

export type Column<T> = {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  pageSize?: number;
  emptyMessage?: string;
};

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  pageSize = 6,
  emptyMessage = 'Tidak ada data untuk ditampilkan.',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paginatedData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedData.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-slate-50 transition">
                {columns.map((col, idx) => {
                  let content: React.ReactNode;
                  if (typeof col.accessor === 'function') {
                    content = col.accessor(item);
                  } else if (col.accessor) {
                    content = item[col.accessor] as unknown as React.ReactNode;
                  } else {
                    content = null;
                  }
                  return (
                    <td key={idx} className={`px-4 py-3.5 text-slate-700 ${col.className || ''}`}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan {paginatedData.length} dari {data.length} data</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            <span className="font-semibold">Halaman {currentPage} dari {totalPages}</span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
