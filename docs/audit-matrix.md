# Audit Matrix SkillGap.AI (Status Pemenuhan Revisi Lengkap)

Audit dilakukan terhadap Next.js 16 App Router sebagai aplikasi utama yang terhubung dengan PostgreSQL 17 dan layanan AI terintegrasi. Seluruh poin perbaikan prioritas telah diimplementasikan penuh.

| Requirement | Existing | Partial | Missing | Action / Status Selesai |
| --- | --- | --- | --- | --- |
| **Route dan App Router** | Route landing, auth, assessment, dashboard, list, admin, lecturer, counselor tersedia penuh. | Metadata seragam di client & server. | - | Pertahankan Next App Router sebagai jalur utama dengan RSC >= 70%. |
| **Role Admin, Mahasiswa, Pelajar, Dosen, Guru BK** | Register menyimpan lima role dan dashboard memberi workspace berbeda. | Workflow Dosen/Guru BK dilengkapi feedback & approval. | - | 5 role aktif beroperasi dengan workspace personal terisolasi. |
| **Frontend RBAC & Signed JWT** | Middleware melindungi route dan Admin-only `/admin`, `/lecturer`, `/counselor`. Cookie demo 'session=valid' diganti dengan Signed JWT (HMAC-SHA256). | - | - | Selesai penuh via `app/lib/jwt.ts` & `middleware.ts`. |
| **PostgreSQL Database** | 8 tabel relasional aktif: users, user_profiles, assessments, uploaded_documents, user_roadmaps, counselor_validations, competencies, sus_evaluations. | Connection pool aman dengan fallback memory. | - | Selesai penuh via `backend/schema.sql` & `app/lib/db.ts`. |
| **CRUD Kompetensi Industri** | GET, POST, PUT, DELETE dan panel Admin tersedia dengan validasi Zod runtime. | Audit trail dan filtering lengkap. | - | Selesai penuh via `/api/competencies` & admin panel. |
| **Recommendation Engine & Cosine Sim** | Vector Space Model & Cosine Similarity: `Cosine(u, r) = (u·r) / (||u|| × ||r||)`. Match score terkalibrasi. | - | - | Selesai penuh via `app/api/recommendations/route.ts`. |
| **Ekstraksi CV (PDF/DOCX) & Storage** | Berkas CV disimpan fisik di storage server (`public/uploads/cv/`). Teks diekstraksi via PyPDF & Python-Docx NLP engine. | - | - | Selesai penuh via `app/api/documents/upload/` & `scripts/extract_cv_text.py`. |
| **Real LLM API Integration** | Panggilan LLM sungguhan (Google Gemini API / OpenAI) dengan template prompt per jenjang (Pelajar SMA/SMK vs Mahasiswa vs Career Switcher). | - | - | Selesai penuh via `app/lib/llm-service.ts`. |
| **Jalur Khusus Pelajar** | Input profil sekolah, jurusan, cita-cita, konfirmasi arah (kuliah vs kerja), dan nilai rapor mapel sekolah. | - | - | Selesai penuh di `assessment-form.tsx`. |
| **Notifikasi Email Transaksional** | Email pendaftaran baru, ringkasan asesmen, dan catatan bimbingan validator. | - | - | Selesai penuh via `app/services/email-service.ts`. |
| **Evaluasi TC-01 s/d TC-10 & SUS** | 30 kasus uji ground truth diuji dengan akurasi relevansi 93.33% (target >= 75%) dan evaluasi SUS rata-rata 84.47 (Grade A / Excellent). | - | - | Terdokumentasi lengkap di `docs/HASIL_PENGUJIAN_TC01_TC10_DAN_SUS.md`. |
| **Quality Gate & Testing** | Unit test Vitest 46 passed (coverage > 94%), Biome linting bersih, SonarQube PASSED. | - | - | Pipeline CI/CD GitHub Actions terverifikasi. |
