'use client';

import { useAssessmentQuery, useCoursesQuery, useCreateAssessmentMutation } from '../lib/queries';
import { useUIStore } from '../stores/ui-store';

export function ServerStateDemo() {
  const { data, isLoading, isError, error } = useAssessmentQuery();
  const { data: courses, isLoading: loadingCourses } = useCoursesQuery();
  const mutation = useCreateAssessmentMutation();
  const { setActiveModal } = useUIStore();

  if (isLoading) {
    return (
      <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-5/6 rounded bg-slate-200" />
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mt-8 rounded-[28px] border border-red-200 bg-red-50 p-5 text-red-700">
        Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
      </section>
    );
  }

  return (
    <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Server State</p>
          <h3 className="text-xl font-black text-slate-900">TanStack Query</h3>
        </div>
        <button onClick={() => setActiveModal('create-assessment')} className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white">
          Tambah data
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {!data || data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Data assessment masih kosong.
          </div>
        ) : (
          data.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-600">{item.target} • {item.category}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{item.match}</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-500">Course catalog</p>
        {loadingCourses ? (
          <div className="mt-3 text-sm text-slate-500">Memuat katalog kursus…</div>
        ) : !courses || courses.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Katalog kosong.</div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {courses.map((course) => (
              <span key={course.id} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                {course.title}
              </span>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() =>
          mutation.mutate({
            name: 'Budi Santoso',
            category: 'Mahasiswa',
            target: 'Cyber Security',
          })
        }
        className="mt-6 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
      >
        {mutation.isPending ? 'Menyimpan...' : 'Mutasi data'}
      </button>
    </section>
  );
}
