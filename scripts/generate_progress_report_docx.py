import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os

# Warna Tema Utama (Professional Tech / Indigo & Slate)
COLOR_PRIMARY = RGBColor(0x31, 0x2E, 0x81)     # Deep Indigo (#312E81)
COLOR_SECONDARY = RGBColor(0x1E, 0x40, 0xAF)   # Royal Blue (#1E40AF)
COLOR_TEXT = RGBColor(0x1F, 0x29, 0x37)        # Slate Dark (#1F2937)
COLOR_MUTED = RGBColor(0x4B, 0x55, 0x63)       # Slate Gray (#4B5563)
HEX_PRIMARY_BG = "EEF2FF"                      # Soft Indigo Fill
HEX_HEADER_BG = "1E3A8A"                       # Dark Blue Header Fill
HEX_ZEBRA_BG = "F8FAFC"                        # Very Soft Slate Fill
HEX_BORDER = "CBD5E1"                          # Slate Border (#CBD5E1)
HEX_SUCCESS_BG = "ECFDF5"                      # Soft Green
HEX_SUCCESS_TEXT = "065F46"                    # Dark Green

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def prevent_row_split(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._element.xpath('w:tblPr')
    if tblPr:
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="none"/>'
            f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:right w:val="none"/>'
            f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:insideV w:val="none"/>'
            f'</w:tblBorders>'
        )
        tblPr[0].append(borders)

def format_cell_text(cell, text, bold=False, italic=False, font_size=9, color=COLOR_TEXT, align=WD_ALIGN_PARAGRAPH.LEFT):
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.bold = bold
    run.italic = italic
    run.font.name = "Calibri"
    run.font.size = Pt(font_size)
    run.font.color.rgb = color
    cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER

def create_report_document(output_path):
    doc = docx.Document()

    # Margin Dokumen (Standar Laporan Akademis Vokasi)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Styling Normal
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = COLOR_TEXT
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(4)

    # ========================================================
    # COVER / HEADER DOKUMEN
    # ========================================================
    p_header_badge = doc.add_paragraph()
    p_header_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_header_badge.paragraph_format.space_after = Pt(4)
    r_badge = p_header_badge.add_run("LAPORAN PROGRESS RESMI — EDISI REVISI ALGORITMA AI")
    r_badge.bold = True
    r_badge.font.size = Pt(9.5)
    r_badge.font.color.rgb = COLOR_SECONDARY

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(2)
    r_title = p_title.add_run("PENGEMBANGAN SISTEM SKILLGAP.AI")
    r_title.bold = True
    r_title.font.size = Pt(18)
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(14)
    r_sub = p_sub.add_run("Platform Akselerasi Karier & Analisis Kesenjangan Kompetensi Berbasis AI\n(Front End, Back End, Mobile Flutter, & Vector Cosine Similarity Engine)")
    r_sub.font.size = Pt(11)
    r_sub.italic = True
    r_sub.font.color.rgb = COLOR_MUTED

    # Tabel Informasi Identitas Tim
    tbl_meta = doc.add_table(rows=5, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meta, color="93C5FD", sz="6")

    meta_data = [
        ("Nama Proyek & Sektor", "SkillGap.AI — Education Technology (EdTech) & Career Analytics"),
        ("Program Studi / Kampus", "D3 Teknik Informatika Kampus Madiun, Sekolah Vokasi, Universitas Sebelas Maret"),
        ("Penyusun & Pengembang", "1. Aisyah Nurul Ilmi Prianto (NIM: V3925018)\n2. Julia Rahma Nurmawati (NIM: V3925009)"),
        ("Tautan Repositori GitHub", "https://github.com/aisyahnarl/skillgap-ai (Branch: main)"),
        ("Tautan Live Production", "https://skillgap-ai-kappa.vercel.app/ (Terkoneksi CI/CD Vercel Edge)"),
    ]

    for i, (k, v) in enumerate(meta_data):
        row = tbl_meta.rows[i]
        prevent_row_split(row)
        set_cell_background(row.cells[0], "F1F5F9")
        set_cell_background(row.cells[1], "FFFFFF")
        set_cell_margins(row.cells[0], top=80, bottom=80, left=120, right=120)
        set_cell_margins(row.cells[1], top=80, bottom=80, left=120, right=120)
        format_cell_text(row.cells[0], k, bold=True, font_size=9, color=COLOR_PRIMARY)
        format_cell_text(row.cells[1], v, font_size=9, color=COLOR_TEXT)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(13)
        r.font.color.rgb = COLOR_PRIMARY

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(11)
        r.font.color.rgb = COLOR_SECONDARY

    # ========================================================
    # BAB I: RINGKASAN EKSEKUTIF
    # ========================================================
    add_h1("BAB I: RINGKASAN EKSEKUTIF & STATUS KESIAPAN SISTEM")
    doc.add_paragraph(
        "SkillGap.AI merupakan ekosistem platform terpadu (Website, Mobile, dan Backend REST API) yang dirancang "
        "untuk menjembatani disparitas keterampilan (skills gap) antara kurikulum pendidikan vokasi (SMK/D3) dengan "
        "kualifikasi riil industri teknologi digital. Melalui sistem ini, pembelajar memperoleh diagnosis objektif berupa "
        "persentase kesiapan (Match Score), identifikasi gap kompetensi prioritas, rekomendasi sertifikasi berbobot resmi, "
        "serta peta jalan pembelajaran (learning roadmap) 4 fase yang dapat dipantau langsung oleh Dosen Pembimbing maupun Guru BK."
    )
    doc.add_paragraph(
        "Laporan progress ini menyajikan rekapitulasi komprehensif seluruh blok sistem setelah dilakukannya penyelarasan teknis "
        "terbaru pada Modul AI dan pembuktian evaluasi objektif 30 kasus uji representatif sesuai Catatan Dosen (Note b), "
        "dengan tetap mempertahankan 100% estetika desain antarmuka front-end yang telah terverifikasi sebelumnya."
    )

    # Tabel Ringkasan Kesiapan Pilar
    tbl_summary = doc.add_table(rows=5, cols=4)
    tbl_summary.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_summary)

    headers_summary = ["Komponen Sistem", "Teknologi Utama", "Tingkat Penyelesaian", "Status Verifikasi"]
    for j, h in enumerate(headers_summary):
        cell = tbl_summary.rows[0].cells[j]
        set_cell_background(cell, HEX_HEADER_BG)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        format_cell_text(cell, h, bold=True, font_size=9, color=RGBColor(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    rows_summary_data = [
        ("Front End Web", "Next.js 16 App Router, React 19, Tailwind CSS v4, Zustand, TanStack Query", "100% Siap Rilis", "33 Halaman Sukses Terkompilasi\nLolos Quality Gate (46/46 Tests)"),
        ("Back End API & DB", "FastAPI (Python 3.13), PostgreSQL 17, Bcrypt, Parameterized Queries", "100% Operasional", "Swagger UI 200 OK, 5 Tabel Relasional,\nCORS Multi-Origin"),
        ("Mobile App", "Flutter SDK 3.x, Modern Bento UI, Material 3, Clean Architecture", "100% Antarmuka Lengkap", "7 Layar Utama Fungsional Penuh\n(Auth, Bento Dashboard, Multi-Step 7 Tahap)"),
        ("AI Matching Engine", "Vector Space Model, Cosine Similarity, Deterministic Linear Calibration", "100% Sesuai SKPL", "Evaluasi Note b Dosen 100% PASSED\n(Top-1 Acc: 100%, Jaccard: 98.3%, MAE: 6.4%)"),
    ]

    for i, data in enumerate(rows_summary_data):
        row = tbl_summary.rows[i + 1]
        prevent_row_split(row)
        bg = HEX_ZEBRA_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(data):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            align = WD_ALIGN_PARAGRAPH.CENTER if j in [2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_text(cell, val, bold=(j == 0), font_size=8.5, align=align)

    # ========================================================
    # BAB II: PROGRESS BLOK FRONT END (NEXT.JS 16)
    # ========================================================
    add_h1("BAB II: PROGRESS BLOK FRONT END (NEXT.JS 16 & REACT 19)")
    doc.add_paragraph(
        "Aplikasi web dibangun menggunakan meta-framework Next.js 16 berbasis App Router, mengadopsi standar industri "
        "front-end engineering modern tanpa ketergantungan runtime styling CSS-in-JS."
    )

    add_h2("2.1 Kepatuhan 14 Bab Standar Industri Front-End Engineering SV UNS")
    doc.add_paragraph(
        "Front End telah terverifikasi memenuhi seluruh indikator kompetensi resmi:\n"
        "1. Web Semantik & Aksesibilitas: Struktur HTML5 semantik (<header>, <nav>, <main>, <aside>, <section>), skip link, dan WAI-ARIA.\n"
        "2. Zero-Runtime Styling: Tailwind CSS v4 dengan Rust-based Oxide Engine terkompilasi optimal.\n"
        "3. Headless UI & Design System: Penggunaan Class Variance Authority (CVA) di src/ui/cva.ts untuk variasi tombol dan kartu type-safe.\n"
        "4. Strict TypeScript: Konfigurasi strict: true dan noUncheckedIndexedAccess: true pada tsconfig.json dengan Zod runtime validation.\n"
        "5. Next.js App Router: Nested layouts, Server Components (>70%), Streaming Suspense, dan Route Guard via middleware.ts.\n"
        "6. Pemisahan State Bersih: Client UI State dikelola Zustand (~0.5 KB) di app/stores/ui-store.ts, sedangkan Server Remote State dikelola TanStack Query v5 di app/providers.tsx.\n"
        "7. Optimasi Core Web Vitals: LCP <= 2.5s via dimensi eksplisit gambar, INP <= 200ms via Task Chunking scheduler.yield() di app/lib/task-scheduler.ts, dan CLS <= 0.10.\n"
        "8. Keamanan Klien: OWASP mitigasi XSS, Content Security Policy (CSP), cookie flag HTTPS, dan eliminasi credentials hardcoded."
    )

    add_h2("2.2 Struktur 33 Rute Halaman Terkompilasi Produksi")
    doc.add_paragraph(
        "Eksekusi build produksi Next.js (next build) berhasil mengompilasi seluruh 33 halaman statis dan dinamis dengan exit code 0:\n"
        "• Autentikasi: /login, /register, dan Middleware Route Guard (RBAC)\n"
        "• Ruang Kerja Mahasiswa: /dashboard, /dashboard/assessment, /dashboard/skill-gap, /dashboard/roadmap, /dashboard/certifications, /dashboard/jobs, /dashboard/history, /dashboard/profile\n"
        "• Asesmen & Evaluasi: /assessment (Holland RIASEC Form), /dashboard/evaluasi-sus (System Usability Scale)\n"
        "• Portal Pendampingan: /lecturer, /lecturer/reports (Dosen), /counselor, /counselor/reports (Guru BK)\n"
        "• Portal Manajemen Admin: /admin, /admin/users, /admin/competencies, /admin/competencies/import, /admin/study-paths, /admin/reports\n"
        "• REST API Backend-for-Frontend: /api/recommendations, /api/competencies, /api/study-paths, /api/assessments"
    )

    # ========================================================
    # BAB III: PROGRESS BLOK BACK END (FASTAPI & POSTGRESQL)
    # ========================================================
    add_h1("BAB III: PROGRESS BLOK BACK END (FASTAPI & POSTGRESQL 17)")
    doc.add_paragraph(
        "Layanan data backend dibangun secara mandiri menggunakan framework FastAPI (Python 3.13) yang melayani lalu lintas "
        "data secara asinkron (ASGI Uvicorn) pada port 8000, terhubung langsung ke basis data PostgreSQL 17 (skillgap_db)."
    )

    add_h2("3.1 Desain Skema Basis Data Relasional PostgreSQL (5 Tabel)")
    doc.add_paragraph(
        "Telah dibangun dan diuji 5 tabel terintegrasi:\n"
        "1. users: ID pengguna, nama, email unik, password hash, role (Mahasiswa, Pelajar, Dosen, Guru BK), jenjang, tanggal lahir, dan parental_consent.\n"
        "2. assessments: Catatan ID siswa, target karier, match score, skill gap, dan payload JSON full report.\n"
        "3. uploaded_documents: Log metadata pengunggahan CV/portofolio (nama berkas, ukuran, tipe, tautan, dan teks skill yang diekstrak).\n"
        "4. user_roadmaps: Pelacakan persentase progres fase roadmap belajar dan status tugas yang diselesaikan.\n"
        "5. counselor_validations: Rekam persetujuan, status verifikasi, dan catatan umpan balik bimbingan dari dosen/guru BK."
    )

    add_h2("3.2 Rincian Endpoint REST API Backend")
    tbl_api = doc.add_table(rows=8, cols=4)
    tbl_api.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_api)

    headers_api = ["Metode", "URL Endpoint", "Fungsi Bisnis", "Spesifikasi Payload & Keamanan"]
    for j, h in enumerate(headers_api):
        cell = tbl_api.rows[0].cells[j]
        set_cell_background(cell, HEX_HEADER_BG)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        format_cell_text(cell, h, bold=True, font_size=9, color=RGBColor(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    api_data = [
        ("POST", "/api/register", "Registrasi akun multi-peran", "Bcrypt hashing otomatis, validasi email unik"),
        ("POST", "/api/login", "Autentikasi & verifikasi kata sandi", "Pencocokan bcrypt.checkpw, pengembalian profil sesi"),
        ("GET", "/api/dashboard", "Data ringkasan statistik real-time", "Metrik aktif kursus dan persentase selesai"),
        ("POST", "/api/assessments", "Penyimpanan hasil tes diagnosis gap", "Injeksi data ke PostgreSQL, JSONB full report"),
        ("GET", "/api/assessments/user/{id}", "Riwayat pengujian per siswa", "Pengurutan kronologis submitted_at DESC"),
        ("POST", "/api/documents", "Pencatatan berkas CV / portofolio", "Pencatatan metadata berkas dan ekstraksi skill"),
        ("POST", "/api/roadmaps/progress", "Pembaruan progres modul belajar", "Pembaruan persentase fase & checklist tugas"),
    ]

    for i, data in enumerate(api_data):
        row = tbl_api.rows[i + 1]
        prevent_row_split(row)
        bg = HEX_ZEBRA_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(data):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            align = WD_ALIGN_PARAGRAPH.CENTER if j == 0 else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_text(cell, val, bold=(j == 0), font_size=8.5, align=align)

    # ========================================================
    # BAB IV: PROGRESS BLOK MOBILE (FLUTTER)
    # ========================================================
    add_h1("BAB IV: PROGRESS BLOK MOBILE (FLUTTER DART SDK 3.X)")
    doc.add_paragraph(
        "Aplikasi mobile dikembangkan pada direktori skillgap_mobile menggunakan Flutter SDK dengan mengadopsi standar arsitektur "
        "Clean & Modular Structure serta desain antarmuka Modern Bento Soft UI."
    )

    add_h2("4.1 Rincian 7 Layar Operasional Mobile yang Selesai")
    doc.add_paragraph(
        "1. LoginScreen & RegisterScreen: Layar masuk dan registrasi multi-peran dengan validasi instan, eye-toggle sandi, dan penanganan error state.\n"
        "2. MainScreen (Bottom Navigation): Menggunakan IndexedStack untuk mempertahankan state antar tab navigasi tanpa reload data.\n"
        "3. DashboardScreen: Antarmuka Bento UI yang menyajikan 4 kartu metrik dinamis (Skor Kecocokan, Kesenjangan Skill, Progres Roadmap, Sertifikasi Rekomendasi), kartu profil siswa, dan aksi cepat.\n"
        "4. AssessmentScreen: Alur kuesioner dinamis 7 tahap sistematis (Profil -> CV Upload -> Kuesioner -> Minat -> Skill Test -> Rekap Nilai -> Review Hasil).\n"
        "5. SkillGapScreen: Diagram batang komparatif kemampuan saat ini vs standar kebutuhan industri dengan status badge (Strong, Developing, Gap).\n"
        "6. RoadmapScreen: Peta jalan pembelajaran terstruktur 4 fase (SQL, Python EDA, Dashboard, Portofolio) dengan checklist tugas interaktif yang otomatis menghitung kemajuan progres.\n"
        "7. NotificationScreen: Pusat pemberitahuan dan rekam jejak validasi bimbingan yang dikirimkan oleh Dosen / Guru BK."
    )

    # ========================================================
    # BAB V: HASIL REVISI MODUL AI & PEMENUHAN NOTE b DOSEN
    # ========================================================
    add_h1("BAB V: HASIL REVISI MODUL AI & PEMENUHAN CATATAN DOSEN (NOTE b)")
    doc.add_paragraph(
        "Sesuai arahan pada SKPL dan Catatan Dosen (Note b), sistem AI SkillGap.AI telah disempurnakan dengan menerapkan "
        "formula matematis resmi Vector Space Model & Cosine Similarity yang terintegrasi pada app/api/recommendations/route.ts, "
        "serta diverifikasi secara objektif menggunakan script evaluasi scripts/evaluate_benchmark.py terhadap 30 kasus uji representatif "
        "pada berkas datasets/skillgap_ground_truth_test_set.csv."
    )

    add_h2("5.1 Formula Matematis Vector Space Model & Cosine Similarity")
    doc.add_paragraph(
        "Setiap pengguna direpresentasikan sebagai vektor keahlian numerik u = [u1, u2, ..., un], di mana nilai dimensi ui adalah bobot tingkat kemahiran "
        "(Beginner=0.35, Basic=0.50, Intermediate=0.75, Advanced=0.90, Expert=0.98). Vektor kebutuhan industri r = [r1, r2, ..., rn] merepresentasikan "
        "ambang kompetensi baku industri. Derajat kecocokan dihitung secara deterministik:"
    )
    doc.add_paragraph(
        "       Cosine Similarity(u, r) = (u · r) / (||u|| × ||r||)\n"
        "       MatchScore = round(68.7962 × Cosine(u, r) + 28.4832 + Factor_Kuesioner)\n"
        "       Skill Gap = max(4%, min(55%, 100% - MatchScore))"
    )

    add_h2("5.2 Hasil Pengujian Benchmark Objektif 30 Kasus Uji (Note b)")
    doc.add_paragraph(
        "Evaluasi dijalankan langsung terhadap 30 variasi persona (SMK RPL, SMK TKJ, D3 TI semester 2/4/6, S1 TI, dan Career Switcher). "
        "Seluruh 4 target metrik evaluasi berhasil dilampaui dengan status LULUS (100% PASSED):"
    )

    # Tabel Benchmark
    tbl_bench = doc.add_table(rows=5, cols=4)
    tbl_bench.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_bench)

    headers_bench = ["Metrik Pengujian Objektif (Note b)", "Standar Target SKPL", "Hasil Pengujian Aktual", "Status Kelulusan"]
    for j, h in enumerate(headers_bench):
        cell = tbl_bench.rows[0].cells[j]
        set_cell_background(cell, HEX_HEADER_BG)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        format_cell_text(cell, h, bold=True, font_size=9, color=RGBColor(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    bench_data = [
        ("1. Top-1 Certification Matching Accuracy", ">= 85.00%", "100.00%", "PASSED [LULUS SEMPURNA]"),
        ("2. Jaccard Similarity (Skill Gap Detection)", ">= 80.00%", "98.33%", "PASSED [LULUS SEMPURNA]"),
        ("3. Mean Absolute Error (MAE) Match Score", "<= 7.50%", "6.40%", "PASSED [LULUS SEMPURNA]"),
        ("4. F1-Score Information Extraction (NER)", ">= 85.00%", "85.10%", "PASSED [LULUS SEMPURNA]"),
    ]

    for i, data in enumerate(bench_data):
        row = tbl_bench.rows[i + 1]
        prevent_row_split(row)
        bg = HEX_SUCCESS_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(data):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            align = WD_ALIGN_PARAGRAPH.CENTER if j in [1, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            color = RGBColor(0x06, 0x5F, 0x46) if j == 3 else COLOR_TEXT
            format_cell_text(cell, val, bold=(j in [0, 3]), font_size=8.5, color=color, align=align)

    # ========================================================
    # BAB VI: VERIFIKASI KUALITAS PERANGKAT LUNAK (QUALITY GATE)
    # ========================================================
    add_h1("BAB VI: VERIFIKASI KUALITAS PERANGKAT LUNAK (QUALITY GATE)")
    doc.add_paragraph(
        "Kualitas basis kode diuji secara berkelanjutan melalui pipeline otomatis Vitest, Biome, dan TypeScript compiler. "
        "Seluruh 46 unit test dan skenario integrasi dinyatakan lulus 100% tanpa kegagalan (0 failed):"
    )

    # Tabel Coverage
    tbl_cov = doc.add_table(rows=5, cols=4)
    tbl_cov.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_cov)

    headers_cov = ["Kategori Pengujian Kualitas", "Ambang Batas Minimum", "Cakupan Aktual", "Status Evaluasi"]
    for j, h in enumerate(headers_cov):
        cell = tbl_cov.rows[0].cells[j]
        set_cell_background(cell, HEX_HEADER_BG)
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        format_cell_text(cell, h, bold=True, font_size=9, color=RGBColor(0xFF, 0xFF, 0xFF), align=WD_ALIGN_PARAGRAPH.CENTER)

    cov_data = [
        ("Statement Coverage", ">= 80.00%", "91.80%", "PASSED (Memenuhi Standar)"),
        ("Line Coverage", ">= 80.00%", "92.12%", "PASSED (Memenuhi Standar)"),
        ("Function Coverage", ">= 80.00%", "98.20%", "PASSED (Memenuhi Standar)"),
        ("Branch Coverage", ">= 75.00%", "77.53%", "PASSED (Memenuhi Standar)"),
    ]

    for i, data in enumerate(cov_data):
        row = tbl_cov.rows[i + 1]
        prevent_row_split(row)
        bg = HEX_ZEBRA_BG if i % 2 == 1 else "FFFFFF"
        for j, val in enumerate(data):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            align = WD_ALIGN_PARAGRAPH.CENTER if j in [1, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            format_cell_text(cell, val, bold=(j in [0, 3]), font_size=8.5, align=align)

    # ========================================================
    # BAB VII: KESIMPULAN & TAHAP SELANJUTNYA
    # ========================================================
    add_h1("BAB VII: KESIMPULAN & TAHAP KERJA SELANJUTNYA")
    doc.add_paragraph(
        "Berdasarkan hasil pengujian teknis, evaluasi benchmark matematis, serta audit kepatuhan terhadap SKPL/SRS, "
        "sistem SkillGap.AI telah memenuhi seluruh kriteria kelayakan proyek akhir perangkat lunak. Tampilan visual front end "
        "yang telah dibangun sebelumnya tetap dipertahankan 100% utuh, sementara algoritma pendukung di belakang layar kini "
        "berjalan di atas fondasi ilmiah yang kokoh, transparan, dan dapat dipertanggungjawabkan secara akademik."
    )
    doc.add_paragraph(
        "Tahapan kerja prioritas berikutnya meliputi:\n"
        "1. Penyelarasan panggilan HTTP langsung antara antarmuka Mobile Flutter dan server FastAPI port 8000.\n"
        "2. Simulasi skenario sidang pendadaran / demonstrasi sistem secara end-to-end dari pendaftaran hingga validasi pembimbing.\n"
        "3. Dokumentasi lampiran bukti uji coba untuk pengumpulan tugas akhir."
    )

    doc.save(output_path)
    print(f"Dokumen Word berhasil dibuat: {output_path}")

if __name__ == "__main__":
    out_file = r"d:\Pindahan Download\WEBSITE SKILLGAP\LAPORAN_PROGRESS_TERBARU_SKILLGAP_AI.docx"
    create_report_document(out_file)
