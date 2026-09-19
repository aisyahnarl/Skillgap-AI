# Checklist Kepatuhan Brief Proyek Akhir

Dokumen ini memetakan brief proyek akhir ke implementasi SkillGap.AI. Status `Ada` berarti sudah tersedia di repository; status `Bukti` berarti perlu dilampirkan saat pengumpulan.

| No. | Bab kompetensi | Implementasi atau bukti repository | Status |
| --- | --- | --- | --- |
| 1 | Web semantik & aksesibilitas | HTML memakai `header`, `nav`, `main`, `aside`, `section`, `article`; skip link, `aria-live`, `aria-expanded`, `aria-controls`, caption, dan `scope` tabel tersedia. | Ada |
| 2 | Tailwind CSS zero-runtime | Tailwind v4 digunakan melalui `@tailwindcss/postcss`; build Vite menghasilkan CSS production. | Ada |
| 3 | Headless UI & design system | CVA tersedia di `src/ui/cva.ts`; komponen visual dan aksesibilitas dipisahkan di aplikasi React. | Ada |
| 4 | JavaScript ES6+ & async | ES modules, DOM event handling, `fetch`, Promise, async/await, filtering, dan state lokal digunakan di `app.js`. | Ada |
| 5 | Strict TypeScript & Zod | `strict` dan `noUncheckedIndexedAccess` aktif; schema Zod, branded IDs, discriminated status, dan `z.infer` tersedia di `src/schemas.ts`. | Ada |
| 6 | Framework UI modern | Aplikasi React 19 dengan pola functional component dan hooks tersedia pada `app/`. | Ada |
| 7 | Next.js App Router & SSR | `app/` directory, nested dashboard layout, middleware route guard, metadata API, dan loading/error boundary tersedia. | Ada |
| 8 | State separation | Zustand dipakai untuk UI state; TanStack Query dipakai untuk remote state dengan `staleTime` dan `gcTime`. | Ada |
| 9 | Build tools | Vite alias `@/`, manual chunks, Biome, TypeScript check, dan production build tersedia. | Ada |
| 10 | Core Web Vitals | Struktur stabil, CSS production, dan metrik render dashboard tersedia. | Ada; bukti Lighthouse/CrUX perlu dilampirkan |
| 11 | Client security & static analysis | CSP/security headers Next.js, DOM API aman dari interpolasi HTML data, `sonar-project.properties`, workflow scan, dan `npm audit` 0 vulnerabilities tersedia. | Ada; laporan SonarQube perlu dilampirkan |
| 12 | API & type-safe data layer | Route BFF assessment, recommendation, dan CRUD kompetensi mendukung validasi Zod, RBAC, serta digunakan oleh halaman utama. | Ada; persistence production perlu dihubungkan |
| 13 | DevOps & CI/CD | `.github/workflows/quality-gate.yml` menjalankan install, typecheck, Biome, test coverage, build Vite, build Next.js, dan SonarQube bersyarat. | Ada; deployment URL perlu diisi |
| 14 | Verifikasi dan pengumpulan | README, checklist, source code, konfigurasi strict/Biome/SonarQube, workflow, test suite, dan coverage report tersedia. | Ada; `.docx`, URL production, dan screenshot Quality Gate perlu dilampirkan |

## Bukti yang harus dilengkapi sebelum deadline

- [ ] Isi URL production Vercel atau Cloudflare Workers di `README.md`.
- [ ] Lampirkan laporan Lighthouse/CrUX untuk LCP <= 2.5s, INP <= 200ms, dan CLS <= 0.10.
- [ ] Jalankan SonarQube Cloud dan lampirkan status Quality Gate `PASSED`.
- [ ] Tambahkan laporan Word `.docx` dan checklist kontrak/SRS.
- [ ] Hubungkan route BFF ke backend REST production bila backend sudah tersedia.
- [ ] Perluas coverage ke UI end-to-end jika dosen mensyaratkan coverage seluruh source, bukan hanya domain/API.
- [ ] Review [audit matrix](audit-matrix.md) bersama dokumen SRS dan tandai bukti final.

Deadline brief: **20 September 2026, 23.59 WIB**.
