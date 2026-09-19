# Audit Matrix SkillGap.AI

Audit dilakukan terhadap Next.js App Router sebagai aplikasi utama. Folder `src/`, halaman HTML root, dan Vite legacy tetap dipertahankan untuk kompatibilitas, tetapi belum menjadi sumber data utama.

| Requirement | Existing | Partial | Missing | Action |
| --- | --- | --- | --- | --- |
| Route dan App Router | Route landing, auth, assessment, dashboard, list, admin tersedia. | Metadata belum seragam di client page. | - | Pertahankan Next App Router sebagai jalur utama. |
| Role Admin, Mahasiswa, Pelajar, Dosen, Guru BK | Register menyimpan lima role dan dashboard memberi workspace berbeda. | Workflow Dosen/Guru BK masih berupa monitoring/data list. | Dashboard khusus penuh per role. | Perluas workflow pendampingan setelah data production tersedia. |
| Frontend RBAC | Middleware melindungi route dan Admin-only `/admin`. | Cookie sesi masih demo client-managed. | Session server/database yang tidak dapat dipalsukan. | Integrasikan identity provider atau session store production. |
| API dan state | BFF assessment, competency CRUD, recommendation API; TanStack Query dan Zustand tersedia. | Store masih in-memory dan reset saat restart. | Database production dan invalidation seluruh feature. | Hubungkan repository layer ke PostgreSQL/Supabase/ORM. |
| CRUD Kompetensi Industri | GET, POST, PUT, DELETE dan panel Admin tersedia. | Persistence masih process memory. | Audit trail dan pagination. | Tambahkan database dan policy audit. |
| Recommendation engine | Hasil dihitung dari target, selected skills, questionnaire, skill gap, dan katalog kompetensi. | NLP/CV parsing belum membaca isi file. | LLM/NLP extraction production. | Tambahkan worker upload/parser dan model provider terisolasi. |
| Jalur Mahasiswa | Profil, target industri, questionnaire, roadmap, sertifikasi, career fit. | CV baru menyimpan metadata nama/ukuran. | Portfolio extraction dan history multi-assessment. | Tambahkan file storage, parser, dan assessment history. |
| Jalur Pelajar | Jenjang dan output pelajar dibedakan pada recommendation/dashboard. | Input sekolah, jurusan, cita-cita, dan rapor belum disimpan lengkap. | Rekomendasi jurusan/studi berbasis data rapor. | Tambahkan schema student profile khusus pelajar. |
| UI/UX | Visual system konsisten, responsive, accessible basics. | Beberapa page-level component masih duplikatif. | Design system yang dipakai lintas semua page. | Ekstrak komponen shared secara bertahap. |
| Quality gate | Typecheck, Biome, Vitest coverage, Vite/Next build, npm audit 0 vulnerabilities. | Coverage fokus schema/API. | E2E dan visual regression. | Tambahkan Playwright untuk auth, CRUD, dan assessment flow. |
| Deployment | CI workflow dan SonarQube hook tersedia. | URL production dan report eksternal belum diisi. | Bukti Lighthouse/CrUX dan SonarQube PASSED. | Deploy lalu lampirkan artefak pengumpulan. |

## Perubahan yang sudah diterapkan

- `/api/competencies` dan `/api/competencies/[id]` dengan validasi Zod dan RBAC Admin.
- `/api/recommendations` dengan input assessment tervalidasi dan rekomendasi sertifikasi dari katalog kompetensi.
- `/api/assessments` digunakan oleh Data List dan dilindungi sesi.
- Middleware melindungi `/admin` berdasarkan role sesi.
- Assessment mengarahkan hasil API ke dashboard.
- Data List memiliki pencarian, filter, dan detail dari data API.
- Dashboard menampilkan workspace sesuai role.
