'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService, type UserProfile } from '../services/auth-service';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    authService.ensureSeedUsers();
    if (searchParams.get('registered') === '1') {
      setMessage('Akun berhasil dibuat. Silakan login terlebih dahulu.');
    }
  }, [searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    const savedUsers = authService.getAllUsers();
    const matchedUser = savedUsers.find(
      (user: UserProfile) =>
        user.email.toLowerCase() === form.email.toLowerCase() && user.password === form.password,
    );

    if (!matchedUser) {
      setError('Email atau password salah. Pastikan data login sesuai dengan akun yang terdaftar.');
      return;
    }

    const role =
      matchedUser.role === 'Admin' || matchedUser.email.toLowerCase().includes('admin')
        ? 'Admin'
        : matchedUser.role || 'Mahasiswa';

    authService.setSession({
      ...matchedUser,
      role,
    });

    setMessage(`Login berhasil sebagai ${role}. Mengarahkan ke workspace...`);
    setError('');

    setTimeout(() => {
      if (role === 'Admin') router.push('/admin');
      else if (role === 'Dosen') router.push('/lecturer');
      else if (role === 'Guru BK') router.push('/counselor');
      else router.push('/dashboard');
    }, 400);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f7ff_0%,_#edf4ff_35%,_#f8fafc_100%)] p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 font-black text-white">S</span>
              SkillGap.AI
            </div>
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-100">Platform Pengembangan Karier</p>
            <h1 className="mt-4 max-w-md text-4xl font-black leading-tight text-white">
              Akselerasi Karier & Penyelarasan Kompetensi
            </h1>
            <p className="mt-4 max-w-md text-base text-indigo-100">
              Analisis kebutuhan industri, roadmap belajar terstruktur, dan validasi pembimbing akademik.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-indigo-100">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
            Engine Rekomendasi Aktif
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">Masuk</p>
              <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Selamat Datang Kembali</h2>
            </div>
            <Link
              href="/"
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600"
            >
              Beranda
            </Link>
          </div>

          {message && (
            <div className="mb-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white"
                placeholder="nama@email.com"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Kata Sandi
              </label>
              <input
                id="login-password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3.5 text-sm font-bold text-white shadow-soft hover:opacity-95 transition"
            >
              Masuk ke Workspace
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Belum punya akun?
            <Link href="/register" className="ml-1 font-bold text-indigo-600 hover:text-indigo-500">
              Daftar sekarang
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
