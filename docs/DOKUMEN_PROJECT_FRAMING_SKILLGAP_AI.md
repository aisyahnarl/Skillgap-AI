# DOKUMEN PROJECT FRAMING
## Mata Kuliah Blok Kecerdasan Buatan & Rekayasa Perangkat Lunak
**Program Studi D3 Teknik Informatika — Sekolah Vokasi Universitas Sebelas Maret**

---

### 1. Identitas Proyek
* **Nama Proyek:** SkillGap.AI *(Sistem Pemetaan Kesenjangan Kompetensi dan Rekomendasi Pengembangan Diri, Persiapan Karier, serta Sertifikasi Berbasis AI)*
* **Sektor:** *Education Technology (EdTech)* & Pengembangan Sumber Daya Manusia (*Human Capital / Career Analytics*)
* **Nama Anggota Tim:**
  1. **Aisyah Nurul Ilmi Prianto** (NIM: V3925018)
  2. **Julia Rahma Nurmawati** (NIM: V3925009)
* **Program Studi:** D3 Teknik Informatika Kampus Madiun, Sekolah Vokasi, Universitas Sebelas Maret
* **Tautan Repositori & Live Demo:**
  * GitHub: [https://github.com/aisyahnarl/skillgap-ai](https://github.com/aisyahnarl/skillgap-ai)
  * Live Production: [https://skillgap-ai-kappa.vercel.app/](https://skillgap-ai-kappa.vercel.app/)

---

### 2. Masalah (*Problem Framing*)
* **Siapa Penggunanya:**
  1. *Pelajar SMK Vokasi (RPL & TKJ):* Siswa yang membutuhkan arah kesiapan kompetensi industri sebelum magang atau memilih kelanjutan studi.
  2. *Mahasiswa Vokasi D3/S1 Teknik Informatika:* Mahasiswa yang mempersiapkan portofolio, tugas akhir, dan kesiapan rekrutmen kerja.
  3. *Pencari Kerja (Job Seeker) & Career Switcher:* Individu yang ingin beralih atau mengakselerasi karier ke industri teknologi informasi.
* **Apa Masalahnya:**
  Terjadinya disparitas (*skill gap*) yang signifikan antara materi yang diajarkan pada kurikulum pendidikan formal dengan kualifikasi teknis riil yang dipersyaratkan industri IT modern. Calon talenta digital mengalami:
  1. Ketidaktahuan letak kekurangan kompetensi teknis secara terukur terhadap standar industri.
  2. Kebingungan dalam memilih sertifikasi yang relevan, kredibel, dan efisien secara biaya/waktu di tengah ribuan pilihan sertifikasi yang beredar.
  3. Ketiadaan peta jalan pembelajaran (*learning roadmap*) bertahap dan terstruktur untuk menutup kesenjangan tersebut.
* **Mengapa Penting:**
  Laporan *Future of Jobs* oleh World Economic Forum (WEF) serta data BPS menunjukkan tingginya tingkat pengangguran terdidik akibat *skills mismatch*. Tanpa diagnosis kesenjangan yang akurat, pembelajar menghabiskan waktu berbulan-bulan mempelajari materi yang tidak relevan atau mengambil sertifikasi yang tidak diakui industri.
* **Karakteristik Masalah (Spesifik, Terukur, Terbatas):**
  * *Spesifik:* Berfokus pada diagnosis kompetensi teknis (*hard skills*) dan kompetensi pendukung (*soft skills*) pada domain teknologi informasi (Software Engineering, Data/AI, Cloud/DevOps, Cyber Security, UI/UX).
  * *Terukur:* Mengukur secara kuantitatif tingkat kecocokan profil (*Match Score* 0–100%) dan gap per unit kompetensi (skala 0–100%) terhadap standar industri dan SKKNI.
  * *Terbatas:* Dibatasi pada 20 peran kerja IT prioritas jenjang Pemula hingga Menengah/Lanjutan dengan katalog sertifikasi terakreditasi resmi (BNSP, Dicoding, Google, AWS, Microsoft, Meta).

---

### 3. Input dan Output Sistem
* **Input Sistem:**
  1. *Profil Pengguna:* Jenjang pendidikan (Pelajar SMK / Mahasiswa / Job Seeker) dan target peran kerja yang dituju (*target role*).
  2. *Asesmen Mandiri Kualitatif & Kuantitatif:* Pilihan daftar keahlian yang dikuasai beserta skala kemahiran (*Beginner*, *Basic*, *Intermediate*, *Advanced*, *Expert*) dan respons kuesioner kesiapan belajar (skala Likert 1–5).
  3. *Teks Deskripsi Pengalaman / Portofolio (Unstructured Text):* Uraian bebas mengenai proyek yang pernah dibuat atau materi yang telah dipelajari untuk diekstraksi keahliannya.
* **Output Sistem:**
  1. *Indikator Kuantitatif Kesiapan Karier:* Skor Kesesuaian (*Match Score* dalam %) dan Nilai Kesenjangan (*Skill Gap* dalam %).
  2. *Matriks Kesenjangan Kompetensi (Skill Gap Matrix):* Pemilahan keahlian ke dalam status *Strong* (memenuhi), *Developing* (sedang berkembang), dan *Gap* (kurang) beserta bobot selisih persentasenya.
  3. *Rekomendasi Sertifikasi Berbobot:* Daftar sertifikasi kredibel terkurasi dengan peringkat prioritas (*High / Medium*), estimasi waktu tempuh, dan relevansi terhadap penutupan gap.
  4. *Roadmap Pembelajaran Personal 3 Fase:* Panduan langkah demi langkah terstruktur (*Phase 1: Fondasi*, *Phase 2: Latihan Terarah & Proyek*, *Phase 3: Validasi & Uji Sertifikasi*) lengkap dengan estimasi durasi minggu dan sumber belajar.

---

### 4. Tipe Masalah AI
* **Tipe Masalah Utama:** **Generative AI (Structured Extraction & Retrieval-Augmented Generation / RAG)** yang dikombinasikan dengan **Machine Learning (Multi-Label Skill Matching & Vector Similarity Ranking)**.
* **Rincian Peran AI:**
  1. *Structured Information Extraction (Gen AI / NLP):* Mengonversi teks bebas deskripsi proyek dan portofolio pengguna menjadi entitas keahlian terstandarisasi skema JSON runtime (*zero-shot/few-shot entity extraction*).
  2. *Retrieval-Augmented Generation (RAG):* Mengambil konteks standar kompetensi SKKNI dan katalog sertifikasi resmi untuk memastikan narasi rekomendasi roadmap dan justifikasi bebas halusinasi (*grounded generation*).
  3. *Vector Cosine Similarity (Machine Learning):* Menghitung derajat kedekatan vektor antara profil kemampuan pengguna dan vektor persyaratan peran kerja target secara deterministik.
  4. *Contextual Narrative Generation (Gen AI):* Menyusun penjelasan rasional, umpan balik kekuatan/kelemahan, dan strategi persiapan sertifikasi yang disesuaikan secara adaptif dengan latar belakang pengguna.

---

### 5. Justifikasi AI
*Mengapa masalah ini membutuhkan AI dan tidak dapat diselesaikan hanya dengan logika pemrograman biasa (rule-based / if-else statis)?*
1. **Variasi Linguistik Terminologi Keahlian yang Dinamis:**  
   Pengguna menginputkan keahlian dengan istilah yang sangat bervariasi (contoh: *"bikin web responsif"*, *"slicing Figma ke HTML/CSS"*, *"ReactJS hooks"*, *"belajar backend pakai Node"*). Logika *if-else* berbasis pencocokan string (*exact matching*) akan gagal mengenali sinonim dan konteks ini. Model AI/NLP mampu memetakan variasi semantik bahasa natural ke dalam taksonomi keahlian baku.
2. **Kebutuhan Personalisasi Penalaran Kurikulum yang Kontekstual:**  
   Sistem berbasis aturan (*rule-based*) hanya mampu menghasilkan template kaku. Gen AI mampu bernalar (*reasoning*) dengan mempertimbangkan latar belakang pengguna: pelajar SMK diberikan roadmap dengan analogi fundamental dan latihan dasar, sedangkan mahasiswa tingkat akhir diberikan fokus arsitektur perangkat lunak, *clean code*, dan portofolio industri.
3. **Skalabilitas dan Kemudahan Peremajaan Data Industri:**  
   Perubahan kebutuhan industri dan kemunculan sertifikasi baru terjadi sangat cepat. Dengan arsitektur berbasis RAG dan *embedding*, penambahan peran kerja dan sertifikasi baru cukup dilakukan dengan memperbarui basis data pengetahuan (*knowledge base*), tanpa perlu mengubah atau menguji ulang ribuan baris aturan *if-else* yang rentan menimbulkan *spaghetti code*.

---

### 6. Algoritma yang Dipakai dan Alasannya
1. **Retrieval-Augmented Generation (RAG) + LLM (Large Language Model):**
   * *Algoritma:* Pipeline RAG terintegrasi LLM dengan *Structured Outputs* (Zod / JSON Schema Enforcement).
   * *Alasan Penggunaan:* Mencegah halusinasi fakta sertifikasi atau standar kompetensi karena model dipaksa merujuk pada basis data SKKNI dan katalog resmi, sekaligus menghasilkan penalaran roadmap yang adaptif, manusiawi, dan terstruktur rapi.
2. **Vector Space Model & Cosine Similarity:**
   * *Algoritma:* Representasi multi-hot/TF-IDF vector embedding dan penghitungan kesamaan kosinus:
     $$\text{Cosine Similarity}(\vec{u}, \vec{r}) = \frac{\vec{u} \cdot \vec{r}}{\|\vec{u}\| \|\vec{r}\|}$$
   * *Alasan Penggunaan:* Komputasi sangat efisien, deterministik, dapat diaudit (*interpretable*), dan menghasilkan penilaian skor kecocokan (*Match Score*) yang konsisten tanpa bias subjektif.

---

### 7. Dataset yang Digunakan
Sistem menggunakan kombinasi dataset publik global, standar nasional, dan set uji terkurasi internal:

1. **Dataset Primer Publik (Katalog Peran & Kompetensi IT):**
   * *Nama Dataset:* **IT Job Roles Skills Dataset**
   * *Sumber:* Kaggle (Dhivya Dharuna)
   * *Tautan:* [https://www.kaggle.com/datasets/dhivyadharuna/it-job-roles-skills-dataset](https://www.kaggle.com/datasets/dhivyadharuna/it-job-roles-skills-dataset)
   * *Deskripsi:* Memuat korpus peran kerja teknologi informasi, deskripsi kualifikasi pekerjaan, keahlian teknis/soft skills, dan sertifikasi acuan.
2. **Dataset Pendukung (Profil Asesmen Kandidat):**
   * *Nama Dataset:* **Candidate Job Role Dataset**
   * *Sumber:* Kaggle (C. K. Shetty)
   * *Tautan:* [https://www.kaggle.com/datasets/ckshetty/candidate-job-role-dataset](https://www.kaggle.com/datasets/ckshetty/candidate-job-role-dataset)
   * *Deskripsi:* Data profil kandidat, tingkat keahlian teknis, dan label target pekerjaan untuk pemodelan pencocokan karier.
3. **Dataset Analisis Kesenjangan Skill Pelajar (Domain Vokasi & Mahasiswa):**
   * *Nama Dataset:* **Student Skill Gap Analysis**
   * *Sumber:* Kaggle (Shristi Saini)
   * *Tautan:* [https://www.kaggle.com/datasets/shristisaini/student-skill-gap-analysis](https://www.kaggle.com/datasets/shristisaini/student-skill-gap-analysis)
   * *Deskripsi:* Data evaluasi tingkat kesiapan dan kesenjangan kompetensi teknis serta soft skills pelajar/mahasiswa terhadap kebutuhan industri.
4. **Dataset Pemetaan Resume & Analisis Kesenjangan (NLP/Matching):**
   * *Nama Dataset:* **Resume Skill Gap Analyzer Dataset**
   * *Sumber:* Kaggle (Keerthi Ramesh)
   * *Tautan:* [https://www.kaggle.com/datasets/keerthiramesh470/resume-skill-gap-analyzer-dataset](https://www.kaggle.com/datasets/keerthiramesh470/resume-skill-gap-analyzer-dataset)
   * *Deskripsi:* Data pasangan teks resume dan deskripsi pekerjaan untuk ekstraksi serta analisis kesenjangan skill berbasis Deep Learning/NLP.
5. **Basis Data Acuan Standar Nasional:**
   * *Nama:* **Standar Kompetensi Kerja Nasional Indonesia (SKKNI) Bidang Komunikasi & Informatika**
   * *Sumber:* Kementerian Ketenagakerjaan RI / Kemendikbudristek & BNSP LSP Telematika
   * *Tautan:* [https://skkni.kemnaker.go.id/](https://skkni.kemnaker.go.id/) (SKKNI No. 282/2017 Software Development, No. 299/2020 Data Management, No. 085/2021 Artificial Intelligence).
6. **Set Uji Evaluasi Ground Truth Manual (Kepatuhan Wajib Note b):**
   * *Nama:* **SkillGap.AI Golden Benchmark Test Set**
   * *Sumber:* Data uji internal terkurasi manual oleh tim pengembang (berkas lokal: `datasets/skillgap_ground_truth_test_set.csv`).
   * *Deskripsi:* Memuat 30 skenario kasus uji representatif mencakup pelajar SMK RPL/TKJ, mahasiswa D3/S1 TI, dan *career switcher*. Setiap baris dilengkapi kunci jawaban manual (*ground truth*): daftar skill yang wajib diekstraksi, skill gap yang wajib teridentifikasi, nilai *match score* acuan, dan sertifikasi utama yang wajib direkomendasikan.

---

### 8. Ruang Lingkup Proyek (*Scope of Work*)
* **Yang Dikerjakan dalam Matakuliah Blok:**
  1. Pengembangan modul ekstraksi entitas keahlian terstruktur dari input teks pengguna.
  2. Implementasi algoritma penghitungan kesenjangan kompetensi (*Skill Gap Analysis*) dan skor kesesuaian (*Match Score*) berbasis kesamaan vektor.
  3. Pembangunan modul rekomendasi sertifikasi berbobot dan generator roadmap pembelajaran personal 3 fase berbasis RAG.
  4. Penyusunan dataset set uji evaluasi (*Golden Test Set*) 30 kasus uji dengan kunci manual serta evaluasi kuantitatif performa sistem (akurasi rekomendasi, Precision/Recall/F1-score ekstraksi skill, dan MAE skor kesesuaian).
  5. Integrasi API BFF dan antarmuka web interaktif berbasis Next.js App Router dan Tailwind CSS untuk asesmen serta visualisasi hasil analisis.
* **Yang TIDAK Dikerjakan dalam Matakuliah Blok:**
  1. Integrasi *scraping real-time* dinamis ke portal lowongan kerja pihak ketiga (LinkedIn, JobStreet) pada saat runtime aplikasi berjalan.
  2. Penyelenggaraan ujian sertifikasi daring dan penerbitan sertifikat fisik/digital resmi dari BNSP atau vendor principal (SkillGap.AI hanya bertindak sebagai sistem asesmen diagnosis dan pemandu persiapan).
  3. Melakukan *pre-training* model bahasa besar (LLM) dari nol ratusan miliar parameter; proyek memanfaatkan model fondasi melalui API dengan integrasi RAG, *structured prompt engineering*, dan *validation guardrails*.

---

### Evaluasi Objektif Sistem AI (Pemenuhan Note b)
Untuk menjamin bahwa luaran sistem AI dapat dievaluasi secara objektif, sistem diuji terhadap 30 kasus uji pada berkas `datasets/skillgap_ground_truth_test_set.csv` dengan metrik:
* **F1-Score Ekstraksi Keahlian (NER/Structured Extraction):** Target $\ge 85\%$ kecocokan terhadap `ground_truth_extracted_skills`.
* **Jaccard Similarity Gap Detection:** Target $\ge 80\%$ keselarasan deteksi kekurangan skill terhadap `ground_truth_missing_skills`.
* **Mean Absolute Error (MAE) Match Score:** Target $\text{MAE} \le 7.5\%$ deviasi terhadap nilai kunci manual `ground_truth_match_score`.
* **Top-1 Accuracy Rekomendasi Sertifikasi:** Target $\ge 85\%$ ketepatan rekomendasi terhadap `ground_truth_certification`.
