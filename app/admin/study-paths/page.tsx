'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type StudyPath = {
  id: string;
  nama_jurusan: string;
  jenjang_target: 'SMA' | 'SMK' | 'Diploma' | 'Sarjana';
  bidang: string;
  deskripsi: string;
  skill_terkait: string[];
  prospek_karier: string[];
  sertifikasi_terkait: string[];
  status: 'active' | 'inactive';
};

type Form = Omit<StudyPath, 'id' | 'skill_terkait' | 'prospek_karier' | 'sertifikasi_terkait'> & {
  skill_terkait: string;
  prospek_karier: string;
  sertifikasi_terkait: string;
};

const blankForm: Form = {
  nama_jurusan: '',
  jenjang_target: 'Sarjana',
  bidang: '',
  deskripsi: '',
  skill_terkait: '',
  prospek_karier: '',
  sertifikasi_terkait: '',
  status: 'active',
};

const splitValues = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export default function StudyPathsPage() {
  const [items, setItems] = useState<StudyPath[]>([]);
  const [query, setQuery] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('all');
  const [editing, setEditing] = useState<StudyPath | null>(null);
  const [form, setForm] = useState<Form>(blankForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<StudyPath | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/study-paths');
      const payload = (await response.json()) as { data?: StudyPath[] };
      setItems(payload.data ?? []);
    } catch {
      setMessage('Gagal memuat data jalur studi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchQuery = `${item.nama_jurusan} ${item.bidang} ${item.deskripsi}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchJenjang = jenjangFilter === 'all' || item.jenjang_target === jenjangFilter;
      return matchQuery && matchJenjang;
    });
  }, [items, query, jenjangFilter]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...form,
      skill_terkait: splitValues(form.skill_terkait),
      prospek_karier: splitValues(form.prospek_karier),
      sertifikasi_terkait: splitValues(form.sertifikasi_terkait),
    };

    const response = await fetch(editing ? `/api/study-paths/${editing.id}` : '/api/study-paths', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setMessage('Data jalur studi tidak valid.');
      return;
    }

    setMessage(editing ? 'Jalur studi berhasil diperbarui.' : 'Jalur studi berhasil ditambahkan.');
    setEditing(null);
    setForm(blankForm);
    setModalOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus jalur studi ini?')) return;
    await fetch(`/api/study-paths/${id}`, { method: 'DELETE' });
    setSelected(null);
    setMessage('Jalur studi berhasil dihapus.');
    await load();
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
        >
          ← Kembali ke Dashboard Admin
        </Link>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Manajemen Data Acuan (FR-05.2)
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Basis Data Jalur Studi Lanjut
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Kelola direktori program studi perguruan tinggi (Sarjana / Diploma) dan kejuruan (SMK) yang digunakan sebagai acuan pencocokan minat pelajar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(blankForm);
              setModalOpen(true);
            }}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 transition whitespace-nowrap"
          >
            + Tambah Jalur Studi
          </button>
        </div>
      </header>

      {/* Filter and Search */}
      <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari program studi, bidang, atau prospek karier..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:border-indigo-300"
          />
          <select
            value={jenjangFilter}
            onChange={(e) => setJenjangFilter(e.target.value)}
            className="w-full sm:w-56 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white"
          >
            <option value="all">Semua Jenjang</option>
            <option value="Sarjana">Sarjana (S1)</option>
            <option value="Diploma">Diploma (D3/D4)</option>
            <option value="SMK">Kejuruan (SMK)</option>
            <option value="SMA">SMA</option>
          </select>
        </div>

        {message && (
          <div role="status" className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-800">
            {message}
          </div>
        )}
      </section>

      {/* Cards Grid */}
      <section>
        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Memuat data jalur studi...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Belum ada jalur studi yang sesuai filter pencarian.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                        {item.jenjang_target} • {item.bidang}
                      </span>
                      <h3 className="mt-2 text-lg font-black text-slate-900 leading-snug">
                        {item.nama_jurusan}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.status === 'active' ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {item.deskripsi}
                  </p>

                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Prospek Karier:
                      </span>
                      <p className="text-slate-700 font-medium truncate">
                        {item.prospek_karier.join(', ')}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Kompetensi Inti:
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.skill_terkait.slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="text-slate-600 hover:text-indigo-600"
                  >
                    Detail Lengkap
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(item);
                        setForm({
                          ...item,
                          skill_terkait: item.skill_terkait.join(', '),
                          prospek_karier: item.prospek_karier.join(', '),
                          sertifikasi_terkait: item.sertifikasi_terkait.join(', '),
                        });
                        setModalOpen(true);
                      }}
                      className="text-indigo-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Edit / Add Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <form
            onSubmit={save}
            className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Formulir Kurasi Jurusan
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {editing ? 'Edit Jalur Studi' : 'Tambah Jalur Studi Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(blankForm);
                  setModalOpen(false);
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nama Program Studi / Jurusan *
                </label>
                <input
                  required
                  value={form.nama_jurusan}
                  onChange={(e) => setForm({ ...form, nama_jurusan: e.target.value })}
                  placeholder="Contoh: Sistem Informasi"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Jenjang Pendidikan Target
                </label>
                <select
                  value={form.jenjang_target}
                  onChange={(e) => setForm({ ...form, jenjang_target: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white font-medium"
                >
                  <option value="Sarjana">Sarjana (S1)</option>
                  <option value="Diploma">Diploma (D3/D4)</option>
                  <option value="SMK">Kejuruan (SMK)</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Bidang Keahlian *
                </label>
                <input
                  required
                  value={form.bidang}
                  onChange={(e) => setForm({ ...form, bidang: e.target.value })}
                  placeholder="Contoh: Data & AI, Software, Desain"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Deskripsi Lengkap *
                </label>
                <textarea
                  required
                  minLength={10}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  rows={3}
                  placeholder="Jelaskan fokus keilmuan dan kompetensi yang dipelajari..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kompetensi Terkait (Pisahkan dengan koma) *
                </label>
                <input
                  required
                  value={form.skill_terkait}
                  onChange={(e) => setForm({ ...form, skill_terkait: e.target.value })}
                  placeholder="SQL, Analisis Proses Bisnis, Python"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Prospek Karier (Pisahkan dengan koma) *
                </label>
                <input
                  required
                  value={form.prospek_karier}
                  onChange={(e) => setForm({ ...form, prospek_karier: e.target.value })}
                  placeholder="Business Analyst, Data Engineer"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sertifikasi Pendukung (Pisahkan dengan koma)
                </label>
                <input
                  value={form.sertifikasi_terkait}
                  onChange={(e) => setForm({ ...form, sertifikasi_terkait: e.target.value })}
                  placeholder="Google Data Analytics, Microsoft PL-300"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm focus:bg-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(blankForm);
                  setModalOpen(false);
                }}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95"
              >
                Simpan Jalur Studi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drawer Detail */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
        >
          <aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl sm:p-8 animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Detail Jalur Studi
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900">
                  {selected.nama_jurusan}
                </h2>
                <span className="inline-block mt-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                  {selected.jenjang_target} • {selected.bidang}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Deskripsi Jalur
                </dt>
                <dd className="mt-1.5 text-slate-700 leading-relaxed text-xs">
                  {selected.deskripsi}
                </dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kompetensi Inti
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1">
                  {selected.skill_terkait.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Prospek Pekerjaan Lulusan
                </dt>
                <dd className="mt-1 text-xs text-slate-700">
                  {selected.prospek_karier.join(', ')}
                </dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sertifikasi Pendukung
                </dt>
                <dd className="mt-1 text-xs text-indigo-700 font-semibold">
                  {selected.sertifikasi_terkait.join(', ') || 'Belum tersedia'}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </main>
  );
}
