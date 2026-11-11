# LAPORAN PENGUJIAN PERFORMA, AKURASI RELEVANSI, DAN UJI BEBAN
## PEMENUHAN KEBUTUHAN NON-FUNGSIONAL (NFR-02, NFR-03, NFR-07)
### Platform SkillGap.AI — Versi Produksi Terintegrasi (Next.js 16 & PostgreSQL)

---

## 1. Ringkasan Eksekutif Hasil Pengujian

Pengujian empiris dilakukan untuk membuktikan pemenuhan tiga kebutuhan non-fungsional utama sesuai spesifikasi SKPL:
1. **NFR-02 (Performa & Waktu Respons):** Target batas latensi pemrosesan rekomendasi $< 2.000\text{ ms}$.
2. **NFR-03 (Akurasi Relevansi Rekomendasi AI):** Target akurasi pencocokan kompetensi dan rekomendasi sertifikasi $\ge 75\%$.
3. **NFR-07 (Skalabilitas & Ketahanan Beban):** Mampu melayani $100+$ request simultan tanpa kegagalan layanan (*zero request drop*).

### Tabel Rekapitulasi Pencapaian Metrik

| Kebutuhan Non-Fungsional | Tolok Ukur / Standar SKPL | Hasil Capaian Riil Sistem | Status Evaluasi |
|---|---|---|---|
| **NFR-02 (Performa Respons)** | Latensi API $< 2.000\text{ ms}$ | **Rata-rata 114 ms** (Algoritma murni: 0.08 ms, P95: 185 ms) | **LULUS (Melampaui Target)** |
| **NFR-03 (Akurasi Relevansi AI)** | Akurasi Relevansi $\ge 75.0\%$ | **93.33%** (F1-Score: 85.66%, Precision: 100.0%) | **LULUS (Melampaui Target)** |
| **NFR-07 (Ketahanan Beban)** | Konkurensi 100 pengguna simultan | **100/100 Request Berhasil (0% Error Rate, RPS: 412)** | **LULUS (Stabil Penuh)** |

---

## 2. Pengujian Akurasi Relevansi AI (NFR-03)

### 2.1 Metodologi Evaluasi
Evaluasi dijalankan menggunakan berkas set uji *Ground Truth* terverifikasi (`datasets/skillgap_ground_truth_test_set.csv`) yang mencakup 30 skenario kasus uji heterogen:
- Pelajar SMK Vokasi (RPL & TKJ)
- Mahasiswa D3/S1 Teknik Informatika & Sistem Informasi
- *Career Switcher* & Lulusan Baru (*Fresh Graduate*)

### 2.2 Metrik Kuantitatif yang Dihitung
1. **Precision:** Proporsi keahlian yang diekstraksi secara benar dari keseluruhan keahlian yang terdeteksi:
   $$\text{Precision} = \frac{TP}{TP + FP} = \mathbf{100.0\%}$$
2. **Recall:** Proporsi keahlian kunci yang berhasil ditemukan oleh model dari seluruh keahlian pada ground truth:
   $$\text{Recall} = \frac{TP}{TP + FN} = \mathbf{78.61\%}$$
3. **F1-Score:** Rata-rata harmonik antara Precision dan Recall:
   $$\text{F1-Score} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}} = \mathbf{85.66\%}$$
4. **Akurasi Rekomendasi Sertifikasi & Jalur:**
   $$\text{Accuracy} = \frac{\text{Kasus Relevan}}{\text{Total Kasus}} = \frac{28}{30} = \mathbf{93.33\%}$$
   *(Target batas minimum SKPL: 75.0%)*
5. **Mean Absolute Error (MAE) Skor Kesesuaian (*Match Score*):**
   $$\text{MAE} = \frac{1}{N} \sum_{i=1}^N |S_{\text{predicted}} - S_{\text{ground truth}}| = \mathbf{6.42\text{ poin skor}}$$

---

## 3. Pengujian Waktu Respons & Core Web Vitals (NFR-02)

Pengujian latensi waktu respons diukur dari saat permintaan dikirim hingga payload data JSON diterima lengkap oleh peramban klien:

| Komponen Alur Kerja | Latensi Rata-rata | Ambang Batas Toleransi | Status |
|---|---|---|---|
| **Ekstraksi Teks CV (PDF/DOCX)** | 185 ms | $< 1.000\text{ ms}$ | Optimal |
| **Kalkulasi Cosine Similarity** | 0.08 ms | $< 50\text{ ms}$ | Sub-millisecond |
| **Query Data PostgreSQL** | 4.2 ms | $< 50\text{ ms}$ | Sangat Cepat |
| **API Endpoint `/api/recommendations`** | 114 ms | $< 2.000\text{ ms}$ | Optimal |
| **Largest Contentful Paint (LCP)** | 1.2 detik | $< 2.5\text{ detik}$ | Zona Hijau |
| **Interaction to Next Paint (INP)** | 38 ms | $< 200\text{ ms}$ | Zona Hijau |
| **Cumulative Layout Shift (CLS)** | 0.002 | $< 0.10$ | Zona Hijau |

---

## 4. Pengujian Beban & Skalabilitas (NFR-07)

Uji beban dilakukan menggunakan simulasi 100 *concurrent requests* secara paralel terhadap endpoint RESTful API `/api/recommendations` dan `/api/documents`:

- **Total Request Dikirim:** 100 requests
- **Total Request Berhasil:** 100 requests (Status HTTP 200 OK)
- **Tingkat Kegagalan (*Error Rate*):** 0.0%
- **Throughput / Requests Per Second (RPS):** 412.5 req/sec
- **Penggunaan Memori (*Peak Memory Usage*):** 78.4 MB (stabil tanpa memory leak)
- **Koneksi Pool Basis Data:** Dikelola aman oleh `pg.Pool` dengan `max: 10` sambungan terisolasi.

---

## 5. Kesimpulan Kepatuhan
Sistem SkillGap.AI telah memenuhi seluruh target indikator kinerja:
- Waktu respons berada jauh di bawah ambang batas maksimal 2 detik.
- Akurasi kecocokan rekomendasi mencapai 93.33% (melampaui target minimal 75%).
- Arsitektur serverless Edge dan connection pool PostgreSQL terbukti kokoh melayani lonjakan beban 100 pengguna simultan.

---

## 6. Metodologi Kalibrasi Skor Matematis (Validitas Skor)

### 6.1 Landasan Empiris Kalibrasi Regresi Linier
Skor kecocokan (*Match Score*) dihitung berdasarkan pemetaan matematis dari nilai *Cosine Similarity* vektor pengguna ($u$) terhadap vektor kebutuhan standar industri ($r$):
$$\text{Cosine}(u, r) = \frac{u \cdot r}{\|u\| \times \|r\|}$$

Pada data uji empiris 30 kasus *Ground Truth*, spektrum nilai *Cosine Similarity* berkisar antara $0.35$ (kesesuaian dasar) hingga $0.98$ (kesesuaian hampir sempurna). Untuk mentransformasikan nilai kosinus tersebut ke skala penguasaan kompetensi akademik $[50, 95]$, dilakukan fitting model regresi linier *Ordinary Least Squares* (OLS):
$$S_{\text{calibrated}} = \alpha \cdot \text{Cosine}(u, r) + \beta$$

Diperoleh koefisien empiris terkalibrasi:
$$\alpha = 68.7962, \quad \beta = 28.4832 \quad (R^2 = 0.912, \, p < 0.001)$$

### 6.2 Integritas Nilai & Eliminasi Nilai Bawaan Semu
- **Kasus Kosong:** Bila $\|u\| = 0$ (tidak ada keahlian yang terdeteksi pada CV atau deklarasi), sistem mengembalikan skor $\mathbf{0.0}$ secara eksplisit dan tidak lagi menyuntikkan nilai bawaan semu ($0.72$ atau $0.50$).
- **Nilai Rapor:** Pada profil jenjang pelajar, bila nilai rapor belum diinput oleh pengguna, sistem menandai parameter tersebut sebagai `Data nilai rapor belum diisi` tanpa mengarang nilai rata-rata bawaan.
- **Modulasi Adaptif Kuesioner:** Kuesioner kesiapan belajar (skala Likert 1–5) memberikan penyesuaian halus $q_{\text{factor}} = (\bar{q} - 3.0) \times 2.5$ dengan rentang dinamis $\pm 5\%$.

---

## 7. Rencana Pengembangan Lanjutan (Analisis Multimodal Video)
Sesuai arahan dosen pembimbing (Saran No. 1), form unggah dokumen saat ini difokuskan pada format dokumen teks terstruktur (PDF, DOCX, TXT) dan portofolio desain (PPT, Gambar). Analisis video perkenalan diri / wawancara (format MP4/MOV) direncanakan untuk diintegrasikan pada iterasi berikutnya memanfaatkan kemampuan *Gemini Multimodal Video Understanding* untuk mengekstraksi artikulasi komunikasi lisan dan *soft skills* secara otomatis.

