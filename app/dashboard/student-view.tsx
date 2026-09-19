'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { AssessmentReport } from '../services/assessment-service';
import { validationService, type ValidationRecord } from '../services/validation-service';
import UserFeedbackModal from '../components/user-feedback-modal';

type StudentViewProps = {
  report: AssessmentReport;
  userName?: string;
};

export default function StudentView({ report, userName = 'Fajar Pratama' }: StudentViewProps) {
  const [validation, setValidation] = useState<ValidationRecord | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);

  useEffect(() => {
    // Check validation from Guru BK for this assessment
    const val = validationService.get('2');
    if (val) setValidation(val);
  }, []);

  const studyRecommendations = useMemo(
    () => [
      {
        rank: 1,
        title: 'Sistem Informasi',
        jenjang: 'Sarjana (S1)',
        match: Math.min(96, report.matchScore + 5),
        description:
          'Mempelajari teknologi komputer sekaligus penerapannya untuk bisnis, manajemen data, dan pembuatan aplikasi.',
        careerProspects: 'Business Analyst, Database Administrator, Product Specialist',
        whyFit: 'Cocok karena memadukan logika terstruktur dengan pemahaman kebutuhan pengguna.',
      },
      {
        rank: 2,
        title: 'Informatika / Ilmu Komputer',
        jenjang: 'Sarjana (S1)',
        match: report.matchScore,
        description:
          'Fokus mendalam pada pembuatan software, algoritma pemrograman, kecerdasan buatan (AI), dan logika komputasi.',
        careerProspects: 'Software Engineer, Data Scientist, Web Developer',
        whyFit: 'Linear dengan kemampuan analitis dan ketertarikan pada pemecahan masalah teknis.',
      },
      {
        rank: 3,
        title: 'Teknologi Informasi',
        jenjang: 'Sarjana Terapan (D4 / S1)',
        match: Math.max(78, report.matchScore - 4),
        description:
          'Fokus praktis pada jaringan komputer, keamanan siber, administrasi cloud, dan infrastruktur IT.',
        careerProspects: 'Network Specialist, Cloud Engineer, Cybersecurity Analyst',
        whyFit: 'Bagus untuk kamu yang suka merakit sistem digital dan mengamankan jaringan.',
      },
    ],
    [report.matchScore],
  );

  const interestPillars = useMemo(
    () => [
      { area: 'Logika & Data', score: 85, color: 'bg-indigo-500' },
      { area: 'Kreativitas & Desain', score: 78, color: 'bg-sky-500' },
      { area: 'Pemecahan Masalah', score: 90, color: 'bg-emerald-500' },
      { area: 'Teknologi Digital', score: 88, color: 'bg-violet-500' },
    ],
    [],
  );

  const completedPhases = report.roadmap.filter((p) => p.status === 'Completed').length;
  const totalPhases = report.roadmap.length || 4;
  const explorationPercentage = Math.round((completedPhases / totalPhases) * 100);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Student Welcome Header */}
        <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-2xl font-black text-white shadow-soft">
                🎓
              </div>
              <div>
                <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
                  Dashboard Pelajar SMA/SMK
                </span>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                  Halo, {userName}!
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Yuk temukan masa depanmu lewat minat, bakat, dan pilihan jurusan yang tepat.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setFeedbackOpen(true)}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-xs"
              >
                {feedbackDone ? '✓ Umpan Balik Terkirim' : 'Beri Umpan Balik Rekomendasi'}
              </button>
              <Link
                href="/assessment"
                className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95 transition"
              >
                Ulangi Tes Minat
              </Link>
              <Link
                href="/dashboard/roadmap"
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Langkah Belajar
              </Link>
            </div>
          </div>
        </header>

        {/* 3 Main Highlights */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">
          {/* Minat Utama */}
          <article className="rounded-[28px] bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-200">
              Minat Utama Kamu
            </p>
            <h2 className="mt-3 text-3xl font-black">{report.primarySkill}</h2>
            <p className="mt-2 text-xs leading-relaxed text-indigo-100">
              Bidang ini paling sesuai dengan jawaban kuesioner dan aktivitas yang kamu sukai.
            </p>
          </article>

          {/* Kesesuaian */}
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Kesesuaian Pilihan
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900">{report.matchScore}%</span>
              <span className="text-xs font-bold text-emerald-600">Tinggi</span>
            </div>
            <p className="mt-2 text-xs text-slate-500 leading-relaxed">
              Profil belajarmu sangat cocok untuk mendalami teknologi dan analisis digital.
            </p>
          </article>

          {/* Progress Eksplorasi */}
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Progres Persiapan
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-black text-indigo-600">
                {completedPhases} / {totalPhases}
              </span>
              <span className="text-xs font-bold text-slate-500">Tahap</span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${explorationPercentage}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {explorationPercentage}% langkah persiapan studi telah kamu lewati.
            </p>
          </article>
        </section>

        {/* Validasi Guru BK Status */}
        {validation && (
          <section className="mt-6 rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white font-bold">
                  ✓
                </span>
                <div>
                  <h3 className="font-bold text-emerald-950">
                    Catatan Bimbingan dari {validation.validatorRole}
                  </h3>
                  <p className="text-xs text-emerald-800">
                    Status: <strong>{validation.decision}</strong> • {validation.validatorName || 'Guru BK'}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                Tervalidasi Resmi
              </span>
            </div>
            {validation.note && (
              <p className="mt-3 rounded-xl bg-white/80 p-3 text-xs text-slate-700 italic border border-emerald-100">
                &ldquo;{validation.note}&rdquo;
              </p>
            )}
          </section>
        )}

        {/* Grid: Jurusan yang Cocok & Peta Minat */}
        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Jurusan yang Cocok */}
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Rekomendasi Studi Lanjut
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  Jurusan yang Cocok
                </h2>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                Top 3 Pilihan
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {studyRecommendations.map((jurusan) => (
                <div
                  key={jurusan.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 font-black text-white text-sm">
                        {jurusan.rank}
                      </span>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{jurusan.title}</h3>
                        <span className="text-xs font-semibold text-indigo-600">{jurusan.jenjang}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                      {jurusan.match}%
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                    {jurusan.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs flex flex-col gap-1 text-slate-500">
                    <span>
                      <strong>Peluang Karier:</strong> {jurusan.careerProspects}
                    </span>
                    <span className="text-indigo-600 font-medium">
                      💡 {jurusan.whyFit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Peta Minat & Jalur Karier Pelajar */}
          <div className="space-y-6">
            {/* Peta Minat */}
            <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Eksplorasi Karakter
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Peta Minat & Bakat
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Distribusi ketertarikanmu berdasarkan kuesioner dan aktivitas harian.
              </p>

              <div className="mt-5 space-y-3">
                {interestPillars.map((pillar) => (
                  <div key={pillar.area}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{pillar.area}</span>
                      <span>{pillar.score}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${pillar.color} transition-all duration-300`}
                        style={{ width: `${pillar.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            {/* Jalur Karier Masa Depan */}
            <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                    Prospek Kerja
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    Jalur Karier Masa Depan
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href="/dashboard/jobs"
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Eksplorasi Lowongan Industri →
                  </Link>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {report.jobOpenings.map((job) => (
                  <div
                    key={job.title}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3.5"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-slate-500">{job.fit}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                      {job.match}% Cocok
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* Sertifikasi Kejuruan & Langkah Selanjutnya */}
        <section className="mt-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                Sertifikasi Pendukung
              </p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">
                Sertifikasi Pemula / Kejuruan
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Sertifikat berskala internasional yang bisa kamu ambil sejak di bangku SMA/SMK.
              </p>
            </div>
            <Link
              href="/dashboard/certifications"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-slate-100"
            >
              Lihat Semua Sertifikasi
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {report.certifications.slice(0, 3).map((cert) => (
              <div
                key={cert.name}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{cert.name}</h4>
                  <p className="mt-1 text-xs font-semibold text-indigo-600">{cert.provider}</p>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-2">{cert.reason}</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-200 text-xs flex justify-between items-center">
                  <span className="text-emerald-700 font-bold">{cert.match ?? 90}% Relevan</span>
                  <span className="text-slate-400 text-[11px]">{cert.targetLevel || 'Pemula'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <UserFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title="Validasi Rekomendasi Jurusan & Karier"
        targetName={report.primarySkill || 'Pilihan Jurusan'}
        role="Pelajar"
        userName={userName}
        onSuccess={() => setFeedbackDone(true)}
      />
    </main>
  );
}
