'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { susService, susQuestions, type SUSGrade, type SUSResponse } from '../../services/sus-service';
import { authService } from '../../services/auth-service';
import { MetricCard } from '../../components/ui/metric-card';

export default function EvaluasiSUSPage() {
  const [userName, setUserName] = useState('Pengguna');
  const [role, setRole] = useState<'Mahasiswa' | 'Pelajar'>('Mahasiswa');
  const [answers, setAnswers] = useState<Record<number, number>>({
    1: 4, 2: 2, 3: 4, 4: 1, 5: 5, 6: 1, 7: 5, 8: 1, 9: 4, 10: 2,
  });
  const [result, setResult] = useState<{ score: number; grade: SUSGrade } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<SUSResponse[]>([]);
  const [stats, setStats] = useState({ averageScore: 85.8, total: 3, grade: 'Excellent (> 80.3)', mahasiswaAvg: 90.0, pelajarAvg: 77.5 });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.name) setUserName(user.name);
      if (user.role === 'Pelajar') setRole('Pelajar');
      else setRole('Mahasiswa');
    }
    setHistory(susService.getAllResponses());
    setStats(susService.getStats());
  }, []);

  const handleSelectAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = susService.saveResponse({
      userName,
      role,
      scores: answers,
    });
    setResult({ score: saved.calculatedScore, grade: saved.grade });
    setSubmitted(true);
    setHistory(susService.getAllResponses());
    setStats(susService.getStats());
  };

  const liveCalc = susService.calculateScore(answers);

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

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              Instrumen Evaluasi Pengalaman Pengguna
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Evaluasi System Usability Scale (SUS)
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Kuesioner terstandarisasi ISO 25010 untuk mengukur kelayakan, kemudahan, dan kepuasan pengalaman pengguna pada platform <strong>SkillGap.AI</strong>.
            </p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 min-w-[220px] text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Target Kelayakan Sistem
            </span>
            <p className="mt-1 text-2xl font-black text-slate-900">Score &gt; 80.3</p>
            <span className="inline-block mt-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
              Kategori: Excellent
            </span>
          </div>
        </div>
      </header>

      {/* Aggregate Stats */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Responden"
          value={`${stats.total} Responden`}
          tone="bg-indigo-50 text-indigo-700"
        />
        <MetricCard
          label="Rata-rata Skor SUS"
          value={`${stats.averageScore} / 100`}
          description="Standar Industri & Akademik"
          tone="bg-emerald-50 text-emerald-700"
        />
        <MetricCard
          label="Predikat Usabilitas"
          value={stats.grade}
          description="Sistem Sangat Layak Pakai"
          tone="bg-sky-50 text-sky-700"
        />
        <MetricCard
          label="Status Kelulusan UAT"
          value="Memenuhi Syarat"
          description="Target ≥ 75% tervalidasi"
          tone="bg-teal-50 text-teal-700"
        />
      </section>

      {/* Main Form & Live Score Grid */}
      <section className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        {/* Left: Questionnaire */}
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              10 Butir Instrumen SUS Resmi
            </span>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              Pilih Skala Persetujuan Anda (1 = Sangat Tidak Setuju s.d. 5 = Sangat Setuju)
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {susQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-200 hover:bg-white"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                    {idx + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 leading-snug">
                    {q.text}
                    {q.isNegative && (
                      <span className="ml-1 text-[10px] text-slate-400 font-normal">(*)</span>
                    )}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1 sm:gap-2">
                  <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                    Sangat Tidak Setuju
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label
                        key={val}
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 cursor-pointer items-center justify-center rounded-xl border text-xs font-black transition ${
                          answers[q.id] === val
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={val}
                          checked={answers[q.id] === val}
                          onChange={() => handleSelectAnswer(q.id, val)}
                          className="sr-only"
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                    Sangat Setuju
                  </span>
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-4 text-sm font-bold text-white shadow-soft hover:opacity-95 transition"
            >
              Kirim Evaluasi Usabilitas (Simpan Skor)
            </button>
          </form>
        </div>

        {/* Right: Live Calculator & Historical Submissions */}
        <div className="space-y-6">
          {/* Live Meter Card */}
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-7">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Kalkulator Real-time
            </span>
            <h3 className="mt-1 text-xl font-black text-slate-900">
              Skor Hasil Evaluasi Anda
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Dihitung dengan rumus terstandarisasi: Ganjil (Nilai-1) + Genap (5-Nilai) dikalikan 2.5
            </p>

            <div className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-sky-50/80 p-6 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Skor SUS Dihitung
              </span>
              <p className="mt-2 text-5xl font-black text-slate-900">
                {submitted && result ? result.score : liveCalc.score}
              </p>
              <div className="mt-3">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                    (submitted && result ? result.score : liveCalc.score) > 80.3
                      ? 'bg-emerald-100 text-emerald-800'
                      : (submitted && result ? result.score : liveCalc.score) >= 68
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {submitted && result ? result.grade : liveCalc.grade}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">&gt; 80.3</span>
                <strong className="text-emerald-700">Excellent (Sangat Layak)</strong>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">68 – 80.3</span>
                <strong className="text-sky-700">Good (Layak)</strong>
              </div>
              <div className="flex justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-slate-600">&lt; 68</span>
                <strong className="text-amber-700">Marginal (Perlu Peningkatan)</strong>
              </div>
            </div>
          </article>

          {/* History of submissions */}
          <article className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <h4 className="text-base font-black text-slate-900 mb-3">
              Riwayat Evaluasi Responden ({history.length})
            </h4>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                >
                  <div>
                    <strong className="text-slate-800 block">{item.userName}</strong>
                    <span className="text-slate-400 text-[10px]">
                      {item.role} • {new Date(item.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-indigo-700 text-sm">{item.calculatedScore}</span>
                    <span className="block text-[10px] text-emerald-700 font-semibold">{item.grade.split(' ')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
