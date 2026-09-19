'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Competency = {
  id: string;
  nama_skill: string;
  kategori: string;
  deskripsi: string;
  bobot_permintaan: number;
  sumber: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  level: string;
  roles: string[];
  certifications: string[];
};

type FormValue = Omit<Competency, 'id' | 'created_at' | 'updated_at' | 'roles' | 'certifications'> & { roles: string; certifications: string };

const categories = ['Technical', 'Data', 'Design', 'Business', 'Communication', 'Management', 'Cyber Security', 'Cloud', 'Soft Skill'];
const blankForm: FormValue = {
  nama_skill: '', kategori: 'Technical', deskripsi: '', bobot_permintaan: 50, sumber: '', status: 'active', level: 'Menengah', roles: '', certifications: '',
};

const toForm = (item: Competency): FormValue => ({ ...item, roles: item.roles.join(', '), certifications: item.certifications.join(', ') });
const toPayload = (value: FormValue) => ({ ...value, roles: value.roles.split(',').map((item) => item.trim()).filter(Boolean), certifications: value.certifications.split(',').map((item) => item.trim()).filter(Boolean) });

export default function CompetenciesPage() {
  const [items, setItems] = useState<Competency[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState<'name' | 'demand' | 'updated'>('updated');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Competency | null>(null);
  const [editing, setEditing] = useState<Competency | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormValue>({ ...blankForm });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const pageSize = 6;

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/competencies');
      const payload = await response.json() as { data?: Competency[]; message?: string };
      if (!response.ok) throw new Error(payload.message ?? 'Kompetensi gagal dimuat.');
      setItems(payload.data ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Kompetensi gagal dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadItems(); }, []);

  const filtered = useMemo(() => {
    const result = items.filter((item) => {
      const matchesQuery = !query || `${item.nama_skill} ${item.deskripsi} ${item.sumber}`.toLowerCase().includes(query.toLowerCase());
      return matchesQuery && (category === 'all' || item.kategori === category) && (status === 'all' || item.status === status);
    });
    return result.sort((a, b) => sort === 'name'
      ? a.nama_skill.localeCompare(b.nama_skill)
      : sort === 'demand' ? b.bobot_permintaan - a.bobot_permintaan : b.updated_at.localeCompare(a.updated_at));
  }, [category, items, query, sort, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch(editing ? `/api/competencies/${editing.id}` : '/api/competencies', {
      method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toPayload(form)),
    });
    const payload = await response.json() as { data?: Competency; message?: string };
    if (!response.ok || !payload.data) { setError(payload.message ?? 'Data kompetensi tidak valid.'); return; }
    setItems((current) => editing ? current.map((item) => item.id === editing.id ? payload.data as Competency : item) : [payload.data as Competency, ...current]);
    setEditing(null); setForm(blankForm); setFormOpen(false); notify(editing ? 'Kompetensi berhasil diperbarui.' : 'Kompetensi berhasil ditambahkan.');
  };

  const remove = async (id: string) => {
    if (!window.confirm('Apakah kamu yakin ingin menghapus kompetensi ini?')) return;
    const response = await fetch(`/api/competencies/${id}`, { method: 'DELETE' });
    if (!response.ok) { notify('Kompetensi gagal dihapus.'); return; }
    setItems((current) => current.filter((item) => item.id !== id)); setSelected(null); notify('Kompetensi berhasil dihapus.');
  };

  const bulkDelete = async () => {
    if (!selectedIds.length || !window.confirm(`Apakah kamu yakin ingin menghapus ${selectedIds.length} kompetensi ini?`)) return;
    await Promise.all(selectedIds.map((id) => fetch(`/api/competencies/${id}`, { method: 'DELETE' })));
    setItems((current) => current.filter((item) => !selectedIds.includes(item.id))); setSelectedIds([]); notify('Kompetensi terpilih berhasil dihapus.');
  };

  const exportCsv = () => {
    const header = ['id', 'nama_skill', 'kategori', 'deskripsi', 'bobot_permintaan', 'sumber', 'status', 'created_at', 'updated_at'];
    const csv = [header, ...filtered.map((item) => header.map((key) => JSON.stringify(item[key as keyof Competency] ?? '')))].map((row) => row.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'kompetensi-industri.csv'; anchor.click(); URL.revokeObjectURL(url); notify('Data kompetensi berhasil diekspor.');
  };

  const importCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    const headers = lines.shift()?.split(',').map((item) => item.trim()) ?? [];
    const required = ['nama_skill', 'kategori', 'deskripsi', 'bobot_permintaan', 'sumber', 'status'];
    const missing = required.filter((field) => !headers.includes(field));
    if (missing.length) { setError(`Kolom wajib tidak ditemukan: ${missing.join(', ')}`); return; }
    const rows = lines.map((line) => {
      const values = line.split(',').map((item) => item.replace(/^"|"$/g, '').trim());
      return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']));
    }).map((row) => ({ ...row, bobot_permintaan: Number(row.bobot_permintaan), roles: ['Generalist'], certifications: [] }));
    const response = await fetch('/api/competencies/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) });
    const payload = await response.json() as { imported?: number; message?: string };
    if (!response.ok) { setError(payload.message ?? 'Import gagal divalidasi.'); return; }
    await loadItems(); notify(`${payload.imported ?? 0} kompetensi berhasil diimport.`);
    event.target.value = '';
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {toast && <div role="status" className="fixed right-5 top-5 z-50 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-soft">{toast}</div>}
      <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Admin / Master data</p><h1 className="mt-2 text-3xl font-black text-slate-900">Kompetensi Industri</h1><p className="mt-2 text-sm text-slate-600">Katalog skill yang menjadi sumber matching assessment dan rekomendasi sertifikasi.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/admin/competencies/import" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">Import data</Link><label className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">Quick CSV<input type="file" accept=".csv" onChange={importCsv} className="hidden" /></label><button type="button" onClick={exportCsv} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">Export CSV</button><button type="button" onClick={() => { setEditing(null); setForm({ ...blankForm }); }} className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-soft">Tambah kompetensi</button></div>
      </header>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_180px_160px_180px_auto]">
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Cari skill, deskripsi, sumber..." aria-label="Cari kompetensi" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm" />
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} aria-label="Filter kategori" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">Semua kategori</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filter status" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">Semua status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Urutkan kompetensi" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="updated">Terbaru diubah</option><option value="name">Nama A-Z</option><option value="demand">Bobot permintaan</option></select>
          <button type="button" onClick={bulkDelete} disabled={!selectedIds.length} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40">Hapus terpilih ({selectedIds.length})</button>
        </div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {loading ? <div className="sg-loading">Memuat kompetensi...</div> : visible.length === 0 ? <div className="sg-empty">Belum ada kompetensi yang sesuai filter.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3"><input type="checkbox" aria-label="Pilih semua kompetensi" checked={visible.length > 0 && visible.every((item) => selectedIds.includes(item.id))} onChange={(event) => setSelectedIds(event.target.checked ? visible.map((item) => item.id) : [])} /></th><th className="px-3 py-3">Skill</th><th className="px-3 py-3">Kategori</th><th className="px-3 py-3">Bobot</th><th className="px-3 py-3">Sumber</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{visible.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="px-3 py-4"><input type="checkbox" aria-label={`Pilih ${item.nama_skill}`} checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /></td><td className="px-3 py-4"><p className="font-bold text-slate-900">{item.nama_skill}</p><p className="mt-1 max-w-xs truncate text-xs text-slate-500">{item.deskripsi}</p></td><td className="px-3 py-4 text-slate-600">{item.kategori}</td><td className="px-3 py-4 font-semibold text-slate-800">{item.bobot_permintaan}%</td><td className="px-3 py-4 text-slate-600">{item.sumber}</td><td className="px-3 py-4"><span className={item.status === 'active' ? 'sg-badge-success' : 'sg-badge-neutral'}>{item.status}</span></td><td className="px-3 py-4"><div className="flex gap-2"><button type="button" onClick={() => setSelected(item)} className="text-xs font-semibold text-slate-700">Detail</button><button type="button" onClick={() => { setEditing(item); setForm(toForm(item)); }} className="text-xs font-semibold text-indigo-600">Edit</button><button type="button" onClick={() => remove(item.id)} className="text-xs font-semibold text-red-600">Hapus</button></div></td></tr>)}</tbody></table></div>}
        <div className="mt-5 flex items-center justify-between text-sm text-slate-500"><span>{filtered.length} kompetensi ditemukan</span><div className="flex items-center gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Sebelumnya</button><span>Halaman {page} / {pages}</span><button type="button" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Berikutnya</button></div></div>
      </section>

      {(editing || form !== blankForm) && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 p-4"><form onSubmit={save} className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">{editing ? 'Edit' : 'Create'}</p><h2 className="mt-2 text-2xl font-black text-slate-900">{editing ? 'Edit kompetensi' : 'Tambah kompetensi'}</h2></div><button type="button" onClick={() => { setEditing(null); setForm(blankForm); }} aria-label="Tutup modal" className="text-slate-500">✕</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Nama Skill *<input required value={form.nama_skill} onChange={(event) => setForm({ ...form, nama_skill: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Kategori *<select required value={form.kategori} onChange={(event) => setForm({ ...form, kategori: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal">{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-sm font-semibold text-slate-700 md:col-span-2">Deskripsi<textarea required minLength={10} value={form.deskripsi} onChange={(event) => setForm({ ...form, deskripsi: event.target.value })} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Bobot Permintaan *<input required type="number" min={0} max={100} value={form.bobot_permintaan} onChange={(event) => setForm({ ...form, bobot_permintaan: Number(event.target.value) })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Sumber *<input required value={form.sumber} onChange={(event) => setForm({ ...form, sumber: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-normal" /></label><label className="text-sm font-semibold text-slate-700">Status *<select required value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Competency['status'] })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal"><option value="active">Active</option><option value="inactive">Inactive</option></select></label><label className="text-sm font-semibold text-slate-700">Level<select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal"><option>Pemula</option><option>Menengah</option><option>Lanjutan</option></select></label><label className="text-sm font-semibold text-slate-700 md:col-span-2">Role terkait<input value={form.roles} onChange={(event) => setForm({ ...form, roles: event.target.value })} placeholder="Pisahkan dengan koma" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-normal" /></label><label className="text-sm font-semibold text-slate-700 md:col-span-2">Sertifikasi terkait<input value={form.certifications} onChange={(event) => setForm({ ...form, certifications: event.target.value })} placeholder="Pisahkan dengan koma" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-normal" /></label></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { setEditing(null); setForm(blankForm); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Batal</button><button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white">Simpan kompetensi</button></div></form></div>}

      {selected && <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30"><aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Detail kompetensi</p><h2 className="mt-2 text-2xl font-black text-slate-900">{selected.nama_skill}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Tutup detail" className="text-slate-500">✕</button></div><div className="mt-8 space-y-5"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Deskripsi</p><p className="mt-2 text-sm leading-6 text-slate-700">{selected.deskripsi}</p></div><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-slate-500">Kategori</p><p className="mt-1 font-semibold text-slate-900">{selected.kategori}</p></div><div><p className="text-xs text-slate-500">Bobot permintaan</p><p className="mt-1 font-semibold text-indigo-700">{selected.bobot_permintaan}%</p></div></div><div><p className="text-xs text-slate-500">Role terkait</p><p className="mt-1 text-sm text-slate-700">{selected.roles.join(', ')}</p></div><div><p className="text-xs text-slate-500">Sertifikasi terkait</p><p className="mt-1 text-sm text-slate-700">{selected.certifications.join(', ') || 'Belum tersedia'}</p></div><div><p className="text-xs text-slate-500">Sumber</p><p className="mt-1 text-sm text-slate-700">{selected.sumber}</p></div></div></aside></div>}
    </main>
  );
}