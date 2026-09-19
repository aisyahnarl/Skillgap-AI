'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService, type UserProfile } from '../services/auth-service';

type Role = 'Admin' | 'Mahasiswa' | 'Pelajar' | 'Dosen' | 'Guru BK';

type NavigationItem = {
  label: string;
  href: string;
  icon: string;
};

const navigationByRole: Record<Role, NavigationItem[]> = {
  Admin: [
    { label: 'Ringkasan Dashboard', href: '/admin', icon: '▦' },
    { label: 'Manajemen Pengguna', href: '/admin/users', icon: '◎' },
    { label: 'Kompetensi Industri', href: '/admin/competencies', icon: '◇' },
    { label: 'Jalur Studi Lanjut', href: '/admin/study-paths', icon: '↗' },
    { label: 'Asesmen & Analisis', href: '/assessment', icon: '◌' },
    { label: 'Laporan Platform', href: '/admin/reports', icon: '▤' },
    { label: 'Evaluasi Usabilitas (SUS)', href: '/dashboard/evaluasi-sus', icon: '★' },
    { label: 'Profil & Pengaturan', href: '/dashboard/profile', icon: '⚙' },
  ],
  Mahasiswa: [
    { label: 'Ringkasan', href: '/dashboard', icon: '▦' },
    { label: 'Asesmen Mandiri', href: '/assessment', icon: '◌' },
    { label: 'Peta Kesenjangan Skill', href: '/dashboard/skill-gap', icon: '⌁' },
    { label: 'Roadmap Belajar', href: '/dashboard/roadmap', icon: '↗' },
    { label: 'Rekomendasi Sertifikasi', href: '/dashboard/certifications', icon: '◇' },
    { label: 'Lowongan Kerja Cocok', href: '/dashboard/jobs', icon: '💼' },
    { label: 'Riwayat Asesmen', href: '/dashboard/history', icon: '◷' },
    { label: 'Evaluasi Usabilitas (SUS)', href: '/dashboard/evaluasi-sus', icon: '★' },
    { label: 'Profil Saya', href: '/dashboard/profile', icon: '◎' },
  ],
  Pelajar: [
    { label: 'Ringkasan', href: '/dashboard', icon: '▦' },
    { label: 'Asesmen Minat', href: '/assessment', icon: '◌' },
    { label: 'Peta Minat & Bakat', href: '/dashboard/skill-gap', icon: '⌁' },
    { label: 'Langkah Belajar', href: '/dashboard/roadmap', icon: '↗' },
    { label: 'Sertifikasi Kejuruan', href: '/dashboard/certifications', icon: '◇' },
    { label: 'Riwayat Minat', href: '/dashboard/history', icon: '◷' },
    { label: 'Evaluasi Usabilitas (SUS)', href: '/dashboard/evaluasi-sus', icon: '★' },
    { label: 'Profil Saya', href: '/dashboard/profile', icon: '◎' },
  ],
  Dosen: [
    { label: 'Ringkasan Bimbingan', href: '/lecturer', icon: '▦' },
    { label: 'Mahasiswa Bimbingan', href: '/lecturer', icon: '◎' },
    { label: 'Peta Kompetensi', href: '/dashboard/skill-gap', icon: '⌁' },
    { label: 'Laporan Bimbingan', href: '/admin/reports', icon: '▤' },
    { label: 'Profil Dosen', href: '/dashboard/profile', icon: '⚙' },
  ],
  'Guru BK': [
    { label: 'Ringkasan Konseling', href: '/counselor', icon: '▦' },
    { label: 'Pelajar Bimbingan', href: '/counselor', icon: '◎' },
    { label: 'Peta Minat Siswa', href: '/dashboard/skill-gap', icon: '⌁' },
    { label: 'Laporan Konseling', href: '/admin/reports', icon: '▤' },
    { label: 'Profil Guru BK', href: '/dashboard/profile', icon: '⚙' },
  ],
};

export default function RoleSidebar({ fixedRole }: { fixedRole?: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role>(fixedRole ?? 'Mahasiswa');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (!fixedRole && user.role && user.role in navigationByRole) {
        setRole(user.role as Role);
      }
    } else if (!fixedRole) {
      try {
        const saved = JSON.parse(localStorage.getItem('skillgap-auth') ?? '{}') as { role?: Role };
        if (saved.role && saved.role in navigationByRole) setRole(saved.role);
      } catch {
        setRole('Mahasiswa');
      }
    }
  }, [fixedRole]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  const items = navigationByRole[fixedRole ?? role];
  const roleLabel = fixedRole ?? role;

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href={roleLabel === 'Admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-sm font-black text-white shadow-soft">
            S
          </span>
          <div>
            <span className="text-sm font-black text-slate-900 block leading-none">SkillGap.AI</span>
            <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{roleLabel}</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
            title="Keluar Akun"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Keluar</span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="role-navigation"
            aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Drawer */}
      <aside
        id="role-navigation"
        className={`${
          open ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-40 flex flex-col justify-between w-72 border-r border-slate-200 bg-white p-5 shadow-2xl transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:translate-x-0 lg:border-b-0 lg:shadow-none`}
        aria-label={`Navigasi ${roleLabel}`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <Link href={roleLabel === 'Admin' ? '/admin' : '/dashboard'} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-lg font-black text-white shadow-soft">
                S
              </span>
              <div>
                <p className="text-lg font-black text-slate-900">SkillGap.AI</p>
                <p className="text-xs text-slate-500">Ruang Kerja {roleLabel}</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
              aria-label="Tutup sidebar"
            >
              ✕
            </button>
          </div>

          <nav className="mt-6 flex-1 space-y-1.5 overflow-y-auto pr-1" aria-label="Navigasi utama">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs ${
                      active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                    aria-hidden="true"
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Area & Logout Button */}
        <div className="mt-4 border-t border-slate-200 pt-4 space-y-2.5">
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 p-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : roleLabel.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800 leading-tight">
                {currentUser?.name || roleLabel}
              </p>
              <p className="truncate text-[10px] text-slate-500">{currentUser?.email || roleLabel}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 hover:text-rose-700 active:scale-[0.98]"
            title="Keluar dari akun"
          >
            <span className="text-sm">🚪</span>
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
