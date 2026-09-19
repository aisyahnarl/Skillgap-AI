'use client';

import React from 'react';

type SkillCardProps = {
  name: string;
  category: string;
  level?: string;
  description?: string;
  demandWeight?: number;
  roles?: string[];
  certifications?: string[];
  onAction?: () => void;
  actionLabel?: string;
};

export function SkillCard({
  name,
  category,
  level,
  description,
  demandWeight,
  roles,
  certifications,
  onAction,
  actionLabel = 'Lihat Detail',
}: SkillCardProps) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:border-indigo-200">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">{name}</h3>
            <p className="mt-0.5 text-xs font-semibold text-indigo-600">
              {category} {level ? `· ${level}` : ''}
            </p>
          </div>
          {demandWeight !== undefined && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
              {demandWeight}% bobot
            </span>
          )}
        </div>

        {description && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-2">{description}</p>
        )}

        {roles && roles.length > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            <strong>Role:</strong> {roles.join(', ')}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>{certifications?.length || 0} sertifikasi terkait</span>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="font-semibold text-indigo-600 hover:text-indigo-700"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}
