# Matriks Migrasi dan Benchmarking SkillGap.AI

## Ruang Lingkup

Pipeline antarmuka `src/` menggunakan Vite, Strict TypeScript, dan Biome Toolchain
berbasis Rust. Tampilan, markup, dan stylesheet aplikasi tidak diubah.

| Persyaratan | Implementasi | Bukti/Perintah |
| --- | --- | --- |
| Vite dan path alias | `vite.config.ts` memetakan `@/` ke `src/`, server Vite di port 3000, preview di 4173 | `npm run dev:vite` |
| Minifikasi | Esbuild minifier dan target ES2022 | `build.minify: "esbuild"` |
| Biome Toolchain | `biome.json` mengaktifkan formatter dan lint rule recommended | `npm run biome:check` |
| Strict TypeScript | `strict: true`, `noUncheckedIndexedAccess: true` pada konfigurasi aplikasi dan node | `npm run typecheck:vite` |
| Code splitting | Vendor eksternal dipisahkan melalui `rollupOptions.output.manualChunks` | `dist/assets/vendor-*.js` |
| HMR dan cold start | Server Vite dijalankan dengan timer manual; perubahan `src/` diamati melalui HMR | `npm run dev:vite` |
| Quality gate | Typecheck, Biome, dan build dijalankan berurutan | `npm run quality:gate` |
| SonarQube | Analisis statis dijalankan di CI menggunakan konfigurasi project | `sonar-scanner` |

## Format Benchmark

Catat hasil aktual dari mesin penguji pada tabel berikut. Jalankan setiap perintah
minimal tiga kali dan gunakan median agar hasil tidak dipengaruhi proses pertama.

| Skenario | Sebelum migrasi | Sesudah Vite/Rust toolchain | Metode |
| --- | ---: | ---: | --- |
| Cold start dev server | ____ s | ____ s | waktu dari perintah sampai `ready` |
| Respons HMR komponen | ____ ms | ____ ms | waktu log update setelah file disimpan |
| Production build | ____ s | 2.18 s (sample run) | `npm run build:vite` |
| Ukuran output utama | ____ KB | ____ KB | ukuran file di `dist/assets` |

Perintah benchmark build:

```bash
npm run benchmark:vite
```

## Quality Gate CI

Pipeline dinyatakan lulus jika seluruh perintah berikut mengembalikan exit code 0:

```bash
npm ci
npm run quality:gate
sonar-scanner
```

SonarQube membutuhkan `SONAR_HOST_URL` dan `SONAR_TOKEN` yang disediakan oleh
secret CI, sehingga token tidak disimpan di repository.