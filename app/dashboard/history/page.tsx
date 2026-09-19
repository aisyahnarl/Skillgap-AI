'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  assessmentService,
  type AssessmentHistoryItem,
} from '../../services/assessment-service';
import { Toast, EmptyState } from '../../components/ui';

export default function AssessmentHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<AssessmentHistoryItem[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<AssessmentHistoryItem | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const items = assessmentService.getHistory();
    setHistory(items);
  }, []);

  const handleActivateSnapshot = (id: string) => {
    assessmentService.activateSnapshot(id);
    setToastMessage('Snapshot berhasil diaktifkan ke dashboard!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 800);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

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
              Riwayat Evaluasi
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Riwayat Asesmen
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl">
              Setiap penilaian disimpan permanen sebagai snapshot terpisah tanpa saling menimpa. Kamu dapat membuka kembali atau mengaktifkan hasil terdahulu kapan saja.
            </p>
          </div>

          <Link
            href="/assessment"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 transition whitespace-nowrap text-center"
          >
            + Asesmen Baru
          </Link>
        </div>
      </header>

      {/* History Items List */}
      <section className="mt-6 space-y-4">
        {history.length === 0 ? (
          <EmptyState
            title="Belum Ada Riwayat Asesmen"
            description="Yuk mulai asesmen pertamamu untuk mendapatkan peta kesenjangan skill dan rekomendasi personal."
            actionLabel="Mulai Asesmen Sekarang"
            actionHref="/assessment"
          />
        ) : (
          history.map((item) => {
            const formattedDate = new Date(item.submittedAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return (
              <article
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft transition hover:border-indigo-200"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                      {formattedDate}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.role || 'Mahasiswa'}
                    </span>
                  </div>
                  <h2 className="mt-1.5 text-2xl font-black text-slate-900">
                    {item.target}
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-800">
                    {item.matchScore}% Cocok
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-800">
                    {item.skillGap}% Kesenjangan
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSnapshot(item)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Buka Detail
                  </button>
                  <button
                    type="button"
                    onClick={() => handleActivateSnapshot(item.id)}
                    className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    Jadikan Aktif
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Snapshot Detail Modal */}
      {selectedSnapshot && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <header className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Snapshot Penilaian
                </span>
                <h3 className="mt-1 text-2xl font-black text-slate-900">
                  {selectedSnapshot.target}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Disimpan pada{' '}
                  {new Date(selectedSnapshot.submittedAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-y-auto py-4 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                    Skor Kecocokan
                  </p>
                  <p className="mt-1 text-3xl font-black text-emerald-950">
                    {selectedSnapshot.matchScore}%
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">
                    Kesenjangan Skill
                  </p>
                  <p className="mt-1 text-3xl font-black text-amber-950">
                    {selectedSnapshot.skillGap}%
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Kekuatan Utama:</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedSnapshot.report.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Prioritas Peningkatan:</h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {selectedSnapshot.report.gaps.map((g) => (
                    <li key={g} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Roadmap Terkait:</h4>
                <div className="space-y-2">
                  {selectedSnapshot.report.roadmap.map((phase) => (
                    <div
                      key={phase.phase}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"
                    >
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>
                          {phase.phase}: {phase.title}
                        </span>
                        <span className="text-indigo-600">{phase.duration}</span>
                      </div>
                      <p className="text-slate-500 mt-1">{phase.goal}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <footer className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleActivateSnapshot(selectedSnapshot.id)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-soft"
              >
                Jadikan Analisis Aktif di Dashboard
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
