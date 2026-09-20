'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { certificationService, type Certification } from '../../services/certification-service';
import { CertificationCard, SearchFilter } from '../../components/ui';

export default function CertificationsPage() {
  const [items, setItems] = useState<Certification[]>([]);
  const [selected, setSelected] = useState<Certification | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    try {
      const allCatalog = certificationService.getAll();
      const report = JSON.parse(localStorage.getItem('skillgap-report') ?? '{}');
      if (report.certifications && Array.isArray(report.certifications) && report.certifications.length > 0) {
        // Map report certifications and blend with standard catalog details
        const mapped = report.certifications.map((c: any, idx: number) => {
          const catalogItem = allCatalog.find(
            (cat) => cat.name.toLowerCase().includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cat.name.toLowerCase()),
          );
          return {
            id: `cert-report-${idx}`,
            name: c.name,
            provider: c.provider || catalogItem?.provider || 'Sertifikasi Industri',
            category: catalogItem?.category || 'Technical',
            description: c.description || catalogItem?.description || c.reason,
            targetLevel: c.targetLevel || catalogItem?.targetLevel || 'Menengah',
            duration: c.duration || catalogItem?.duration || '3 bulan',
            prerequisites: c.prerequisites || catalogItem?.prerequisites || 'Dasar analitikal',
            officialUrl: c.officialUrl || catalogItem?.officialUrl || null,
            imageUrl: c.imageUrl || catalogItem?.imageUrl || null,
            relatedSkills: c.relatedSkills || catalogItem?.relatedSkills || ['Core Skill'],
            match: c.match ?? 92,
            priority: c.priority || 'High',
            reason: c.reason,
          };
        });

        // Blend with the rest of catalog so users can search across Dicoding, Coursera, Meta, etc.
        const remaining = allCatalog.filter(
          (cat) => !mapped.some((m: any) => m.name.toLowerCase().includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(m.name.toLowerCase()))
        );

        setItems([...mapped, ...remaining]);
      } else {
        setItems(allCatalog);
      }
    } catch {
      setItems(certificationService.getAll());
    }
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.provider.toLowerCase().includes(query.toLowerCase()) ||
        item.relatedSkills.some((s) => s.toLowerCase().includes(query.toLowerCase()));
      const matchCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchQuery && matchCategory;
    });
  }, [items, query, categoryFilter]);

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
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              Kurasi Sertifikasi Profesional
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Rekomendasi Sertifikasi & Lisensi
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Katalog sertifikasi kredibel berskala global dan nasional yang diprioritaskan berdasarkan skill gap pada assessment profilmu.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200 w-32 h-20 shadow-2xs">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80"
                alt="Sertifikasi & Karier"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-center min-w-[140px]">
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Total Rekomendasi
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">{items.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter & Search */}
      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <SearchFilter
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder="Cari sertifikasi, provider (Dicoding, Coursera, Meta, Google), atau skill..."
          filterValue={categoryFilter}
          onFilterChange={setCategoryFilter}
          filterLabel="Filter Kategori"
          filterOptions={[
            { label: 'Semua Kategori', value: 'all' },
            { label: 'Data & Analitik', value: 'Data' },
            { label: 'Teknis & Rekayasa', value: 'Technical' },
            { label: 'Desain & Kreatif', value: 'Design' },
            { label: 'Cloud & Infrastruktur', value: 'Cloud' },
          ]}
        />
      </section>

      {/* Certification Cards Grid */}
      <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
            Tidak ada sertifikasi yang cocok dengan filter pencarian.
          </div>
        ) : (
          filtered.map((cert) => (
            <CertificationCard
              key={cert.name}
              name={cert.name}
              provider={cert.provider}
              reason={cert.reason}
              match={cert.match}
              priority={cert.priority}
              relatedSkills={cert.relatedSkills}
              duration={cert.duration}
              officialUrl={cert.officialUrl}
              imageUrl={cert.imageUrl}
              onViewDetail={() => setSelected(cert)}
            />
          ))
        )}
      </section>

      {/* Detail Drawer */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs"
        >
          <aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl sm:p-8 animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Rincian Sertifikasi
                </span>
                <h2 className="mt-1 text-2xl font-black text-slate-900 leading-snug">
                  {selected.name}
                </h2>
                <p className="text-xs font-semibold text-indigo-600 mt-1">
                  Dikeluarkan oleh: {selected.provider}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                aria-label="Tutup detail"
              >
                ✕
              </button>
            </div>

            {selected.imageUrl && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 shadow-2xs h-44 w-full">
                <img
                  src={selected.imageUrl}
                  alt={selected.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <dl className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl bg-slate-50 p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Deskripsi Lengkap
                </dt>
                <dd className="mt-1.5 text-slate-700 leading-relaxed">
                  {selected.description}
                </dd>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tingkat Kemampuan
                  </dt>
                  <dd className="mt-1 font-bold text-slate-900">{selected.targetLevel}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Estimasi Durasi
                  </dt>
                  <dd className="mt-1 font-bold text-slate-900">{selected.duration}</dd>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Prasyarat Mengikuti
                </dt>
                <dd className="mt-1 text-slate-700">{selected.prerequisites}</dd>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kompetensi yang Ditingkatkan
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {selected.relatedSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700"
                    >
                      {s}
                    </span>
                  ))}
                </dd>
              </div>

              {selected.reason && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                  <dt className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Alasan Rekomendasi
                  </dt>
                  <dd className="mt-1 text-xs text-emerald-900 leading-relaxed font-medium">
                    {selected.reason}
                  </dd>
                </div>
              )}

              {selected.officialUrl && (
                <div className="pt-2">
                  <a
                    href={selected.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 transition"
                  >
                    Kunjungi Laman Resmi Ujian / Kursus ↗
                  </a>
                </div>
              )}

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-indigo-900">Relevan dengan Kebutuhan Industri</p>
                  <p className="text-[11px] text-indigo-700">Sertifikasi ini dicari oleh perusahaan mitra pada lowongan kerja aktif.</p>
                </div>
                <Link
                  href="/dashboard/jobs"
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-200 shadow-2xs hover:bg-indigo-50 whitespace-nowrap"
                >
                  Cari Lowongan →
                </Link>
              </div>
            </dl>
          </aside>
        </div>
      )}
    </main>
  );
}
