'use client';

import React from 'react';
import Link from 'next/link';

type EmptyStateProps = {
  title?: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: string;
};

export function EmptyState({
  title = 'Belum Ada Data',
  description,
  actionLabel,
  actionHref,
  onAction,
  icon = '📋',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white p-8 text-center shadow-2xs">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl mb-3">
        {icon}
      </span>
      <h3 className="text-lg font-black text-slate-900">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-slate-500 leading-relaxed">
        {description}
      </p>

      {actionLabel && (
        <div className="mt-5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-soft hover:opacity-95 transition"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-soft hover:opacity-95 transition"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
