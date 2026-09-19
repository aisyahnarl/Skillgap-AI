# Struktur Berkas Proyek dan Verifikasi Kode

## 1. Struktur proyek

```text
WEBSITE SKILLGAP/
├─ app.js                    # Logika UI, validasi, state, simulasi async API
├─ assessment.html           # Form assessment / input data
├─ dashboard.html            # Dashboard overview dan KPI
├─ index.html                # Entry point aplikasi Vite
├─ list.html                 # Data list dengan filter dan search
├─ login.html                # Form login
├─ register.html             # Form pendaftaran
├─ package.json              # Konfigurasi package npm/Vite
├─ data/
│  └─ mock-data.json        # Data simulasi API lokal
├─ docs/
│  ├─ srs-matrix.html       # Matriks kebutuhan SRS
│  ├─ srs-front-end-matrix.html
│  ├─ srs-ui-component-map.html
│  └─ project-structure.md
├─ src/
│  ├─ app.ts                # Logika aplikasi TypeScript awal
│  ├─ main.ts               # Entry point frontend TypeScript
│  ├─ schemas.ts            # Validasi schema (Zod)
│  ├─ state.ts              # State management model
│  ├─ styles.css            # Styling modul
│  ├─ types.ts              # Tipe domain
│  └─ ui/
│     └─ cva.ts             # Utility component class variant
├─ styles.css               # Styling global
├─ vite.config.js           # Konfigurasi bundler Vite
├─ tsconfig.json            # Konfigurasi TypeScript
├─ tsconfig.app.json
├─ tsconfig.node.json
└─ package-lock.json
```

## 2. Kesesuaian dengan kebutuhan SKPL

- Pemetaan SRS ke UI: dashboard, assessment form, dan data list dibuat sebagai modul modular dan reusable.
- Pengelolaan state: aplikasi menggunakan objek state dan fungsi render yang mengupdate UI secara terpusat.
- Validasi form: input wajib dan `reportValidity()` mencegah pengiriman kosong.
- Simulasi API: fetch ke `data/mock-data.json` digunakan dengan status loading/error.
- Performa: dashboard menampilkan render-time dan bundle budget status untuk monitoring.
- Dokumentasi: `docs/srs-ui-component-map.html` dapat dicetak menjadi PDF 1–2 halaman.

## 3. Verifikasi kode

Proses validasi yang disarankan:

1. Jalankan `npm install` untuk memastikan dependency terselesaikan.
2. Jalankan `npm run build` untuk memvalidasi sintaks dan bundling.
3. Lakukan pengecekan browser terhadap halaman dashboard, assessment, dan list.
4. Pastikan tidak ada error console ketika halaman baru dimuat.

## 4. Ringkasan final

Proyek ini telah diorganisasikan agar mengikuti struktur modul SRS, aplikasi dapat berkinerja baik, dan arsip dokumentasi pemetaan kebutuhan UI telah dipersiapkan sesuai kebutuhan SKPL.
