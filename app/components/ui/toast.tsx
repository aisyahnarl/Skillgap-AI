'use client';

import React from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
};

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  if (!message) return null;

  const bgStyles =
    type === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : type === 'info'
      ? 'border-sky-200 bg-sky-50 text-sky-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  const icon =
    type === 'error' ? '⚠️' : type === 'info' ? 'ℹ️' : '✓';

  return (
    <div
      role="status"
      className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${bgStyles} animate-in slide-in-from-top-2`}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-xs font-bold">
        {icon}
      </span>
      <p className="text-sm font-semibold">{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-sm font-bold opacity-60 hover:opacity-100"
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      )}
    </div>
  );
}
