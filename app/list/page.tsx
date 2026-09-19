'use client';

import { useEffect, useMemo, useState } from 'react';

type AssessmentRow = { id: string; name: string; category: string; target: string; match: string; status: 'valid' | 'review' | 'pending' };

export default function DataListPage() {
  const [rows, setRows] = useState<AssessmentRow[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<AssessmentRow | null>(null);

  useEffect(() => {
    fetch('/api/assessments')
      .then((response) => response.json())
      .then((payload: { data?: AssessmentRow[] }) => setRows(payload.data ?? []));
  }, []);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesQuery = !query || Object.values(row).some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (status === 'all' || row.status === status);
  }), [query, rows, status]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">List / Detail</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Data profil pengguna</h1>
          </div>
          <a href="/assessment" className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft">Tambah data</a>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Cari data pengguna" placeholder="Cari nama, kategori, atau program..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm md:w-80" />
            <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter status" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
              <option value="all">Semua status</option>
              <option value="valid">Valid</option>
              <option value="review">Review</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="pb-3 pr-4 font-medium">Nama</th>
                <th className="pb-3 pr-4 font-medium">Kategori</th>
                <th className="pb-3 pr-4 font-medium">Target</th>
                <th className="pb-3 pr-4 font-medium">Kecocokan</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 pr-4 font-medium text-slate-900">{row.name}</td>
                  <td className="py-3 pr-4">{row.category}</td>
                  <td className="py-3 pr-4">{row.target}</td>
                  <td className="py-3 pr-4">{row.match}</td>
                  <td className="py-3 pr-4"><span className="rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700">{row.status}</span></td>
                  <td className="py-3"><button type="button" onClick={() => setSelected(row)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">Detail</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <section className="mt-6 rounded-[28px] border border-indigo-100 bg-indigo-50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Detail assessment</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{selected.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{selected.category} · {selected.target} · Match {selected.match}</p>
            </div>
            <button type="button" onClick={() => setSelected(null)} className="text-sm font-semibold text-indigo-700">Tutup</button>
          </div>
        </section>
      )}
    </main>
  );
}
