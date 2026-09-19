'use client';

import { useState } from 'react';
import { validationService, type UserFeedbackRecord } from '../services/validation-service';

type UserFeedbackModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  targetName: string;
  role: 'Mahasiswa' | 'Pelajar';
  userName?: string;
  onSuccess?: (feedback: UserFeedbackRecord) => void;
};

export default function UserFeedbackModal({
  isOpen,
  onClose,
  title,
  targetName,
  role,
  userName = 'Pengguna',
  onSuccess,
}: UserFeedbackModalProps) {
  const [relevance, setRelevance] = useState<'Sangat Relevan' | 'Cukup Relevan' | 'Kurang Relevan'>('Sangat Relevan');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = validationService.saveUserFeedback({
      userName,
      role,
      target: targetName,
      relevance,
      rating,
      comment,
    });
    setSubmitted(true);
    if (onSuccess) onSuccess(saved);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          aria-label="Tutup modal"
        >
          ✕
        </button>

        <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
          Umpan Balik Pengguna (FR-10)
        </span>
        <h2 className="mt-2 text-2xl font-black text-slate-900">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">
          Evaluasi rekomendasi untuk target: <strong className="text-indigo-600">{targetName}</strong>
        </p>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <span className="text-3xl">🎉</span>
            <h3 className="mt-2 text-lg font-black text-emerald-900">Umpan Balik Tersimpan!</h3>
            <p className="mt-1 text-xs text-emerald-700">
              Terima kasih, penilaianmu membantu menyempurnakan akurasi rekomendasi sistem SkillGap.AI.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Tingkat Relevansi Rekomendasi
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Sangat Relevan', label: 'Sangat Relevan', desc: '≥ 85%' },
                  { value: 'Cukup Relevan', label: 'Cukup Relevan', desc: '75–84%' },
                  { value: 'Kurang Relevan', label: 'Kurang Relevan', desc: '< 75%' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRelevance(item.value as any)}
                    className={`rounded-xl border p-2.5 text-center transition ${
                      relevance === item.value
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs">{item.label}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Skor Kepuasan (Rating)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition hover:scale-110 ${
                      star <= rating ? 'text-amber-400' : 'text-slate-200'
                    }`}
                    aria-label={`Beri rating ${star} bintang`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-600">
                  {rating} dari 5 Bintang
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="feedback-comment" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Komentar & Catatan Tambahan (Opsional)
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-300 focus:outline-none"
                placeholder="Ceritakan apakah materi/tahap rekomendasi sudah sesuai dengan kebutuhan belajarmu..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95 transition"
              >
                Kirim Umpan Balik
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
