'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { roadmapService, type RoadmapPhase } from '../../services/roadmap-service';
import { assessmentService } from '../../services/assessment-service';
import { authService } from '../../services/auth-service';
import { RoadmapTimeline } from '../../components/ui/roadmap-timeline';
import { MetricCard } from '../../components/ui/metric-card';
import UserFeedbackModal from '../../components/user-feedback-modal';

export default function RoadmapPage() {
  const [phases, setPhases] = useState<RoadmapPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [targetName, setTargetName] = useState('Karier Pilihan');
  const [userName, setUserName] = useState('Mahasiswa');

  useEffect(() => {
    const current = roadmapService.get();
    setPhases(current);
    const active = assessmentService.getActiveReport();
    if (active?.primarySkill) setTargetName(active.primarySkill);
    const user = authService.getCurrentUser();
    if (user?.name) setUserName(user.name);
    setLoading(false);
  }, []);

  const overallProgress = useMemo(
    () => roadmapService.calculateOverallProgress(phases),
    [phases],
  );

  const completedPhasesCount = useMemo(
    () => phases.filter((p) => p.status === 'Completed').length,
    [phases],
  );

  const activePhase = useMemo(
    () => phases.find((p) => p.status === 'In Progress') || phases[0],
    [phases],
  );

  const handleToggleTask = (phaseIndex: number, taskIndex: number) => {
    const nextPhases = roadmapService.toggleTask(phaseIndex, taskIndex);
    setPhases(nextPhases);
  };

  const handleStartPhase = (phaseIndex: number) => {
    const nextPhases = roadmapService.startPhase(phaseIndex);
    setPhases(nextPhases);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Header */}
      <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
        >
          ← Kembali ke Dashboard
        </Link>

        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              Jalur Belajar Terstruktur
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Roadmap Pembelajaran
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Rencana akselerasi bertahap untuk menutup prioritas kesenjangan skill. Centang setiap tugas yang diselesaikan untuk menaikkan kesiapan portofoliomu.
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 min-w-[240px]">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Progres Keseluruhan</span>
              <span className="text-indigo-700">{overallProgress}% Selesai</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500">
              {completedPhasesCount} dari {phases.length} tahap selesai
            </span>
          </div>
        </div>
      </header>

      {/* Metric Quick Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Tahap"
          value={`${phases.length} Tahap`}
          description="Rangkaian kurikulum modular"
          tone="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          label="Tahap Aktif"
          value={activePhase ? activePhase.phase : 'Tidak ada'}
          description={activePhase ? activePhase.title : 'Semua tahap selesai'}
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label="Tahap Selesai"
          value={`${completedPhasesCount} / ${phases.length}`}
          description={`${Math.round((completedPhasesCount / (phases.length || 1)) * 100)}% Target tercapai`}
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Estimasi Waktu"
          value="20 Minggu"
          description="Sekitar 5 bulan komitmen belajar"
          tone="bg-sky-50 text-sky-700"
        />
      </section>

      {/* Timeline of Phases */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-xl font-black text-slate-900">
            Tahapan Pembelajaran & Tugas
          </h2>
          <p className="text-xs text-slate-500">
            Klik kotak centang pada setiap tugas untuk memperbarui progres belajar secara otomatis.
          </p>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Memuat roadmap...
          </div>
        ) : (
          <>
            <RoadmapTimeline
              phases={phases}
              onToggleTask={handleToggleTask}
              onStartPhase={handleStartPhase}
            />

            {/* Student Validation & Feedback Section (SKPL FR-10) */}
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                    Evaluasi Mahasiswa (FR-10)
                  </span>
                  <h3 className="mt-2 text-xl font-black text-slate-900">
                    Apakah Roadmap Ini Sesuai Kebutuhanmu?
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-xl">
                    Berikan konfirmasi dan evaluasi relevansi terhadap kurikulum tahapan belajar di atas untuk membantu meningkatkan akurasi sistem.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 transition text-center whitespace-nowrap"
                >
                  {feedbackSuccess ? '✓ Umpan Balik Terkirim (Ubah)' : 'Beri Umpan Balik & Validasi'}
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <UserFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="Validasi Relevansi Roadmap"
        targetName={targetName}
        role="Mahasiswa"
        userName={userName}
        onSuccess={() => setFeedbackSuccess(true)}
      />
    </main>
  );
}
