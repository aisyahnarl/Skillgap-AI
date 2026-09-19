'use client';

import React from 'react';
import type { RoadmapPhase } from '../../services/roadmap-service';

type RoadmapTimelineProps = {
  phases: RoadmapPhase[];
  onToggleTask?: (phaseIndex: number, taskIndex: number) => void;
  onStartPhase?: (phaseIndex: number) => void;
  readOnly?: boolean;
};

export function RoadmapTimeline({
  phases,
  onToggleTask,
  onStartPhase,
  readOnly = false,
}: RoadmapTimelineProps) {
  if (!phases || phases.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
        Belum ada roadmap yang dibuat. Selesaikan assessment terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {phases.map((phase, phaseIndex) => {
        const completedTasks = phase.tasks.filter((t) => t.completed).length;
        const totalTasks = phase.tasks.length;
        const phaseProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const statusBadge =
          phase.status === 'Completed'
            ? 'sg-badge-success'
            : phase.status === 'In Progress'
            ? 'sg-badge-warning'
            : 'sg-badge-neutral';

        const statusText =
          phase.status === 'Completed'
            ? 'Selesai'
            : phase.status === 'In Progress'
            ? 'Sedang Berjalan'
            : 'Belum Dimulai';

        return (
          <article
            key={`${phase.phase}-${phase.title}`}
            className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft transition hover:border-indigo-100"
          >
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                    {phase.phase}
                  </span>
                  <span className="text-xs font-medium text-slate-400">•</span>
                  <span className="text-xs font-semibold text-slate-500">
                    {phase.duration}
                  </span>
                </div>
                <h3 className="mt-1.5 text-2xl font-black text-slate-900">
                  {phase.title}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  <strong>Target:</strong> {phase.goal}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={statusBadge}>{statusText}</span>
                {!readOnly && phase.status === 'Not Started' && onStartPhase && (
                  <button
                    type="button"
                    onClick={() => onStartPhase(phaseIndex)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition"
                  >
                    Mulai Tahap Ini
                  </button>
                )}
              </div>
            </div>

            {/* Phase Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progres Tugas ({completedTasks}/{totalTasks})</span>
                <span className="font-semibold text-slate-700">{phaseProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    phaseProgress === 100
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-indigo-600 to-sky-500'
                  }`}
                  style={{ width: `${phaseProgress}%` }}
                />
              </div>
            </div>

            {/* Grid details: Tasks & Metadata */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Left: Tasks Checkboxes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Daftar Tugas Praktis
                </h4>
                <div className="mt-3 space-y-2">
                  {phase.tasks.map((task, taskIndex) => (
                    <label
                      key={task.label}
                      className={`flex items-start gap-3 rounded-xl border p-3 text-sm transition ${
                        task.completed
                          ? 'border-emerald-200 bg-emerald-50/50 text-slate-600'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-200 hover:bg-white'
                      } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <input
                        type="checkbox"
                        disabled={readOnly}
                        checked={task.completed}
                        onChange={() => onToggleTask && onToggleTask(phaseIndex, taskIndex)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500"
                      />
                      <span className={task.completed ? 'line-through text-slate-400' : 'font-medium'}>
                        {task.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Right: Skills, Resources, Certification, Project */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs space-y-3">
                <div>
                  <strong className="text-slate-700 uppercase tracking-wider block mb-1">
                    Kompetensi yang Dibangun
                  </strong>
                  <div className="flex flex-wrap gap-1.5">
                    {phase.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-indigo-700 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <strong className="text-slate-700 uppercase tracking-wider block mb-1">
                    Sumber Pembelajaran
                  </strong>
                  <ul className="space-y-1 text-slate-600 list-disc list-inside">
                    {phase.resources.map((res) => (
                      <li key={res} className="truncate">{res}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong className="text-slate-700 uppercase tracking-wider block mb-0.5">
                    Sertifikasi Terkait
                  </strong>
                  <p className="font-semibold text-slate-800">{phase.certification}</p>
                </div>

                <div>
                  <strong className="text-slate-700 uppercase tracking-wider block mb-0.5">
                    Proyek Portofolio
                  </strong>
                  <p className="font-semibold text-slate-800">{phase.project}</p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
