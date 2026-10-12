# Repositori Dataset & Set Uji Evaluasi — SkillGap.AI

Folder ini menyimpan dataset primer acuan kompetensi dan set uji ground truth manual yang digunakan untuk melatih, menyelaraskan context RAG, dan mengevaluasi kinerja sistem kecerdasan buatan pada platform **SkillGap.AI**.

---

## 1. Daftar Berkas Dataset

| Nama Berkas | Tipe Data | Deskripsi Utama | Jumlah Baris |
|---|---|---|---|
| [`it_job_roles_skills_curated.csv`](it_job_roles_skills_curated.csv) | Knowledge Base / Tabular | Katalog peran kerja IT, deskripsi, skill teknis & soft skills, bobot industri, rujukan SKKNI, dan sertifikasi. | 20 Role Utama IT |
| [`skillgap_ground_truth_test_set.csv`](skillgap_ground_truth_test_set.csv) | Ground Truth Test Set | Set uji evaluasi dengan kunci jawaban manual untuk menguji kinerja sistem ekstraksi dan pemetaan gap kompetensi AI secara objektif. | 30 Kasus Uji Terverifikasi |

---

## 2. Dataset Primer: `it_job_roles_skills_curated.csv`

Dataset ini bertindak sebagai basis data acuan industri (knowledge base) yang disintesis dari standar kompetensi kerja nasional dan dataset publik global.

### Struktur Kolom (Data Dictionary)
- `role_id`: Pengidentifikasi unik peran kerja (contoh: `ROL-001`).
- `role_title`: Judul peran kerja profesional (contoh: `Frontend Developer`).
- `target_level`: Jenjang kemampuan sasaran (`Pemula`, `Menengah`, `Lanjutan`).
- `domain_category`: Kategori domain teknologi (`Software Engineering`, `Data & AI`, `Design & Creative`, `Infrastructure & Cloud`, `Cyber Security`, `IoT & Hardware`, `Product & Management`).
- `required_technical_skills`: Daftar keahlian teknis esensial yang dipersyaratkan oleh industri.
- `required_soft_skills`: Keahlian interpersonal dan cara berpikir yang dibutuhkan.
- `skkni_reference`: Nomor payung hukum Standar Kompetensi Kerja Nasional Indonesia (SKKNI) resmi Kementerian Ketenagakerjaan RI atau Kurikulum Vokasi.
- `industry_weight`: Skor bobot permintaan pasar kerja saat ini (skala 0–100) berdasarkan laporan ketenagakerjaan teknologi.
- `recommended_certifications`: Rekomendasi sertifikasi kompetensi kredibel (BNSP, Google, Microsoft, AWS, Meta, Dicoding).

### Tautan & Sumber Publik Terbuka:
1. **IT Job Roles Skills Dataset (Kaggle)**  
   - Pemilik/Penerbit: Dhivya Dharuna  
   - Tautan Resmi: [https://www.kaggle.com/datasets/dhivyadharuna/it-job-roles-skills-dataset](https://www.kaggle.com/datasets/dhivyadharuna/it-job-roles-skills-dataset)  
   - Relevansi: Menyediakan korpus peran IT dunia nyata, deskripsi kebutuhan skill, dan pemetaan sertifikasi global.
2. **Candidate Job Role Dataset (Kaggle)**  
   - Pemilik/Penerbit: CKS Dataset  
   - Tautan Resmi: [https://www.kaggle.com/datasets/cks-dataset/candidate-job-role-dataset](https://www.kaggle.com/datasets/cks-dataset/candidate-job-role-dataset)  
   - Relevansi: Profil kandidat pelamar, tingkat keahlian, dan pemetaan kesesuaian karier.
3. **Pusat Standar Kompetensi Kerja Nasional Indonesia (SKKNI Kemnaker RI)**  
   - Tautan Resmi: [https://skkni.kemnaker.go.id/](https://skkni.kemnaker.go.id/)  
   - Relevansi: SKKNI No. 282/2017 (Pemrograman Perangkat Lunak), No. 299/2020 (Manajemen Data), No. 085/2021 (AI), No. 391/2019 (Keamanan Informasi).

---

## 3. Set Uji Ground Truth: `skillgap_ground_truth_test_set.csv`

> [!IMPORTANT]  
> **Kepatuhan Terhadap Catatan Dosen (Note b):**  
> *"Jika project Gen AI : wajib menyiapkan set uji dengan kunci jawaban manual. Tanpa set ini, hasil LLM tidak bisa dievaluasi secara objektif"*

Dataset ini memuat 30 skenario pengujian heterogen mencakup seluruh spektrum target pengguna sistem (Pelajar SMK RPL/TKJ, Mahasiswa D3/S1 Vokasi IT, dan Fresh Graduate / Career Switcher).

### Struktur Kolom:
- `test_id`: Kode pengujian (`TC-001` s.d. `TC-030`).
- `persona_category`: Latar belakang pendidikan dan tingkatan pengguna (contoh: *Pelajar SMK RPL*, *Mahasiswa D3 TI Semester 4*, *Fresh Graduate TI*).
- `target_role`: Posisi pekerjaan yang menjadi target karier pengguna.
- `user_input_text`: Teks bebas deskripsi diri / jawaban asesmen yang dimasukkan oleh pengguna ke dalam antarmuka sistem.
- `declared_skills`: Format data terstruktur awal dari kuesioner.
- `ground_truth_extracted_skills`: **Kunci jawaban manual** daftar keahlian yang secara sah harus berhasil diekstraksi oleh model AI/NLP dari input teks.
- `ground_truth_missing_skills`: **Kunci jawaban manual** kesenjangan skill (skill gap) yang wajib diidentifikasi sistem sebagai kekurangan kompetensi.
- `ground_truth_match_score`: **Kunci jawaban manual** nilai persentase kesesuaian target (0–100%) yang dihitung oleh tim penilai ahli.
- `ground_truth_certification`: **Kunci jawaban manual** sertifikasi terbaik yang paling tepat dan urgen untuk direkomendasikan.
- `ground_truth_priority`: Prioritas tindakan penutupan gap (`High`, `Medium`, `Low`).

---

## 4. Metrik Evaluasi Objektif Sistem AI

Dengan adanya set uji di atas, performa model AI dapat diukur secara kuantitatif:

### A. Evaluasi Ekstraksi Entitas Keahlian (Structured Extraction / NER)
Mengukur kemampuan AI dalam mengekstraksi keahlian dari teks input pengguna dibandingkan dengan `ground_truth_extracted_skills`:
$$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}, \quad F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$

### B. Evaluasi Identifikasi Skill Gap (Missing Skills)
Mengukur tingkat ketepatan deteksi kekurangan skill terhadap `ground_truth_missing_skills` menggunakan **Jaccard Similarity Index**:
$$\text{Jaccard Similarity} = \frac{|S_{\text{prediksi}} \cap S_{\text{ground\_truth}}|}{|S_{\text{prediksi}} \cup S_{\text{ground\_truth}}|}$$

### C. Evaluasi Prediksi Skor Kesesuaian (Match Score Error)
Mengukur selisih antara nilai match score yang diprediksi sistem dengan nilai kunci jawaban manual menggunakan **Mean Absolute Error (MAE)**:
$$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} |y_{\text{pred}, i} - y_{\text{ground\_truth}, i}|$$

### D. Evaluasi Akurasi Rekomendasi Sertifikasi
Mengukur persentase kecocokan rekomendasi sertifikasi teratas (*Top-1 Accuracy*):
$$\text{Accuracy}_{\text{Top-1}} = \frac{\sum [C_{\text{prediksi}} == C_{\text{ground\_truth}}]}{N} \times 100\%$$
