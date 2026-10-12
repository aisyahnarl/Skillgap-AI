'use client';

import { useState, useMemo } from 'react';

// ─── Data Indikator Minat Bakat (berbasis penelitian) ───────────────────────

/**
 * Holland Code RIASEC (John Holland, 1959/1997)
 * Digunakan secara luas oleh BK/Counselor untuk menentukan arah studi dan karier.
 * Referensi: Holland, J. L. (1997). Making Vocational Choices. PAR.
 */
const hollandDescriptions: Record<string, { title: string; color: string; icon: string; description: string; itMatch: string[] }> = {
  R: {
    title: 'Realistic (Praktis)',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '🔧',
    description: 'Menyukai pekerjaan fisik, mekanik, dan teknis. Lebih suka hal yang nyata dan konkret.',
    itMatch: ['IoT/Embedded Systems', 'Cloud Infrastructure', 'Network Engineering', 'Hardware/Robotics'],
  },
  I: {
    title: 'Investigative (Analitis)',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🔬',
    description: 'Suka meneliti, menganalisis, dan memecahkan masalah. Berbasis logika dan sains.',
    itMatch: ['Data Science', 'Machine Learning/AI', 'Cybersecurity', 'Software Engineering'],
  },
  A: {
    title: 'Artistic (Kreatif)',
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    icon: '🎨',
    description: 'Suka ekspresi kreatif, inovasi, dan keindahan. Menghindari aturan kaku.',
    itMatch: ['UI/UX Design', 'Game Development', 'Front-End Development', 'Creative Coding'],
  },
  S: {
    title: 'Social (Sosial)',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🤝',
    description: 'Senang membantu, mengajar, dan berinteraksi. Peduli terhadap kebutuhan orang lain.',
    itMatch: ['IT Education/Training', 'Product Management', 'Technical Support', 'UX Research'],
  },
  E: {
    title: 'Enterprising (Kewirausahaan)',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '🚀',
    description: 'Suka memimpin, membujuk, dan mengelola. Berorientasi pada hasil bisnis.',
    itMatch: ['Startup/Founder', 'Product Management', 'Digital Marketing', 'Business Intelligence'],
  },
  C: {
    title: 'Conventional (Terstruktur)',
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: '📊',
    description: 'Suka pekerjaan terorganisir, sistematis, dan mengikuti prosedur yang jelas.',
    itMatch: ['Database Administration', 'QA/Testing', 'DevOps', 'Data Engineering', 'IT Governance'],
  },
};

/**
 * Kuesioner Holland Code RIASEC untuk menentukan tipe kepribadian karier
 * 2 pertanyaan per tipe = 12 pertanyaan total
 */
const hollandQuestions = [
  { id: 'R1', type: 'R', text: 'Saya suka bekerja dengan alat, mesin, atau perangkat teknologi secara langsung' },
  { id: 'I1', type: 'I', text: 'Saya senang meneliti, menganalisis data, dan memecahkan masalah yang kompleks' },
  { id: 'A1', type: 'A', text: 'Saya menyukai ekspresi kreatif melalui desain, seni visual, atau tulisan' },
  { id: 'S1', type: 'S', text: 'Saya senang membantu, mengajar, atau berinteraksi intensif dengan orang lain' },
  { id: 'E1', type: 'E', text: 'Saya suka memimpin tim, membuat keputusan, dan mengelola proyek besar' },
  { id: 'C1', type: 'C', text: 'Saya nyaman dengan pekerjaan yang terorganisir, mengikuti prosedur, dan berbasis data' },
  { id: 'R2', type: 'R', text: 'Saya lebih memilih kegiatan praktis yang hasilnya bisa langsung dilihat dan dirasakan' },
  { id: 'I2', type: 'I', text: 'Saya tertarik pada ilmu sains, matematika, logika, dan pemikiran sistematis' },
  { id: 'A2', type: 'A', text: 'Saya suka berinovasi, membuat sesuatu yang unik, dan tidak suka batasan yang kaku' },
  { id: 'S2', type: 'S', text: 'Saya peduli dengan masalah sosial dan ingin berkontribusi secara langsung' },
  { id: 'E2', type: 'E', text: 'Saya tertarik pada bisnis, kewirausahaan, negosiasi, dan pengambilan keputusan strategis' },
  { id: 'C2', type: 'C', text: 'Saya nyaman dengan angka, tabel, laporan, dan tugas-tugas yang terstruktur jelas' },
];

/**
 * Data rekomendasi jurusan berdasarkan kombinasi Holland Code
 * Sumber: Panduan BK Kemendikbud + riset penelusuran lulusan SMA/SMK
 */
const majorRecommendations: Record<string, {
  title: string;
  jenjang: string;
  university: string;
  hollandFit: string[];
  description: string;
  careerProspects: string;
  itRelevance: string;
  minRapor?: number;
}[]> = {
  IA: [
    {
      title: 'Teknik Informatika / Ilmu Komputer',
      jenjang: 'Sarjana (S1)',
      university: 'Universitas negeri dan swasta unggulan',
      hollandFit: ['I', 'A', 'R'],
      description: 'Fokus mendalam pada pembuatan software, algoritma, kecerdasan buatan, dan komputasi modern.',
      careerProspects: 'Software Engineer, AI/ML Engineer, Data Scientist, Web Developer',
      itRelevance: 'Sangat Tinggi — inti dari ekosistem industri IT',
      minRapor: 80,
    },
    {
      title: 'Sistem Informasi',
      jenjang: 'Sarjana (S1)',
      university: 'Universitas negeri dan swasta',
      hollandFit: ['I', 'C', 'E'],
      description: 'Menggabungkan teknologi komputer dengan manajemen bisnis dan sistem enterprise.',
      careerProspects: 'System Analyst, Business Intelligence, IT Consultant, Product Manager',
      itRelevance: 'Tinggi — jembatan antara bisnis dan teknologi',
      minRapor: 75,
    },
  ],
  IE: [
    {
      title: 'Sistem Informasi',
      jenjang: 'Sarjana (S1)',
      university: 'Universitas negeri dan swasta',
      hollandFit: ['I', 'E', 'C'],
      description: 'Kombinasi teknologi informasi dengan pemikiran bisnis dan manajerial.',
      careerProspects: 'Product Manager, IT Business Analyst, Startup Founder Tech',
      itRelevance: 'Tinggi — cocok untuk jalur product dan bisnis teknologi',
      minRapor: 75,
    },
    {
      title: 'Informatika',
      jenjang: 'Sarjana (S1)',
      university: 'Universitas negeri',
      hollandFit: ['I', 'R', 'E'],
      description: 'Ilmu komputer dengan pendekatan lebih luas mencakup aspek rekayasa dan inovasi.',
      careerProspects: 'Software Engineer, CTO Startup, Tech Lead',
      itRelevance: 'Sangat Tinggi',
      minRapor: 82,
    },
  ],
  AC: [
    {
      title: 'Desain Komunikasi Visual (DKV)',
      jenjang: 'Sarjana (S1)',
      university: 'ITS, ITB, Binus, FSRD',
      hollandFit: ['A', 'S', 'C'],
      description: 'Menggabungkan seni visual dengan komunikasi pesan yang efektif untuk media digital dan cetak.',
      careerProspects: 'UI/UX Designer, Graphic Designer, Brand Designer, Motion Designer',
      itRelevance: 'Menengah-Tinggi — sangat relevan untuk UI/UX di industri IT',
      minRapor: 75,
    },
    {
      title: 'Teknologi Informasi',
      jenjang: 'Sarjana Terapan (D4/S1)',
      university: 'Politeknik, universitas negeri',
      hollandFit: ['A', 'R', 'I'],
      description: 'Pendekatan praktis-terapan pada jaringan, keamanan, cloud, dan infrastruktur IT.',
      careerProspects: 'Network Engineer, Cloud Administrator, Cybersecurity Analyst',
      itRelevance: 'Tinggi — fokus pada infrastruktur dan keamanan IT',
      minRapor: 72,
    },
  ],
};

// Fungsi untuk mendapatkan top 2 Holland Code berdasarkan skor
function getTopHollandCodes(scores: Record<string, number>): string {
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top2 = sorted.slice(0, 2).map(([code]) => code).sort().join('');
  return top2;
}

// Mapping dari Holland Code ke rekomendasi default jika tidak ada exact match
function getRecommendations(hollandKey: string, reportMatchScore: number) {
  const key = Object.keys(majorRecommendations).find(k =>
    k.split('').every(c => hollandKey.includes(c))
  );

  if (key && majorRecommendations[key]) {
    return majorRecommendations[key];
  }

  // Default recommendations jika tidak ada match
  return [
    {
      title: 'Teknik Informatika',
      jenjang: 'Sarjana (S1)',
      university: 'Universitas negeri dan swasta',
      hollandFit: ['I', 'R'],
      description: 'Fokus pada pembuatan software dan algoritma untuk berbagai aplikasi teknologi.',
      careerProspects: 'Software Engineer, Web Developer, Data Analyst',
      itRelevance: 'Sangat Tinggi',
      minRapor: 78,
    },
    {
      title: 'Sistem Informasi',
      jenjang: 'Sarjana (S1)',
      university: 'Universitas negeri dan swasta',
      hollandFit: ['C', 'E'],
      description: 'Teknologi informasi yang dipadukan dengan manajemen dan bisnis.',
      careerProspects: 'Business Analyst, IT Consultant, Product Manager',
      itRelevance: 'Tinggi',
      minRapor: 75,
    },
  ];
}

type HollandAssessmentProps = {
  reportMatchScore: number;
  studentMajor?: string;
  gradeAverage?: number;
};

export default function HollandAssessment({ reportMatchScore, studentMajor, gradeAverage }: HollandAssessmentProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  const allAnswered = hollandQuestions.every(q => answers[q.id] !== undefined);

  const hollandScores = useMemo(() => {
    if (!showResult) return {};
    const scores: Record<string, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    hollandQuestions.forEach(q => {
      if (answers[q.id] !== undefined) {
        scores[q.type] = (scores[q.type] || 0) + (answers[q.id] || 0);
      }
    });
    return scores;
  }, [answers, showResult]);

  const topHollandKey = useMemo(() => getTopHollandCodes(hollandScores), [hollandScores]);

  const recommendations = useMemo(() => {
    if (!showResult) return [];
    return getRecommendations(topHollandKey, reportMatchScore);
  }, [topHollandKey, reportMatchScore, showResult]);

  const dominantType = useMemo(() => {
    if (!showResult || Object.keys(hollandScores).length === 0) return null;
    const sorted = Object.entries(hollandScores).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? null;
  }, [hollandScores, showResult]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = () => {
    if (allAnswered) setShowResult(true);
  };

  if (showResult) {
    return (
      <div className="space-y-6">
        {/* Tipe Dominan */}
        {dominantType && hollandDescriptions[dominantType] && (
          <div className={`rounded-[24px] border p-6 ${hollandDescriptions[dominantType].color}`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Tipe Holland Dominanmu</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-3xl">{hollandDescriptions[dominantType].icon}</span>
              <div>
                <h3 className="text-xl font-black">{hollandDescriptions[dominantType].title}</h3>
                <p className="mt-1 text-sm leading-relaxed">{hollandDescriptions[dominantType].description}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase">Cocok untuk bidang IT:</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {hollandDescriptions[dominantType].itMatch.map(item => (
                  <span key={item} className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">{item}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skor per Tipe */}
        <div className="rounded-[24px] border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">Profil RIASEC Kamu</p>
          <div className="mt-4 space-y-3">
            {Object.entries(hollandScores)
              .sort((a, b) => b[1] - a[1])
              .map(([type, score]) => {
                const desc = hollandDescriptions[type];
                const maxScore = 10; // 2 pertanyaan × skala 5
                const pct = Math.round((score / maxScore) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{desc?.icon} {desc?.title}</span>
                      <span className="font-bold text-slate-900">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Rekomendasi Jurusan */}
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Rekomendasi Jurusan</p>
          <p className="mt-1 text-xs text-slate-500">
            Berdasarkan profil Holland Code <strong>{topHollandKey}</strong>
            {gradeAverage ? ` dan rata-rata nilai rapor ${gradeAverage.toFixed(1)}` : ''}
          </p>
          <div className="mt-4 space-y-4">
            {recommendations.map((rec, idx) => (
              <div key={rec.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xs font-black text-white">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900">{rec.title}</h4>
                      <p className="text-xs text-indigo-600 font-semibold">{rec.jenjang}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {Math.min(98, reportMatchScore + (2 - idx) * 3)}% Cocok
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-600 leading-relaxed">{rec.description}</p>
                <div className="mt-3 grid gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <p><strong className="text-slate-700">Peluang Karier:</strong> {rec.careerProspects}</p>
                  <p><strong className="text-slate-700">Relevansi IT:</strong>{' '}
                    <span className="text-indigo-600 font-semibold">{rec.itRelevance}</span>
                  </p>
                  {rec.minRapor && (
                    <p><strong className="text-slate-700">Nilai Rapor Min.:</strong>{' '}
                      <span className={gradeAverage && gradeAverage >= rec.minRapor ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {rec.minRapor}{gradeAverage && gradeAverage >= rec.minRapor ? ' ✓ Kamu memenuhi syarat' : gradeAverage ? ` ⚠ Nilai kamu ${gradeAverage.toFixed(1)}` : ''}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setShowResult(false); setAnswers({}); }}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Ulangi Kuesioner
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-800">
        <p className="font-bold">📋 Kuesioner Minat Holland Code (RIASEC)</p>
        <p className="mt-1 leading-relaxed text-indigo-700">
          Berikan penilaian 1–5 untuk setiap pernyataan berikut.
          <span className="font-semibold"> 1 = Sangat Tidak Setuju, 5 = Sangat Setuju</span>
        </p>
      </div>

      <div className="space-y-3">
        {hollandQuestions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium text-slate-800">
              <span className="mr-2 text-xs font-bold text-indigo-500">{idx + 1}.</span>
              {q.text}
            </p>
            <div className="mt-3 flex items-center justify-between gap-1">
              <span className="text-[10px] text-slate-400">Tidak Setuju</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(val => (
                  <label key={val} className="flex flex-col items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name={q.id}
                      value={val}
                      checked={answers[q.id] === val}
                      onChange={() => handleAnswer(q.id, val)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-[10px] font-bold text-slate-500">{val}</span>
                  </label>
                ))}
              </div>
              <span className="text-[10px] text-slate-400">Setuju</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {Object.keys(answers).length} / {hollandQuestions.length} pertanyaan dijawab
        </span>
        <button
          type="button"
          disabled={!allAnswered}
          onClick={handleSubmit}
          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-bold text-white shadow-soft disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Lihat Hasil Kuesioner
        </button>
      </div>
    </div>
  );
}
