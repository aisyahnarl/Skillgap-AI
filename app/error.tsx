'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-red-50 p-8 text-center text-red-700">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Terjadi masalah</h2>
        <p className="mt-3 text-sm text-red-600">Halaman gagal dimuat. Silakan coba lagi.</p>
        <button onClick={() => reset()} className="mt-5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">
          Coba lagi
        </button>
      </div>
    </div>
  );
}
