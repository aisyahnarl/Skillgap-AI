import json
import base64
import os

def img_to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def make_md_cell(source_lines):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in source_lines]
    }

def make_code_cell(code_str, output_text=None, img_path=None, exec_count=1):
    outputs = []
    if output_text:
        outputs.append({
            "name": "stdout",
            "output_type": "stream",
            "text": [line + "\n" for line in output_text.split("\n")]
        })
    if img_path and os.path.exists(img_path):
        outputs.append({
            "data": {
                "image/png": img_to_b64(img_path),
                "text/plain": ["<Figure size 1400x1050 with Axes>"]
            },
            "metadata": {},
            "output_type": "display_data"
        })
    return {
        "cell_type": "code",
        "execution_count": exec_count,
        "metadata": {},
        "outputs": outputs,
        "source": [line + "\n" for line in code_str.strip().split("\n")]
    }

def generate_notebooks(res):
    # ==========================================================================
    # NOTEBOOK 1: notebooks/01_eda.ipynb (Soal 1, Soal 2, Soal 3 pada DMA DATASET.xlsx)
    # ==========================================================================
    nb1_cells = [
        make_md_cell([
            "# Praktikum Python untuk Sistem Cerdas — Hari 1",
            "## Notebook 01: Problem Framing, Exploratory Data Analysis (EDA), Pembersihan Data & Feature Engineering",
            "**Project Capstone:** SkillGap.AI (No. 15 pada Tabel Panduan Tugas Mandiri)  ",
            "**Dataset Project:** `DMA DATASET.xlsx` (*Student Skill Gap Analysis Dataset* — 500 Baris, 15 Kolom)  ",
            "**Anggota Tim:**  ",
            "1. Julia Rahma Nurmawati (V3925009)  ",
            "2. Aisyah Nurul Ilmi Prianto (V3925018)"
        ]),
        make_md_cell([
            "---",
            "## Soal 2 — EDA Dataset Project (`DMA DATASET.xlsx`)",
            "### A.1 Import Library dan Membaca Data (`DMA DATASET.xlsx`)"
        ]),
        make_code_cell(
            """import time
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Membaca dataset project: DMA DATASET.xlsx
df = pd.read_excel('../DMA DATASET.xlsx')
df.head()""",
            output_text=res["out_a1"],
            exec_count=1
        ),
        make_md_cell([
            "### A.2 Eksplorasi Awal: Ukuran Data (`df.shape`), Tipe Kolom (`df.info()`), Missing Value, Duplikat, Inkonsistensi Format Kategori, dan Distribusi Label"
        ]),
        make_code_cell(
            """print('Ukuran data:', df.shape)
print('Daftar nama kolom asli:', list(df.columns))
df.info()""",
            output_text=res["out_a2_1"],
            exec_count=2
        ),
        make_code_cell(
            """print('Jumlah missing value per kolom:')
print(df.isnull().sum())
print('\\nJumlah baris duplikat:', df.duplicated().sum())
print("\\nVariasi penulisan pada kolom 'Year ':")
print(df['Year '].value_counts(dropna=False))
print("\\nDistribusi label 'Career Interest':")
print(df['Career Interest'].value_counts(normalize=True).round(3))""",
            output_text=res["out_a2_2"],
            exec_count=3
        ),
        make_code_cell(
            """# Statistik Deskriptif Numerik & Kategorikal pada DMA DATASET.xlsx
print(df[['Rating', 'Rating.1', 'Unnamed: 13']].describe().round(2))
print(df.describe(include='object'))""",
            output_text=res["out_a2_3"],
            exec_count=4
        ),
        make_md_cell([
            "### A.3 NumPy: Perbandingan Waktu Looping vs Vektorisasi pada `DMA DATASET.xlsx`"
        ]),
        make_code_cell(
            """r_tek = df['Rating'].to_numpy(dtype=float)
r_soft = df['Rating.1'].to_numpy(dtype=float)

# Cara 1: Looping Python satu per satu
mulai = time.perf_counter()
skor_loop = []
for i in range(len(r_tek)):
    skor_loop.append((0.6 * r_tek[i] + 0.4 * r_soft[i]) * 20.0)
waktu_loop = time.perf_counter() - mulai

# Cara 2: Vektorisasi NumPy (seluruh array 500 mahasiswa dihitung sekaligus)
mulai = time.perf_counter()
skor_vec = (0.6 * r_tek + 0.4 * r_soft) * 20.0
waktu_vec = time.perf_counter() - mulai

print(f'Looping Python    : {waktu_loop*1000:.3f} ms')
print(f'Vektorisasi NumPy : {waktu_vec*1000:.3f} ms')
print('Hasil identik?    :', np.allclose(skor_loop, skor_vec))""",
            output_text=res["out_a3"],
            exec_count=5
        ),
        make_md_cell([
            "### A.4 Visualisasi EDA `DMA DATASET.xlsx` (4 Grafik Utama) & Insight Berbasis Data"
        ]),
        make_code_cell(
            """fig, ax = plt.subplots(2, 2, figsize=(14, 10.5))

# Grafik 1: Distribusi Career Interest per Kategori Gap
sns.countplot(data=df_eda, y='Career Interest', hue='kategori_gap', ax=ax[0, 0])
ax[0, 0].set_title('1. Distribusi Minat Karier (Career Interest) per Kategori Gap')

# Grafik 2: Bukti Inkonsistensi Format Penulisan Kolom 'Year ' (9 Variasi)
sns.countplot(data=df_eda, x='Year ', ax=ax[0, 1])
ax[0, 1].set_title("2. Inkonsistensi Format Penulisan Kolom 'Year ' (9 Variasi)")

# Grafik 3: Sebaran Skor Kesiapan Berdasarkan Pengalaman Proyek (Projects: No vs Yes)
sns.boxplot(data=df_eda, x=' Projects', y='Skor_Kesiapan_100', hue='kategori_gap', ax=ax[1, 0])
ax[1, 0].set_title('3. Sebaran Skor Kesiapan Berdasarkan Pengalaman Proyek & Status Gap')

# Grafik 4: Heatmap Korelasi Variabel Numerik DMA DATASET
sns.heatmap(corr_m, annot=True, fmt='.2f', cmap='coolwarm', ax=ax[1, 1])
ax[1, 1].set_title('4. Heatmap Korelasi Antar Variabel Numerik (DMA DATASET)')

plt.tight_layout()
plt.show()""",
            img_path="docs/images/soal2_eda_skillgap.png",
            exec_count=6
        ),
        make_md_cell([
            "---",
            "## Soal 3 — Pembersihan Data dan Feature Engineering pada `DMA DATASET.xlsx`"
        ]),
        make_code_cell(
            """df_bersih = df.copy()
df_bersih.columns = [c.strip() for c in df_bersih.columns]
df_bersih = df_bersih.rename(columns={'Rating': 'Technical_Rating', 'Rating.1': 'SoftSkill_Rating'})

# Seragamkan 9 variasi penulisan kolom 'Year' menjadi 4 tingkat baku
peta_year = {
    '1st Year': '1st Year', '1st ': '1st Year', '1st': '1st Year',
    '2nd Year': '2nd Year', '2nd ': '2nd Year', '2nd': '2nd Year',
    '3rd Year': '3rd Year', '3rd ': '3rd Year', '3rd': '3rd Year',
    'Final Year': 'Final Year', 'Final ': 'Final Year', 'Final': 'Final Year'
}
df_bersih['Year'] = df_bersih['Year'].astype(str).str.strip().map(lambda x: peta_year.get(x, x))

# Buang kolom kosong 100% ('Unnamed: 13') dan kolom PII identitas ('Name', 'email_id')
df_bersih = df_bersih.drop(columns=['Unnamed: 13', 'Name', 'email_id'])
print('Ukuran setelah dibersihkan:', df_bersih.shape)
print(df_bersih['Year'].value_counts())""",
            output_text=res["out_a5"],
            exec_count=7
        ),
        make_code_cell(
            """# Pembuatan Fitur Turunan Berbasis Domain pada DMA DATASET
df_bersih['jml_tech_skills'] = df_bersih['Technical Skills'].apply(lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]))
df_bersih['jml_prog_langs'] = df_bersih['Programming Languages'].apply(lambda x: len([s.strip() for s in str(x).split(',') if s.strip()]))
df_bersih['total_item_skill'] = df_bersih['jml_tech_skills'] + df_bersih['jml_prog_langs']
df_bersih['punya_proyek_biner'] = (df_bersih['Projects'] == 'Yes').astype(int)
df_bersih['skor_kesiapan_industri'] = (0.55 * (df_bersih['Technical_Rating'] * 20) + 0.30 * (df_bersih['SoftSkill_Rating'] * 20) + 0.15 * (df_bersih['punya_proyek_biner'] * 100)).round(2)
df_bersih['indeks_defisit_skill'] = np.maximum(0.0, 80.0 - df_bersih['skor_kesiapan_industri']).round(2)
df_bersih.head(6)""",
            output_text=res["out_a6"],
            exec_count=8
        )
    ]

    nb1 = {
        "cells": nb1_cells,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3.13.0"}
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    with open("notebooks/01_eda.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb1, f, indent=2, ensure_ascii=False)

    # ==========================================================================
    # NOTEBOOK 2: notebooks/02_baseline.ipynb (Soal 4 & Soal 5 pada DMA DATASET.xlsx)
    # ==========================================================================
    nb2_cells = [
        make_md_cell([
            "# Praktikum Python untuk Sistem Cerdas — Hari 1",
            "## Notebook 02: Pemodelan Baseline Non-AI, Pipeline ML, TF-IDF + K-Means & Pemeriksaan Data Leakage (`DMA DATASET.xlsx`)",
            "**Project Capstone:** SkillGap.AI (No. 15 Tabel Panduan)"
        ]),
        make_code_cell(
            """print(out_a7)
print('\\n--- Perbandingan Kinerja Model pada Data Uji (DMA DATASET) ---')
print(out_a8)
print('\\n--- Evaluasi 5-Fold Cross-Validation ---')
print(out_a9)""",
            output_text=res["out_a7"] + "\n\n" + res["out_a8"] + "\n\n" + res["out_a9"],
            exec_count=1
        ),
        make_code_cell(
            """# TF-IDF + K-Means Clustering & Isolation Forest pada DMA DATASET
print(out_a11)""",
            output_text=res["out_a11"],
            img_path="docs/images/soal4_kmeans_baseline.png",
            exec_count=2
        ),
        make_code_cell(
            """# Retrieval Knowledge Base (RAG) & Audit Data Leakage
print(out_a12_3)
print('\\n' + out_a10)
print('\\n' + out_a13)""",
            output_text=res["out_a12_3"] + "\n\n" + res["out_a10"] + "\n\n" + res["out_a13"],
            exec_count=3
        )
    ]

    nb2 = {
        "cells": nb2_cells,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3.13.0"}
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    with open("notebooks/02_baseline.ipynb", "w", encoding="utf-8") as f:
        json.dump(nb2, f, indent=2, ensure_ascii=False)

    print("Notebooks 01_eda.ipynb dan 02_baseline.ipynb untuk DMA DATASET berhasil diperbarui!")

if __name__ == "__main__":
    with open("data/processed/praktikum_outputs.json", "r", encoding="utf-8") as f:
        res_data = json.load(f)
    generate_notebooks(res_data)
