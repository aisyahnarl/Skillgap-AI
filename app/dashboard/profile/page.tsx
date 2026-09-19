'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService, type UserProfile } from '../../services/auth-service';
import { Toast, DashboardCard } from '../../components/ui';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [cvName, setCvName] = useState('Belum ada file');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const current = authService.getCurrentUser();
    if (current) {
      setUser(current);
      setName(current.name);
    }
    try {
      const cv = localStorage.getItem('skillgap-cv');
      if (cv) {
        const parsed = JSON.parse(cv);
        if (parsed.name) setCvName(parsed.name);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    authService.updateUser(user.email, { name });
    setUser((prev) => (prev ? { ...prev, name } : null));
    setToastMessage('Profil berhasil diperbarui!');
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
              Pengaturan Akun & Profil
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Profil Pengguna
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Kelola informasi identitas, preferensi akun, dan dokumen pendukung analitik.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
          >
            Keluar Akun
          </button>
        </div>
      </header>

      {/* Form & Documents */}
      <div className="mt-6 space-y-6">
        <DashboardCard title="Informasi Identitas" subtitle="Data Pribadi">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Akun
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Peran (Role)
                </label>
                <input
                  type="text"
                  disabled
                  value={user.role}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Jenjang Pendidikan
                </label>
                <input
                  type="text"
                  disabled
                  value={user.jenjang}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-soft hover:opacity-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </DashboardCard>

        {/* Dokumen CV Terunggah */}
        <DashboardCard title="Dokumen Portofolio / CV" subtitle="Berkas Terunggah">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-lg">
                📄
              </span>
              <div>
                <p className="font-bold text-slate-900 text-sm">{cvName}</p>
                <p className="text-xs text-slate-500">Format PDF / DOCX • Digunakan untuk analisis kecocokan profil & skill</p>
              </div>
            </div>

            <Link
              href="/assessment"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition text-center"
            >
              Ganti File CV
            </Link>
          </div>
        </DashboardCard>
      </div>
    </main>
  );
}
