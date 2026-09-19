'use client';

import React from 'react';

type DashboardCardProps = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  id?: string;
};

export function DashboardCard({
  title,
  subtitle,
  action,
  badge,
  className = '',
  children,
  id,
}: DashboardCardProps) {
  return (
    <article
      id={id}
      className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft ${className}`}
    >
      {(title || subtitle || action || badge) && (
        <header className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {subtitle && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                {title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </header>
      )}
      {children}
    </article>
  );
}
