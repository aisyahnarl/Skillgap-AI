'use client';

import React from 'react';

type CertificationCardProps = {
  name: string;
  provider: string;
  reason?: string;
  match?: number;
  priority?: 'High' | 'Medium' | 'Low' | string;
  relatedSkills?: string[];
  duration?: string;
  imageUrl?: string;
  onViewDetail?: () => void;
  officialUrl?: string | null;
};

export function CertificationCard({
  name,
  provider,
  reason,
  match,
  priority = 'High',
  relatedSkills,
  duration,
  imageUrl,
  onViewDetail,
  officialUrl,
}: CertificationCardProps) {
  const priorityBadge =
    priority === 'High'
      ? 'sg-badge-danger'
      : priority === 'Medium'
      ? 'sg-badge-warning'
      : 'sg-badge-neutral';

  return (
    <article className="group flex flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft transition hover:border-indigo-200 hover:shadow-md">
      <div>
        {imageUrl && (
          <div className="relative mb-4 h-36 w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
            <span className="absolute bottom-2.5 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
              {provider}
            </span>
            {match !== undefined && (
              <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-2xs">
                {match}% Cocok
              </span>
            )}
          </div>
        )}

        {!imageUrl && (
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-xs font-semibold text-indigo-600">{provider}</p>
            {match !== undefined && (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                {match}% Cocok
              </span>
            )}
          </div>
        )}

        <h3 className="text-base font-black text-slate-900 leading-snug">{name}</h3>

        {reason && (
          <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-2">{reason}</p>
        )}

        {relatedSkills && relatedSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {relatedSkills.slice(0, 3).map((s) => (
              <span key={s} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {s}
              </span>
            ))}
          </div>
        )}

        {duration && (
          <p className="mt-2 text-[11px] text-slate-500">
            <strong>Estimasi durasi:</strong> {duration}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className={priorityBadge}>
          Prioritas {priority === 'High' ? 'Tinggi' : priority === 'Medium' ? 'Sedang' : 'Rendah'}
        </span>
        <div className="flex items-center gap-2">
          {officialUrl && (
            <a
              href={officialUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
            >
              Info Resmi
            </a>
          )}
          {onViewDetail && (
            <button
              type="button"
              onClick={onViewDetail}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Lihat Detail →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
