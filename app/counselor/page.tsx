'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import RecommendationValidation from '../components/recommendation-validation';
import { SearchFilter } from '../components/ui/search-filter';
import { MetricCard } from '../components/ui/metric-card';

type StudentCounselingMentee = {
  id: string;
  name: string;
  school: string;
  grade: string;
  primaryInterest: string;
  recommendedMajors: Array<{ title: string; match: number; jenjang: string }>;
  matchScore: number;
  explorationStatus: string;
  explorationPercentage: number;
  reportGrades: Record<string, number>;
  careerAspiration: string;
  needsReview: boolean;
};

const initialStudents: StudentCounselingMentee[] = [
  {
    id: '2',
    name: 'Fajar Pratama',
    school: 'SMK Negeri 1 Jakarta',
    grade: 'Kelas XII RPL',
    primaryInterest: 'Informatika & Rekayasa Perangkat Lunak',
    recommendedMajors: [
      { title: 'Sistem Informasi', match: 92, jenjang: 'Sarjana (S1)' },
      { title: 'Informatika', match: 88, jenjang: 'Sarjana (S1)' },
      { title: 'Teknologi Informasi', match: 84, jenjang: 'Sarjana Terapan (D4)' },
    ],
    matchScore: 88,
    explorationStatus: 'Aktif Eksplorasi (Tahap 2)',
    explorationPercentage: 50,
    reportGrades: { Matematika: 88, 'Bahasa Indonesia': 85, 'Bahasa Inggris': 82, Informatika: 92 },
    careerAspiration: 'Ingin menjadi Software Engineer atau Data Analyst di industri teknologi.',
    needsReview: true,
  },
  {
    id: 'pelajar-2',
    name: 'Dewi Kartika',
    school: 'SMA Negeri 8 Jakarta',
    grade: 'Kelas XII MIPA',
    primaryInterest: 'Desain Komunikasi Visual & UI/UX',
    recommendedMajors: [
      { title: 'Desain Komunikasi Visual', match: 94, jenjang: 'Sarjana (S1)' },
      { title: 'Sistem Informasi', match: 86, jenjang: 'Sarjana (S1)' },
      { title: 'Desain Produk Digital', match: 82, jenjang: 'Sarjana Terapan (D4)' },
    ],
    matchScore: 90,
    explorationStatus: 'Aktif Eksplorasi (Tahap 3)',
    explorationPercentage: 75,
    reportGrades: { Matematika: 80, 'Bahasa Indonesia': 90, 'Bahasa Inggris': 88, Informatika: 86 },
    careerAspiration: 'Product Designer atau UI/UX Researcher.',
    needsReview: false,
  },
  {
    id: 'pelajar-3',
    name: 'Rizky Putra',
    school: 'SMK Telkom Jakarta',
    grade: 'Kelas XI TKJ',
    primaryInterest: 'Infrastruktur Jaringan & Cloud',
    recommendedMajors: [
      { title: 'Teknik Telekomunikasi', match: 91, jenjang: 'Sarjana (S1)' },
      { title: 'Teknologi Rekayasa Jaringan', match: 89, jenjang: 'Sarjana Terapan (D4)' },
      { title: 'Teknik Komputer', match: 85, jenjang: 'Sarjana (S1)' },
    ],
    matchScore: 86,
    explorationStatus: 'Baru Mulai (Tahap 1)',
    explorationPercentage: 25,
    reportGrades: { Matematika: 84, 'Bahasa Indonesia': 80, 'Bahasa Inggris': 78, Informatika: 90 },
    careerAspiration: 'Cloud Engineer atau Network Security Specialist.',
    needsReview: true,
  },
];

export default function CounselorPage() {
  const [students] = useState<StudentCounselingMentee[]>(initialStudents);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentCounselingMentee | null>(initialStudents[0] ?? null);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchQuery =
        student.name.toLowerCase().includes(query.toLowerCase()) ||
        student.primaryInterest.toLowerCase().includes(query.toLowerCase()) ||
        student.school.toLowerCase().includes(query.toLowerCase());
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
              Guru Bimbingan Konseling (BK) Workspace
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Pendampingan Siswa SMA / SMK
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Fasilitasi konsultasi arah minat, pemetaan jurusan perguruan tinggi yang cocok, dan berikan validasi resmi bagi siswa yang merencanakan studi lanjut.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-center min-w-[160px]">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Siswa Bimbingan
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">{students.length}</p>
          </div>
        </div>
      </header>

      {/* Metrics */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Siswa"
          value={`${students.length} Pelajar`}
          tone="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          label="Rata-rata Kesesuaian"
          value="88.0%"
          description="Akurasi minat studi lanjut"
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Perlu Konsultasi"
          value={`${students.filter((s) => s.needsReview).length} Siswa`}
          description="Memerlukan validasi Guru BK"
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label="Siswa Aktif"
          value="100%"
          description="Semua telah mengisi minat"
          tone="bg-sky-50 text-sky-700"
        />
      </section>

      {/* Main Grid: Student List & Detail */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1.3fr]">
        {/* Left: Pelajar Directory */}
        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-lg font-black text-slate-900 mb-3">Daftar Pelajar</h2>
            <SearchFilter
              searchQuery={query}
              onSearchChange={setQuery}
              searchPlaceholder="Cari siswa, sekolah, atau minat..."
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterLabel="Filter status validasi"
              filterOptions={[
                { label: 'Semua Status', value: 'all' },
                { label: 'Perlu Validasi', value: 'review' },
                { label: 'Sudah Divalidasi', value: 'validated' },
              ]}
            />
          </div>

          <div className="space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Tidak ada data pelajar yang cocok.
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
                          <span className="text-xs text-slate-400">{stu.grade}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{stu.school}</p>
                        <p className="mt-2 text-xs font-bold text-indigo-600">
                          Minat Utama: {stu.primaryInterest}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                          {stu.matchScore}% Cocok
                        </span>
                        {stu.needsReview && (
                          <span className="sg-badge-warning text-[10px]">Perlu Validasi</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Status: <strong className="text-slate-700">{stu.explorationStatus}</strong></span>
                      <span className="text-indigo-600 font-bold">{stu.explorationPercentage}% progres</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Pelajar Detail & Validation Form */}
        <div>
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Detail Pelajar Card */}
              <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
                <div className="flex items-start justify-between border-b border-slate-100 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                      Detail Profil Pelajar
                    </span>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      {selectedStudent.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedStudent.school} • {selectedStudent.grade}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block uppercase tracking-wider">Kesesuaian</span>
                    <span className="text-2xl font-black text-emerald-700">{selectedStudent.matchScore}%</span>
                  </div>
                </div>

                {/* Minat Utama & Cita-Cita */}
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">
                      Minat Utama
                    </span>
                    <p className="mt-1 text-base font-black text-slate-900">
                      {selectedStudent.primaryInterest}
                    </p>
                    <p className="mt-2 text-xs text-slate-600 italic">
                      Cita-cita: &ldquo;{selectedStudent.careerAspiration}&rdquo;
                    </p>
                  </div>

                  {/* Nilai Rapor */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                      Rata-rata Nilai Rapor Terkini
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      {Object.entries(selectedStudent.reportGrades).map(([mapel, nilai]) => (
                        <div key={mapel} className="rounded-xl bg-white p-2 border border-slate-200">
                          <span className="text-slate-400 block text-[10px] truncate">{mapel}</span>
                          <strong className="text-sm text-slate-900 font-black">{nilai}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Jurusan yang Direkomendasikan */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
                      Jurusan yang Direkomendasikan Sistem
                    </span>
                    <div className="space-y-2">
                      {selectedStudent.recommendedMajors.map((jurusan, idx) => (
                        <div
                          key={jurusan.title}
                          className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <div>
                              <strong className="text-slate-900">{jurusan.title}</strong>
                              <span className="text-slate-400 text-[10px] ml-1.5">({jurusan.jenjang})</span>
                            </div>
                          </div>
                          <span className="font-black text-emerald-700">{jurusan.match}% Cocok</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Eksplorasi */}
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                    <span className="text-slate-500">Status Eksplorasi:</span>
                    <strong className="text-slate-800">{selectedStudent.explorationStatus}</strong>
                  </div>
                </div>
              </article>

              {/* Recommendation Validation Component */}
              <RecommendationValidation
                validatorRole="Guru BK"
                validatorName="Siti Rahmawati, S.Pd"
                itemId={selectedStudent.id}
              />
            </div>
          ) : (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Pilih salah satu pelajar dari daftar di sebelah kiri untuk melihat detail dan memberikan bimbingan.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
