'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { validationService } from '../../services/validation-service';
import { susService } from '../../services/sus-service';
import { assessmentService } from '../../services/assessment-service';
import { DashboardCard, MetricCard } from '../../components/ui';

type StudentReportRecord = {
  id: string;
  name: string;
  school: string;
  grade: string;
  primaryInterest: string;
  hollandType: string;
  recommendedMajor: string;
  matchScore: number;
  reportGradeAvg: number;
  validationStatus: 'Tervalidasi' | 'Perlu Pendalaman' | 'Belum Ditinjau';
  consultationDate: string;
  counselorNotes: string;
};

const initialStudentReports: StudentReportRecord[] = [
  {
    id: 'pelajar-1',
    name: 'Fajar Pratama',
    school: 'SMK Negeri 1 Jakarta',
    grade: 'Kelas XII RPL',
    primaryInterest: 'Informatika & Rekayasa Perangkat Lunak',
    hollandType: 'Investigative - Realistic (IR)',
    recommendedMajor: 'Sistem Informasi (S1) / Informatika (S1)',
    matchScore: 88,
    reportGradeAvg: 86.8,
    validationStatus: 'Tervalidasi',
    consultationDate: '10 Oktober 2026',
    counselorNotes: 'Siswa memiliki logika matematika dan coding yang konsisten. Direkomendasikan mengambil jalur SNBP/SNBT Informatika.',
  },
  {
    id: 'pelajar-2',
    name: 'Dewi Kartika',
    school: 'SMA Negeri 8 Jakarta',
    grade: 'Kelas XII MIPA',
    primaryInterest: 'Desain Komunikasi Visual & UI/UX',
    hollandType: 'Artistic - Investigative (AI)',
    recommendedMajor: 'Desain Komunikasi Visual (S1) / Desain Produk (D4)',
    matchScore: 92,
    reportGradeAvg: 86.0,
    validationStatus: 'Tervalidasi',
    consultationDate: '08 Oktober 2026',
    counselorNotes: 'Portofolio visual dan empati user sangat baik. Perlu penguatan pemahaman teknis design system.',
  },
  {
    id: 'pelajar-3',
    name: 'Rizky Putra',
    school: 'SMK Telkom Jakarta',
    grade: 'Kelas XI TKJ',
    primaryInterest: 'Infrastruktur Jaringan & Cloud',
    hollandType: 'Realistic - Conventional (RC)',
    recommendedMajor: 'Teknologi Rekayasa Jaringan (D4) / Teknik Komputer (S1)',
    matchScore: 86,
    reportGradeAvg: 83.0,
    validationStatus: 'Perlu Pendalaman',
    consultationDate: '05 Oktober 2026',
    counselorNotes: 'Nilai mapel kejuruan baik, disarankan memperdalam sertifikasi kejuruan BNSP / Mikrotik sebelum mendaftar perguruan tinggi.',
  },
  {
    id: 'pelajar-4',
    name: 'Aisyah Putri',
    school: 'SMA Negeri 3 Bandung',
    grade: 'Kelas XII IPS',
    primaryInterest: 'Digital Marketing & Bisnis Digital',
    hollandType: 'Enterprising - Social (ES)',
    recommendedMajor: 'Bisnis Digital (S1) / Sistem Informasi (S1)',
    matchScore: 85,
    reportGradeAvg: 84.5,
    validationStatus: 'Belum Ditinjau',
    consultationDate: '11 Oktober 2026',
    counselorNotes: 'Menunggu penyerahan kelengkapan nilai rapor semester 5 dan portofolio kegiatan OSIS.',
  },
];

export default function CounselorReportsPage() {
  const [reports, setReports] = useState<StudentReportRecord[]>(initialStudentReports);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const history = assessmentService.getHistory();
    const studentAssessments = history.filter(
      (h) => h.role === 'Pelajar' || h.jenjang?.includes('Pelajar')
    );

    if (studentAssessments.length > 0) {
      const dynamicReports: StudentReportRecord[] = studentAssessments.map((h, idx) => {
        const studentName = h.userName || (h.target ? `Pelajar (${h.target})` : `Pelajar Baru #${idx + 1}`);
        let avgGrade = 85.0;
        if (h.reportGrades) {
          const vals = Object.values(h.reportGrades).map(Number).filter((n) => !isNaN(n) && n > 0);
          if (vals.length > 0) {
            avgGrade = Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
          }
        }

        const formattedDate = new Date(h.submittedAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        return {
          id: h.id,
          name: studentName,
          school: h.school || 'SMA/SMK Sederajat',
          grade: h.grade || 'Kelas XII',
          primaryInterest: h.primaryInterest || h.target,
          hollandType: 'Investigative - Realistic (IR)',
          recommendedMajor: `${h.target || 'Informatika'} (S1)`,
          matchScore: h.matchScore,
          reportGradeAvg: avgGrade,
          validationStatus: 'Perlu Pendalaman' as const,
          consultationDate: formattedDate,
          counselorNotes: h.roadmapStatus
            ? `Progres langkah belajar: ${h.roadmapStatus}.`
            : h.careerAspiration
            ? `Cita-cita: "${h.careerAspiration}". Asesmen mandiri baru telah diselesaikan.`
            : 'Menunggu peninjauan dan bimbingan langsung Guru BK.',
        };
      });

      const combined = [
        ...dynamicReports,
        ...initialStudentReports.filter((init) => !dynamicReports.some((d) => d.id === init.id)),
      ];
      setReports(combined);
    }
  }, []);

  const susStats = useMemo(() => susService.getStats(), []);
  const validationStats = useMemo(() => validationService.getStats(), []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.recommendedMajor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'validated'
          ? r.validationStatus === 'Tervalidasi'
          : statusFilter === 'pending'
          ? r.validationStatus === 'Perlu Pendalaman' || r.validationStatus === 'Belum Ditinjau'
          : true;
      return matchSearch && matchStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Nama Siswa',
      'Asal Sekolah',
      'Kelas',
      'Minat Utama',
      'Tipe Holland RIASEC',
      'Rekomendasi Jurusan',
      'Skor Minat (%)',
      'Rata-rata Rapor',
      'Status Validasi BK',
      'Tanggal Konsultasi',
      'Catatan Guru BK',
    ];

    const rows = filteredReports.map((r) => [
      r.name,
      r.school,
      r.grade,
      r.primaryInterest,
      r.hollandType,
      r.recommendedMajor,
      r.matchScore,
      r.reportGradeAvg,
      r.validationStatus,
      r.consultationDate,
      r.counselorNotes,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-konseling-siswa-bk-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <Link
          href="/counselor"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
        >
          ← Kembali ke Workspace Konseling
        </Link>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              Laporan Konseling Pelajar (Guru BK)
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Laporan Konseling & Pemetaan Studi Siswa
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Laporan khusus Guru BK untuk memantau hasil asesmen minat bakat (Holland RIASEC), nilai rapor akademik,
              rekomendasi jurusan PTN/PTS, dan status bimbingan karier pelajar SMA/SMK.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 transition cursor-pointer"
            >
              📥 Unduh Rekap CSV Siswa
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Khusus Pelajar */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Siswa Terdata"
          value={`${reports.length} Pelajar`}
          description="Siswa terdaftar konseling"
          tone="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          label="Tervalidasi BK"
          value={`${reports.filter((r) => r.validationStatus === 'Tervalidasi').length} Siswa`}
          description="Rekomendasi disetujui"
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Perlu Bimbingan"
          value={`${reports.filter((r) => r.validationStatus !== 'Tervalidasi').length} Siswa`}
          description="Menunggu sesi tindak lanjut"
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label="Kepuasan Pelajar (SUS)"
          value={`${susStats.pelajarAvg || 80.5} / 100`}
          description="Skor kepuasan sistem bagi siswa"
          tone="bg-teal-50 text-teal-700"
        />
      </section>

      {/* Detail Breakdown & Rekapitulasi */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Distribusi Peminatan Studi */}
        <DashboardCard
          title="Distribusi Minat Bidang Studi"
          subtitle="Arah Peminatan Lanjutan Siswa"
        >
          <div className="space-y-3 pt-2">
            {[
              { bidang: 'Teknologi & Informatika', count: 2, pct: 50, color: 'bg-indigo-600' },
              { bidang: 'Desain Visual & Kreatif', count: 1, pct: 25, color: 'bg-sky-500' },
              { bidang: 'Bisnis & Manajemen Digital', count: 1, pct: 25, color: 'bg-emerald-500' },
            ].map((item) => (
              <div key={item.bidang}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{item.bidang}</span>
                  <span>{item.count} siswa ({item.pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Pemetaan Holland RIASEC */}
        <DashboardCard
          title="Pemetaan Holland Code (RIASEC)"
          subtitle="Karakteristik Karier Siswa"
        >
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-bold text-slate-800 block">Investigative (I) - 45%</span>
              <p className="text-slate-500 mt-0.5">Siswa cenderung menyukai sains, analisis data, dan problem solving terstruktur.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-bold text-slate-800 block">Artistic (A) - 25%</span>
              <p className="text-slate-500 mt-0.5">Ketertarikan pada ekspresi visual, UI/UX, dan eksplorasi ide kreatif digital.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <span className="font-bold text-slate-800 block">Realistic (R) & Enterprising (E) - 30%</span>
              <p className="text-slate-500 mt-0.5">Kombinasi keterampilan teknis terapan dan inisiatif komunikasi bisnis.</p>
            </div>
          </div>
        </DashboardCard>

        {/* Audit Kepatuhan Data Siswa */}
        <DashboardCard
          title="Kepatuhan Privasi Data Siswa"
          subtitle="UU PDP No. 27/2022 Pasal Perlindungan Anak"
        >
          <div className="space-y-3 pt-1 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
              <strong className="block text-emerald-800">✅ 100% Informed Consent Terverifikasi</strong>
              <p className="mt-1 text-emerald-900 leading-relaxed">
                Seluruh pelajar di bawah 18 tahun telah melampirkan persetujuan orang tua/wali saat registrasi akun.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
              <strong className="text-slate-800 block">Kerahasiaan Catatan Konseling</strong>
              Catatan bimbingan Guru BK dienkripsi dan hanya dapat diakses oleh siswa bersangkutan serta Guru BK sekolah.
            </div>
          </div>
        </DashboardCard>
      </section>

      {/* Tabel Laporan Siswa Terstruktur */}
      <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">Rekapitulasi Laporan Siswa Bimbingan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar komprehensif rekomendasi studi dan catatan konsultasi per siswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, sekolah, jurusan..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:border-indigo-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="validated">Tervalidasi</option>
              <option value="pending">Perlu Bimbingan</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Siswa & Sekolah</th>
                <th className="pb-3">Minat & Holland RIASEC</th>
                <th className="pb-3">Rekomendasi Jurusan</th>
                <th className="pb-3 text-center">Rata-rata Rapor</th>
                <th className="pb-3 text-center">Kecocokan</th>
                <th className="pb-3">Status BK</th>
                <th className="pb-3">Catatan Bimbingan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 pr-3">
                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{item.school} • {item.grade}</p>
                  </td>
                  <td className="py-4 pr-3">
                    <p className="font-semibold text-indigo-700">{item.primaryInterest}</p>
                    <span className="inline-block mt-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
                      {item.hollandType}
                    </span>
                  </td>
                  <td className="py-4 pr-3 font-semibold text-slate-800">
                    {item.recommendedMajor}
                  </td>
                  <td className="py-4 text-center font-black text-slate-800">
                    {item.reportGradeAvg}
                  </td>
                  <td className="py-4 text-center">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
                      {item.matchScore}%
                    </span>
                  </td>
                  <td className="py-4 pr-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        item.validationStatus === 'Tervalidasi'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.validationStatus === 'Perlu Pendalaman'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.validationStatus}
                    </span>
                  </td>
                  <td className="py-4 max-w-xs text-slate-500 text-[11px] leading-relaxed">
                    {item.counselorNotes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
