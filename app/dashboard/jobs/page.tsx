'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  jobService,
  type MatchedJobVacancy,
  type JobCategory,
  type WorkplaceType,
  type JobType,
} from '../../services/job-service';
import { assessmentService, type AssessmentReport } from '../../services/assessment-service';
import { authService, type UserProfile } from '../../services/auth-service';
import { Toast, EmptyState } from '../../components/ui';

function JobsPageContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('id');

  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [cvName, setCvName] = useState('CV_Nadia_Amalia_DataAnalyst.pdf');
  const [jobs, setJobs] = useState<MatchedJobVacancy[]>([]);
  const [selectedJob, setSelectedJob] = useState<MatchedJobVacancy | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Active Tab: 'all' | 'recommended' | 'saved' | 'applications'
  const [activeTab, setActiveTab] = useState<'all' | 'recommended' | 'saved' | 'applications'>('all');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [workplaceFilter, setWorkplaceFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');

  // Quick Apply Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Initial Data
  const refreshJobs = (activeRep?: AssessmentReport) => {
    const matched = jobService.getMatchedJobs(activeRep ?? report ?? undefined);
    setJobs(matched);
    return matched;
  };

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setApplicantName(currentUser.name || 'Nadia A.');
      setApplicantEmail(currentUser.email || 'nadia@email.com');
    } else {
      setApplicantName('Nadia A.');
      setApplicantEmail('nadia@email.com');
    }

    try {
      const cv = localStorage.getItem('skillgap-cv');
      if (cv) {
        const parsed = JSON.parse(cv);
        if (parsed.name) setCvName(parsed.name);
      }
    } catch {
      // ignore
    }

    const activeReport = assessmentService.getActiveReport();
    setReport(activeReport);
    const loadedJobs = refreshJobs(activeReport);

    // If query string has id, pre-open drawer
    if (initialJobId) {
      const target = loadedJobs.find((j) => j.id === initialJobId);
      if (target) setSelectedJob(target);
    }
  }, [initialJobId]);

  // Handle Bookmark Toggle
  const handleToggleBookmark = (jobId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isSaved = jobService.toggleBookmark(jobId);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isBookmarked: isSaved } : j)),
    );
    if (selectedJob?.id === jobId) {
      setSelectedJob((prev) => (prev ? { ...prev, isBookmarked: isSaved } : null));
    }
    setToastMessage(isSaved ? 'Lowongan disimpan ke daftar favorit!' : 'Lowongan dihapus dari daftar simpan.');
  };

  // Handle Quick Apply Submit
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    setIsSubmitting(true);
    setTimeout(() => {
      jobService.applyJob({
        jobId: selectedJob.id,
        applicantName: applicantName || 'Nadia A.',
        email: applicantEmail || 'nadia@email.com',
        cvName,
        portfolioUrl,
        notes: coverNote,
      });

      refreshJobs();
      setSelectedJob((prev) =>
        prev
          ? {
              ...prev,
              hasApplied: true,
              applicationStatus: 'Lamaran Terkirim',
              appliedDate: new Date().toISOString(),
            }
          : null,
      );

      setIsSubmitting(false);
      setToastMessage(`Lamaran berhasil dikirimkan ke ${selectedJob.company}!`);
    }, 600);
  };

  // Filtered Job List
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Tab filter
      if (activeTab === 'recommended' && job.matchPercentage < 80) return false;
      if (activeTab === 'saved' && !job.isBookmarked) return false;
      if (activeTab === 'applications' && !job.hasApplied) return false;

      // Search query
      const matchSearch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchCategory = categoryFilter === 'all' || job.category === categoryFilter;

      // Workplace filter
      const matchWorkplace = workplaceFilter === 'all' || job.workplaceType === workplaceFilter;

      // Job type filter
      const matchJobType = jobTypeFilter === 'all' || job.type === jobTypeFilter;

      return matchSearch && matchCategory && matchWorkplace && matchJobType;
    });
  }, [jobs, activeTab, searchQuery, categoryFilter, workplaceFilter, jobTypeFilter]);

  const savedCount = useMemo(() => jobs.filter((j) => j.isBookmarked).length, [jobs]);
  const appliedCount = useMemo(() => jobs.filter((j) => j.hasApplied).length, [jobs]);
  const recommendedCount = useMemo(() => jobs.filter((j) => j.matchPercentage >= 80).length, [jobs]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
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
              Peluang Karier & Rekrutmen Cerdas
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Lowongan Kerja Cocok
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Koleksi lowongan kerja dan magang di perusahaan teknologi & industri terkemuka Indonesia yang dipadankan secara otomatis dengan hasil asesmen kompetensimu: <strong className="text-indigo-700 font-bold">{report?.primarySkill || 'Data Science'}</strong> ({report?.matchScore || 87}% Skor Kecocokan).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/roadmap"
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-xs"
            >
              Lanjutkan Roadmap Belajar →
            </Link>
            <Link
              href="/assessment"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95 transition"
            >
              Perbarui Hasil Asesmen
            </Link>
          </div>
        </div>
      </header>

      {/* Metric Quick Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Lowongan</span>
          <p className="mt-2 text-3xl font-black text-slate-900">{jobs.length} Posisi</p>
          <p className="mt-1 text-xs text-slate-500">Perusahaan terverifikasi</p>
        </div>
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/70 p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Rekomendasi AI Teratas</span>
          <p className="mt-2 text-3xl font-black text-emerald-950">{recommendedCount} Posisi</p>
          <p className="mt-1 text-xs text-emerald-700">Kecocokan &gt;= 80% dengan skillmu</p>
        </div>
        <div className="rounded-[24px] border border-amber-200 bg-amber-50/70 p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Lowongan Disimpan</span>
          <p className="mt-2 text-3xl font-black text-amber-950">{savedCount} Posisi</p>
          <p className="mt-1 text-xs text-amber-700">Tersimpan di daftar favorit</p>
        </div>
        <div className="rounded-[24px] border border-indigo-200 bg-indigo-50/70 p-5 shadow-soft">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">Lamaran Saya</span>
          <p className="mt-2 text-3xl font-black text-indigo-950">{appliedCount} Terkirim</p>
          <p className="mt-1 text-xs text-indigo-700">Status dipantau berkala</p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Lowongan ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recommended')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'recommended'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ✨ Rekomendasi AI ({recommendedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'saved'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ★ Disimpan ({savedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('applications')}
            className={`rounded-full px-4 py-2 text-xs font-bold transition ${
              activeTab === 'applications'
                ? 'bg-indigo-700 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            💼 Lamaran Saya ({appliedCount})
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Cari Posisi / Perusahaan / Skill
            </label>
            <input
              type="text"
              placeholder="Contoh: Data Analyst, Tokopedia, SQL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Bidang Keahlian
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua Bidang</option>
              <option value="Data Science">Data Science & Analytics</option>
              <option value="Web Development">Web & Software Engineering</option>
              <option value="UI/UX">UI/UX Design</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Product">Product Management</option>
              <option value="Marketing">Digital Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sistem Kerja
            </label>
            <select
              value={workplaceFilter}
              onChange={(e) => setWorkplaceFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua Sistem Kerja</option>
              <option value="Remote">Remote (Dari Mana Saja)</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tipe Pekerjaan
            </label>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua Tipe Pekerjaan</option>
              <option value="Fresh Graduate">Fresh Graduate</option>
              <option value="Magang / Internship">Magang / Internship</option>
              <option value="Penuh Waktu">Penuh Waktu</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main Job Cards Grid */}
      <section className="mt-6">
        {filteredJobs.length === 0 ? (
          <EmptyState
            title="Tidak Ada Lowongan yang Cocok"
            description="Coba ubah kata kunci pencarian atau sesuaikan filter untuk melihat lebih banyak kesempatan kerja."
            actionLabel="Reset Semua Filter"
            onAction={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setWorkplaceFilter('all');
              setJobTypeFilter('all');
              setActiveTab('all');
            }}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => {
              const isHighlyMatched = job.matchPercentage >= 85;
              const isGoodMatch = job.matchPercentage >= 75;

              return (
                <article
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`group relative flex flex-col justify-between cursor-pointer rounded-[28px] border bg-white p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
                    selectedJob?.id === job.id
                      ? 'border-indigo-500 ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {/* Top Card: Company Info + Bookmark Button */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black text-white shadow-soft ${job.companyColor}`}
                        >
                          {job.companyInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-slate-600 flex items-center gap-1">
                            {job.company}
                            <span className="text-sky-500 font-black text-[10px]" title="Perusahaan Terverifikasi">✓</span>
                          </p>
                          <h2 className="mt-0.5 text-base font-black text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                            {job.title}
                          </h2>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(job.id, e)}
                        className={`rounded-xl p-2 text-sm transition ${
                          job.isBookmarked
                            ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                        title={job.isBookmarked ? 'Hapus dari simpanan' : 'Simpan lowongan'}
                      >
                        {job.isBookmarked ? '★' : '☆'}
                      </button>
                    </div>

                    {/* Location, Type, Workplace Pills */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5">{job.location}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5">{job.workplaceType}</span>
                      <span className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5">{job.type}</span>
                      {job.urgentHiring && (
                        <span className="rounded-md bg-rose-50 text-rose-700 font-bold px-2 py-0.5">
                          Segera Dibutuhkan
                        </span>
                      )}
                    </div>

                    {/* Dynamic AI Match Score Badge */}
                    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700">Kecocokan Asesmen</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-black ${
                            isHighlyMatched
                              ? 'bg-emerald-100 text-emerald-800'
                              : isGoodMatch
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {job.matchPercentage}% Cocok
                        </span>
                      </div>

                      {/* Matched vs Gap Skills Badges */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {job.matchedSkills.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold"
                          >
                            ✓ {s}
                          </span>
                        ))}
                        {job.missingSkills.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold"
                          >
                            💡 {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Job Description Preview */}
                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  {/* Bottom Card: Salary, Date & Action CTA */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Estimasi Gaji
                      </p>
                      <p className="text-xs font-black text-slate-900 truncate">{job.salary}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.hasApplied ? (
                        <span className="rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold">
                          ✓ Dilamar
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedJob(job)}
                          className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-soft hover:opacity-95 transition"
                        >
                          Detail & Lamar
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Slide-over Drawer / Modal: Job Detail & Quick Apply Form */}
      {selectedJob && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs transition-opacity"
        >
          <div
            onClick={() => setSelectedJob(null)}
            className="flex-1"
            aria-hidden="true"
          />

          <aside className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black text-white shadow-soft ${selectedJob.companyColor}`}
                  >
                    {selectedJob.companyInitial}
                  </div>
                  <div>
                    <span className="inline-block text-xs font-bold text-slate-500">
                      {selectedJob.company} • {selectedJob.location}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 sm:text-2xl leading-snug">
                      {selectedJob.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleBookmark(selectedJob.id, e)}
                    className={`rounded-xl p-2.5 text-base transition ${
                      selectedJob.isBookmarked
                        ? 'bg-amber-50 text-amber-500 hover:bg-amber-100'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                    }`}
                    title={selectedJob.isBookmarked ? 'Hapus simpanan' : 'Simpan lowongan'}
                  >
                    {selectedJob.isBookmarked ? '★' : '☆'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    aria-label="Tutup detail lowongan"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Badges in Drawer Header */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg bg-indigo-50 font-bold text-indigo-700 px-2.5 py-1">
                  {selectedJob.type}
                </span>
                <span className="rounded-lg bg-slate-100 font-semibold text-slate-700 px-2.5 py-1">
                  {selectedJob.workplaceType}
                </span>
                <span className="rounded-lg bg-slate-100 font-semibold text-slate-700 px-2.5 py-1">
                  {selectedJob.experienceLevel}
                </span>
                <span className="rounded-lg bg-emerald-50 font-bold text-emerald-800 px-2.5 py-1">
                  Gaji: {selectedJob.salary}
                </span>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 p-6">
              {/* AI Assessment Match Card */}
              <div className="rounded-[28px] border border-indigo-100 bg-indigo-50/70 p-5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-700">
                    Analisis Kecocokan Hasil Asesmen AI
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">
                    {selectedJob.matchPercentage}% Cocok
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-700 font-medium">
                  {selectedJob.whyFit}
                </p>

                <div className="mt-3 pt-3 border-t border-indigo-100 grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-900 block mb-1">
                      Keahlian Kamu yang Sesuai:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.matchedSkills.map((s) => (
                        <span key={s} className="rounded-md bg-emerald-100 text-emerald-900 px-2 py-0.5 text-[10px] font-bold">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-900 block mb-1">
                      Keahlian yang Disarankan Ditingkatkan:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedJob.missingSkills.map((s) => (
                        <span key={s} className="rounded-md bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                          💡 {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[11px] text-indigo-900 font-semibold flex items-center justify-between">
                  <span>{selectedJob.roadmapAdvice}</span>
                  <Link href="/dashboard/roadmap" className="text-indigo-600 underline font-bold whitespace-nowrap ml-2">
                    Buka Roadmap →
                  </Link>
                </div>
              </div>

              {/* Job Overview */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Deskripsi Pekerjaan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {selectedJob.description}
                </p>
              </div>

              {/* Responsibilities */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Tanggung Jawab Utama
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {selectedJob.responsibilities.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Kualifikasi & Persyaratan
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-700">
                  {selectedJob.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Benefit & Fasilitas
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedJob.benefits.map((b) => (
                    <span
                      key={b}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      🎁 {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Application Form Section */}
              <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-slate-900">
                    {selectedJob.hasApplied ? 'Status Lamaran Anda' : 'Formulir Lamar Cepat (Quick Apply)'}
                  </h3>
                  <span className="text-xs font-bold text-indigo-600">
                    {selectedJob.company}
                  </span>
                </div>

                {selectedJob.hasApplied ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white font-bold">
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-bold text-emerald-950">
                          Lamaran Berhasil Diajukan
                        </p>
                        <p className="text-xs text-emerald-800">
                          Status: <strong>{selectedJob.applicationStatus || 'Lamaran Terkirim'}</strong> • Dokumen CV: {cvName}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-emerald-900">
                      Tim HR {selectedJob.company} akan mereview profil dan kesesuaian kompetensimu. Notifikasi jadwal interview akan dikirimkan ke email <strong>{applicantEmail}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          required
                          value={applicantName}
                          onChange={(e) => setApplicantName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Email Kontak
                        </label>
                        <input
                          type="email"
                          required
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Pre-attached CV from student profile */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">📄</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{cvName}</p>
                          <p className="text-[10px] text-slate-500">CV terlampir dari profil pengguna</p>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/profile"
                        className="text-[11px] font-bold text-indigo-600 hover:underline"
                      >
                        Ganti CV
                      </Link>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tautan Portofolio / GitHub / LinkedIn (Opsional)
                      </label>
                      <input
                        type="url"
                        placeholder="https://github.com/username atau https://linkedin.com/in/..."
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Pesan Singkat untuk HR (Opsional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ceritakan ketertarikanmu pada posisi ini atau ringkasan proyek relevan..."
                        value={coverNote}
                        onChange={(e) => setCoverNote(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 transition flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Mengirimkan Lamaran...' : `Kirim Lamaran ke ${selectedJob.company}`}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <p className="text-sm font-bold text-slate-500">Memuat katalog lowongan pekerjaan...</p>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
