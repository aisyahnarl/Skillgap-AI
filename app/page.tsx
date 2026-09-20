import Link from 'next/link';

const stats = [
  { value: '12.4K', label: 'Pengguna aktif' },
  { value: '3.2K', label: 'Assessment berjalan' },
  { value: '87%', label: 'Tingkat kecocokan' },
  { value: '1.8K', label: 'Roadmap terselesaikan' },
];

const features = [
  { title: 'Login & Autentikasi', text: 'Masuk dengan email dan password yang aman untuk akses sesi personal dan dashboard yang disesuaikan.' },
  { title: 'Registrasi & Jenjang', text: 'Pendaftaran lengkap dengan peran, jenjang pendidikan, serta alur profil yang berbeda untuk mahasiswa, pelajar, dosen, dan guru BK.' },
  { title: 'Unggah CV / Portofolio', text: 'Mahasiswa dapat mengunggah dokumen PDF/DOCX untuk sumber data kompetensi dan pengalaman kerja.' },
  { title: 'NLP Extraction', text: 'Skill, pengalaman, dan sertifikasi otomatis terekstraksi dari dokumen CV/portofolio menggunakan pendekatan NLP.' },
  { title: 'Profil Alternatif Pelajar', text: 'Pelajar SMA/SMK cukup mengisi minat, bakat, dan nilai rapor sebagai pengganti pengalaman kerja formal.' },
  { title: 'Kuesioner Minat & Skill', text: 'Menyediakan self-assessment yang dibedakan bahasa dan konteksnya sesuai jenjang pengguna.' },
];

const steps = [
  'Daftar akun dan pilih jenjang pendidikan',
  'Isi profil, minat, atau unggah CV',
  'AI menganalisis kompetensi dan kebutuhan',
  'Lihat roadmap karier yang terpersonalisasi',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f5f7ff_0%,_#edf4ff_35%,_#f8fafc_100%)] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-lg font-black text-white shadow-soft">S</span>
            <div>
              <p className="text-lg font-black tracking-tight text-slate-900">SkillGap.AI</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">Akselerasi Karier & Kompetensi</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <Link href="#fitur" className="transition hover:text-indigo-600">Fitur</Link>
            <Link href="#alur" className="transition hover:text-indigo-600">Alur</Link>
            <Link href="#roadmap" className="transition hover:text-indigo-600">Roadmap</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">Masuk</Link>
            <Link href="/register" className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:brightness-105">Daftar</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-indigo-700">Panduan Karier Cerdas</span>
            <h1 className="mt-6 max-w-xl text-4xl font-black leading-[1.05] tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-6xl">
              Temukan potensi terbaikmu dengan teknologi AI yang personal.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              SkillGap.AI membantu mahasiswa, pelajar, dan stakeholder melihat kesenjangan skill, minat, serta roadmap pengembangan yang paling cocok untuk masa depan karier.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:brightness-105">Mulai sekarang</Link>
              <Link href="/assessment" className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-600">Coba assessment</Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              {['Mahasiswa', 'Pelajar', 'Dosen', 'Guru BK'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-indigo-200/60 blur-3xl" />
            <div className="absolute -right-6 bottom-10 h-44 w-44 rounded-full bg-sky-200/70 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-soft">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
                alt="Mahasiswa berdiskusi"
                width={1200}
                height={420}
                fetchPriority="high"
                className="h-[420px] w-full rounded-[24px] object-cover"
              />
              <div className="absolute bottom-8 left-8 right-8 rounded-[24px] border border-white/40 bg-white/80 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Profil</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">Nadia A.</h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">Mahasiswa</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-indigo-50 p-3">
                    <p className="text-xs text-indigo-600">Skor Kecocokan</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">87%</p>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-3">
                    <p className="text-xs text-sky-600">Roadmap</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">4 tahap</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-soft">
              <p className="text-3xl font-black tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">Kenapa kami?</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Platform yang memadukan data, AI, dan kebutuhan karier nyata.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {['Analisis Kesenjangan Skill', 'Rekomendasi Karier & Studi', 'Roadmap Belajar Interaktif', 'Wawasan Berbasis Portofolio'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
              alt="Tim bekerja"
              width={900}
              height={600}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section id="fitur" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">Fitur utama</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Semua kebutuhan skill assessment dalam satu platform</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-lg font-black text-white">✓</div>
              <h3 className="text-xl font-black text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="alur" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-300">Alur kerja</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Dari profil sampai roadmap karier</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-sm font-black text-indigo-200">0{index + 1}</div>
                <p className="text-base font-semibold leading-7 text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-soft lg:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-indigo-600">Rekomendasi hari ini</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Roadmap karier yang dekat dengan kebutuhan masa depan.</h2>
              <p className="mt-4 max-w-lg text-base leading-8 text-slate-600">
                Platform ini membantu pengguna memahami posisi mereka saat ini, jalur karier yang paling relevan, serta kompetensi yang perlu dikembangkan agar lebih siap menghadapi dunia kerja dan pendidikan lanjutan.
              </p>
            </div>

            <div className="rounded-[28px] bg-gradient-to-br from-indigo-600 to-sky-500 p-6 text-white shadow-soft">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-100">Prioritas</p>
              <h3 className="mt-4 text-3xl font-black">Data Science</h3>
              <ul className="mt-4 space-y-3 text-sm text-indigo-50">
                <li>• Prioritaskan SQL, Python, dan statistik dasar</li>
                <li>• Tingkatkan portofolio proyek data nyata</li>
                <li>• Fokus pada komunikasi insight bisnis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 SkillGap.AI. Semua hak dilindungi.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-indigo-600">Masuk</Link>
            <Link href="/register" className="hover:text-indigo-600">Daftar</Link>
            <Link href="/assessment" className="hover:text-indigo-600">Asesmen</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
