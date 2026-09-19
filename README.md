# SkillGap.AI

Platform assessment skill gap dengan halaman HTML statis dan aplikasi Next.js App Router.

Toolchain utama: Next.js 16, React 19, Tailwind CSS v4, TypeScript strict, Zod, Zustand, TanStack Query v5, Vite, dan Biome.

## Menjalankan proyek

```bash
npm ci
npm run dev
```

Aplikasi Next.js berjalan di `http://localhost:3001`.

## Quality checks

```bash
npm run typecheck:vite
npm run biome:check
npm run test:coverage
npm run build:vite
npm run build
```

Workflow GitHub Actions menjalankan typecheck, Biome, automated tests dengan coverage, quality gate Vite, build Next.js, dan scan SonarQube jika `SONAR_HOST_URL` serta `SONAR_TOKEN` tersedia sebagai repository secrets.

Test domain schema dan BFF saat ini lulus dengan coverage 100% pada file yang dicakup konfigurasi Vitest.

## Deployment

- Production URL: `TODO: isi URL Vercel atau Cloudflare Workers`
- SonarQube Quality Gate report: `TODO: lampirkan screenshot atau PDF PASSED`
- Laporan proyek akhir: `TODO: lampirkan dokumen .docx`

## Dokumen kepatuhan

Lihat [checklist kepatuhan proyek](docs/project-compliance-checklist.md) untuk pemetaan 14 bab, bukti implementasi, dan item yang masih perlu dilengkapi sebelum pengumpulan.

Deadline pada brief: **20 September 2026, 23.59 WIB**.
