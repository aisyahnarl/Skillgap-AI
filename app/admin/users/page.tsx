'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { authService, type UserProfile, type UserRole } from '../../services/auth-service';
import { SearchFilter, ConfirmDialog, Toast } from '../../components/ui';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [jenjangFilter, setJenjangFilter] = useState('all');

  // Modals state
  const [detailUser, setDetailUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; role: UserRole; jenjang: string }>({
    name: '',
    role: 'Mahasiswa',
    jenjang: 'Mahasiswa',
  });
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadUsers = () => {
    const list = authService.getAllUsers();
    setUsers(list);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchJenjang =
        jenjangFilter === 'all'
          ? true
          : jenjangFilter === 'Mahasiswa'
          ? u.jenjang.toLowerCase().includes('mahasiswa')
          : u.jenjang.toLowerCase().includes('sma') || u.jenjang.toLowerCase().includes('smk') || u.jenjang.toLowerCase().includes('pelajar');
      return matchQuery && matchRole && matchJenjang;
    });
  }, [users, query, roleFilter, jenjangFilter]);

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      jenjang: user.jenjang,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    authService.updateUser(editingUser.email, {
      name: editForm.name,
      role: editForm.role,
      jenjang: editForm.jenjang,
    });

    loadUsers();
    setEditingUser(null);
    setToastMessage('Data pengguna berhasil diperbarui!');
  };

  const handleConfirmDelete = () => {
    if (!deletingEmail) return;
    authService.deleteUser(deletingEmail);
    loadUsers();
    setDeletingEmail(null);
    if (detailUser?.email === deletingEmail) setDetailUser(null);
    setToastMessage('Pengguna berhasil dihapus dari sistem.');
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* Header */}
      <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700"
        >
          ← Kembali ke Dashboard Admin
        </Link>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-indigo-600">
              Kontrol Akses Pengguna
            </span>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Manajemen Pengguna
            </h1>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Kelola akun pengguna, ubah hak akses (peran), atur jenjang pendidikan, serta pantau aktivitas pengguna platform.
            </p>
          </div>
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 text-center min-w-[160px]">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Total Pengguna
            </p>
            <p className="text-3xl font-black text-slate-900 mt-1">{users.length}</p>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <SearchFilter
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder="Cari berdasarkan nama atau email..."
          filterValue={roleFilter}
          onFilterChange={setRoleFilter}
          filterLabel="Filter Peran Pengguna"
          filterOptions={[
            { label: 'Semua Peran', value: 'all' },
            { label: 'Mahasiswa', value: 'Mahasiswa' },
            { label: 'Pelajar', value: 'Pelajar' },
            { label: 'Dosen', value: 'Dosen' },
            { label: 'Guru BK', value: 'Guru BK' },
            { label: 'Admin', value: 'Admin' },
          ]}
          secondaryFilterValue={jenjangFilter}
          onSecondaryFilterChange={setJenjangFilter}
          secondaryFilterLabel="Filter Jenjang"
          secondaryFilterOptions={[
            { label: 'Semua Jenjang', value: 'all' },
            { label: 'Mahasiswa', value: 'Mahasiswa' },
            { label: 'SMA / SMK', value: 'SMA/SMK' },
          ]}
        />

        {/* User Table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5">Nama</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Jenjang</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    Tidak ada pengguna yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const roleBadge =
                    u.role === 'Admin'
                      ? 'bg-rose-100 text-rose-800'
                      : u.role === 'Dosen'
                      ? 'bg-emerald-100 text-emerald-800'
                      : u.role === 'Guru BK'
                      ? 'bg-amber-100 text-amber-800'
                      : u.role === 'Pelajar'
                      ? 'bg-violet-100 text-violet-800'
                      : 'bg-sky-100 text-sky-800';

                  return (
                    <tr key={u.email} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${roleBadge}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{u.jenjang}</td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailUser(u)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(u)}
                            className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                          >
                            Edit
                          </button>
                          {u.role !== 'Admin' && (
                            <button
                              type="button"
                              onClick={() => setDeletingEmail(u.email)}
                              className="rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit User Modal */}
      {editingUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Perbarui Profil Pengguna
                </span>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Edit Data Pengguna
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Akun
                </label>
                <input
                  type="text"
                  disabled
                  value={editingUser.email}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800 focus:bg-white"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Pelajar">Pelajar</option>
                    <option value="Dosen">Dosen</option>
                    <option value="Guru BK">Guru BK</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Jenjang
                  </label>
                  <select
                    value={editForm.jenjang}
                    onChange={(e) => setEditForm({ ...editForm, jenjang: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-800 focus:bg-white"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Pelajar SMA-SMK Sederajat">Pelajar SMA-SMK Sederajat</option>
                    <option value="Dosen Pembimbing">Dosen Pembimbing</option>
                    <option value="Guru BK">Guru BK</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2 text-xs font-bold text-white shadow-soft"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail User Modal */}
      {detailUser && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                  User Record
                </span>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Detail Pengguna
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <dl className="mt-5 space-y-3.5 text-sm">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama</dt>
                <dd className="mt-0.5 font-bold text-slate-900">{detailUser.name}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</dt>
                <dd className="mt-0.5 font-semibold text-slate-700">{detailUser.email}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role</dt>
                  <dd className="mt-0.5 font-bold text-indigo-700">{detailUser.role}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Jenjang</dt>
                  <dd className="mt-0.5 font-bold text-slate-700">{detailUser.jenjang}</dd>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terdaftar Sejak</dt>
                <dd className="mt-0.5 text-slate-600">
                  {detailUser.createdAt
                    ? new Date(detailUser.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Akun Bawaan Sistem'}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailUser(null)}
                className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingEmail)}
        title="Hapus Pengguna?"
        message={`Apakah Anda yakin ingin menghapus akun ${deletingEmail}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEmail(null)}
      />
    </main>
  );
}
