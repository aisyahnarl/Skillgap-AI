'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { assessmentService, defaultStudentReport, type AssessmentReport } from '../../services/assessment-service';
import { authService, type UserRole } from '../../services/auth-service';
import { MetricCard, DashboardCard, SkillGapChart } from '../../components/ui';

export default function SkillGapPage() {
  const [report, setReport] = useState<AssessmentReport>(defaultStudentReport);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userRole, setUserRole] = useState<UserRole>('Mahasiswa');

  useEffect(() => {
    const active = assessmentService.getActiveReport();
    setReport(active);
    const user = authService.getCurrentUser();
    if (user?.role) setUserRole(user.role);
  }, []);

  const isPelajar = userRole === 'Pelajar';

  const categories = useMemo(() => {
    return ['All', ...new Set(report.skillAnalysis.map((s) => s.category))];
  }, [report.skillAnalysis]);

  const filteredSkills = useMemo(() => {
    return report.skillAnalysis.filter(
      (item) => selectedCategory === 'All' || item.category === selectedCategory,
    );
  }, [report.skillAnalysis, selectedCategory]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
        >
          ← Kembali ke Dashboard
        </Link>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              {isPelajar ? 'Pemetaan Minat & Potensi Studi (Pelajar)' : 'Pemetaan Kompetensi & Kesenjangan Skill'}
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {isPelajar ? `Peta Minat & Bakat: ${report.primarySkill}` : `Peta Kesenjangan Skill: ${report.primarySkill}`}
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              {isPelajar
                ? `Visualisasi pemetaan minat belajar dan potensi akademikmu terhadap program studi dan bidang kejuruan yang direkomendasikan untuk target ${report.primarySkill}.`
                : `Visualisasi komprehensif tingkat penguasaan kompetensimu dibandingkan ekspektasi standar industri untuk target karier ${report.primarySkill}.`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/assessment"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95 transition text-center"
            >
              {isPelajar ? 'Perbarui Tes Minat' : 'Perbarui Asesmen'}
            </Link>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={isPelajar ? 'Kesesuaian Minat' : 'Skor Kecocokan Keseluruhan'}
          value={`${report.matchScore}%`}
          description={isPelajar ? 'Akurasi kecocokan jurusan' : 'Tingkat kesiapan profil'}
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label={isPelajar ? 'Area Penguatan Belajar' : 'Total Kesenjangan Skill'}
          value={`${report.skillGap}%`}
          description={isPelajar ? 'Materi yang perlu dieksplorasi' : 'Rata-rata defisit kompetensi'}
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label={isPelajar ? 'Pilihan Bidang Utama' : 'Target Bidang Industri'}
          value={report.primarySkill}
          description={isPelajar ? 'Jurusan & karier sasaran' : 'Profesi acuan standar'}
          tone="bg-indigo-50 text-indigo-700"
        />
      </section>

      {/* Category Pills */}
      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {category === 'All' ? 'Semua Kategori' : category}
          </button>
        ))}
      </div>

      {/* Main Analysis Grid */}
      <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left: Skill Comparison Chart */}
        <DashboardCard
          title="Perbandingan Penguasaan Skill"
          subtitle="Profil Anda (Biru) vs Standar Industri (Hijau)"
        >
          <SkillGapChart skills={filteredSkills} />
        </DashboardCard>

        {/* Right: Strengths & Priorities */}
        <div className="space-y-6">
          <DashboardCard
            title="Kekuatan Teridentifikasi"
            subtitle="Profil Keunggulan"
            badge={<span className="sg-badge-success">{report.strengths.length} Poin</span>}
          >
            <ul className="space-y-3 text-sm text-slate-700">
              {report.strengths.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    ✓
                  </span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard
            title="Prioritas Penutupan Gap"
            subtitle="Rencana Aksi"
            badge={<span className="sg-badge-danger">{report.gaps.length} Fokus</span>}
          >
            <ul className="space-y-3 text-sm text-slate-700">
              {report.gaps.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                    !
                  </span>
                  <span className="leading-snug font-medium text-slate-800">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/dashboard/roadmap"
                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                Mulai Kerjakan di Roadmap →
              </Link>
              <Link
                href="/dashboard/jobs"
                className="inline-flex w-full items-center justify-center rounded-xl bg-slate-50 border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                💼 Lihat Lowongan Kerja Relevan →
              </Link>
            </div>
          </DashboardCard>
        </div>
      </section>
    </main>
  );
}
