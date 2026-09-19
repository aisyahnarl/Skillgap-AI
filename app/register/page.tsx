'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService, type UserRole } from '../services/auth-service';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Mahasiswa' as UserRole,
    jenjang: 'Mahasiswa',
    birthDate: '',
  });
  const [parentalConsent, setParentalConsent] = useState(false);
  const [error, setError] = useState('');

  const isPelajar = form.role === 'Pelajar' || form.jenjang === 'Pelajar SMA-SMK Sederajat';
  const age = form.birthDate
    ? Math.floor((Date.now() - new Date(form.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : undefined;
  const isUnder18 = isPelajar && (age !== undefined ? age < 18 : true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError('Semua field wajib diisi.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (isUnder18 && !parentalConsent) {
      setError('Persetujuan orang tua/wali wajib dicentang untuk pengguna pelajar di bawah 18 tahun (UU PDP No. 27/2022).');
      return;
    }

    const res = authService.createUser({
      name: form.name,
      email: form.email.toLowerCase(),
      password: form.password,
      role: form.role,
      jenjang: form.jenjang,
      birthDate: form.birthDate || undefined,
      age: age,
      parentalConsent: isUnder18 ? parentalConsent : undefined,
    });

    if (!res.success) {
      setError(res.message || 'Pendaftaran gagal.');
      return;
    }

    setError('');
    router.push('/login?registered=1');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#f5f7ff_0%,_#edf4ff_35%,_#f8fafc_100%)] p-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
        <div className="grid lg:grid-cols-2">
          <section className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-sky-500 p-8 text-white">
            <div className="flex h-full flex-col justify-between">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 font-black text-white">S</span>
                SkillGap.AI
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-indigo-100">Registrasi</p>
                <h1 className="mt-4 text-4xl font-black leading-tight text-white">Buat akun baru dan pilih peran yang tepat.</h1>
                <p className="mt-4 text-base text-indigo-100">Daftar dengan peran dan jenjang yang sesuai agar sistem menyesuaikan profil serta output rekomendasi.</p>
              </div>
            </div>
          </section>

          <section className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">Pendaftaran Akun</p>
                <h2 className="mt-2 text-3xl font-black text-slate-900">Buat akun</h2>
              </div>
              <Link href="/" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">Beranda</Link>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Nama lengkap</label>
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white"
                  placeholder="nama@email.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Kata Sandi</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Peran (Role)</label>
                  <select
                    value={form.role}
                    onChange={(event) => setForm({ ...form, role: event.target.value as UserRole })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white font-medium"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Pelajar">Pelajar</option>
                    <option value="Dosen">Dosen</option>
                    <option value="Guru BK">Guru BK</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Jenjang</label>
                  <select
                    value={form.jenjang}
                    onChange={(event) => setForm({ ...form, jenjang: event.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white font-medium"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Pelajar SMA-SMK Sederajat">Pelajar SMA-SMK Sederajat</option>
                    <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                    <option value="Guru BK">Guru BK</option>
                  </select>
                </div>
              </div>

              {isPelajar && (
                <div className="space-y-3 rounded-2xl border border-indigo-100 bg-slate-50 p-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Tanggal Lahir (Verifikasi Usia Pelajar)
                    </label>
                    <input
                      type="date"
                      value={form.birthDate}
                      onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
                      required={isPelajar}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none"
                    />
                    {age !== undefined && (
                      <p className="mt-1 text-xs text-slate-500">
                        Usia terdeteksi: <strong>{age} tahun</strong> {age < 18 ? '(Di bawah umur / Pelajar)' : '(Dewasa)'}
                      </p>
                    )}
                  </div>

                  {isUnder18 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-950">
                        <span>🛡️</span>
                        <span>Persetujuan Orang Tua / Wali (UU PDP No. 27 Tahun 2022)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        Sesuai regulasi pelindungan data pribadi anak, pengumpulan data minat dan nilai akademik pelajar di bawah 18 tahun wajib atas izin orang tua atau wali.
                      </p>
                      <label className="flex items-start gap-2.5 pt-1 cursor-pointer font-medium text-slate-800">
                        <input
                          type="checkbox"
                          checked={parentalConsent}
                          onChange={(e) => setParentalConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded accent-indigo-600"
                          required
                        />
                        <span>
                          Saya menyatakan telah memperoleh izin dan persetujuan resmi dari orang tua/wali untuk mendaftar di platform SkillGap.AI.
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3.5 text-sm font-bold text-white shadow-soft hover:opacity-95 transition">
                Daftar Sekarang
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600">
              Sudah punya akun?
              <Link href="/login" className="ml-1 font-bold text-indigo-600 hover:underline">Masuk</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
