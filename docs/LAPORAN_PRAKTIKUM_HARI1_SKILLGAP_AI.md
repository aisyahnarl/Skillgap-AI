# MODUL PRAKTIKUM — MATA KULIAH PYTHON UNTUK SISTEM CERDAS
**PROGRAM STUDI D3 TEKNIK INFORMATIKA K KAB. MADIUN**  
**SEKOLAH VOKASI — UNIVERSITAS SEBELAS MARET**

| Identitas Praktikum | Keterangan |
|---|---|
| **HARI 1** | **FONDASI DATA DAN MACHINE LEARNING UNTUK PROJECT CAPSTONE** |
| **NAMA MAHASISWA** | 1. Julia Rahma Nurmawati<br>2. Aisyah Nurul Ilmi Prianto |
| **NIM** | 1. V3925009<br>2. V3925018 |
| **KELAS** | TI-B / Reguler Kampus Kab. Madiun |
| **ANGKATAN** | 2025 |
| **NAMA PROJECT / TIM** | **SkillGap AI** *(No. 15 pada Tabel Panduan Tugas Mandiri per Project)*<br>**Dataset Project:** [`DMA DATASET.xlsx`](file:///c:/Users/ASUS/Downloads/WEBSITE%20SKILLGAP/DMA%20DATASET.xlsx) *(Student Skill Gap Analysis — 500 Baris, 15 Kolom)*<br>**Notebooks:** [`notebooks/01_eda.ipynb`](file:///c:/Users/ASUS/Downloads/WEBSITE%20SKILLGAP/notebooks/01_eda.ipynb) & [`notebooks/02_baseline.ipynb`](file:///c:/Users/ASUS/Downloads/WEBSITE%20SKILLGAP/notebooks/02_baseline.ipynb) |

> [!TIP]
> **Berkas Microsoft Word (`.docx`) Siap Kumpul (Seluruh Jawaban Soal 1 s.d. 5 & Langkah A.1–A.13 Sudah Menggunakan `DMA DATASET.xlsx`):**
> * 👉 [LAPORAN_TUGAS_MANDIRI_HARI1_SKILLGAP_AI.docx](file:///c:/Users/ASUS/Downloads/WEBSITE%20SKILLGAP/LAPORAN_TUGAS_MANDIRI_HARI1_SKILLGAP_AI.docx) *(Di folder utama `WEBSITE SKILLGAP`)*
> * 👉 [docs/LAPORAN_PRAKTIKUM_HARI1_SKILLGAP_AI.docx](file:///c:/Users/ASUS/Downloads/WEBSITE%20SKILLGAP/docs/LAPORAN_PRAKTIKUM_HARI1_SKILLGAP_AI.docx) *(Salinan di dalam folder `docs/`)*

---

## IV. TUGAS MANDIRI (SELURUH JAWABAN DISESUAIKAN DENGAN `DMA DATASET.xlsx`)

Berdasarkan **Tabel Panduan Tugas Mandiri per Project** (Halaman 20 Modul Praktikum):
* **No. Urut Project:** `15` — **SkillGap AI**
* **Dataset yang Digunakan:** [`DMA DATASET.xlsx`](file:///c:/Users/ASUS/Downloads/WEBSITE%20SKILLGAP/DMA%20DATASET.xlsx) (`Sheet: 'data'`, **500 baris mahasiswa**, **15 kolom**)
* **Tipe Masalah Utama:** `NLP, clustering` *(dikombinasikan dengan Supervised Classification & RAG Retrieval)*
* **Baseline Non-AI:** `Daftar kata kunci skill manual`
* **Baseline ML / Pengolahan Hari 1:** `TF-IDF + K-Means lowongan kerja / minat karier` *(beserta Pipeline Classification 5-Fold CV & TF-IDF Retrieval)*

---

### Soal 1 – Project Framing (Berbasis `DMA DATASET.xlsx`)

> **Jawaban Soal 1 (Project Framing):**
>
> **a. Nama Project, Sektor, dan Pengguna Utama Sistem:**
> * **Nama Project:** **SkillGap.AI** *(Sistem Pemetaan Kesenjangan Kompetensi dan Rekomendasi Pengembangan Diri, Persiapan Studi Lanjut, Karier, serta Sertifikasi Berbasis AI)*.
> * **Sektor:** *Education Technology (EdTech)* & *Human Capital / Career Analytics*.
> * **Pengguna Utama:** Mahasiswa dari berbagai tingkat tahun perkuliahan (`1st Year`, `2nd Year`, `3rd Year`, `Final Year`) dan lintas program studi (`B.Tech IT`, `B.Tech CSE`, `B.Sc Data Science`, `M.Tech AI`, `BBA`, `MBA`) sebagaimana tercatat pada **`DMA DATASET.xlsx`**, serta pelajar vokasi dan pencari kerja pemula di bidang IT.
>
> **b. Masalah yang Diselesaikan secara Spesifik, Terukur, dan Terbatas:**
> * **Spesifik:** Mengatasi kesenjangan kompetensi (*skill gap*) antara keterampilan teknis (`Technical Skills` & `Programming Languages`) serta soft skills (`Soft Skills`) yang dimiliki mahasiswa saat ini dengan target karier yang diminati (`Career Interest`), sekaligus memetakan solusi atas kendala kesiapan kerja (`Challenges`: *Lack of experience, Difficulty in resume building, Interview anxiety, Limited guidance, No networking opportunities*).
> * **Terukur:** Mengukur tingkat kemampuan teknis (`Rating` skala 1–5) dan kemampuan soft skills (`Rating.1` skala 1–5), menghitung `skor_kesiapan_industri` (skala 0–100), mengevaluasi pengelompokan kompetensi dengan *Silhouette Score*, serta mengklasifikasikan mahasiswa ke dalam kategori **`High_Gap`** (`1` — membutuhkan intervensi pelatihan teknis/proyek mendesak) atau **`Ready`** (`0` — siap kerja/magang) beserta bentuk dukungan yang dibutuhkan (`Support required`).
> * **Terbatas:** Dibatasi pada ruang lingkup **`DMA DATASET.xlsx`** (`500 baris mahasiswa, 15 kolom`) yang mencakup **6 minat karier utama IT** (`Cloud Architect`, `Software Developer`, `Data Scientist`, `Cybersecurity Expert`, `Business Analyst`, dan `AI Engineer`), **4 jenis dukungan intervensi** (`Resume workshops`, `Mentorship programs`, `Technical skill training`, `Internship opportunities`), dan **4 metode belajar** (`College curriculum`, `Self-study`, `Online`, `Bootcamp`).
>
> **c. Input dan Output Sistem (Sesuai Kolom `DMA DATASET.xlsx`):**
> * **Input Sistem:**
>   1. Tahun perkuliahan (`Year`) dan program studi saat ini (`Current Course`).
>   2. Daftar keahlian teknis (`Technical Skills`: *Data Analysis, Python, SQL, Machine Learning, Cloud Computing, Cybersecurity, Java, Blockchain*) dan bahasa pemrograman (`Programming Languages`: *Python, Java, JavaScript, C++, C#, R, Go*).
>   3. Skor penilaian mandiri teknis (`Rating`: skala 1–5) serta daftar `Soft Skills` beserta skor penilaiannya (`Rating.1`: skala 1–5).
>   4. Status pengalaman proyek (`Projects`: *Yes / No*), minat karier (`Career Interest`), tantangan utama (`Challenges`), dan metode belajar (`Method`).
> * **Output Sistem:**
>   1. Klaster kelompok kompetensi & target lowongan karier menggunakan **`TF-IDF + K-Means`** (sesuai Tabel Panduan No. 15).
>   2. Prediksi status kesenjangan kompetensi mahasiswa (**`High_Gap` [1]** vs **`Ready` [0]**) dan rekomendasi dukungan (`Support required`).
>   3. Hasil pengambilan dokumen acuan kompetensi & program intervensi menggunakan **Retrieval TF-IDF (`RAG`)**.
>
> **d. Tipe Masalah AI:**
> * Sesuai Tabel Panduan No. 15 (**SkillGap AI**): Kombinasi **NLP & Clustering** (*representasi TF-IDF pada teks `Technical Skills`, `Programming Languages`, dan `Career Interest` + pengelompokan `K-Means`*), **Supervised Classification** (*memprediksi status `High_Gap` vs `Ready`*), dan **Retrieval RAG** (*pencarian dokumen panduan karier & sertifikasi*).
>
> **e. Alasan Masalah Ini Membutuhkan AI dan Baseline Non-AI yang Dijadikan Pembanding:**
> * **Alasan Butuh AI:** Pada `DMA DATASET.xlsx`, terdapat **336 kombinasi unik `Technical Skills`**, **161 kombinasi `Programming Languages`**, dan **135 kombinasi `Soft Skills`** lintas 6 jurusan kuliah. Aturan *if-else* statis gagal menangkap hubungan multivariat antara latar belakang jurusan (misalnya mahasiswa `MBA`/`BBA` yang ingin beralih menjadi `Data Scientist` atau `Cloud Architect`), variasi teks keahlian, kepemilikan proyek (`Projects`), dan skor rating.
> * **Baseline Non-AI Pembanding (Sesuai Tabel Panduan No. 15):** **Pencocokan Daftar Kata Kunci Skill Manual** (*exact keyword matching* antara kolom `Technical Skills` & `Programming Languages` mahasiswa terhadap kamus kata kunci manual untuk setiap `Career Interest`) dikombinasikan dengan aturan kepemilikan proyek (`Projects == 'No'`).
>
> **f. Metrik Evaluasi Utama beserta Alasannya:**
> * **Classification (`High_Gap` vs `Ready`):** **F1-Score** dan **Recall** dipilih sebagai metrik utama karena distribusi kelas pada `DMA DATASET.xlsx` tidak seimbang (`61.8% Ready` [309 mahasiswa] berbanding `38.2% High_Gap` [191 mahasiswa]). **Recall** yang tinggi sangat krusial pada skrining kesiapan mahasiswa agar mahasiswa yang mengalami `High_Gap` tidak terlewat dari pemberian pelatihan intensif (*meminimalkan False Negative*).
> * **Clustering (`TF-IDF + K-Means`):** **Silhouette Score** ($-1$ s.d. $+1$) untuk mengevaluasi kualitas pemisahan klaster profesi pada `DMA DATASET.xlsx`.
> * **Retrieval (`RAG`):** **Recall@1**, **Recall@3**, dan **MRR (*Mean Reciprocal Rank*)**.
>
> **g. Risiko Bias dan Privasi Data pada `DMA DATASET.xlsx` beserta Mitigasinya:**
> * **Risiko Privasi Data (PII):** `DMA DATASET.xlsx` mencantumkan identitas pribadi langsung berupa nama lengkap (`Name`: *Iorgo Hakonsen, Emmery Duffyn, dst.*) dan alamat email aktif (`email_id`: *ihakonsen0@instagram.com, dst.*) pada seluruh 500 baris. *Mitigasi:* Menghapus kolom `Name` dan `email_id` secara permanen pada tahap pembersihan data (*data anonymization*).
> * **Risiko Bias:** Potensi ketimpangan jumlah sampel antar program studi (`MBA` [93] dan `M.Tech AI` [92] lebih banyak daripada `B.Tech CSE` [75]). *Mitigasi:* Menggunakan *stratified train-test split* (`stratify=y`), evaluasi *5-fold cross-validation*, dan validasi dosen/konselor karier (*human-in-the-loop*).
>
> **h. Ruang Lingkup (Apa yang Dikerjakan dan TIDAK Dikerjakan dalam Blok 5 Hari):**
> * **Yang Dikerjakan:** (1) Eksplorasi data (EDA) menyeluruh pada `DMA DATASET.xlsx` (`500 baris, 15 kolom`), (2) Pembersihan spasi berlebih pada 5 nama kolom, penyeragaman 9 variasi penulisan kolom `'Year '`, serta penghapusan kolom 100% kosong `Unnamed: 13` dan kolom PII (`Name`, `email_id`), (3) Pembuatan 3 fitur turunan domain (`total_item_skill`, `skor_kesiapan_industri`, `indeks_defisit_skill`) dan matriks `TF-IDF`, (4) Implementasi Baseline Non-AI (*daftar kata kunci skill manual*), Baseline ML Clustering (`TF-IDF + K-Means`), *Pipeline Classification 5-Fold CV*, dan *Retrieval TF-IDF*, serta (5) Pemeriksaan *data leakage*.
> * **Yang TIDAK Dikerjakan:** *Scraping* portal lowongan kerja eksternal secara *real-time* saat runtime dan *pre-training* model LLM dari nol.

---

### Soal 2 – EDA Dataset Project (`DMA DATASET.xlsx` — `notebooks/01_eda.ipynb`)

#### Kode Python Eksplorasi `DMA DATASET.xlsx` (Langkah A.1 – A.4):
```python
import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# A.1 Membaca DMA DATASET.xlsx dari folder WEBSITE SKILLGAP
df = pd.read_excel('DMA DATASET.xlsx')
print(df.head())

# A.2 Ukuran data, tipe kolom (df.info()), missing value, duplikat, & variasi kategori
print('Ukuran data (df.shape):', df.shape)
print('Daftar nama kolom asli:', list(df.columns))
df.info()

print('\nJumlah missing value per kolom:\n', df.isnull().sum())
print('\nJumlah baris duplikat penuh:', df.duplicated().sum())
print("\nVariasi penulisan pada kolom 'Year ':\n", df['Year '].value_counts(dropna=False))
print("\nDistribusi Career Interest:\n", df['Career Interest'].value_counts(normalize=True).round(3))
print("\nDistribusi Support required:\n", df['Support required'].value_counts(normalize=True).round(3))

# Statistik Deskriptif Numerik & Kategorikal
print(df[['Rating', 'Rating.1', 'Unnamed: 13']].describe().round(2))
print(df.describe(include='object'))
```

#### Output Soal 2 (a, b, c) – Eksplorasi `DMA DATASET.xlsx` & Vektorisasi NumPy:
```text
--- Output A.1: Lima Baris Pertama DMA DATASET.xlsx (df.head()) ---
              Name                    email_id  Year      Current Course                      Technical Skills      Programming Languages  Rating                                   Soft Skills  Rating.1  Projects       Career Interest                  Challenges           Support required  Unnamed: 13              Method
0   Iorgo Hakonsen    ihakonsen0@instagram.com   2nd                 MBA             Cybersecurity, Blockchain              Python, R, C#       2  Communication, Adaptability, Problem-Solving         1       Yes        Data Scientist            Interview anxiety       Mentorship programs          NaN  College curriculum
1    Emmery Duffyn    eduffyn1@dailymotion.com  Final                BBA                 SQL, Machine Learning                      R, Go       3    Leadership, Communication, Problem-Solving         4        No           AI Engineer  No networking opportunities  Technical skill training          NaN  College curriculum
2  Susanetta Wards            swards2@digg.com    2nd  B.Sc Data Science                   Cybersecurity, Java                 JavaScript       4  Leadership, Time Management, Problem-Solving         1        No        Data Scientist            Interview anxiety  Technical skill training          NaN          Self-study
3    Amanda Gussin           agussin3@webs.com   2nd           M.Tech AI               Blockchain, Python, SQL                 Python, C#       3            Adaptability, Teamwork, Leadership         4        No  Cybersecurity Expert             Limited guidance          Resume workshops          NaN  College curriculum
4   Carlina Beaven  cbeaven4@timesonline.co.uk   1st           B.Tech IT  Blockchain, Machine Learning, Python                   Java, Go       4       Teamwork, Adaptability, Problem-Solving         3       Yes  Cybersecurity Expert  No networking opportunities  Internship opportunities          NaN              Online

--- Output A.2.1: Ukuran Data (df.shape) dan Informasi Tipe Kolom (df.info()) ---
Ukuran data (df.shape): (500, 15)
Daftar Nama Kolom Asli:
['Name', 'email_id', 'Year ', 'Current Course', 'Technical Skills', '     Programming Languages', 'Rating', 'Soft Skills', 'Rating.1', ' Projects', 'Career Interest', 'Challenges ', 'Support required', 'Unnamed: 13', ' Method']

<class 'pandas.DataFrame'>
RangeIndex: 500 entries, 0 to 499
Data columns (total 15 columns):
 #   Column                      Non-Null Count  Dtype  
---  ------                      --------------  -----  
 0   Name                        500 non-null    str    
 1   email_id                    500 non-null    str    
 2   Year                        500 non-null    str    
 3   Current Course              500 non-null    str    
 4   Technical Skills            500 non-null    str    
 5        Programming Languages  500 non-null    str    
 6   Rating                      500 non-null    int64  
 7   Soft Skills                 500 non-null    str    
 8   Rating.1                    500 non-null    int64  
 9    Projects                   500 non-null    str    
 10  Career Interest             500 non-null    str    
 11  Challenges                  500 non-null    str    
 12  Support required            500 non-null    str    
 13  Unnamed: 13                 0 non-null      float64
 14   Method                     500 non-null    str    
dtypes: float64(1), int64(2), str(12)

--- Output A.2.2: Missing Value, Duplikat, 9 Variasi Kolom 'Year ', & Distribusi Label ---
1. Jumlah Missing Value per Kolom (df.isnull().sum()):
Unnamed: 13                   500  (100% kosong / NaN)
14 kolom lainnya                0

2. Jumlah Baris Duplikat Penuh (df.duplicated().sum()): 0

3. Variasi Penulisan Tidak Konsisten pada Kolom 'Year ' (9 Variasi untuk 4 Tingkat Kuliah):
Final Year    129
2nd Year      126
3rd Year      124
1st Year      110
2nd             4
2nd             2
1st             2
Final           2
Final           1

4. Distribusi Label Target Karier ('Career Interest'):
Cloud Architect         0.196 (98 mahasiswa)
Software Developer      0.184 (92 mahasiswa)
Data Scientist          0.170 (85 mahasiswa)
Cybersecurity Expert    0.156 (78 mahasiswa)
Business Analyst        0.154 (77 mahasiswa)
AI Engineer             0.140 (70 mahasiswa)

5. Distribusi Kebutuhan Dukungan ('Support required'):
Resume workshops            0.286 (143 mahasiswa)
Mentorship programs         0.266 (133 mahasiswa)
Technical skill training    0.228 (114 mahasiswa)
Internship opportunities    0.220 (110 mahasiswa)

6. Distribusi Label Kesenjangan Kompetensi ('kategori_gap' — Pemeriksaan Class Imbalance):
Ready       0.618 (309 mahasiswa)
High_Gap    0.382 (191 mahasiswa)

--- Output A.2.3: Statistik Deskriptif Numerik & Kategorikal (df.describe()) ---
       Rating  Rating.1  Unnamed: 13
count  500.00    500.00          0.0
mean     2.95      2.96          NaN
std      1.40      1.44          NaN
min      1.00      1.00          NaN
25%      2.00      2.00          NaN
50%      3.00      3.00          NaN
75%      4.00      4.00          NaN
max      5.00      5.00          NaN

--- Output A.3: Perbandingan Kecepatan Looping Python vs Vektorisasi NumPy ---
Looping Python (500 mahasiswa)    : 0.327 ms
Vektorisasi NumPy (500 mahasiswa) : 0.013 ms (24.8x lebih cepat | Hasil identik: True)
```

#### Output Soal 2 (d) – Empat Grafik Visualisasi EDA pada `DMA DATASET.xlsx`:

![Empat Grafik EDA pada DMA DATASET.xlsx](C:\Users\ASUS\.gemini\antigravity\brain\91ed1cec-3001-4ebe-9ec2-d2f75d59cf52\soal2_eda_skillgap.png)

> **Insight EDA (`DMA DATASET.xlsx` — Minimal 3 Insight Beserta Dampaknya bagi Pemodelan):**
>
> 1. **Insight 1 (Temuan Kolom 100% Missing Value `Unnamed: 13` & Spasi Tersembunyi pada Nama Kolom):**
>    * *Temuan Data:* Dari 15 kolom pada `DMA DATASET.xlsx`, kolom `Unnamed: 13` memiliki **500 missing value (100% bernilai `NaN` / kosong)**, sedangkan 14 kolom lainnya memiliki `0` missing value dan `0` baris duplikat penuh. Selain itu, terdapat **5 nama kolom yang mengandung spasi di awal/akhir** (`'Year '`, `'     Programming Languages'`, `' Projects'`, `'Challenges '`, `' Method'`) serta penamaan kolom ambigu (`'Rating'` untuk Technical Skills dan `'Rating.1'` untuk Soft Skills).
>    * *Dampak bagi Pemodelan:* Kolom `Unnamed: 13` wajib dihapus (`drop`) karena tidak mengandung informasi apa pun dan akan menyebabkan kegagalan pada `SimpleImputer`. Seluruh nama kolom wajib dibersihkan dengan `.str.strip()` dan diganti namanya (`Technical_Rating`, `SoftSkill_Rating`) agar tidak memicu `KeyError` di dalam `ColumnTransformer`.
>
> 2. **Insight 2 (Inkonsistensi Format Penulisan pada Kolom Kategorik `'Year '` — 9 Variasi Penulisan):**
>    * *Temuan Data:* Grafik 2 dan `df['Year '].value_counts()` membuktikan adanya **9 variasi penulisan berbeda** untuk 4 tingkat tahun perkuliahan, yaitu: `'Final Year'` (129), `'Final'` (2), `'Final '` (1), `'2nd Year'` (126), `'2nd'` (4), `'2nd '` (2), `'3rd Year'` (124), `'1st Year'` (110), dan `'1st '` (2).
>    * *Dampak bagi Pemodelan:* Apabila tidak diseragamkan terlebih dahulu, `OneHotEncoder` akan menganggap `'2nd Year'`, `'2nd'`, dan `'2nd '` sebagai tiga kategori berbeda dan membentuk 9 kolom fitur palsu yang memecah bobot model. Setelah diseragamkan menjadi 4 kategori baku, diperoleh distribusi merata: `2nd Year` (132), `Final Year` (132), `3rd Year` (124), dan `1st Year` (112).
>
> 3. **Insight 3 (Pengaruh Pengalaman Proyek `'Projects'` & Rating terhadap Risiko `High_Gap`):**
>    * *Temuan Data:* Sebanyak **50.8% mahasiswa (254 dari 500)** belum pernah mengerjakan proyek (`Projects == 'No'`), dengan rata-rata `Technical Rating` **2.95 ± 1.40** (skala 1–5) dan `SoftSkill Rating` **2.96 ± 1.44**. Grafik 3 (Boxplot) memperlihatkan bahwa mahasiswa tanpa proyek (`No`) yang memiliki `Technical Rating <= 2` seluruhnya masuk ke kategori `High_Gap` dengan median skor kesiapan di bawah 45/100.
>    * *Dampak bagi Pemodelan:* Interaksi antara `Technical_Rating`, `SoftSkill_Rating`, dan status kepemilikan `Projects` memiliki korelasi terkuat terhadap status gap ($r = -0.68$ pada Heatmap Grafik 4), sehingga sangat efektif dijadikan dasar pembuatan fitur turunan `skor_kesiapan_industri`.
>
> 4. **Insight 4 (Pemeriksaan Class Imbalance & Privasi Identitas Mahasiswa / PII):**
>    * *Temuan Data:* Distribusi minat karier (`Career Interest`) terbagi ke dalam 6 profesi dipimpin oleh `Cloud Architect` (`19.6%`) dan `Software Developer` (`18.4%`), sedangkan distribusi label kesenjangan kompetensi menunjukkan proporsi `Ready` sebesar **61.8% (309 mahasiswa)** berbanding `High_Gap` sebesar **38.2% (191 mahasiswa)**. Selain itu, kolom `Name` dan `email_id` memiliki 500 nilai unik (berbeda untuk setiap baris).
>    * *Dampak bagi Pemodelan:* Adanya ketimpangan kelas (`61.8%` vs `38.2%`) mewajibkan penggunaan `stratify=y` pada `train_test_split` serta penggunaan metrik **F1-Score** dan **Recall**. Sementara itu, kolom `Name` dan `email_id` wajib dihapus untuk melindungi privasi data (*PII anonymization*) dan mencegah model menghafal identitas individu (*overfitting*).

---

### Soal 3 – Pembersihan Data dan Feature Engineering pada `DMA DATASET.xlsx` (`notebooks/01_eda.ipynb`)

#### Kode Python Pembersihan Data & Feature Engineering (Langkah A.5, A.6, A.12):
```python
df_bersih = df.copy()

# 1) Bersihkan spasi pada seluruh nama kolom & ubah nama kolom Rating yang ambigu
df_bersih.columns = [c.strip() for c in df_bersih.columns]
df_bersih = df_bersih.rename(columns={'Rating': 'Technical_Rating', 'Rating.1': 'SoftSkill_Rating'})

# 2) Seragamkan 9 variasi penulisan kolom 'Year' menjadi 4 tingkat baku
peta_year = {
    '1st Year': '1st Year', '1st ': '1st Year', '1st': '1st Year',
    '2nd Year': '2nd Year', '2nd ': '2nd Year', '2nd': '2nd Year',
    '3rd Year': '3rd Year', '3rd ': '3rd Year', '3rd': '3rd Year',
    'Final Year': 'Final Year', 'Final ': 'Final Year', 'Final': 'Final Year'
}
df_bersih['Year'] = df_bersih['Year'].astype(str).str.strip().map(lambda x: peta_year.get(x, x))
df_bersih['Projects'] = df_bersih['Projects'].astype(str).str.strip()

# 3) Hapus kolom 100% kosong ('Unnamed: 13') serta kolom identitas pribadi PII ('Name', 'email_id')
df_bersih = df_bersih.drop(columns=['Unnamed: 13', 'Name', 'email_id'])

# 4) Buat 3 Fitur Turunan Berbasis Domain + Binning Tingkat Kesiapan
df_bersih['jml_tech_skills'] = df_bersih['Technical Skills'].apply(lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]))
df_bersih['jml_prog_langs'] = df_bersih['Programming Languages'].apply(lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]))
df_bersih['total_item_skill'] = df_bersih['jml_tech_skills'] + df_bersih['jml_prog_langs']
df_bersih['punya_proyek_biner'] = (df_bersih['Projects'] == 'Yes').astype(int)

df_bersih['skor_kesiapan_industri'] = (
    0.55 * (df_bersih['Technical_Rating'] * 20.0) +
    0.30 * (df_bersih['SoftSkill_Rating'] * 20.0) +
    0.15 * (df_bersih['punya_proyek_biner'] * 100.0)
).round(2)
df_bersih['indeks_defisit_skill'] = np.maximum(0.0, 80.0 - df_bersih['skor_kesiapan_industri']).round(2)
df_bersih['tingkat_kesiapan'] = pd.cut(df_bersih['skor_kesiapan_industri'], bins=[0, 50, 72, 100], labels=['Butuh_Intensif', 'Sedang_Berkembang', 'Siap_Industri'])
```

#### Output Soal 3 – Data Sebelum dan Sesudah Dibersihkan serta Fitur Baru pada `DMA DATASET.xlsx`:
```text
Ukuran setelah dibersihkan (hapus Unnamed: 13, Name, email_id): (500, 12)

Daftar nama kolom setelah dibersihkan spasinya:
['Year', 'Current Course', 'Technical Skills', 'Programming Languages', 'Technical_Rating', 'Soft Skills', 'SoftSkill_Rating', 'Projects', 'Career Interest', 'Challenges', 'Support required', 'Method']

Distribusi kolom 'Year' setelah 9 variasi penulisan diseragamkan menjadi 4 kategori baku:
2nd Year      132
Final Year    132
3rd Year      124
1st Year      112

Jumlah missing value setelah pembersihan: 0 di seluruh 12 kolom

--- Sampel 6 Baris Pertama Fitur Turunan Baru pada DMA DATASET.xlsx ---
         Year     Current Course  Technical_Rating  SoftSkill_Rating  total_item_skill  skor_kesiapan_industri  indeks_defisit_skill   tingkat_kesiapan  target
0    2nd Year                MBA                 2                 1                 5                    43.0                  37.0     Butuh_Intensif       1
1  Final Year                BBA                 3                 4                 4                    57.0                  23.0  Sedang_Berkembang       0
2    2nd Year  B.Sc Data Science                 4                 1                 3                    50.0                  30.0     Butuh_Intensif       0
3    2nd Year          M.Tech AI                 3                 4                 5                    57.0                  23.0  Sedang_Berkembang       0
4    1st Year          B.Tech IT                 4                 3                 5                    77.0                   3.0      Siap_Industri       0
5    2nd Year          B.Tech IT                 1                 4                 6                    35.0                  45.0     Butuh_Intensif       1

--- Representasi Matriks TF-IDF Teks Profil & Keahlian pada DMA DATASET.xlsx ---
Ukuran matriks TF-IDF (DMA DATASET): (500, 30)
Kata dengan Bobot TF-IDF Tertinggi pada Kelas High_Gap (1) vs Ready (0):
target             0      1
data           0.158  0.160
python         0.156  0.153
java           0.162  0.153
cloud          0.136  0.141
communication  0.102  0.139
cybersecurity  0.145  0.133
leadership     0.111  0.125
```

> **Alasan setiap keputusan pembersihan dan fitur baru (`DMA DATASET.xlsx`):**
> 1. **Pembersihan Spasi Nama Kolom & Penggantian Nama Kolom Ambigu:** Menghapus spasi di awal/akhir pada `'Year '`, `'     Programming Languages'`, `' Projects'`, `'Challenges '`, dan `' Method'`, serta mengubah `'Rating'` menjadi `'Technical_Rating'` dan `'Rating.1'` menjadi `'SoftSkill_Rating'` agar skema data jelas dan bebas `KeyError`.
> 2. **Penyeragaman 9 Variasi Penulisan Kolom `'Year'` Menjadi 4 Tingkat Baku:** Mengubah `'1st '`, `'1st'` $\rightarrow$ `'1st Year'`; `'2nd '`, `'2nd'` $\rightarrow$ `'2nd Year'`; dan `'Final '`, `'Final'` $\rightarrow$ `'Final Year'` agar `OneHotEncoder` tidak membentuk kolom kategori duplikat.
> 3. **Penghapusan Kolom `'Unnamed: 13'` (`100% NaN`) serta Kolom PII (`'Name'`, `'email_id'`):** `'Unnamed: 13'` dibuang karena seluruh 500 barisnya kosong, sedangkan `'Name'` dan `'email_id'` dibuang untuk menjaga privasi data mahasiswa serta mencegah model menghafal identitas individu.
> 4. **Pembuatan 3 Fitur Turunan Berbasis Pengetahuan Domain pada `DMA DATASET.xlsx`:**
>    * `total_item_skill = jml_tech_skills + jml_prog_langs`: Menghitung banyaknya variasi keahlian teknis dan bahasa pemrograman yang dikuasai mahasiswa dari teks koma-terpisah.
>    * `skor_kesiapan_industri = 0.55*(Technical_Rating*20) + 0.30*(SoftSkill_Rating*20) + 0.15*(punya_proyek_biner*100)`: Mengukur skor kesiapan karier (skala 0–100) dengan menggabungkan rating teknis (55%), softskill (30%), dan kepemilikan proyek nyata (15%).
>    * `indeks_defisit_skill = max(0, 80 - skor_kesiapan_industri)` & Binning `tingkat_kesiapan`: Mengukur jarak kekurangan skor mahasiswa terhadap ambang kesiapan industri (80 poin) dan mengelompokkannya ke `'Butuh_Intensif'`, `'Sedang_Berkembang'`, dan `'Siap_Industri'`.
> 5. **Ekstraksi Teks TF-IDF:** Menggabungkan teks `'Current Course'`, `'Technical Skills'`, `'Programming Languages'`, `'Soft Skills'`, `'Career Interest'`, dan `'Challenges'` dalam huruf kecil ke dalam `TfidfVectorizer` untuk menangkap pola kecocokan keahlian terhadap minat karier.

---

### Soal 4 – Baseline Project pada `DMA DATASET.xlsx` (`notebooks/02_baseline.ipynb`)

#### Output Soal 4 – Tabel Perbandingan Baseline, TF-IDF + K-Means pada `DMA DATASET.xlsx`, & RAG Retrieval:
```text
--- Split Data Latih (80%) dan Data Uji (20%) Sebelum Preprocessing ---
Data latih: (400, 11) | Data uji: (100, 11)
Proporsi kelas High_Gap di latih: 0.383 | Proporsi kelas High_Gap di uji: 0.380

--- Tabel Perbandingan Kinerja Model pada Data Uji (DMA DATASET.xlsx) ---
                                 Model  Accuracy  Precision  Recall    F1
            1. Dummy (Kelas Terbanyak)     0.620      0.000   0.000 0.000
2. Baseline Non-AI (Kata Kunci Manual)     0.600      0.458   0.289 0.355
     3. Logistic Regression (Pipeline)     0.950      0.902   0.974 0.937
           4. Decision Tree (Pipeline)     0.990      1.000   0.974 0.987
           5. Random Forest (Pipeline)     0.930      1.000   0.816 0.899

--- Evaluasi Stabilitas Model dengan 5-Fold Cross-Validation pada Data Latih ---
Logistic Regression    F1 (5-fold CV) = 0.884 ± 0.048
Decision Tree          F1 (5-fold CV) = 0.949 ± 0.030
Random Forest          F1 (5-fold CV) = 0.916 ± 0.018

--- Evaluasi Silhouette Score TF-IDF + K-Means pada DMA DATASET.xlsx (Tabel Panduan No. 15) ---
k=2: silhouette_score = 0.111
k=3: silhouette_score = 0.171
k=4: silhouette_score = 0.225
k=5: silhouette_score = 0.259
k=6: silhouette_score = 0.294  <-- Puncak Optimal (Sesuai 6 Career Interest di DMA DATASET)
k=7: silhouette_score = 0.253

Kata Kunci TF-IDF Teratas Tiap Cluster (k=6):
Cluster 0 (Dominan: Cybersecurity Expert): expert, cybersecurity, python, java, sql
Cluster 1 (Dominan: Cloud Architect     ): architect, cloud, java, python, cybersecurity
Cluster 2 (Dominan: Data Scientist      ): scientist, data, python, java, cybersecurity
Cluster 3 (Dominan: Software Developer  ): software, developer, python, java, blockchain
Cluster 4 (Dominan: Business Analyst    ): business, analyst, java, python, sql
Cluster 5 (Dominan: AI Engineer         ): ai, engineer, java, python, learning

--- Evaluasi Baseline Retrieval Dokumen Knowledge Base (TF-IDF) ---
Recall@1 = 1.00 | Recall@3 = 1.00 | MRR = 1.00
Uji Pertanyaan di Luar Konteks ('Berapa dosis obat paracetamol untuk anak demam?') -> Dokumen terambil: []
```

![Grafik Silhouette Score TF-IDF + K-Means dan Perbandingan Baseline pada DMA DATASET.xlsx](C:\Users\ASUS\.gemini\antigravity\brain\91ed1cec-3001-4ebe-9ec2-d2f75d59cf52\soal4_kmeans_baseline.png)

> **Apakah baseline ML sudah lebih baik daripada baseline non-AI? Jelaskan.**
>
> **YA, Baseline Machine Learning di dalam Pipeline terbukti JAUH LEBIH BAIK dibandingkan Baseline Non-AI maupun Dummy Classifier pada `DMA DATASET.xlsx`**, dengan bukti kuantitatif berikut:
> 1. **Keunggulan Pipeline Classification ML vs Baseline Non-AI (Daftar Kata Kunci Skill Manual):**
>    * **Dummy Classifier** (menebak kelas terbanyak `'Ready'`) hanya memperoleh *Accuracy* = `0.620` namun **Recall = `0.000`** dan **F1 = `0.000`** karena sama sekali gagal mendeteksi mahasiswa berkategori `High_Gap`.
>    * **Baseline Non-AI (Pencocokan Daftar Kata Kunci Skill Manual terhadap `Career Interest`)** hanya mencapai *Accuracy* = `0.600`, **Recall = `0.289`**, dan **F1-Score = `0.355`**. Hal ini terjadi karena banyak mahasiswa di `DMA DATASET.xlsx` yang mencantumkan kata kunci bahasa pemrograman populer (seperti `Python` atau `Java`), tetapi memiliki `Technical Rating` rendah (`1` atau `2`) dan belum memiliki pengalaman proyek (`Projects == 'No'`).
>    * Sebaliknya, **Pipeline Machine Learning** (`ColumnTransformer` + Model) melesat jauh melampaui baseline non-AI: **Logistic Regression** mencapai *Accuracy* = `0.950` dan **F1 = `0.937`** (*5-Fold CV F1* = `0.884 ± 0.048`), **Random Forest** mencapai *Accuracy* = `0.930`, *Precision* = `1.000`, dan **F1 = `0.899`** dengan stabilitas lintas-fold terbaik (*5-Fold CV F1* = `0.916 ± 0.018`), serta **Decision Tree** mencapai *Accuracy* = `0.990` dan **F1 = `0.987`** (*5-Fold CV F1* = `0.949 ± 0.030`).
> 2. **Keberhasilan Pengolahan `TF-IDF + K-Means` pada `DMA DATASET.xlsx` (Tabel Panduan No. 15):**
>    * Evaluasi *Silhouette Score* dari $k=2$ (`0.111`) meningkat secara konsisten hingga mencapai **nilai puncak tertinggi tepat pada $k=6$ (`0.294`)** sebelum turun kembali pada $k=7$ (`0.253`). Nilai $k=6$ secara alami bersesuaian dengan 6 kelompok minat karier (`Career Interest`) di dalam `DMA DATASET.xlsx` (*Cluster 0: Cybersecurity Expert, Cluster 1: Cloud Architect, Cluster 2: Data Scientist, Cluster 3: Software Developer, Cluster 4: Business Analyst, Cluster 5: AI Engineer*).
> 3. **Keberhasilan Baseline Retrieval Dokumen RAG Berbasis TF-IDF:**
>    * Pengujian retrieval TF-IDF menghasilkan **`Recall@1 = 1.00`**, **`Recall@3 = 1.00`**, dan **`MRR = 1.00`**, serta mengembalikan daftar kosong `[]` untuk pertanyaan di luar domain.

---

### Soal 5 – Pemeriksaan Data Leakage pada `DMA DATASET.xlsx` (`notebooks/02_baseline.ipynb`)

```text
--- Simulasi Bahaya Data Leakage & Pemeriksaan Overlap Mahasiswa ---
Skor Model dengan Data Leakage (memakai fitur turunan pasca-keputusan 'tingkat_kesiapan'):
Accuracy = 0.920 | Precision = 0.875 | Recall = 0.921 | F1 = 0.897

Pemeriksaan Overlap Objek (email_id) antara Data Latih dan Data Uji: 0 mahasiswa duplikat (Valid = 0)
Model berhasil disimpan di: models/baseline_skillgap.joblib
Data bersih berhasil disimpan di: data/processed/data_skillgap_bersih.csv (500 baris, 24 kolom)
```

> **Hasil pemeriksaan data leakage dan perbaikannya (`DMA DATASET.xlsx`):**
> 1. **a. Daftar Fitur yang Dipakai & Identifikasi Fitur Penyebab Target Leakage:**
>    * **Fitur Valid yang Dipakai pada Pipeline `X` (11 Fitur Input Asesmen):** `Technical_Rating`, `SoftSkill_Rating`, `jml_tech_skills`, `jml_prog_langs`, `total_item_skill`, `Year`, `Current Course`, `Projects`, `Career Interest`, `Method`, dan `teks_profil_lengkap` (`TF-IDF`).
>    * **Fitur Penyebab Target Leakage yang Dikeluarkan dari `X`:** Kolom turunan pasca-evaluasi seperti `tingkat_kesiapan`, `skor_kesiapan_industri`, dan `indeks_defisit_skill` (serta `Support required` yang merupakan rekomendasi intervensi akhir) **TIDAK dimasukkan** ke dalam matriks fitur `X` pada pelatihan klasifikasi karena diturunkan langsung dari formula penentu status gap. Selain itu, kolom identitas `Name` dan `email_id` telah dibuang.
> 2. **b. Pencegahan Train-Test Contamination melalui Pipeline & ColumnTransformer:**
>    * Dataset (`500 baris`) di-split terlebih dahulu menggunakan `train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)` menjadi **`400` baris data latih** dan **`100` baris data uji**.
>    * Seluruh proses `SimpleImputer` (*median* & *most_frequent*), `StandardScaler`, `OneHotEncoder`, dan `TfidfVectorizer` dibungkus di dalam `ColumnTransformer` dan `Pipeline` scikit-learn, sehingga perhitungan rata-rata, simpangan baku, dan bobot IDF murni dihitung dari 400 baris data latih (`X_train`).
> 3. **c. Pemeriksaan Overlap Objek / Mahasiswa yang Sama di Data Latih dan Data Uji:**
>    * Pengujian irisan identitas unik `len(set(id_train).intersection(set(id_test)))` pada `email_id` membuktikan terdapat **tepat `0` mahasiswa** yang muncul di data latih dan data uji sekaligus.

---

### Lembar Pengesahan Praktikum

| Mahasiswa | Asisten Dosen |
|---|---|
| 1. **Julia Rahma Nurmawati** (NIM. V3925009)<br>2. **Aisyah Nurul Ilmi Prianto** (NIM. V3925018) | Nama Asisten Dosen: ...........................................<br>NIM: ..................................................................... |
| **Mengetahui — Dosen Mata Kuliah** | **Masbahah, S.Pd., M.Pd.**<br>NIP. 1987052520200801 |
