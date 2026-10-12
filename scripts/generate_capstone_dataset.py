import csv
import random
from datetime import datetime, timedelta
import os

def generate_skillgap_capstone_dataset(output_path="datasets/data_skillgap_capstone.csv"):
    random.seed(42)

    roles_config = [
        {
            "role": "Frontend Developer",
            "demand": 92,
            "req_skills": 10,
            "keywords_high_gap": [
                "belajar html5 css3 javascript dasar belum mahir state management react typescript git",
                "slicing halaman web html css bootstrap butuh pendalaman frontend reactjs dan rest api",
                "pemula layout web responsif form html belum terbiasa integrasi api axios tailwind",
                "menguasai desain html css dasar sedang belajar komponen react nextjs dan testing"
            ],
            "keywords_ready": [
                "menguasai react typescript tailwind css javascript es6 rest api git responsive web frontend",
                "pengalaman bangun aplikasi web reactjs nextjs state management zustand unit testing ui",
                "terampil html5 semantik css grid flexbox typescript komponen react modern performa web",
                "portofolio frontend developer react tailwind integrasi api autentikasi jwt deployment"
            ]
        },
        {
            "role": "Backend Developer",
            "demand": 90,
            "req_skills": 10,
            "keywords_high_gap": [
                "paham query sql dasar select sedang belajar nodejs express docker dan rest api",
                "belajar algoritma pemrograman dasar belum mendalami server backend database postgresql",
                "bisa crud php mysql dasar butuh penguatan microservices autentikasi jwt redis api",
                "sedang mempelajari skema database relasional indexing dan arsitektur rest api backend"
            ],
            "keywords_ready": [
                "menguasai nodejs express typescript postgresql prisma orm docker redis rest api jwt",
                "berpengalaman merancang backend microservices golang nodejs database indexing ci cd",
                "terampil arsitektur server rest api keamanan owasp autentikasi oauth2 testing backend",
                "membangun layanan api skalabel postgresql docker containerization dokumentasi swagger"
            ]
        },
        {
            "role": "Data Analyst",
            "demand": 93,
            "req_skills": 9,
            "keywords_high_gap": [
                "menguasai microsoft excel dasar sedang belajar sql python pandas visualisasi tableau",
                "belajar cara cleaning data statistik deskriptif dan query join database sql dasar",
                "terbiasa google sheets sederhana butuh pelatihan analisis data python dan power bi",
                "sedang mendalami pengolahan dataset besar python numpy pandas dan pembuatan dashboard"
            ],
            "keywords_ready": [
                "menguasai sql kompleks python pandas numpy visualisasi tableau power bi statistik data",
                "berpengalaman exploratory data analysis eda data cleaning etl dashboard kpi bisnis",
                "terampil pemodelan data star schema sql agregasi python matplotlib seaborn reporting",
                "analis data berpengalaman menyusun insight bisnis dari database sql dan power bi"
            ]
        },
        {
            "role": "UI/UX Designer",
            "demand": 85,
            "req_skills": 8,
            "keywords_high_gap": [
                "belajar tampilan grafis visual sedang mendalami figma wireframing usability testing ux",
                "bisa desain photoshop dasar namun butuh penguatan user research persona journey map",
                "membuat mockup tampilan web belum mendalami design system auto layout prototipe figma",
                "sedang belajar wawancara pengguna heuristic evaluation dan pengujian prototipe interaktif"
            ],
            "keywords_ready": [
                "menguasai figma auto layout design system high fidelity prototyping user research usability",
                "berpengalaman menyusun user persona wireframing information architecture desain aksesibel",
                "terampil evaluasi heuristik desain antarmuka mobile web interaktif kolaborasi developer",
                "portofolio studi kasus ui ux riset pengguna sampai pengujian usability prototipe figma"
            ]
        },
        {
            "role": "Cloud DevOps Engineer",
            "demand": 89,
            "req_skills": 11,
            "keywords_high_gap": [
                "kenal perintah dasar linux ubuntu sedang belajar docker kubernetes ci cd aws cloud",
                "paham jaringan lan dasar butuh penguatan konfigurasi server cloud dan terraform",
                "sedang mempelajari otomatisasi pipeline github actions container orchestration monitoring",
                "belajar setup virtual machine cloud firewall security group dan manajemen kontainer"
            ],
            "keywords_ready": [
                "menguasai linux server docker kubernetes github actions ci cd terraform aws cloud monitoring",
                "berpengalaman otomasi infrastruktur cloud iac prometheus grafana high availability deploy",
                "terampil mengelola cluster container docker kubernetes jaringan vpc keamanan cloud",
                "devops engineer membangun pipeline ci cd otomatis pengujian dan cloud scaling"
            ]
        },
        {
            "role": "Cyber Security Analyst",
            "demand": 89,
            "req_skills": 10,
            "keywords_high_gap": [
                "belajar dasar jaringan tcp ip sedang mendalami wireshark siem vulnerability assessment",
                "mempelajari cara analisis log serangan siber owasp top 10 dan pengujian penetrasi",
                "paham konfigurasi sistem dasar butuh penguatan keamanan linux firewall ids ips",
                "sedang belajar analisis paket jaringan forensik digital dan mitigasi insiden keamanan"
            ],
            "keywords_ready": [
                "menguasai analisis jaringan wireshark siem splunk vulnerability assessment owasp linux",
                "berpengalaman mendeteksi anomali trafik jaringan incident response hardening server",
                "terampil audit keamanan aplikasi web penetration testing nmap metasploit mitigasi risiko",
                "analis keamanan siber memantau ancaman real time siem dan pertahanan jaringan"
            ]
        }
    ]

    jenjang_variants = {
        "SMK": ["SMK", "SMK", "SMK", "smk", "Siswa SMK"],
        "D3": ["D3", "D3", "D3", "d3", "Diploma 3"],
        "S1": ["S1", "S1", "S1", "s1", "Sarjana"]
    }

    start_date = datetime(2026, 6, 1)
    rows = []

    num_unique = 720
    for i in range(1, num_unique + 1):
        knd_id = f"KND-{1000 + i}"
        day_offset = int(random.betavariate(2, 2) * 110)
        tgl = (start_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")

        jenjang_base = random.choices(["SMK", "D3", "S1"], weights=[0.35, 0.40, 0.25])[0]
        jenjang_raw = random.choice(jenjang_variants[jenjang_base])

        if jenjang_base == "SMK":
            usia = random.randint(16, 19)
        elif jenjang_base == "D3":
            usia = random.randint(18, 23)
        else:
            usia = random.randint(20, 28)

        role_info = random.choice(roles_config)
        role_name = role_info["role"]
        req_skills = role_info["req_skills"]
        demand_weight = role_info["demand"] + random.randint(-3, 3)

        is_high_gap = random.random() < 0.28
        # 12% borderline / noisy cases agar distribusi realistis seperti data dunia nyata
        is_borderline = random.random() < 0.12

        if is_high_gap:
            kategori_gap = "High_Gap"
            if is_borderline:
                skor_teknis = round(random.gauss(64, 8), 1)
                skor_softskill = round(random.gauss(68, 9), 1)
                jml_skill = random.randint(4, 6)
                teks = random.choice(role_info["keywords_ready"]) + f" target posisi {role_name.lower()}"
            else:
                skor_teknis = round(random.gauss(51, 11), 1)
                skor_softskill = round(random.gauss(60, 10), 1)
                jml_skill = random.randint(1, 5)
                teks = random.choice(role_info["keywords_high_gap"]) + f" target posisi {role_name.lower()}"
            status_akhir = random.choices(
                ["Wajib Bootcamp Intensif", "Ambil Sertifikasi Dasar"],
                weights=[0.97, 0.03]
            )[0]
        else:
            kategori_gap = "Ready"
            if is_borderline:
                skor_teknis = round(random.gauss(61, 8), 1)
                skor_softskill = round(random.gauss(66, 9), 1)
                jml_skill = random.randint(3, 5)
                teks = random.choice(role_info["keywords_high_gap"]) + f" siap melamar {role_name.lower()}"
            else:
                skor_teknis = round(random.gauss(76, 9), 1)
                skor_softskill = round(random.gauss(78, 8), 1)
                jml_skill = random.randint(5, req_skills)
                teks = random.choice(role_info["keywords_ready"]) + f" siap melamar {role_name.lower()}"
            status_akhir = random.choices(
                ["Siap Lamar Kerja", "Ambil Sertifikasi Dasar"],
                weights=[0.96, 0.04]
            )[0]

        skor_teknis = max(18.0, min(99.0, skor_teknis))
        skor_softskill = max(28.0, min(99.0, skor_softskill))

        rows.append({
            "id_kandidat": knd_id,
            "tanggal_asesmen": tgl,
            "usia": usia,
            "jenjang_pendidikan": jenjang_raw,
            "target_role": role_name,
            "skor_teknis": skor_teknis,
            "skor_softskill": skor_softskill,
            "jumlah_skill_dimiliki": jml_skill,
            "jumlah_skill_lowongan": req_skills,
            "bobot_permintaan_industri": demand_weight,
            "teks_profil_dan_lowongan": teks,
            "status_rekomendasi_akhir": status_akhir,
            "kategori_gap": kategori_gap
        })

    # Nilai mustahil (outliers)
    rows[10]["skor_teknis"] = 145.0
    rows[45]["skor_teknis"] = 132.5
    rows[88]["skor_teknis"] = -12.0
    rows[120]["usia"] = 5
    rows[195]["usia"] = 125
    rows[240]["skor_softskill"] = 150.0

    # Missing values
    for idx in [15, 33, 67, 102, 155, 210, 289, 340, 412, 501, 588, 630]:
        rows[idx]["skor_teknis"] = ""
    for idx in [22, 74, 140, 225, 315, 450, 520, 610]:
        rows[idx]["skor_softskill"] = ""
    for idx in [50, 180, 390, 555]:
        rows[idx]["jenjang_pendidikan"] = ""
    for idx in [95, 260, 480]:
        rows[idx]["bobot_permintaan_industri"] = ""

    # 25 baris duplikat
    duplicates = [rows[idx].copy() for idx in range(0, 250, 10)]
    all_rows = rows + duplicates
    random.shuffle(all_rows)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fieldnames = [
        "id_kandidat", "tanggal_asesmen", "usia", "jenjang_pendidikan",
        "target_role", "skor_teknis", "skor_softskill",
        "jumlah_skill_dimiliki", "jumlah_skill_lowongan",
        "bobot_permintaan_industri", "teks_profil_dan_lowongan",
        "status_rekomendasi_akhir", "kategori_gap"
    ]
    with open(output_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"Dataset berhasil diperbarui: {output_path} ({len(all_rows)} baris)")

if __name__ == "__main__":
    generate_skillgap_capstone_dataset()
