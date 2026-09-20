# Checklist Kepatuhan Brief Proyek Akhir

Dokumen ini memetakan brief proyek akhir ke implementasi SkillGap.AI. Status `Lengkap` berarti sudah terimplementasi dan teruji secara penuh di basis kode; status `Siap Lampirkan` berarti tinggal mengekspor bukti PDF/Word saat pengumpulan tugas.

| No. | Bab Kompetensi | Implementasi & Bukti Repositori | Status |
|---|---|---|---|
| 1 | **Web Semantik & Aksesibilitas** | HTML5 semantik (`header`, `nav`, `main`, `aside`, `section`, `article`); skip link, `aria-live`, `aria-expanded`, `aria-controls`, caption, dan `scope` tabel tersedia. | Lengkap |
| 2 | **Tailwind CSS Zero-Runtime** | Tailwind v4 digunakan melalui `@tailwindcss/postcss` dengan Rust-based Oxide engine; build Vite menghasilkan CSS production teroptimasi. | Lengkap |
| 3 | **Headless UI & Design System** | CVA tersedia di `src/ui/cva.ts`; komponen modular type-safe (`app/components/ui/`), pemisahan logika aksesibilitas dan styling visual. | Lengkap |
| 4 | **JavaScript ES6+ & Asinkron** | ES modules, DOM event handling, `fetch`, Promise, async/await, array transformations, dan destructuring digunakan secara intensif. | Lengkap |
| 5 | **Strict TypeScript & Zod** | `strict: true` dan `noUncheckedIndexedAccess: true` aktif pada `tsconfig.json`; schema Zod, branded IDs (`StudentId`, `OrderId`, `ProductId`), discriminated unions, dan `z.infer` di `src/schemas.ts` & `app/lib/schemas.ts`. | Lengkap |
| 6 | **Framework UI Modern** | Aplikasi React 19 dengan pola functional component, hooks, auto-memoization, dan render responsif. | Lengkap |
| 7 | **Next.js App Router & SSR** | `app/` directory, nested dashboard layouts, middleware/proxy route guard, metadata API SEO, streaming SSR suspense, dan loading/error boundaries. | Lengkap |
| 8 | **State Separation** | Pemisahan tegas: Client UI State menggunakan Zustand (~0.5 KB) di `app/stores/ui-store.ts`, Server Remote State menggunakan TanStack Query v5 (`staleTime: 60s`, `gcTime: 5m`) di `app/providers.tsx`. | Lengkap |
| 9 | **Build Tools Modern** | Konfigurasi ganda Next.js Turbopack & Vite (`@/` aliasing, `manualChunks` code splitting) serta linter Biome (`biome.json`). | Lengkap |
| 10 | **Core Web Vitals** | LCP <= 2.5s via dimensi eksplisit gambar & `fetchPriority="high"`; INP <= 200ms via Task Chunking menggunakan `scheduler.yield()` di `app/lib/task-scheduler.ts`; CLS <= 0.10 via reservasi dimensi kontainer. | Lengkap |
| 11 | **Client Security & SonarQube** | Mitigasi OWASP Client-Side: pencegahan XSS, CSP headers, isolasi secret, secure cookie flag HTTPS, eliminasi literal credentials (S2068), `rel="noopener noreferrer"`, npm audit 0 vulnerabilities, dan SonarQube Cloud properties. | Lengkap |
| 12 | **API & Type-Safe Data Layer** | Route BFF RESTful (`api/assessments`, `api/competencies`, `api/study-paths`, `api/recommendations`) dengan validasi Zod runtime, RBAC, dan CRUD lengkap. | Lengkap |
| 13 | **DevOps, Edge Deployment & CI/CD** | Live deployment di Edge Cloud Vercel (`https://skillgap-ai-kappa.vercel.app/`), pipeline GitHub Actions di `.github/workflows/ci.yml` menjalankan typecheck, Biome, Vitest test coverage 94%, Vite build, Next.js build, dan SonarQube scan. | Lengkap |
| 14 | **Verifikasi Repositori & Kualitas** | README.md dengan live URL & panduan SonarCloud, `tsconfig.json` strict, `biome.json`, `sonar-project.properties`, test coverage 94.06% (45 tests passed), dan artefak LCOV `coverage/lcov.info`. | Lengkap |

---

## Bukti Pengumpulan UAS

- [x] Tautan Live Production Vercel aktif: [https://skillgap-ai-kappa.vercel.app/](https://skillgap-ai-kappa.vercel.app/) (Tercantum di `README.md`).
- [x] Konfigurasi SonarQube Cloud (`sonar-project.properties`) dengan report path `coverage/lcov.info` dan coverage exclusions tepat.
- [x] Test coverage melampaui standar Quality Gate (Statements: 93.5%, Lines: 94.06%, Functions: 98.68%, Branches: 80.98%).
- [x] File GitHub Actions workflow resmi `.github/workflows/ci.yml`.
- [ ] Lampirkan screenshot / unduhan PDF status **Quality Gate PASSED** dari SonarCloud setelah menghubungkan secret `SONAR_TOKEN`.
- [ ] Lampirkan berkas dokumen laporan Word (`.docx`) dan ceklis kontrak/SRS.
