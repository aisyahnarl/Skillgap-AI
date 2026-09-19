'use client';

import React from 'react';

export type SkillItem = {
  skill: string;
  category?: string;
  current: number;
  required: number;
  gap: number;
  status?: string;
};

type SkillGapChartProps = {
  skills: SkillItem[];
  compact?: boolean;
};

export function SkillGapChart({ skills, compact = false }: SkillGapChartProps) {
  if (!skills || skills.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        Belum ada data kompetensi untuk ditampilkan.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {skills.map((item) => {
        const status =
          item.status || (item.current >= item.required ? 'Strong' : item.gap > 25 ? 'Gap' : 'Developing');
        const badgeClass =
          status === 'Strong'
            ? 'sg-badge-success'
            : status === 'Gap'
            ? 'sg-badge-danger'
            : 'sg-badge-warning';

        const statusLabel =
          status === 'Strong'
            ? 'Kuat / Siap'
            : status === 'Gap'
            ? 'Perlu Ditingkatkan'
            : 'Sedang Berkembang';

        return (
          <div
            key={item.skill}
            className={`rounded-2xl border border-slate-200 bg-slate-50 ${
              compact ? 'p-3.5' : 'p-4'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <h4 className="font-bold text-slate-900">{item.skill}</h4>
                {item.category && (
                  <p className="text-xs text-slate-500">{item.category}</p>
                )}
              </div>
              <span className={badgeClass}>{statusLabel}</span>
            </div>

            <div className="mt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  Profil Saat Ini: <strong>{item.current}%</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  Kebutuhan Industri: <strong>{item.required}%</strong>
                </span>
              </div>

              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${item.current}%` }}
                />
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 opacity-80">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${item.required}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500">
                  {item.gap > 0 ? `Gap yang perlu ditutup: ${item.gap}%` : 'Memenuhi standar industri'}
                </span>
                <span
                  className={`font-semibold ${
                    item.gap > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {item.gap > 0 ? `-${item.gap}%` : '✓ Sesuai'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
