'use client';

import Link from 'next/link';
import { useState } from 'react';

type PreviewRow = Record<string, string | number>;
const requiredColumns = ['nama_skill', 'kategori', 'deskripsi', 'bobot_permintaan', 'sumber', 'status'];

const sampleSkkniData = `nama_skill,kategori,deskripsi,bobot_permintaan,sumber,status
Implementasi Algoritma Pemrograman,Technical,Menulis kode terstruktur menggunakan algoritma standar dan pengujian fungsi,90,SKKNI Software Development 2017,active
Pengelolaan Basis Data Relasional,Data,Merancang skema SQL membuat query kompleks dan memelihara integritas data,88,SKKNI Software Development 2017,active
Desain Arsitektur Perangkat Lunak,Technical,Menyusun struktur modul dependensi dan pola desain aplikasi modern,85,SKKNI Software Development 2017,active
Pengujian Perangkat Lunak (Unit & Integration),Technical,Menjalankan test case otomatis dan dokumentasi debugging bug,82,SKKNI Software Development 2017,active
Keamanan Kode Sumber (Secure Coding),Cyber Security,Menerapkan sanitasi input otentikasi dan mitigasi kerentanan OWASP,86,SKKNI Software Development 2017,active`;

const sampleJobMarketData = `nama_skill,kategori,deskripsi,bobot_permintaan,sumber,status
Python Machine Learning Pipelines,Data,Membangun workflow data scikit-learn dan deployment model prediktif,94,Job Market Analytics 2026,active
Next.js React Server Components,Technical,Pengembangan antarmuka web modern dengan routing server-side dan SSR,92,Job Market Analytics 2026,active
Cloud Containerization Docker & K8s,Cloud,Mengemas aplikasi microservices dan orkestrasi container di cloud,89,Job Market Analytics 2026,active
REST API & Microservices Architecture,Technical,Membangun endpoint API scalable berbasis FastAPI dan Express,91,Job Market Analytics 2026,active
UI Design & Design System Figma,Design,Merancang komponen UI konsisten dan interaktif untuk user web/mobile,87,Job Market Analytics 2026,active`;

export default function CompetencyImportPage() {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [importing, setImporting] = useState(false);

  const processCsvText = (text: string, name: string) => {
    setFileName(name);
    setMessage('');
    setErrors([]);

    const lines = text.split(/\r?\n/).filter(Boolean);
    const parsedHeaders = lines.shift()?.split(',').map((item) => item.trim()) ?? [];
    setHeaders(parsedHeaders);

    const missing = requiredColumns.filter((column) => !parsedHeaders.includes(column));
    if (missing.length) {
      setErrors([`Kolom wajib tidak lengkap: ${missing.join(', ')}`]);
      setRows([]);
      return;
    }

    const parsedRows = lines.map((line) => {
      const values = line.split(',').map((item) => item.replace(/^"|"$/g, '').trim());
      return Object.fromEntries(
        parsedHeaders.map((header, index) => [
          header,
          header === 'bobot_permintaan' ? Number(values[index] ?? 0) : values[index] ?? '',
        ]),
      );
    });

    const names = new Set<string>();
    const duplicateRows = parsedRows.reduce<string[]>((result, row, index) => {
      const key = String(row.nama_skill).toLowerCase();
      if (names.has(key)) result.push(`Baris ${index + 2}: duplikat ${row.nama_skill}`);
      names.add(key);
      return result;
    }, []);

    setErrors(duplicateRows);
    setRows(parsedRows);
  };

  const parseFile = async (file: File) => {
    const text = await file.text();
    processCsvText(text, file.name);
  };

  const handleDownloadTemplate = () => {
    const templateContent = `${requiredColumns.join(',')}\nContoh Skill Baru,Technical,Deskripsi lengkap kompetensi industri,85,Sumber Lowongan / Standar,active`;
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template-kurasi-kompetensi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importData = async () => {
    setImporting(true);
    const payload = rows.map((row) => ({
      ...row,
      roles: ['Generalist'],
      certifications: [],
    }));

    const response = await fetch('/api/competencies/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: payload }),
    });

    const result = (await response.json()) as {
      imported?: number;
      duplicates?: string[];
      message?: string;
    };
    setImporting(false);

    if (!response.ok) {
      setErrors([result.message ?? 'Import gagal.']);
      return;
    }

    setMessage(
      `✓ Berhasil mengimpor ${result.imported ?? 0} data kompetensi ke katalog.${
        result.duplicates?.length ? ` Duplikat dilewati: ${result.duplicates.join(', ')}.` : ''
      }`,
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <Link
          href="/admin/competencies"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
        >
          ← Kembali ke Katalog Kompetensi
        </Link>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Kurasi Data Industri (FR-05.1)
            </p>
            <h1 className="mt-1 text-3xl font-black text-slate-900">
              Import & Kurasi Kompetensi Industri
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Unggah dataset CSV lowongan kerja atau standar kompetensi kerja nasional (SKKNI) untuk memperbarui basis data acuan recommendation engine.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition whitespace-nowrap"
          >
            📥 Unduh Template CSV
          </button>
        </div>
      </header>

      {/* Quick Demo Datasets */}
      <section className="mb-6 rounded-[24px] border border-indigo-100 bg-indigo-50/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Pustaka Dataset Standar Industri (1-Klik)
            </span>
            <p className="text-xs text-indigo-700 mt-0.5">
              Gunakan data acuan resmi standar industri tanpa perlu membuat file CSV manual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => processCsvText(sampleSkkniData, 'skkni-software-development-2017.csv')}
              className="rounded-xl bg-white border border-indigo-200 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition shadow-2xs"
            >
              📋 Standar SKKNI Dev
            </button>
            <button
              type="button"
              onClick={() => processCsvText(sampleJobMarketData, 'lowongan-industri-2026.csv')}
              className="rounded-xl bg-white border border-indigo-200 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition shadow-2xs"
            >
              💼 Data Lowongan 2026
            </button>
          </div>
        </div>
      </section>

      {/* Upload Zone */}
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/30 px-6 py-10 text-center hover:bg-indigo-50/50 transition">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 text-xl font-black mb-2">
            📄
          </span>
          <span className="text-base font-bold text-indigo-900">
            {fileName ? `File terpilih: ${fileName}` : 'Klik untuk Memilih File CSV'}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            Kolom wajib: {requiredColumns.join(', ')}
          </span>
          <input
            type="file"
            accept=".csv"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void parseFile(file);
            }}
            className="hidden"
          />
        </label>

        {fileName && (
          <p className="mt-4 text-xs font-semibold text-slate-600">
            File aktif: <strong className="text-slate-900">{fileName}</strong> • Terdeteksi {rows.length} baris data
          </p>
        )}

        {errors.length > 0 && (
          <div role="alert" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            <p className="font-bold mb-1">Catatan Validasi Data:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {message && (
          <div role="status" className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 font-medium">
            {message}
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500 font-bold">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} className="px-3.5 py-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rows.slice(0, 10).map((row, index) => (
                    <tr key={`${String(row.nama_skill)}-${index}`} className="hover:bg-slate-50">
                      {headers.map((header) => (
                        <td key={header} className="max-w-xs truncate px-3.5 py-2.5 text-slate-700">
                          {String(row[header] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Menampilkan maksimal 10 dari {rows.length} baris preview
              </span>
              <button
                type="button"
                disabled={importing || errors.some((err) => err.toLowerCase().includes('tidak lengkap'))}
                onClick={() => void importData()}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-3 text-xs font-bold text-white shadow-soft hover:opacity-95 disabled:opacity-40 transition"
              >
                {importing ? 'Memproses Impor...' : `Impor ${rows.length} Data ke Katalog`}
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
