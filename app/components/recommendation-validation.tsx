'use client';

import { useEffect, useState } from 'react';
import { validationService, type ValidationDecision, type ValidationRecord } from '../services/validation-service';

type Props = {
  validatorRole: 'Dosen' | 'Guru BK';
  itemId: string;
  validatorName?: string;
  onValidated?: (record: ValidationRecord) => void;
};

export default function RecommendationValidation({
  validatorRole,
  itemId,
  validatorName,
  onValidated,
}: Props) {
  const [decision, setDecision] = useState<ValidationDecision>('Relevan');
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [record, setRecord] = useState<ValidationRecord | null>(null);

  useEffect(() => {
    const existing = validationService.get(itemId);
    if (existing) {
      setRecord(existing);
      setDecision(existing.decision);
      setNote(existing.note);
      setIsEditing(false);
    } else {
      setRecord(null);
      setIsEditing(true);
    }
  }, [itemId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = validationService.save(itemId, {
      decision,
      note,
      validatorRole,
      validatorName,
    });
    setRecord(saved);
    setIsEditing(false);
    if (onValidated) onValidated(saved);
  };

  if (record && !isEditing) {
    const isRelevant = record.decision === 'Relevan';
    return (
      <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
            Hasil Validasi Rekomendasi
          </span>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline"
          >
            Ubah Validasi
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <span className="text-slate-500 font-medium">Divalidasi oleh:</span>
            <span className="font-black text-slate-800">
              {record.validatorName ? `${record.validatorName} (${record.validatorRole})` : record.validatorRole}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <span className="text-slate-500 font-medium">Status Validasi:</span>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                isRelevant ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {record.decision}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <span className="text-slate-500 font-medium">Waktu Validasi:</span>
            <span className="font-semibold text-slate-700">
              {new Date(record.date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {record.note && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Catatan Pembimbing:
              </span>
              <p className="text-slate-700 leading-relaxed italic">&ldquo;{record.note}&rdquo;</p>
            </div>
          )}
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
      <header className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
          Form Evaluasi & Validasi
        </p>
        <h3 className="mt-1 text-xl font-black text-slate-900">
          Validasi Rekomendasi
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Berikan penilaian profesional sebagai {validatorRole} terhadap jalur yang direkomendasikan sistem.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Status Kelayakan
          </label>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 font-semibold transition ${
                decision === 'Relevan'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name={`validation-decision-${itemId}`}
                checked={decision === 'Relevan'}
                onChange={() => setDecision('Relevan')}
                className="h-4 w-4 accent-emerald-600"
              />
              ○ Relevan
            </label>

            <label
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 font-semibold transition ${
                decision === 'Perlu Revisi'
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name={`validation-decision-${itemId}`}
                checked={decision === 'Perlu Revisi'}
                onChange={() => setDecision('Perlu Revisi')}
                className="h-4 w-4 accent-amber-600"
              />
              ○ Perlu Revisi
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor={`validation-note-${itemId}`}
            className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Catatan
          </label>
          <textarea
            id={`validation-note-${itemId}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white"
            placeholder="Tuliskan alasan penilaian atau saran perbaikan untuk bimbingan..."
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          {record && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95 transition"
          >
            Submit Validasi
          </button>
        </div>
      </form>
    </article>
  );
}
