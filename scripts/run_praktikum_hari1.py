import os
import time
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.cluster import KMeans
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, silhouette_score
from sklearn.metrics.pairwise import cosine_similarity

os.makedirs("docs/images", exist_ok=True)
os.makedirs("models", exist_ok=True)
os.makedirs("data/processed", exist_ok=True)
os.makedirs("notebooks", exist_ok=True)

results = {}

# ==============================================================================
# A.1 & A.2 (SOAL 2): IMPORT DATA & EDA PADA 'DMA DATASET.xlsx'
# ==============================================================================
df = pd.read_excel("DMA DATASET.xlsx")
# Simpan juga salinan CSV di folder datasets agar kompatibel lintas tools
df.to_csv("datasets/DMA_DATASET.csv", index=False)

out_a1 = df.head(5).to_string()
results["out_a1"] = out_a1

import io
buf = io.StringIO()
df.info(buf=buf)
info_str = buf.getvalue()
out_a2_1 = f"Ukuran data (df.shape): {df.shape}\nDaftar Nama Kolom Asli:\n{list(df.columns)}\n\nInformasi Tipe Kolom (df.info()):\n{info_str}"
results["out_a2_1"] = out_a2_1

missing_str = df.isnull().sum().to_string()
dup_count = df.duplicated().sum()
year_uniq = df['Year '].value_counts(dropna=False).to_string()
course_dist = df['Current Course'].value_counts().to_string()
career_dist = df['Career Interest'].value_counts(normalize=True).round(3).to_string()
support_dist = df['Support required'].value_counts(normalize=True).round(3).to_string()

# Label target kesenjangan kompetensi (High_Gap = 1 jika Technical Rating <= 2 dan Projects == 'No', atau rata-rata rating <= 2.0)
kategori_gap_series = np.where(
    ((df['Rating'] <= 2) & (df[' Projects'].str.strip() == 'No')) | ((df['Rating'] + df['Rating.1']) / 2.0 <= 2.0),
    'High_Gap',
    'Ready'
)
df_eda = df.copy()
df_eda['kategori_gap'] = kategori_gap_series
gap_prop = pd.Series(kategori_gap_series).value_counts(normalize=True).round(3).to_string()
gap_cnt = pd.Series(kategori_gap_series).value_counts().to_string()

out_a2_2 = (
    f"1. Jumlah Missing Value per Kolom (df.isnull().sum()):\n{missing_str}\n\n"
    f"2. Jumlah Baris Duplikat Penuh (df.duplicated().sum()): {dup_count}\n\n"
    f"3. Variasi Penulisan Tidak Konsisten pada Kolom 'Year ' (9 Variasi Penulisan untuk 4 Tingkat Kuliah):\n{year_uniq}\n\n"
    f"4. Distribusi Label Target Karier ('Career Interest'):\n{career_dist}\n\n"
    f"5. Distribusi Kebutuhan Dukungan ('Support required'):\n{support_dist}\n\n"
    f"6. Distribusi Label Kesenjangan Kompetensi ('kategori_gap' — Pemeriksaan Class Imbalance):\nProporsi:\n{gap_prop}\nJumlah Baris:\n{gap_cnt}"
)
results["out_a2_2"] = out_a2_2

out_a2_3 = (
    "Statistik Deskriptif Kolom Numerik (df.describe().round(2)):\n" +
    df[['Rating', 'Rating.1', 'Unnamed: 13']].describe().round(2).to_string() +
    "\n\nStatistik Deskriptif Kolom Kategorik (df.describe(include='object')):\n" +
    df[['Year ', 'Current Course', 'Technical Skills', '     Programming Languages', ' Soft Skills' if ' Soft Skills' in df.columns else 'Soft Skills', ' Projects', 'Career Interest', 'Challenges ', 'Support required', ' Method']].describe().to_string()
)
results["out_a2_3"] = out_a2_3

# ==============================================================================
# A.3: NUMPY LOOPING VS VEKTORISASI PADA DMA DATASET (Rating Teknis & Soft Skill)
# ==============================================================================
r_tek = df['Rating'].to_numpy(dtype=float)
r_soft = df['Rating.1'].to_numpy(dtype=float)

mulai = time.perf_counter()
skor_loop = []
for i in range(len(r_tek)):
    skor_loop.append((0.6 * r_tek[i] + 0.4 * r_soft[i]) * 20.0)
waktu_loop = time.perf_counter() - mulai

mulai = time.perf_counter()
skor_vec = (0.6 * r_tek + 0.4 * r_soft) * 20.0
waktu_vec = time.perf_counter() - mulai

same_res = np.allclose(skor_loop, skor_vec)
speedup = waktu_loop / max(waktu_vec, 1e-9)
out_a3 = (
    f"Looping Python (500 mahasiswa)    : {waktu_loop*1000:.3f} ms\n"
    f"Vektorisasi NumPy (500 mahasiswa) : {waktu_vec*1000:.3f} ms\n"
    f"Percepatan (Speedup)              : {speedup:.1f}x lebih cepat\n"
    f"Hasil perhitungan identik?        : {same_res}"
)
results["out_a3"] = out_a3

# ==============================================================================
# A.4 (SOAL 2.d): VISUALISASI 4 GRAFIK EDA DARI 'DMA DATASET.xlsx'
# ==============================================================================
sns.set_theme(style="whitegrid")
fig, ax = plt.subplots(2, 2, figsize=(14, 10.5))

# Grafik 1: Distribusi Career Interest & Kategori Gap
order_career = df_eda['Career Interest'].value_counts().index
sns.countplot(data=df_eda, y='Career Interest', order=order_career, hue='kategori_gap', palette=['#2563eb', '#dc2626'], ax=ax[0, 0])
ax[0, 0].set_title('1. Distribusi Minat Karier (Career Interest) per Kategori Gap', fontsize=11, fontweight='bold')
ax[0, 0].set_xlabel('Jumlah Mahasiswa')
ax[0, 0].set_ylabel('Target Karier (Career Interest)')
ax[0, 0].legend(title='Status Gap')

# Grafik 2: Variasi Penulisan Kolom 'Year ' Sebelum Dibersihkan (Bukti Data Kotor)
order_year = df_eda['Year '].value_counts().index
sns.countplot(data=df_eda, x='Year ', order=order_year, hue='Year ', palette='viridis', legend=False, ax=ax[0, 1])
ax[0, 1].set_title("2. Inkonsistensi Format Penulisan Kolom 'Year ' (9 Variasi)", fontsize=11, fontweight='bold')
ax[0, 1].set_xlabel("Nilai Mentah pada Kolom 'Year '")
ax[0, 1].set_ylabel('Frekuensi Baris')
ax[0, 1].tick_params(axis='x', rotation=30)

# Grafik 3: Boxplot / Sebaran Rating Teknis & Soft Skill Berdasarkan Pengalaman Proyek & Gap
df_eda['Skor_Kesiapan_100'] = ((0.6 * df_eda['Rating'] + 0.4 * df_eda['Rating.1']) * 20.0).round(1)
sns.boxplot(data=df_eda, x=' Projects', y='Skor_Kesiapan_100', hue='kategori_gap', palette=['#60a5fa', '#f87171'], ax=ax[1, 0])
ax[1, 0].set_title('3. Sebaran Skor Kesiapan Berdasarkan Pengalaman Proyek & Status Gap', fontsize=11, fontweight='bold')
ax[1, 0].set_xlabel('Memiliki Pengalaman Proyek (Projects: No vs Yes)')
ax[1, 0].set_ylabel('Skor Kesiapan Gabungan (Skala 20 - 100)')
ax[1, 0].legend(title='Kategori Gap')

# Grafik 4: Heatmap Korelasi Fitur Numerik Hasil Ekstraksi DMA DATASET
df_eda['Jml_Tech_Skills'] = df_eda['Technical Skills'].apply(lambda x: len(str(x).split(',')))
df_eda['Jml_Prog_Langs'] = df_eda['     Programming Languages'].apply(lambda x: len(str(x).split(',')))
df_eda['Punya_Proyek_Biner'] = (df_eda[' Projects'].str.strip() == 'Yes').astype(int)
df_eda['Target_High_Gap'] = (df_eda['kategori_gap'] == 'High_Gap').astype(int)

kolom_korelasi = ['Rating', 'Rating.1', 'Jml_Tech_Skills', 'Jml_Prog_Langs', 'Punya_Proyek_Biner', 'Skor_Kesiapan_100', 'Target_High_Gap']
corr_m = df_eda[kolom_korelasi].rename(columns={
    'Rating': 'Tech_Rating',
    'Rating.1': 'Soft_Rating',
    'Jml_Tech_Skills': 'N_TechSkills',
    'Jml_Prog_Langs': 'N_ProgLangs',
    'Punya_Proyek_Biner': 'Has_Project',
    'Skor_Kesiapan_100': 'Readiness',
    'Target_High_Gap': 'High_Gap'
}).corr()

sns.heatmap(corr_m, annot=True, fmt='.2f', cmap='coolwarm', ax=ax[1, 1])
ax[1, 1].set_title('4. Heatmap Korelasi Antar Variabel Numerik (DMA DATASET)', fontsize=11, fontweight='bold')

plt.tight_layout()
plt.savefig("docs/images/soal2_eda_skillgap.png", dpi=150)
plt.close()

# ==============================================================================
# A.5 & A.6 (SOAL 3): PEMBERSIHAN DATA & FEATURE ENGINEERING PADA DMA DATASET
# ==============================================================================
df_bersih = df.copy()

# 1) Rapikan spasi pada seluruh nama kolom (strip whitespace) dan ganti nama kolom ambigu
df_bersih.columns = [c.strip() for c in df_bersih.columns]
df_bersih = df_bersih.rename(columns={
    'Rating': 'Technical_Rating',
    'Rating.1': 'SoftSkill_Rating'
})

# Simpan email_id sebelum dihapus untuk pemeriksaan overlap objek Soal 5c
email_ids = df_bersih['email_id'].copy()

# 2) Hapus baris duplikat (jika ada)
df_bersih = df_bersih.drop_duplicates().reset_index(drop=True)

# 3) Seragamkan inkonsistensi format penulisan pada kolom 'Year' (9 variasi -> 4 tingkat baku)
peta_year = {
    '1st Year': '1st Year', '1st ': '1st Year', '1st': '1st Year',
    '2nd Year': '2nd Year', '2nd ': '2nd Year', '2nd': '2nd Year',
    '3rd Year': '3rd Year', '3rd ': '3rd Year', '3rd': '3rd Year',
    'Final Year': 'Final Year', 'Final ': 'Final Year', 'Final': 'Final Year'
}
df_bersih['Year'] = df_bersih['Year'].astype(str).str.strip().map(lambda x: peta_year.get(x, x))
df_bersih['Projects'] = df_bersih['Projects'].astype(str).str.strip()

# 4) Buang kolom 100% kosong ('Unnamed: 13'), kolom PII identitas ('Name', 'email_id')
df_bersih = df_bersih.drop(columns=['Unnamed: 13', 'Name', 'email_id'])

out_a5 = (
    f"Ukuran setelah dibersihkan (hapus Unnamed: 13, Name, email_id): {df_bersih.shape}\n\n"
    f"Daftar nama kolom setelah dibersihkan spasinya:\n{list(df_bersih.columns)}\n\n"
    f"Distribusi kolom 'Year' setelah 9 variasi penulisan diseragamkan menjadi 4 kategori baku:\n{df_bersih['Year'].value_counts().to_string()}\n\n"
    f"Jumlah missing value setelah pembersihan:\n{df_bersih.isnull().sum().to_string()}"
)
results["out_a5"] = out_a5

# A.6 Feature Engineering Berbasis Pengetahuan Domain pada DMA DATASET
# Fitur Turunan 1: Jumlah total keahlian teknis & bahasa pemrograman yang dikuasai
df_bersih['jml_tech_skills'] = df_bersih['Technical Skills'].apply(lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]))
df_bersih['jml_prog_langs'] = df_bersih['Programming Languages'].apply(lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]))
df_bersih['total_item_skill'] = df_bersih['jml_tech_skills'] + df_bersih['jml_prog_langs']

# Fitur Turunan 2: Skor Kesiapan Kompetensi Tertimbang (Weighted Readiness Score skala 0-100)
# 55% Technical Rating + 30% SoftSkill Rating + 15% Bonus Pengalaman Proyek
df_bersih['punya_proyek_biner'] = (df_bersih['Projects'] == 'Yes').astype(int)
df_bersih['skor_kesiapan_industri'] = (
    (0.55 * (df_bersih['Technical_Rating'] * 20.0)) +
    (0.30 * (df_bersih['SoftSkill_Rating'] * 20.0)) +
    (0.15 * (df_bersih['punya_proyek_biner'] * 100.0))
).round(2)

# Fitur Turunan 3: Indeks Defisit Kompetensi (Skill Deficit Index: selisih terhadap standar skor 80)
df_bersih['indeks_defisit_skill'] = np.maximum(0.0, 80.0 - df_bersih['skor_kesiapan_industri']).round(2)

# Binning Skor Kesiapan menjadi Tingkat Kesiapan (Readiness Tier)
df_bersih['tingkat_kesiapan'] = pd.cut(
    df_bersih['skor_kesiapan_industri'],
    bins=[0, 50, 72, 100],
    labels=['Butuh_Intensif', 'Sedang_Berkembang', 'Siap_Industri']
)

# Gabungkan teks Technical Skills, Programming Languages, Soft Skills, dan Career Interest untuk TF-IDF
df_bersih['teks_profil_lengkap'] = (
    df_bersih['Current Course'].str.lower() + " " +
    df_bersih['Technical Skills'].str.lower() + " " +
    df_bersih['Programming Languages'].str.lower() + " " +
    df_bersih['Soft Skills'].str.lower() + " " +
    df_bersih['Career Interest'].str.lower() + " " +
    df_bersih['Challenges'].str.lower()
)

# Label Target Biner: High_Gap = 1 (butuh pelatihan teknis / kesiapan rendah), Ready = 0
df_bersih['target'] = (
    ((df_bersih['Technical_Rating'] <= 2) & (df_bersih['Projects'] == 'No')) |
    ((df_bersih['Technical_Rating'] + df_bersih['SoftSkill_Rating']) / 2.0 <= 2.0)
).astype(int)

out_a6 = df_bersih[[
    'Year', 'Current Course', 'Technical_Rating', 'SoftSkill_Rating',
    'total_item_skill', 'skor_kesiapan_industri', 'indeks_defisit_skill', 'tingkat_kesiapan', 'target'
]].head(6).to_string()
results["out_a6"] = out_a6

# TF-IDF Kata Tertinggi per Kelas (A.12.1) pada DMA DATASET
tfidf_exp = TfidfVectorizer(max_features=30)
X_teks_exp = tfidf_exp.fit_transform(df_bersih['teks_profil_lengkap'])
bobot_df = pd.DataFrame(X_teks_exp.toarray(), columns=tfidf_exp.get_feature_names_out())
bobot_df['target'] = df_bersih['target'].values
top_words_df = bobot_df.groupby('target').mean().T.sort_values(1, ascending=False).head(8).round(3)
out_a12_1 = f"Ukuran matriks TF-IDF (DMA DATASET): {X_teks_exp.shape}\n\nKata dengan Bobot TF-IDF Tertinggi pada Kelas High_Gap (1) vs Ready (0):\n{top_words_df.to_string()}"
results["out_a12_1"] = out_a12_1

# Simulasi Time Series Harian Gelombang Pengisian Asesmen Mahasiswa (shift(1) mencegah leakage)
rng_dates = pd.date_range(start='2026-07-01', periods=60, freq='D')
np.random.seed(42)
df_bersih['tanggal_asesmen'] = np.random.choice(rng_dates, size=len(df_bersih))
harian = (df_bersih.groupby('tanggal_asesmen').size()
          .asfreq('D', fill_value=0).to_frame('jumlah_mahasiswa'))
harian['lag_1'] = harian['jumlah_mahasiswa'].shift(1)
harian['lag_7'] = harian['jumlah_mahasiswa'].shift(7)
harian['rolling_mean_7'] = harian['jumlah_mahasiswa'].shift(1).rolling(7).mean().round(2)
harian['hari_minggu'] = harian.index.dayofweek
out_a12_2 = harian.dropna().head(8).to_string()
results["out_a12_2"] = out_a12_2

# ==============================================================================
# A.7, A.8, A.9 (SOAL 4): SPLIT DATA, PIPELINE, BASELINE NON-AI & ML
# ==============================================================================
# Perhatikan: Kita gunakan fitur murni profil input mahasiswa (tanpa bocoran label)
fitur_num = ['Technical_Rating', 'SoftSkill_Rating', 'jml_tech_skills', 'jml_prog_langs', 'total_item_skill']
fitur_kat = ['Year', 'Current Course', 'Projects', 'Career Interest', 'Method']
fitur_teks = 'teks_profil_lengkap'

X = df_bersih[fitur_num + fitur_kat + [fitur_teks]]
y = df_bersih['target']

X_train, X_test, y_train, y_test, id_train, id_test = train_test_split(
    X, y, email_ids, test_size=0.2, stratify=y, random_state=42
)

prep_num = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])
prep_kat = Pipeline([
    ('imputer', SimpleImputer(strategy='most_frequent')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])
prep_teks = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=40))
])

preprocessor = ColumnTransformer([
    ('num', prep_num, fitur_num),
    ('kat', prep_kat, fitur_kat),
    ('teks', prep_teks, fitur_teks)
])

out_a7 = f"Data latih: {X_train.shape} | Data uji: {X_test.shape}\nProporsi kelas High_Gap di latih: {y_train.mean():.3f} | Proporsi kelas High_Gap di uji: {y_test.mean():.3f}"
results["out_a7"] = out_a7

def hitung_metrik(nama, y_true, y_pred):
    return {
        "Model": nama,
        "Accuracy": accuracy_score(y_true, y_pred),
        "Precision": precision_score(y_true, y_pred, zero_division=0),
        "Recall": recall_score(y_true, y_pred, zero_division=0),
        "F1": f1_score(y_true, y_pred, zero_division=0)
    }

# Baseline 1: Dummy Classifier
dummy_pipe = Pipeline([('prep', preprocessor), ('model', DummyClassifier(strategy='most_frequent'))])
dummy_pipe.fit(X_train, y_train)
m_dummy = hitung_metrik("1. Dummy (Kelas Terbanyak)", y_test, dummy_pipe.predict(X_test))

# Baseline 2: Baseline Non-AI (Pencocokan Daftar Kata Kunci Skill Manual sesuai Tabel Panduan No. 15)
# Mencocokkan apakah Technical Skills mahasiswa mengandung kata kunci sesuai Career Interest-nya
kamus_role_manual = {
    'cloud architect': ['cloud computing', 'python', 'java'],
    'software developer': ['java', 'javascript', 'c++', 'python', 'sql'],
    'data scientist': ['data analysis', 'python', 'machine learning', 'sql', 'r'],
    'cybersecurity expert': ['cybersecurity', 'cloud computing', 'python'],
    'business analyst': ['data analysis', 'sql', 'python'],
    'ai engineer': ['machine learning', 'python', 'data analysis']
}
def baseline_kata_kunci_manual(df_in):
    preds = []
    for _, row in df_in.iterrows():
        role_k = str(row['Career Interest']).lower().strip()
        teks_s = str(row['teks_profil_lengkap']).lower()
        kw_wajib = kamus_role_manual.get(role_k, ['python', 'sql'])
        jml_match = sum(1 for k in kw_wajib if k in teks_s)
        # Aturan manual: jika kata kunci cocok <= 1 atau belum punya proyek -> tebak High_Gap (1)
        if jml_match <= 1 and str(row['Projects']).strip() == 'No':
            preds.append(1)
        else:
            preds.append(0)
    return np.array(preds)

m_rule = hitung_metrik("2. Baseline Non-AI (Kata Kunci Manual)", y_test, baseline_kata_kunci_manual(X_test))

# Baseline 3: Logistic Regression Pipeline
logreg_pipe = Pipeline([('prep', preprocessor), ('model', LogisticRegression(max_iter=1000, random_state=42))])
logreg_pipe.fit(X_train, y_train)
m_logreg = hitung_metrik("3. Logistic Regression (Pipeline)", y_test, logreg_pipe.predict(X_test))

# Baseline 4: Decision Tree Pipeline
dt_pipe = Pipeline([('prep', preprocessor), ('model', DecisionTreeClassifier(max_depth=4, random_state=42))])
dt_pipe.fit(X_train, y_train)
m_dt = hitung_metrik("4. Decision Tree (Pipeline)", y_test, dt_pipe.predict(X_test))

# Baseline 5: Random Forest Pipeline
rf_pipe = Pipeline([('prep', preprocessor), ('model', RandomForestClassifier(n_estimators=200, random_state=42))])
rf_pipe.fit(X_train, y_train)
m_rf = hitung_metrik("5. Random Forest (Pipeline)", y_test, rf_pipe.predict(X_test))

df_perbandingan = pd.DataFrame([m_dummy, m_rule, m_logreg, m_dt, m_rf]).round(3)
out_a8 = df_perbandingan.to_string(index=False)
results["out_a8"] = out_a8

# A.9: 5-Fold Cross-Validation
kandidat_models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'Decision Tree': DecisionTreeClassifier(max_depth=4, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=200, random_state=42),
}
cv_lines = []
for nama, mdl in kandidat_models.items():
    pipe_cv = Pipeline([('prep', preprocessor), ('model', mdl)])
    skor_cv = cross_val_score(pipe_cv, X_train, y_train, cv=5, scoring='f1')
    cv_lines.append(f"{nama:<22} F1 (5-fold CV) = {skor_cv.mean():.3f} ± {skor_cv.std():.3f}")
out_a9 = "\n".join(cv_lines)
results["out_a9"] = out_a9

# ==============================================================================
# A.10 (SOAL 5): SIMULASI DATA LEAKAGE & PEMERIKSAAN OVERLAP
# ==============================================================================
# Simulasi sengaja memasukkan fitur 'tingkat_kesiapan' & 'indeks_defisit_skill' yang diturunkan langsung dari rumus target
X_bocor = pd.get_dummies(df_bersih[['tingkat_kesiapan', 'indeks_defisit_skill', 'skor_kesiapan_industri']])
Xb_train, Xb_test, yb_train, yb_test = train_test_split(
    X_bocor, y, test_size=0.2, stratify=y, random_state=42
)
model_bocor = LogisticRegression(max_iter=1000).fit(Xb_train, yb_train)
m_bocor = hitung_metrik("Model DENGAN Leakage", yb_test, model_bocor.predict(Xb_test))
overlap_ids = len(set(id_train).intersection(set(id_test)))

out_a10 = (
    f"Skor Model dengan Data Leakage (memakai fitur turunan pasca-keputusan 'tingkat_kesiapan'):\n"
    f"Accuracy={m_bocor['Accuracy']:.3f} | Precision={m_bocor['Precision']:.3f} | Recall={m_bocor['Recall']:.3f} | F1={m_bocor['F1']:.3f}\n\n"
    f"Pemeriksaan Overlap Objek (email_id) antara Data Latih dan Data Uji: {overlap_ids} mahasiswa duplikat (Valid = 0)"
)
results["out_a10"] = out_a10

# ==============================================================================
# A.11 & TABEL NO. 15: TF-IDF + K-MEANS CLUSTERING PADA DMA DATASET & ISOLATION FOREST
# ==============================================================================
teks_skill_role = (df_bersih['Technical Skills'] + " " + df_bersih['Programming Languages'] + " " + df_bersih['Career Interest']).str.lower()
tfidf_cluster = TfidfVectorizer(max_features=40)
X_tfidf_job = tfidf_cluster.fit_transform(teks_skill_role)

sil_lines = []
sil_scores = []
k_values = list(range(2, 8))
for k in k_values:
    km_temp = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X_tfidf_job)
    s_score = silhouette_score(X_tfidf_job, km_temp.labels_)
    sil_scores.append(s_score)
    sil_lines.append(f"k={k}: silhouette_score = {s_score:.3f}")

km_final = KMeans(n_clusters=6, n_init=10, random_state=42).fit(X_tfidf_job)
df_bersih['cluster_kompetensi'] = km_final.labels_

terms = tfidf_cluster.get_feature_names_out()
order_centroids = km_final.cluster_centers_.argsort()[:, ::-1]
cluster_keywords = []
for i in range(6):
    top_t = [terms[ind] for ind in order_centroids[i, :5]]
    dom_role = df_bersih[df_bersih['cluster_kompetensi'] == i]['Career Interest'].mode()[0]
    cluster_keywords.append(f"Cluster {i} (Dominan: {dom_role:<20}): {', '.join(top_t)}")

profil_cluster = df_bersih.groupby('cluster_kompetensi')[['Technical_Rating', 'SoftSkill_Rating', 'total_item_skill', 'skor_kesiapan_industri', 'target']].mean().round(2)

fitur_num_iso = ['Technical_Rating', 'SoftSkill_Rating', 'total_item_skill', 'skor_kesiapan_industri']
X_num_scaled = prep_num.fit_transform(df_bersih[fitur_num])
iso = IsolationForest(contamination=0.04, random_state=42)
df_bersih['anomali'] = iso.fit_predict(X_num_scaled)
anomali_counts = df_bersih['anomali'].value_counts().to_string()
contoh_anomali = df_bersih.loc[df_bersih['anomali'] == -1, ['Current Course', 'Career Interest', 'Technical_Rating', 'SoftSkill_Rating', 'Projects', 'target']].head(5).to_string()

out_a11 = (
    "Evaluasi Silhouette Score TF-IDF + K-Means pada DMA DATASET:\n" +
    "\n".join(sil_lines) +
    "\n\nKata Kunci TF-IDF Teratas Tiap Cluster (k=6):\n" +
    "\n".join(cluster_keywords) +
    f"\n\nProfil Rata-rata Tiap Cluster:\n{profil_cluster.to_string()}\n\n"
    f"Deteksi Anomali Profil Mahasiswa (Isolation Forest):\n{anomali_counts}\n\n"
    f"Contoh 5 Profil Mahasiswa dengan Pola Tidak Biasa (Anomali = -1):\n{contoh_anomali}"
)
results["out_a11"] = out_a11

# Plot Grafik Evaluasi Baseline & Clustering
fig, ax = plt.subplots(1, 2, figsize=(12, 4.8))
ax[0].plot(k_values, sil_scores, marker='o', linewidth=2, color='#2563eb')
ax[0].set_title('A. Silhouette Score TF-IDF + K-Means (DMA DATASET)', fontweight='bold')
ax[0].set_xlabel('Jumlah Cluster (k)')
ax[0].set_ylabel('Silhouette Score')

model_names_short = ['Dummy', 'Rule-Based\n(Keyword)', 'LogReg\nPipeline', 'DecisionTree\nPipeline', 'RandomForest\nPipeline']
f1_vals = [m_dummy['F1'], m_rule['F1'], m_logreg['F1'], m_dt['F1'], m_rf['F1']]
rec_vals = [m_dummy['Recall'], m_rule['Recall'], m_logreg['Recall'], m_dt['Recall'], m_rf['Recall']]
x_pos = np.arange(len(model_names_short))
ax[1].bar(x_pos - 0.18, f1_vals, width=0.35, label='F1-Score', color='#2563eb')
ax[1].bar(x_pos + 0.18, rec_vals, width=0.35, label='Recall', color='#10b981')
ax[1].set_xticks(x_pos)
ax[1].set_xticklabels(model_names_short, fontsize=9)
ax[1].set_ylim(0, 1.1)
ax[1].set_title('B. Perbandingan Kinerja Baseline Non-AI vs Pipeline ML', fontweight='bold')
ax[1].set_ylabel('Skor Evaluasi (0 - 1.0)')
ax[1].legend()

plt.tight_layout()
plt.savefig("docs/images/soal4_kmeans_baseline.png", dpi=150)
plt.close()

# ==============================================================================
# A.12.3: RETRIEVAL DOKUMEN RAG BERBASIS TF-IDF (RECALL@1, RECALL@3, MRR)
# ==============================================================================
dokumen_kb = pd.DataFrame({
    'id': ['KB1', 'KB2', 'KB3', 'KB4', 'KB5', 'KB6', 'KB7', 'KB8'],
    'teks': [
        'Cloud Architect wajib menguasai Cloud Computing, arsitektur AWS atau Azure, keamanan jaringan, serta bahasa Python atau Go.',
        'Software Developer membutuhkan penguasaan bahasa Java, JavaScript, C++, struktur data, SQL, serta pembuatan proyek aplikasi nyata.',
        'Data Scientist memerlukan kompetensi Data Analysis, pemrograman Python dan R, Machine Learning, statistik, serta pemodelan prediktif.',
        'Cybersecurity Expert bertanggung jawab pada keamanan siber, audit jaringan, mitigasi serangan, serta penguasaan Cloud Computing dan Linux.',
        'Business Analyst menggabungkan kemampuan Data Analysis, query SQL, komunikasi bisnis, kepemimpinan, serta pemecahan masalah.',
        'AI Engineer merancang sistem Machine Learning, Deep Learning, pemrograman Python, serta integrasi model kecerdasan buatan.',
        'Mahasiswa dengan tantangan Lack of experience dan belum memiliki Projects disarankan mengikuti Internship opportunities dan Bootcamp.',
        'Mahasiswa yang menghadapi Difficulty in resume building dan Interview anxiety direkomendasikan mengikuti Resume workshops dan Mentorship programs.'
    ]
})

eval_rag = pd.DataFrame({
    'pertanyaan': [
        'Keahlian apa yang wajib dikuasai untuk karier Cloud Architect?',
        'Bahasa pemrograman apa saja yang dibutuhkan oleh seorang Software Developer?',
        'Kompetensi apa yang harus dipelajari mahasiswa untuk menjadi Data Scientist?',
        'Apa tanggung jawab dan keahlian utama seorang Cybersecurity Expert?',
        'Keterampilan apa yang dipadukan pada profesi Business Analyst?',
        'Bidang apa yang dikerjakan oleh seorang AI Engineer dengan Python?',
        'Program dukungan apa yang cocok bagi mahasiswa yang belum memiliki Projects dan kurang pengalaman?',
        'Apa rekomendasi untuk mengatasi kesulitan membuat resume dan kecemasan wawancara?'
    ],
    'dok_benar': ['KB1', 'KB2', 'KB3', 'KB4', 'KB5', 'KB6', 'KB7', 'KB8']
})

stopword_id = ['apa', 'saja', 'yang', 'untuk', 'menjadi', 'di', 'dan', 'bagi', 'seorang', 'oleh', 'pada', 'bagaimana']
tfidf_rag = TfidfVectorizer(stop_words=stopword_id)
X_dok_kb = tfidf_rag.fit_transform(dokumen_kb['teks'])

def retrieve_kb(q, k=3):
    skor = cosine_similarity(tfidf_rag.transform([q]), X_dok_kb)[0]
    urut = [i for i in skor.argsort()[::-1] if skor[i] > 0][:k]
    return list(dokumen_kb['id'].iloc[urut]), skor[urut]

peringkat_list = []
for q, benar in zip(eval_rag['pertanyaan'], eval_rag['dok_benar']):
    hasil_ids, _ = retrieve_kb(q, k=len(dokumen_kb))
    peringkat_list.append(hasil_ids.index(benar) + 1 if benar in hasil_ids else np.inf)

eval_rag['peringkat'] = peringkat_list
eval_rag['top3'] = [retrieve_kb(q, k=3)[0] for q in eval_rag['pertanyaan']]

r_ser = eval_rag['peringkat']
rec_at_1 = (r_ser <= 1).mean()
rec_at_3 = (r_ser <= 3).mean()
mrr_val = (1.0 / r_ser).mean()
ood_hasil, _ = retrieve_kb('Berapa dosis obat paracetamol untuk anak demam?')

out_a12_3 = (
    f"Jumlah Chunk Knowledge Base: {len(dokumen_kb)} dokumen | Rata-rata panjang: {int(dokumen_kb['teks'].str.len().mean())} karakter\n\n"
    f"{eval_rag[['pertanyaan', 'dok_benar', 'top3', 'peringkat']].to_string()}\n\n"
    f"Recall@1 = {rec_at_1:.2f}\n"
    f"Recall@3 = {rec_at_3:.2f}\n"
    f"MRR      = {mrr_val:.2f}\n\n"
    f"Uji Pertanyaan di Luar Konteks ('Berapa dosis obat paracetamol untuk anak demam?') -> Dokumen terambil: {ood_hasil}"
)
results["out_a12_3"] = out_a12_3

# ==============================================================================
# A.13: SIMPAN MODEL & DATA BERSIH
# ==============================================================================
joblib.dump(rf_pipe, 'models/baseline_skillgap.joblib')
df_bersih.to_csv('data/processed/data_skillgap_bersih.csv', index=False)
out_a13 = (
    f"Evaluasi Final Random Forest Pipeline pada Data Uji (DMA DATASET):\n"
    f"Accuracy = {m_rf['Accuracy']:.3f} | Precision = {m_rf['Precision']:.3f} | Recall = {m_rf['Recall']:.3f} | F1-Score = {m_rf['F1']:.3f}\n"
    f"Model berhasil disimpan di: models/baseline_skillgap.joblib\n"
    f"Data bersih berhasil disimpan di: data/processed/data_skillgap_bersih.csv ({df_bersih.shape[0]} baris, {df_bersih.shape[1]} kolom)"
)
results["out_a13"] = out_a13

with open("data/processed/praktikum_outputs.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print("Seluruh eksperimen pada DMA DATASET.xlsx selesai dan tersimpan!")
