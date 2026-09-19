'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import RecommendationValidation from '../components/recommendation-validation';
import { SearchFilter } from '../components/ui/search-filter';
import { MetricCard } from '../components/ui/metric-card';

type StudentMentee = {
  id: string;
  name: string;
  nim: string;
  target: string;
  matchScore: number;
  skillGap: number;
  roadmapStatus: string;
  roadmapProgress: number;
  strengths: string[];
  gaps: string[];
  certifications: string[];
  cvUrl?: string;
  needsReview: boolean;
};

const initialStudents: StudentMentee[] = [
  {
    id: '1',
    name: 'Nadia A.',
    nim: '21051204012',
    target: 'Data Scientist',
    matchScore: 87,
    skillGap: 14,
    roadmapStatus: 'Sedang Berjalan (Tahap 1)',
    roadmapProgress: 35,
    strengths: ['Analisis kuantitatif', 'Algoritma dasar', 'Logika pemrograman Python'],
    gaps: ['Syntax SQL JOIN & Window Functions', 'Portofolio dataset riil'],
    certifications: ['Google Data Analytics', 'Microsoft PL-300'],
    needsReview: true,
  },
  {
    id: 'stu-2',
    name: 'Ayu Lestari',
    nim: '21051204045',
    target: 'Business Intelligence Analyst',
    matchScore: 89,
    skillGap: 11,
    roadmapStatus: 'Sedang Berjalan (Tahap 2)',
    roadmapProgress: 55,
    strengths: ['Storytelling dashboard', 'Power BI', 'SQL Querying'],
    gaps: ['Data modeling DAX kompleks', 'ETL pipelines'],
    certifications: ['Microsoft PL-300 Power BI Data Analyst'],
    needsReview: false,
  },
  {
    id: 'stu-3',
    name: 'Nadya Sari',
    nim: '21051204088',
    target: 'Frontend Web Developer',
    matchScore: 91,
    skillGap: 9,
    roadmapStatus: 'Sedang Berjalan (Tahap 3)',
    roadmapProgress: 75,
    strengths: ['React modern', 'TypeScript', 'Tailwind CSS'],
    gaps: ['Next.js App Router Server Components', 'Jest unit testing'],
    certifications: ['Meta Front-End Developer'],
    needsReview: false,
  },
  {
    id: 'stu-4',
    name: 'Bagus Prakoso',
    nim: '21051204019',
    target: 'Cyber Security Analyst',
    matchScore: 76,
    skillGap: 24,
    roadmapStatus: 'Belum Dimulai',
    roadmapProgress: 0,
    strengths: ['Linux basics', 'Jaringan TCP/IP'],
    gaps: ['Vulnerability scanning', 'Incident response', 'Security compliance'],
    certifications: ['CompTIA Security+'],
    needsReview: true,
  },
];

export default function LecturerPage() {
  const [students] = useState<StudentMentee[]>(initialStudents);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentMentee | null>(initialStudents[0] ?? null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchQuery =
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.target.toLowerCase().includes(query.toLowerCase()) ||
        student.nim.includes(query);
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'review'
          ? student.needsReview
          : !student.needsReview;
      return matchQuery && matchStatus;
    });
  }, [students, query, statusFilter]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              Dosen Pembimbing Workspace
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Monitoring Mahasiswa Bimbingan
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Pantau target karier, match score, gap kompetensi, dan progres roadmap mahasiswa bimbingan akademik. Berikan validasi kelayakan jalur dan catatan pembimbingan.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-center min-w-[160px]">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Total Bimbingan
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">{students.length}</p>
          </div>
        </div>
      </header>

      {/* Quick Metrics */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Mahasiswa"
          value={`${students.length} Mahasiswa`}
          tone="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          label="Rata-rata Kecocokan"
          value="85.7%"
          description="Tingkat kesiapan profil"
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Perlu Validasi"
          value={`${students.filter((s) => s.needsReview).length} Mahasiswa`}
          description="Menunggu review dosen"
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label="Roadmap Aktif"
          value="75%"
          description="3 dari 4 aktif belajar"
          tone="bg-sky-50 text-sky-700"
        />
      </section>

      {/* Main Content: List & Details */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
        {/* Left: Student Directory */}
        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-slate-900 mb-3">Daftar Mahasiswa</h2>
            <SearchFilter
              searchQuery={query}
              onSearchChange={setQuery}
              searchPlaceholder="Cari nama, NIM, atau target..."
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterLabel="Filter status review"
              filterOptions={[
                { label: 'Semua Status', value: 'all' },
                { label: 'Perlu Review', value: 'review' },
                { label: 'Tervalidasi', value: 'validated' },
              ]}
            />
          </div>

          <div className="space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Tidak ada mahasiswa yang sesuai pencarian.
              </div>
            ) : (
              filteredStudents.map((stu) => {
                const isSelected = selectedStudent?.id === stu.id;
                return (
                  <div
                    key={stu.id}
                    onClick={() => setSelectedStudent(stu)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      isSelected
                        ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">{stu.name}</h3>
                          <span className="text-xs text-slate-400">NIM {stu.nim}</span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-indigo-600">
                          Target: {stu.target}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                          {stu.matchScore}% Cocok
                        </span>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                          {stu.skillGap}% Kesenjangan
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Status: <strong className="text-slate-700">{stu.roadmapStatus}</strong></span>
                      {stu.needsReview && (
                        <span className="sg-badge-warning text-[10px]">Perlu Validasi</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Comprehensive Student Detail & Validation Form */}
        <div>
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Detail Mahasiswa Card */}
              <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
                <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                      Detail Mahasiswa Bimbingan
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      NIM: {selectedStudent.nim} • Program Studi Informatika
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase tracking-wider">Target Karier</span>
                    <span className="text-base font-black text-indigo-700">{selectedStudent.target}</span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Skor Kecocokan</span>
                    <p className="mt-1 text-2xl font-black text-emerald-950">{selectedStudent.matchScore}%</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Kesenjangan Skill</span>
                    <p className="mt-1 text-2xl font-black text-amber-950">{selectedStudent.skillGap}%</p>
                  </div>
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-center col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Progres Roadmap</span>
                    <p className="mt-1 text-2xl font-black text-indigo-950">{selectedStudent.roadmapProgress}%</p>
                  </div>
                </div>

                {/* Strengths and Gaps */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Kekuatan (Strengths)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedStudent.strengths.map((s) => (
                        <li key={s} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Area Peningkatan (Gap)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {selectedStudent.gaps.map((g) => (
                        <li key={g} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">!</span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Roadmap and Certification */}
                <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-xs space-y-2">
                  <div>
                    <strong className="text-slate-800">Status Roadmap:</strong>{' '}
                    <span className="text-slate-600">{selectedStudent.roadmapStatus}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Rekomendasi Sertifikasi:</strong>{' '}
                    <span className="text-indigo-700 font-semibold">
                      {selectedStudent.certifications.join(', ')}
                    </span>
                  </div>
                </div>
              </article>

              {/* Validation Component */}
              <RecommendationValidation
                validatorRole="Dosen"
                validatorName="Dr. Hendra Wijaya, M.Kom"
                itemId={selectedStudent.id}
              />
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Pilih salah satu mahasiswa dari daftar di sebelah kiri untuk melihat detail dan memberikan validasi.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
