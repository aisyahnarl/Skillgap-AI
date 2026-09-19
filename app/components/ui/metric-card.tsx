'use client';

import React from 'react';

type MetricCardProps = {
  label: string;
  value: string | number;
  description?: string;
  tone?: string;
  icon?: React.ReactNode;
  trend?: string;
  className?: string;
};

export function MetricCard({
  label,
  value,
  description,
  tone = 'bg-indigo-50 text-indigo-700',
  icon,
  trend,
  className = '',
}: MetricCardProps) {
  return (
    <article
      className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft transition hover:border-indigo-100 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
          {icon}
          {label}
        </span>
        {trend && (
          <span className="text-xs font-semibold text-emerald-600">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-black text-slate-900">{value}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
    </article>
  );
}
