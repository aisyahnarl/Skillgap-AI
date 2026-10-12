'use client';

import { useState } from 'react';

type AiInfoBannerProps = {
  compact?: boolean;
};

/**
 * Banner informasi tentang AI/LLM yang digunakan di platform SkillGap.AI
 * Menjawab pertanyaan: pakai AI apa? Gemini atau GPT? Cloud atau lokal?
 */
export default function AiInfoBanner({ compact = false }: AiInfoBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 px-4 py-3 text-xs text-indigo-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🤖</span>
            <span>
              <strong>AI Engine:</strong> Google Gemini 1.5 Flash (Cloud API) •{' '}
              <span className="text-indigo-600 font-semibold">Tidak ada NLP lokal</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 rounded-lg border border-indigo-200 bg-white px-2 py-1 text-[10px] font-bold text-indigo-700 hover:bg-indigo-50 transition"
          >
            {expanded ? 'Tutup' : 'Detail'}
          </button>
        </div>
        {expanded && (
          <div className="mt-3 space-y-2 border-t border-indigo-200 pt-3 text-[11px] leading-relaxed">
            <p><strong>🌐 Model LLM:</strong> Google Gemini 1.5 Flash melalui Google AI Studio API (Cloud-based)</p>
            <p><strong>📄 Ekstraksi Dokumen:</strong> LLM langsung membaca dan menganalisis teks dari CV/portofolio yang diunggah — tidak menggunakan NLP terpisah (spaCy/NLTK)</p>
            <p><strong>⚡ Kenapa Cloud LLM?</strong> LLM modern seperti Gemini sudah mampu memahami teks, mengekstrak informasi, dan menganalisis konten tanpa perlu pipeline NLP tambahan</p>
            <p><strong>🔒 Privasi:</strong> Data yang dikirim ke API diproses sesuai kebijakan privasi Google Cloud</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-sky-50 p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl text-white">
            🤖
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Informasi AI & LLM Platform
            </p>
            <h3 className="mt-1 text-lg font-black text-slate-900">
              Didukung Google Gemini AI (Cloud)
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Platform ini menggunakan <strong className="text-indigo-700">Google Gemini 1.5 Flash</strong> sebagai
              Large Language Model utama melalui Google AI Studio Cloud API — bukan model lokal.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition"
        >
          {expanded ? 'Sembunyikan' : 'Selengkapnya'}
        </button>
      </div>

      {expanded && (
        <div className="mt-5 grid gap-4 border-t border-indigo-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-indigo-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Model LLM</p>
            <p className="mt-2 text-sm font-black text-slate-900">Google Gemini 1.5 Flash</p>
            <p className="mt-1 text-xs text-slate-500">
              Model multimodal Google — bisa membaca teks, dokumen, hingga gambar dan video
            </p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-600">Mode Deployment</p>
            <p className="mt-2 text-sm font-black text-slate-900">Cloud API (Google AI Studio)</p>
            <p className="mt-1 text-xs text-slate-500">
              Tidak ada model yang berjalan secara lokal — semua inferensi dilakukan di server Google
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Ekstraksi Dokumen</p>
            <p className="mt-2 text-sm font-black text-slate-900">LLM Native (Bukan NLP Terpisah)</p>
            <p className="mt-1 text-xs text-slate-500">
              Gemini langsung menganalisis CV/portofolio — tanpa spaCy, NLTK, atau library NLP lokal
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Spesialisasi</p>
            <p className="mt-2 text-sm font-black text-slate-900">Bidang IT & Teknologi</p>
            <p className="mt-1 text-xs text-slate-500">
              Rekomendasi difokuskan pada ekosistem industri IT: Web, Data, Cloud, Cyber, UI/UX
            </p>
          </div>
        </div>
      )}

      {!expanded && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
            🧠 Gemini AI
          </span>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
            ☁️ Cloud (Google AI Studio)
          </span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            📄 LLM Document Analysis
          </span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
            🎯 Spesialisasi IT
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            ❌ Bukan GPT / ChatGPT
          </span>
        </div>
      )}
    </section>
  );
}
