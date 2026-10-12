'use client';

import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { validationService } from '../../services/validation-service';
import { susService } from '../../services/sus-service';
import { assessmentService } from '../../services/assessment-service';
import { DashboardCard, MetricCard } from '../../components/ui';

type StudentAcademicMenteeReport = {
  id: string;
  name: string;
  nim: string;
  programStudi: string;
  targetRole: string;
  matchScore: number;
  skillGapPercentage: number;
  roadmapProgress: number;
  strengths: string[];
  priorityGaps: string[];
  certificationsTarget: string[];
  supervisionStatus: 'Memenuhi Standar' | 'Perlu Akselerasi' | 'Menunggu Review';
  lastEvaluationDate: string;
  lecturerNotes: string;
};

const initialMenteeReports: StudentAcademicMenteeReport[] = [
  {
    id: 'mhs-1',
    name: 'Nadia A.',
    nim: '21051204012',
    programStudi: 'Teknik Informatika (S1)',
    targetRole: 'Data Scientist',
    matchScore: 87,
    skillGapPercentage: 14,
    roadmapProgress: 35,
    strengths: ['Analisis Kuantitatif', 'Python (Pandas/NumPy)', 'Statistika Komputasi'],
    priorityGaps: ['SQL Query Tingkat Lanjut', 'Proyek End-to-End Riil'],
    certificationsTarget: ['Google Data Analytics', 'Microsoft PL-300'],
    supervisionStatus: 'Memenuhi Standar',
    lastEvaluationDate: '11 Oktober 2026',
    lecturerNotes: 'Progres belajar linear dengan target skripsi bertema machine learning. Disarankan menyelesaikan modul SQL sebelum semester 8.',
  },
  {
    id: 'mhs-2',
    name: 'Ayu Lestari',
    nim: '21051204045',
    programStudi: 'Sistem Informasi (S1)',
    targetRole: 'Business Intelligence Analyst',
    matchScore: 89,
    skillGapPercentage: 11,
    roadmapProgress: 55,
    strengths: ['Dashboard Storytelling', 'Power BI & DAX Dasar', 'SQL Querying'],
    priorityGaps: ['Data Modeling Skema Kompleks', 'ETL Pipeline Otomasi'],
    certificationsTarget: ['Microsoft Certified: Power BI Data Analyst'],
    supervisionStatus: 'Memenuhi Standar',
    lastEvaluationDate: '09 Oktober 2026',
    lecturerNotes: 'Proyek magang industri diakui sebagai konversi SKS. Portofolio visualisasi bisnis sudah sangat matang.',
  },
  {
    id: 'mhs-3',
    name: 'Nadya Sari',
    nim: '21051204088',
    programStudi: 'Teknik Informatika (S1)',
    targetRole: 'Frontend Web Developer',
    matchScore: 91,
    skillGapPercentage: 9,
    roadmapProgress: 75,
    strengths: ['Modern React & Next.js', 'TypeScript Clean Code', 'Tailwind Responsive'],
    priorityGaps: ['Jest & Cypress Unit Testing', 'Web Vitals Performance Polish'],
    certificationsTarget: ['Meta Front-End Developer Professional'],
    supervisionStatus: 'Memenuhi Standar',
    lastEvaluationDate: '07 Oktober 2026',
    lecturerNotes: 'Siap untuk jalur fast-track rekrutmen mitra industri. Memenuhi kualifikasi kelulusan tepat waktu.',
  },
  {
    id: 'mhs-4',
    name: 'Bagus Prakoso',
    nim: '21051204019',
    programStudi: 'Teknik Informatika (S1)',
    targetRole: 'Cyber Security Analyst',
    matchScore: 76,
    skillGapPercentage: 24,
    roadmapProgress: 15,
    strengths: ['Linux OS Fundamentals', 'Jaringan TCP/IP & Wireshark'],
    priorityGaps: ['Vulnerability Scanning Terapan', 'SIEM Tools (Splunk/ELK)', 'Incident Response'],
    certificationsTarget: ['CompTIA Security+', 'Google Cybersecurity'],
    supervisionStatus: 'Perlu Akselerasi',
    lastEvaluationDate: '04 Oktober 2026',
    lecturerNotes: 'Kesenjangan skill masih 24%. Dosen merekomendasikan fokus lab praktikum di platform TryHackMe sebelum mengambil tugas akhir keamanan jaringan.',
  },
];

export default function LecturerReportsPage() {
  const [reports, setReports] = useState<StudentAcademicMenteeReport[]>(initialMenteeReports);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const history = assessmentService.getHistory();
    const collegeAssessments = history.filter(
      (h) => h.role === 'Mahasiswa' || h.jenjang === 'Mahasiswa'
    );

    if (collegeAssessments.length > 0) {
      const dynamicReports: StudentAcademicMenteeReport[] = collegeAssessments.map((h, idx) => {
        const studentName = h.userName || (h.target ? `Mahasiswa (${h.target})` : `Mahasiswa Baru #${idx + 1}`);
        const nim = h.nim || `21051204${(100 + idx).toString().slice(-3)}`;
        const strengths = h.report?.strengths && h.report.strengths.length > 0
          ? h.report.strengths
          : ['Analisis kuantitatif', 'Algoritma dasar', 'Logika pemrograman'];
        const priorityGaps = h.report?.gaps && h.report.gaps.length > 0
          ? h.report.gaps
          : ['Syntax SQL JOIN & Window Functions', 'Portofolio dataset riil'];
        const certs = h.report?.certifications && h.report.certifications.length > 0
          ? h.report.certifications.map((c) => c.name)
          : ['Google Data Analytics', 'Microsoft PL-300'];

        const formattedDate = new Date(h.submittedAt).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        const progPct = typeof h.progressPercentage === 'number' ? h.progressPercentage : 30;

        return {
          id: h.id,
          name: studentName,
          nim,
          programStudi: h.programStudi || 'Teknik Informatika (S1)',
          targetRole: h.target || h.report?.primarySkill || 'Data Science',
          matchScore: h.matchScore,
          skillGapPercentage: h.skillGap,
          roadmapProgress: progPct,
          strengths,
          priorityGaps,
          certificationsTarget: certs,
          supervisionStatus: h.matchScore >= 80 ? ('Memenuhi Standar' as const) : ('Perlu Akselerasi' as const),
          lastEvaluationDate: formattedDate,
          lecturerNotes: h.roadmapStatus
            ? `Status belajar: ${h.roadmapStatus}. Target: ${h.target}.`
            : `Asesmen mandiri baru telah diselesaikan dengan target ${h.target}. Menunggu review validasi dosen pembimbing.`,
        };
      });

      const combined = [
        ...dynamicReports,
        ...initialMenteeReports.filter((init) => !dynamicReports.some((d) => d.id === init.id)),
      ];
      setReports(combined);
    }
  }, []);

  const susStats = useMemo(() => susService.getStats(), []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.nim.includes(searchQuery) ||
        r.targetRole.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'passed'
          ? r.supervisionStatus === 'Memenuhi Standar'
          : statusFilter === 'need_action'
          ? r.supervisionStatus === 'Perlu Akselerasi' || r.supervisionStatus === 'Menunggu Review'
          : true;
      return matchSearch && matchStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Nama Mahasiswa',
      'NIM',
      'Program Studi',
      'Target Karier Industri',
      'Skor Kesesuaian (%)',
      'Kesenjangan Skill (%)',
      'Progres Roadmap (%)',
      'Target Sertifikasi',
      'Status Pembimbingan',
      'Tanggal Evaluasi Terakhir',
      'Catatan Dosen Pembimbing',
    ];

    const rows = filteredReports.map((r) => [
      r.name,
      r.nim,
      r.programStudi,
      r.targetRole,
      r.matchScore,
      r.skillGapPercentage,
      r.roadmapProgress,
      r.certificationsTarget.join('; '),
      r.supervisionStatus,
      r.lastEvaluationDate,
      r.lecturerNotes,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan-bimbingan-akademik-dosen-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <Link
          href="/lecturer"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
        >
          ← Kembali ke Workspace Dosen
        </Link>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              Laporan Akademik & Karier Mahasiswa (Dosen Pembimbing)
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Laporan Bimbingan Kompetensi Mahasiswa
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Laporan khusus Dosen Pembimbing untuk mengukur kesiapan kompetensi industri, progres roadmap pembelajaran,
              capaian sertifikasi profesional, dan audit kelayakan lulusan mahasiswa bimbingan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 transition cursor-pointer"
            >
              📥 Unduh Rekap CSV Bimbingan
            </button>
          </div>
        </div>
      </header>

      {/* Metrics Khusus Mahasiswa & Dosen */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Mahasiswa Bimbingan"
          value={`${reports.length} Orang`}
          description="Terdaftar dalam bimbingan akademik"
          tone="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          label="Rata-rata Kesiapan Industri"
          value="85.7%"
          description="Match score target karier"
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Kesenjangan Skill Rata-rata"
          value="14.5%"
          description="Area gap kompetensi industri"
          tone="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label="Tingkat Usabilitas (SUS Mahasiswa)"
          value={`${susStats.mahasiswaAvg || 84.0} / 100`}
          description="Evaluasi kemudahan platform"
          tone="bg-teal-50 text-teal-700"
        />
      </section>

      {/* Detail Breakdown Mahasiswa */}
      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Distribusi Target Peran Industri */}
        <DashboardCard
          title="Distribusi Target Peran Industri"
          subtitle="Arah Karier Mahasiswa Bimbingan"
        >
          <div className="space-y-3 pt-2">
            {[
              { role: 'Data Science & Analytics', count: 2, pct: 50, color: 'bg-indigo-600' },
              { role: 'Software & Frontend Development', count: 1, pct: 25, color: 'bg-emerald-500' },
              { role: 'Cybersecurity & Systems', count: 1, pct: 25, color: 'bg-amber-500' },
            ].map((item) => (
              <div key={item.role}>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{item.role}</span>
                  <span>{item.count} mhs ({item.pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Audit Pencapaian Sertifikasi */}
        <DashboardCard
          title="Pencapaian Lisensi & Sertifikasi"
          subtitle="Standar Industri Global"
        >
          <div className="space-y-2.5 pt-1 text-xs">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3">
              <span className="font-bold text-indigo-900 block">Sertifikasi Data & Cloud</span>
              <p className="text-slate-600 mt-0.5">Google Data Analytics, Microsoft PL-300 Power BI (3 Mahasiswa aktif persiapan).</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
              <span className="font-bold text-emerald-900 block">Sertifikasi Software Development</span>
              <p className="text-slate-600 mt-0.5">Meta Front-End Developer, Dicoding Academy Web Fundamentals (1 Mahasiswa selesai).</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
              <span className="font-bold text-amber-900 block">Sertifikasi Keamanan Siber</span>
              <p className="text-slate-600 mt-0.5">CompTIA Security+ / Google Cybersecurity (1 Mahasiswa tahap persiapan lab).</p>
            </div>
          </div>
        </DashboardCard>

        {/* Sinkronisasi Kurikulum & Capaian Lulusan */}
        <DashboardCard
          title="Capaian Pembelajaran Lulusan (CPL)"
          subtitle="Keselarasan Mata Kuliah & Industri"
        >
          <div className="space-y-3 pt-1 text-xs">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
              <strong className="block text-emerald-800">✅ 75% Progres Roadmap Diatas Target</strong>
              <p className="mt-1 text-emerald-900 leading-relaxed">
                Mayoritas mahasiswa telah menyelesaikan tahapan fondasi dan proyek portofolio sebelum semester akhir.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600">
              <strong className="text-slate-800 block">Rekomendasi Tindak Lanjut Dosen</strong>
              Mendorong mahasiswa dengan gap &gt;20% untuk mengikuti program magang industri bersertifikat (MBKM) atau pelatihan lab mandiri.
            </div>
          </div>
        </DashboardCard>
      </section>

      {/* Tabel Laporan Mahasiswa Terstruktur */}
      <section className="mt-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">Rekapitulasi Kesiapan Mahasiswa Bimbingan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar capaian target karier, skill gap analitik, dan catatan pembimbingan akademik per mahasiswa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIM, target karier..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs focus:bg-white focus:outline-none focus:border-indigo-400"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="all">Semua Status</option>
              <option value="passed">Memenuhi Standar</option>
              <option value="need_action">Perlu Akselerasi</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Mahasiswa & NIM</th>
                <th className="pb-3">Target Industri</th>
                <th className="pb-3 text-center">Kecocokan</th>
                <th className="pb-3 text-center">Skill Gap</th>
                <th className="pb-3 text-center">Roadmap Selesai</th>
                <th className="pb-3">Status Pembimbingan</th>
                <th className="pb-3">Catatan Dosen Pembimbing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-4 pr-3">
                    <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">NIM {item.nim} • {item.programStudi}</p>
                  </td>
                  <td className="py-4 pr-3">
                    <p className="font-semibold text-indigo-700">{item.targetRole}</p>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Target: {item.certificationsTarget.join(', ')}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
                      {item.matchScore}%
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                      {item.skillGapPercentage}%
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className="font-bold text-indigo-600">{item.roadmapProgress}%</span>
                  </td>
                  <td className="py-4 pr-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        item.supervisionStatus === 'Memenuhi Standar'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.supervisionStatus}
                    </span>
                  </td>
                  <td className="py-4 max-w-xs text-slate-500 text-[11px] leading-relaxed">
                    {item.lecturerNotes}
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
