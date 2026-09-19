'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import StudentView from './student-view';
import {
  assessmentService,
  defaultStudentReport,
  type AssessmentReport,
  type AssessmentHistoryItem,
} from '../services/assessment-service';
import { roadmapService } from '../services/roadmap-service';
import { authService, type UserProfile } from '../services/auth-service';
import { certificationService } from '../services/certification-service';
import { jobService } from '../services/job-service';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>({
    name: 'Nadia A.',
    role: 'Mahasiswa',
    email: 'nadia@email.com',
    jenjang: 'Mahasiswa',
  });
  const [cvName, setCvName] = useState('Belum ada CV');
  const [assessmentLabel, setAssessmentLabel] = useState('Assessment belum dibuat');
  const [report, setReport] = useState<AssessmentReport>(defaultStudentReport);
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState(25);

  useEffect(() => {
    // 1. Load User
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // 2. Load Assessment Report (Single source of truth)
    const activeReport = assessmentService.getActiveReport();
    setReport(activeReport);
    setAssessmentLabel(`Assessment: ${activeReport.primarySkill}`);

    // 3. Load CV
    try {
      const cv = localStorage.getItem('skillgap-cv');
      if (cv) {
        const parsed = JSON.parse(cv);
        if (parsed.name) setCvName(parsed.name);
      }
    } catch {
      // ignore
    }

    // 4. Load History
    const historyItems = assessmentService.getHistory();
    setHistory(historyItems);

    // 5. Load Roadmap Progress
    const phases = roadmapService.get();
    const progress = roadmapService.calculateOverallProgress(phases);
    setRoadmapProgress(progress);
  }, []);

  const metrics = useMemo(
    () => [
      { label: 'Skor Kecocokan', value: `${report.matchScore}%`, tone: 'bg-indigo-50 text-indigo-700' },
      { label: 'Kesenjangan Skill', value: `${report.skillGap}%`, tone: 'bg-amber-50 text-amber-700' },
      { label: 'Roadmap Belajar', value: `${roadmapProgress}% selesai`, tone: 'bg-emerald-50 text-emerald-700' },
      { label: 'Sertifikasi', value: `${report.certifications.length} item`, tone: 'bg-sky-50 text-sky-700' },
    ],
    [report, roadmapProgress],
  );

  const matchedJobs = useMemo(() => {
    return jobService.getMatchedJobs(report);
  }, [report]);

  const roleWorkspace = useMemo(() => {
    if (user.role === 'Pelajar') {
      return {
        title: 'Jalur studi dan karier pelajar',
        description: 'Gunakan peta minat, nilai, dan cita-cita untuk memilih jurusan atau sertifikasi kejuruan.',
        action: 'Buat assessment pelajar',
      };
    }
    if (user.role === 'Dosen') {
      return {
        title: 'Pendampingan mahasiswa',
        description: 'Pantau kebutuhan kompetensi mahasiswa dan siapkan arahan pengembangan berbasis data.',
        action: 'Lihat data assessment',
      };
    }
    if (user.role === 'Guru BK') {
      return {
        title: 'Pendampingan siswa',
        description: 'Gunakan hasil pemetaan minat dan skill gap sebagai bahan konsultasi studi lanjut siswa.',
        action: 'Lihat data siswa',
      };
    }
    return {
      title: 'Pengembangan karier mahasiswa',
      description: 'Ukur kesiapan skill terhadap target industri dan susun roadmap belajar yang terarah.',
      action: 'Buat assessment baru',
    };
  }, [user.role]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  // Pelajar uses dedicated student dashboard (#18)
  if (user.role === 'Pelajar') {
    return <StudentView report={report} userName={user.name} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Original Header with Unsplash Avatar & Greeting */}
        <header className="mb-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80"
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
                  Dashboard Pengguna • Halo, {user.name}!
                </p>
                <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
                <p className="text-sm text-slate-500">
                  {user.role} • Target Karier: <strong className="text-indigo-600 font-bold">{report.primarySkill}</strong> • {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/assessment"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:opacity-95 transition"
              >
                Asesmen Ulang
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Keluar
              </button>
            </div>
          </div>
        </header>

        {/* 4 Required Action CTAs */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <Link
            href="/assessment"
            className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95 transition"
          >
            Ulangi Asesmen
          </Link>
          <Link
            href="/dashboard/skill-gap"
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-soft hover:bg-slate-50 transition"
          >
            Lihat Kesenjangan Skill
          </Link>
          <Link
            href="/dashboard/roadmap"
            className="rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
          >
            Lanjutkan Roadmap
          </Link>
          <Link
            href="/dashboard/certifications"
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-soft hover:bg-slate-50 transition"
          >
            Eksplorasi Sertifikasi
          </Link>
          <Link
            href="/dashboard/jobs"
            className="rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
          >
            💼 Cari Lowongan Kerja
          </Link>
        </div>

        {/* Original Ruang Kerja Section */}
        <section className="mb-8 rounded-[28px] border border-indigo-100 bg-indigo-50/70 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Ruang kerja {user.role}</p>
          <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900">{roleWorkspace.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">{roleWorkspace.description}</p>
            </div>
            <Link
              href={user.role === 'Mahasiswa' ? '/assessment' : '/list'}
              className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50 transition"
            >
              {roleWorkspace.action}
            </Link>
          </div>
        </section>

        {/* 4 Original Metrics Grid */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((item) => (
            <article key={item.label} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
              <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.tone}`}>{item.label}</div>
              <p className="mt-4 text-3xl font-black text-slate-900">{item.value}</p>
            </article>
          ))}
        </section>

        {/* Original Section: Peta Minat & Skill Gap + Aside */}
        <section id="skill-gap" className="mt-8 grid scroll-mt-6 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Peta minat & kesenjangan skill</h2>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Prioritas utama</p>
                <p className="mt-3 text-xl font-black text-slate-900">{report.primarySkill}</p>
                <p className="mt-2 text-sm text-slate-600">Kecocokan profil terhadap target karier saat ini sekitar {report.matchScore}%.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Kesenjangan skill</p>
                <p className="mt-3 text-xl font-black text-slate-900">{report.skillGap}%</p>
                <p className="mt-2 text-sm text-slate-600">Area yang perlu ditingkatkan agar siap masuk jalur karier target.</p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">Kekuatan Utama</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {report.strengths.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-600">Gap yang perlu ditutup</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {report.gaps.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>

          <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Rekomendasi</p>
            <h3 className="mt-3 text-2xl font-black text-slate-900">{report.primarySkill}</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {report.gaps.slice(0, 3).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>

            {/* Assessment History Snippet */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Riwayat Asesmen Terakhir
                </span>
                <Link href="/dashboard/history" className="text-xs font-bold text-indigo-600 hover:underline">
                  Lihat Semua →
                </Link>
              </div>
              <div className="space-y-2">
                {history.slice(0, 2).map((h) => (
                  <Link
                    key={h.id}
                    href="/dashboard/history"
                    className="block rounded-xl bg-slate-50 p-2.5 text-xs hover:bg-indigo-50 transition border border-slate-100"
                  >
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{h.target}</span>
                      <span className="text-emerald-600">{h.matchScore}% Cocok</span>
                    </div>
                    <p className="text-slate-400 mt-0.5">
                      {new Date(h.submittedAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* Original Section: Current vs Required Bar Meters */}
        <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Analisis kesenjangan skill</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Keahlian Saat Ini vs Kebutuhan Industri</h2>
            </div>
            <Link href="/dashboard/skill-gap" className="text-sm font-semibold text-indigo-600 hover:underline">
              Lihat detail
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {report.skillAnalysis.map((item) => {
              const statusLabel =
                item.status === 'Strong' ? 'Kuat / Siap' : item.status === 'Gap' ? 'Perlu Ditingkatkan' : 'Cukup';
              return (
                <article key={item.skill} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">{item.skill}</h3>
                    <span className={item.status === 'Strong' ? 'sg-badge-success' : item.status === 'Gap' ? 'sg-badge-danger' : 'sg-badge-warning'}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <div className="flex justify-between">
                      <span>Saat Ini {item.current}%</span>
                      <span>Kebutuhan Industri {item.required}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.current}%` }} />
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.required}%` }} />
                    </div>
                    <p className="pt-1 font-semibold text-slate-700">Kesenjangan {item.gap}%</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Original Section: Generate Learning Roadmap */}
        <section id="roadmap" className="mt-8 scroll-mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Roadmap pembelajaran terstruktur</h2>
              <p className="text-xs text-slate-500 mt-1">Progres roadmap: {roadmapProgress}% selesai</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-bold text-sky-700">Terpersonalisasi</span>
              <Link href="/dashboard/roadmap" className="text-xs font-bold text-indigo-600 hover:underline">
                Buka Roadmap Interaktif →
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {report.roadmap.map((step) => {
              const statusDisplay =
                step.status === 'Completed'
                  ? 'Selesai'
                  : step.status === 'In Progress'
                  ? 'Sedang Berjalan'
                  : 'Belum Dimulai';

              return (
                <div key={step.phase} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">{step.phase}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                      {statusDisplay}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-black text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.goal}</p>
                  <p className="mt-3 text-xs font-semibold text-emerald-700">{step.duration}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Original Section: CV & assessment + Rekomendasi Sertifikasi */}
        <section id="profile" className="mt-8 grid scroll-mt-6 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article id="certifications" className="scroll-mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-2xl font-black text-slate-900">Dokumen & asesmen</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Dokumen CV / Portofolio</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{cvName}</p>
              </div>
              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Hasil Asesmen</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">{assessmentLabel}</p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900">Rekomendasi lisensi & sertifikasi</h2>
              <Link href="/dashboard/certifications" className="text-sm font-semibold text-indigo-600 hover:underline">
                Lihat semua
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {report.certifications.map((item) => {
                const catalogMatch = certificationService.getAll().find((c) => c.name.toLowerCase().includes(item.name.toLowerCase()) || item.name.toLowerCase().includes(c.name.toLowerCase()));
                const img = item.imageUrl || catalogMatch?.imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80';
                return (
                  <div key={item.name} className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                    <img
                      src={img}
                      alt={item.name}
                      className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-black text-slate-900 truncate">{item.name}</h3>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          {item.match ?? 0}% cocok
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-1">{item.reason}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        {/* Rekomendasi Lowongan Kerja Cocok (Sesuai Asesmen AI) */}
        <section id="jobs" className="mt-8 scroll-mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                  Rekomendasi Karier AI
                </span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Terpadan Otomatis
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Lowongan Kerja yang Cocok dengan Profil Asesmenmu
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-2xl">
                Berdasarkan target <strong className="text-slate-800 font-bold">{report.primarySkill}</strong> dan keahlian yang telah kamu kuasai, berikut posisi industri yang paling relevan untukmu saat ini.
              </p>
            </div>
            <Link
              href="/dashboard/jobs"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition whitespace-nowrap shadow-2xs"
            >
              Lihat Semua Lowongan ({matchedJobs.length} Posisi) →
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {matchedJobs.slice(0, 3).map((job) => (
              <article
                key={job.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4.5 transition hover:border-indigo-300 hover:bg-white shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white shadow-soft ${job.companyColor}`}>
                        {job.companyInitial}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold text-slate-500">{job.company}</p>
                        <h3 className="truncate text-sm font-black text-slate-900">{job.title}</h3>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {job.matchPercentage}% Cocok
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1 text-[10px]">
                    <span className="rounded-md bg-slate-200/70 px-2 py-0.5 font-semibold text-slate-700">{job.location}</span>
                    <span className="rounded-md bg-slate-200/70 px-2 py-0.5 font-semibold text-slate-700">{job.workplaceType}</span>
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 font-bold text-indigo-800">{job.type}</span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.matchedSkills.slice(0, 2).map((s) => (
                      <span key={s} className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold">
                        ✓ {s}
                      </span>
                    ))}
                    {job.missingSkills.slice(0, 1).map((s) => (
                      <span key={s} className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold">
                        💡 {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900">{job.salary}</span>
                  <Link
                    href={`/dashboard/jobs?id=${job.id}`}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-soft hover:opacity-95 transition"
                  >
                    Lamar Cepat →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
