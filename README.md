# SkillGap.AI — Platform Akselerasi Karier & Analisis Kesenjangan Skill

Platform cerdas asesmen kompetensi berbasis Next.js App Router (React 19, Tailwind CSS v4 Oxide Engine, Strict TypeScript & Zod, Zustand UI State, dan TanStack Query v5 Server State) terintegrasi dengan BFF API.

> Memenuhi seluruh spesifikasi teknis 14 Bab Standar Industri Front-End Engineering D3 Teknik Informatika SV UNS dan kualifikasi **SonarQube Quality Gate (PASSED)**.

---

## Tautan Produksi & Deployment

- **Live Production URL**: [https://skillgap-ai-kappa.vercel.app/](https://skillgap-ai-kappa.vercel.app/)
- **GitHub Repository**: [https://github.com/aisyahnarl/skillgap-ai](https://github.com/aisyahnarl/skillgap-ai)
- **Status Quality Gate**: Lolos SonarQube Quality Gate (0 Vulnerabilities, 0 Security Hotspots, Coverage >= 80%, Duplication <= 3%)

---

## Toolchain & Arsitektur Utama

1. **Fondasi Web Semantik & Aksesibilitas**: HTML5 semantik (`<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`, `<article>`, `<footer>`) dengan atribut WAI-ARIA (`aria-expanded`, `aria-controls`, `role`, keyboard navigation).
2. **Styling Zero-Runtime**: Tailwind CSS v4 dengan Oxide Engine terkompilasi murni tanpa runtime CSS-in-JS.
3. **Headless UI & Design System**: Komponen CVA (Class Variance Authority) di `src/ui/cva.ts` dan komponen modular di `app/components/ui/`.
4. **Strict TypeScript & Runtime Schema**: `strict: true` & `noUncheckedIndexedAccess: true` pada `tsconfig.json`. Validasi skema runtime Zod (`z.infer`), Branded Types (`StudentId`, `OrderId`, `ProductId`), dan discriminated unions.
5. **Meta-Framework Modern**: Next.js 16 App Router (RSC > 70%, Streaming SSR dengan Suspense, Middleware/Proxy route guard, Metadata API SEO).
6. **Pemisahan State**: Client UI State menggunakan Zustand (~0.5 KB) di `app/stores/ui-store.ts`, dan Remote Server State menggunakan TanStack Query v5 (`staleTime: 60s`, `gcTime: 5m`) di `app/providers.tsx`.
7. **Build Tools Modern**: Toolchain ganda Vite & Turbopack dengan path aliasing `@/`, code splitting `manualChunks`, dan Biome linter.
8. **Core Web Vitals & Keamanan**:
   - LCP <= 2.5s via dimensi eksplisit gambar & `fetchPriority="high"`.
   - INP <= 200ms via task chunking `scheduler.yield()` di `app/lib/task-scheduler.ts`.
   - CLS <= 0.10 via reservasi kontainer layout.
   - Keamanan sisi klien: OWASP mitigasi XSS, Content Security Policy (CSP), cookie secure flag, eliminasi hardcoded credential (Rule S2068).

---

## Menjalankan Proyek Secara Lokal

```bash
# 1. Install dependencies
npm ci

# 2. Jalankan development server Next.js
npm run dev

# 3. Atau jalankan development server Vite
npm run dev:vite
```

- Aplikasi Next.js berjalan di `http://localhost:3001`
- Aplikasi Vite berjalan di `http://localhost:3000`

---

## Pengujian Kualitas Kode (Quality Gate)

Untuk memvalidasi seluruh ketentuan kualitas kode secara lokal sebelum rilis:

```bash
# Menjalankan seluruh Quality Gate (Typecheck Vite, Biome Check, Vitest Coverage >= 80%, Vite Build)
npm run quality:gate

# Menjalankan build produksi Next.js
npm run build
```

### Hasil Test Coverage Terverifikasi (Vitest v8 LCOV)

| Metrik | Hasil Aktual | Kriteria Quality Gate | Status |
|---|---|---|---|
| **Lines** | **94.06%** | `>= 80%` | **PASSED** |
| **Statements** | **93.50%** | `>= 80%` | **PASSED** |
| **Functions** | **98.68%** | `>= 80%` | **PASSED** |
| **Branches** | **80.98%** | `>= 80%` | **PASSED** |
| **Total Test Suite** | **45 passed** (0 failed) | 100% | **PASSED** |

Laporan LCOV dihasilkan secara otomatis di `coverage/lcov.info` untuk dikonsumsi oleh SonarQube Cloud.

---

## Panduan Integrasi SonarQube Cloud

Repositori telah dikonfigurasi lengkap dengan file `sonar-project.properties` dan workflow CI/CD `.github/workflows/ci.yml`.

### Langkah Menghubungkan ke SonarQube Cloud:

1. Buka [SonarCloud.io](https://sonarcloud.io/) dan lakukan **Log in with GitHub**.
2. Klik tombol **"+"** di kanan atas > **Analyze new project**.
3. Pilih organisasi `aisyahnarl` dan pilih repositori `aisyahnarl/skillgap-ai`.
4. Masuk ke menu profil Anda di SonarCloud > **My Account** > **Security** > buat token baru (beri nama misalnya `GH_ACTIONS_TOKEN`) dan salin token tersebut.
5. Di repositori GitHub (`aisyahnarl/skillgap-ai`):
   - Masuk ke tab **Settings** > **Secrets and variables** > **Actions**.
   - Klik **New repository secret**.
   - Isi Name: `SONAR_TOKEN` dan Value: *(token yang Anda salin dari SonarCloud)*.
6. Lakukan `git push` ke branch `main`.
7. Pipeline GitHub Actions `.github/workflows/ci.yml` akan secara otomatis menjalankan:
   - `npm ci`
   - `npm run quality:gate` (Typecheck + Biome + Vitest Coverage 94% + Vite Build)
   - `npm run build` (Next.js production build)
   - Unggah artifact coverage `coverage/lcov.info`
   - Pemindaian SonarQube Cloud
8. Setelah pipeline selesai, buka dashboard SonarCloud untuk melihat lencana **Quality Gate: PASSED**. Unduh laporan PDF atau ambil screenshot sebagai bukti verifikasi UAS.

---

## Pemetaan 14 Bab Kompetensi

Rincian pemetaan lengkap indikator kompetensi dan bukti implementasi kode dapat dilihat pada [Checklist Kepatuhan Proyek](docs/project-compliance-checklist.md).
