import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listCompetencies } from '../../lib/competencies';
import { hasSession } from '../../lib/auth';

const recommendationInputSchema = z.object({
  role: z.string().min(1),
  jenjang: z.string().min(1),
  target: z.string().min(3),
  selectedSkills: z.array(z.string()).min(1),
  questionnaire: z.record(z.string(), z.number().min(1).max(5)),
  skillLevels: z.record(z.string(), z.enum(['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'])).optional(),
});

// ============================================================
// VECTOR COSINE SIMILARITY ENGINE
// Sesuai spesifikasi SKPL: Vector Space Model & Cosine Similarity
// Formula: Cosine(u, r) = (u · r) / (||u|| × ||r||)
// ============================================================

/** Pemetaan level skill ke skor numerik [0–1] sebagai komponen vektor */
const LEVEL_SCORE: Record<string, number> = {
  Beginner: 0.25,
  Basic: 0.40,
  Intermediate: 0.60,
  Advanced: 0.80,
  Expert: 0.95,
};

/**
 * Membangun vektor multi-hot berbobot dari daftar skill yang dimiliki user.
 * Setiap dimensi vektor merepresentasikan satu kompetensi dari katalog.
 * Nilai dimensi = skor level skill (0 jika skill tidak dimiliki).
 */
function buildUserVector(
  catalogSkills: string[],
  selectedSkills: string[],
  skillLevels?: Record<string, string>,
): number[] {
  return catalogSkills.map((catalogSkill) => {
    const normalizedCatalog = catalogSkill.toLowerCase();
    const matchedSkill = selectedSkills.find((s) =>
      normalizedCatalog.includes(s.toLowerCase().split(/\s+/)[0] ?? s.toLowerCase()) ||
      s.toLowerCase().includes(normalizedCatalog.split(/\s+/)[0] ?? normalizedCatalog),
    );
    if (!matchedSkill) return 0;
    const level = skillLevels?.[matchedSkill] ?? 'Beginner';
    return LEVEL_SCORE[level] ?? 0.25;
  });
}

/**
 * Membangun vektor persyaratan industri dari katalog kompetensi.
 * Nilai dimensi = bobot permintaan industri (dinormalisasi ke skala 0–1).
 */
function buildRequirementVector(
  catalogSkills: string[],
  competencies: Array<{ nama_skill: string; bobot_permintaan: number }>,
): number[] {
  return catalogSkills.map((catalogSkill) => {
    const comp = competencies.find((c) => c.nama_skill === catalogSkill);
    return comp ? comp.bobot_permintaan / 100 : 0.5;
  });
}

/**
 * Menghitung Cosine Similarity antara dua vektor numerik.
 * Implementasi: Cosine(u, r) = dot(u, r) / (norm(u) * norm(r))
 * Mengembalikan nilai 0.0–1.0
 */
function cosineSimilarity(vectorU: number[], vectorR: number[]): number {
  const dotProduct = vectorU.reduce((sum, val, i) => sum + val * (vectorR[i] ?? 0), 0);
  const normU = Math.sqrt(vectorU.reduce((sum, val) => sum + val * val, 0));
  const normR = Math.sqrt(vectorR.reduce((sum, val) => sum + val * val, 0));
  if (normU === 0 || normR === 0) return 0;
  return dotProduct / (normU * normR);
}

/**
 * Menghitung skor kesiapan kuesioner dari respons Likert (skala 1–5).
 * Bobot questionnaire sebesar 20% dari match score total.
 */
function questionnaireReadinessScore(questionnaire: Record<string, number>): number {
  const values = Object.values(questionnaire);
  if (values.length === 0) return 0.6;
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  return avg / 5; // normalisasi ke rentang 0–1
}

/**
 * Menghitung Match Score akhir dengan formula gabungan:
 *   matchScore = (cosine × 0.80 + questionnaireReadiness × 0.20) × 100
 * Diklem ke rentang [45, 98] untuk realisme skor.
 */
function computeMatchScore(
  cosine: number,
  questionnaire: Record<string, number>,
): number {
  const readiness = questionnaireReadinessScore(questionnaire);
  const raw = cosine * 0.80 + readiness * 0.20;
  return Math.round(Math.max(45, Math.min(98, raw * 100)));
}

// ============================================================
// CERTIFICATION CATALOG
// ============================================================
const certificationCatalog: Record<string, { provider: string; description: string; targetLevel: string; duration: string; officialUrl: string | null; prerequisites: string }> = {
  'Google Data Analytics': { provider: 'Google / Coursera', description: 'Fondasi analisis data, spreadsheet, SQL, dan visualisasi Tableau.', targetLevel: 'Pemula - Menengah', duration: '6 bulan', officialUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics', prerequisites: 'Tidak ada prasyarat formal.' },
  'Microsoft PL-300': { provider: 'Microsoft', description: 'Analisis data, pemodelan data relasional, dan pelaporan Power BI.', targetLevel: 'Menengah', duration: '3-4 bulan', officialUrl: 'https://learn.microsoft.com/credentials/certifications/power-bi-data-analyst-associate/', prerequisites: 'Pengalaman dasar data dan SQL direkomendasikan.' },
  'AWS Cloud Practitioner': { provider: 'AWS', description: 'Fondasi layanan cloud AWS, keamanan, dan arsitektur deployment.', targetLevel: 'Pemula - Menengah', duration: '2-3 bulan', officialUrl: 'https://aws.amazon.com/certification/certified-cloud-practitioner/', prerequisites: 'Dasar komputasi umum.' },
  'Google UX Design': { provider: 'Google / Coursera', description: 'Riset pengguna, wireframe, prototipe Figma interaktif, dan usability testing.', targetLevel: 'Pemula - Menengah', duration: '6 bulan', officialUrl: 'https://www.coursera.org/professional-certificates/google-ux-design', prerequisites: 'Tidak ada prasyarat formal.' },
  'Meta Front-End Developer': { provider: 'Meta / Coursera', description: 'Kurikulum web modern Meta: HTML5, CSS3, JavaScript, React, dan Git.', targetLevel: 'Pemula - Menengah', duration: '7 bulan', officialUrl: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', prerequisites: 'Logika pemrograman dasar.' },
  'Meta Back-End Developer': { provider: 'Meta / Coursera', description: 'Arsitektur backend Meta: Python, Linux, database relasional, Django, dan RESTful API.', targetLevel: 'Pemula - Menengah', duration: '8 bulan', officialUrl: 'https://www.coursera.org/professional-certificates/meta-back-end-developer', prerequisites: 'Pemecahan masalah dasar.' },
  'Dicoding: Belajar Fundamental Front-End Web': { provider: 'Dicoding Academy', description: 'Standar industri Indonesia terakreditasi Kemendikbudristek untuk Web Components, ES6, Webpack, dan RESTful API.', targetLevel: 'Pemula - Menengah', duration: '2 bulan (80 jam)', officialUrl: 'https://www.dicoding.com/academies/163', prerequisites: 'Dasar HTML, CSS, JavaScript.' },
  'Dicoding: Belajar Fundamental Back-End': { provider: 'Dicoding Academy', description: 'Pembangunan RESTful API dengan Node.js, framework Hapi, database PostgreSQL, dan clean architecture.', targetLevel: 'Menengah', duration: '2.5 bulan (90 jam)', officialUrl: 'https://www.dicoding.com/academies/261', prerequisites: 'Dasar JavaScript & konsep API.' },
  'Dicoding: Belajar Machine Learning': { provider: 'Dicoding Academy', description: 'Konsep supervised & unsupervised learning, regresi, clustering, dan implementasi TensorFlow.', targetLevel: 'Pemula - Menengah', duration: '1.5 bulan (60 jam)', officialUrl: 'https://www.dicoding.com/academies/184', prerequisites: 'Dasar sintaks Python.' },
  'Dicoding: Belajar Dasar Pemrograman Web': { provider: 'Dicoding Academy', description: 'Fundamental pembuatan website modern dengan HTML5 semantik, CSS Flexbox/Grid, dan responsive layout.', targetLevel: 'Pemula (Pelajar SMK/SMA)', duration: '1 bulan (45 jam)', officialUrl: 'https://www.dicoding.com/academies/123', prerequisites: 'Tidak ada prasyarat.' },
  'BNSP Junior Web Developer': { provider: 'BNSP / LSP Telematika', description: 'Sertifikasi kompetensi kerja resmi Republik Indonesia mengacu pada SKKNI Software Development.', targetLevel: 'Menengah (SMK & Mahasiswa)', duration: '1-2 bulan persiapan', officialUrl: 'https://bnsp.go.id/', prerequisites: 'Portofolio aplikasi web fungsional.' },
  'Google Cybersecurity': { provider: 'Google / Coursera', description: 'Deteksi ancaman keamanan siber, mitigasi risiko jaringan, dan tools SIEM.', targetLevel: 'Pemula - Menengah', duration: '6 bulan', officialUrl: 'https://www.coursera.org/professional-certificates/google-cybersecurity', prerequisites: 'Kemampuan komputer umum.' },
  'Microsoft AZ-900': { provider: 'Microsoft', description: 'Fondasi konsep cloud computing, model layanan Azure, dan tata kelola keamanan.', targetLevel: 'Pemula', duration: '1.5 bulan persiapan', officialUrl: 'https://learn.microsoft.com/certifications/exams/az-900/', prerequisites: 'Tidak ada prasyarat.' },
};

// ============================================================
// MAIN API HANDLER
// ============================================================
export async function POST(request: Request) {
  if (!hasSession(request)) return NextResponse.json({ success: false, message: 'Session required.' }, { status: 401 });
  try {
    const input = recommendationInputSchema.parse(await request.json());
    const isStudentPath = input.jenjang.includes('Pelajar');
    const competencies = listCompetencies();

    // ----------------------------------------------------------
    // 1. Susun ruang vektor: dimensi = seluruh skill di katalog
    // ----------------------------------------------------------
    const catalogSkills = competencies.map((c) => c.nama_skill);

    // 2. Bangun vektor profil user (u) dan vektor kebutuhan industri (r)
    const userVector = buildUserVector(catalogSkills, input.selectedSkills, input.skillLevels);
    const requirementVector = buildRequirementVector(catalogSkills, competencies);

    // 3. Hitung Cosine Similarity antara vektor user dan vektor industri
    const cosine = cosineSimilarity(userVector, requirementVector);

    // 4. Hitung Match Score gabungan: 80% cosine + 20% questionnaire readiness
    const matchScore = computeMatchScore(cosine, input.questionnaire);
    const skillGap = Math.max(2, Math.min(55, 100 - matchScore));

    // ----------------------------------------------------------
    // 5. Filter kompetensi yang relevan dengan target & skill user
    // ----------------------------------------------------------
    const firstWord = (value: string) => value.trim().split(/\s+/)[0] ?? value;
    const matchingCompetencies = competencies.filter((competency) => {
      const searchText = `${competency.name} ${competency.roles.join(' ')}`.toLowerCase();
      return input.selectedSkills.some((skill) => searchText.includes(firstWord(skill.toLowerCase())))
        || searchText.includes(firstWord(input.target.toLowerCase()));
    });

    // 6. Analisis skill gap per kompetensi menggunakan skor vektor
    const skillAnalysis = (matchingCompetencies.length ? matchingCompetencies : competencies).slice(0, 6).map((competency) => {
      const level = input.skillLevels?.[competency.nama_skill] ?? 'Beginner';
      const levelScore = Math.round((LEVEL_SCORE[level] ?? 0.25) * 100);
      const required = Math.max(60, competency.bobot_permintaan);
      const gap = Math.max(0, required - levelScore);
      return { skill: competency.nama_skill, category: competency.kategori, current: levelScore, required, gap, status: gap >= 25 ? 'Gap' : gap > 0 ? 'Developing' : 'Strong' };
    });

    // 7. Rekomendasi sertifikasi berbobot berdasarkan gap terbesar
    const certifications = (matchingCompetencies.length ? matchingCompetencies : competencies)
      .flatMap((competency) => competency.certifications.map((name) => {
        const detail = certificationCatalog[name];
        const relatedGap = skillAnalysis.find((item) => item.skill === competency.nama_skill)?.gap ?? skillGap;
        const match = Math.max(70, Math.min(98, 100 - relatedGap + Math.round(competency.bobot_permintaan / 20)));
        return { name, ...(detail ?? { provider: 'SkillGap competency catalog', description: 'Detail resmi belum tersedia.', targetLevel: competency.level, duration: 'Belum ditentukan', officialUrl: null, prerequisites: 'Belum ditentukan.' }), relatedSkills: [competency.nama_skill], match, priority: relatedGap >= 25 ? 'High' : 'Medium', relatedGap, reason: `Direkomendasikan karena membantu menutup skill gap ${competency.nama_skill} sebesar ${relatedGap}%.` };
      }))
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      data: {
        primarySkill: input.selectedSkills[0] ?? input.target,
        matchScore,
        skillGap,
        // Metadata debug cosine similarity untuk transparansi
        _cosineSimilarity: Math.round(cosine * 10000) / 10000,
        skillAnalysis,
        strengths: isStudentPath
          ? ['Peta minat dan bakat berhasil dipetakan', 'Potensi belajar lintas bidang', 'Target studi dapat dikembangkan']
          : ['Kompetensi prioritas telah teridentifikasi', 'Profil sesuai dengan target industri', 'Kesiapan belajar dapat ditingkatkan'],
        gaps: matchingCompetencies.length
          ? matchingCompetencies.slice(0, 3).map((competency) => `Perlu penguatan ${competency.name} level ${competency.level}`)
          : [`Perlu penguatan kompetensi inti untuk ${input.target}`, 'Perlu membangun portofolio yang relevan', 'Perlu validasi melalui proyek atau sertifikasi'],
        roadmap: [
          { phase: 'PHASE 1', title: `Fondasi ${input.target}`, goal: `Tingkatkan skill gap prioritas untuk ${input.target}`, duration: '4 minggu', skills: input.selectedSkills, resources: ['Kurikulum dasar dan latihan terstruktur'], certification: certifications[0]?.name ?? 'Belum ditentukan', project: `${input.target} case study`, status: 'Not Started', tasks: ['Konsep dasar', 'Latihan terarah', 'Refleksi hasil'] },
          { phase: 'PHASE 2', title: 'Latihan terarah', goal: 'Mengerjakan latihan dan proyek kecil yang dapat diukur', duration: '6 minggu', skills: skillAnalysis.filter((item) => item.gap > 0).map((item) => item.skill), resources: ['Dokumentasi resmi', 'Project-based learning'], certification: certifications[1]?.name ?? 'Belum ditentukan', project: 'Portfolio mini project', status: 'Not Started', tasks: ['Buat project', 'Minta feedback', 'Publikasikan hasil'] },
          { phase: 'PHASE 3', title: 'Validasi kompetensi', goal: 'Menggunakan sertifikasi atau portofolio sebagai bukti', duration: '5 minggu', skills: skillAnalysis.map((item) => item.skill), resources: ['Practice test dan review'], certification: certifications[2]?.name ?? 'Belum ditentukan', project: 'Final case study', status: 'Not Started', tasks: ['Review gap', 'Simulasi assessment', 'Finalisasi bukti'] },
        ],
        certifications,
        jobOpenings: isStudentPath
          ? [{ title: 'Jalur studi lanjut', fit: `Pilihan studi yang selaras dengan ${input.target}`, match: matchScore, salary: 'Target pendidikan' }]
          : [{ title: input.target, fit: `Role awal berdasarkan skill ${input.selectedSkills.join(', ')}`, match: matchScore, salary: 'Sesuaikan dengan pasar kerja' }],
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Input assessment tidak valid.' }, { status: 400 });
  }
}
