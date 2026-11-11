import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listCompetencies, type Competency } from '../../lib/competencies';
import { hasSession } from '../../lib/auth';
import { callRealLLM } from '../../lib/llm-service';

const recommendationInputSchema = z.object({
  role: z.string().min(1),
  jenjang: z.string().min(1),
  target: z.string().min(3),
  selectedSkills: z.array(z.string()).min(1),
  questionnaire: z.record(z.string(), z.number().min(1).max(5)),
  skillLevels: z.record(z.string(), z.enum(['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'])).optional(),
  studentProfile: z.object({
    school: z.string().optional(),
    major: z.string().optional(),
    aspiration: z.string().optional(),
    interests: z.string().optional(),
    studentGoal: z.enum(['kuliah', 'kerja']).optional(),
  }).optional(),
  reportGrades: z.record(z.string(), z.number()).optional(),
  extractedCvText: z.string().optional(),
  uploadedCv: z.string().optional(),
});

// ============================================================
// VECTOR COSINE SIMILARITY ENGINE
// Sesuai spesifikasi SKPL: Vector Space Model & Cosine Similarity
// Formula: Cosine(u, r) = (u · r) / (||u|| × ||r||)
// ============================================================

/** Pemetaan level skill ke skor numerik [0–1] sebagai komponen vektor */
const LEVEL_SCORE: Record<string, number> = {
  Beginner: 0.35,
  Basic: 0.50,
  Intermediate: 0.75,
  Advanced: 0.90,
  Expert: 0.98,
};

/** Pemetaan sinonim/sub-keahlian ke kompetensi katalog terstandarisasi */
const SKILL_DOMAIN_MAP: Record<string, string[]> = {
  'Analisis Data': ['data', 'python', 'sql', 'database', 'pandas', 'analytics', 'bi', 'tableau', 'excel', 'statistics'],
  'Riset Pengguna & Desain UI/UX': ['ui', 'ux', 'figma', 'design', 'user', 'wireframe', 'prototype', 'research'],
  'API Engineering & Back-End Architecture': ['api', 'backend', 'back-end', 'node', 'express', 'postgresql', 'mysql', 'docker', 'server', 'database'],
  'Pengembangan Web Front-End Modern': ['frontend', 'front-end', 'web', 'react', 'javascript', 'typescript', 'tailwind', 'html', 'css', 'next'],
  'Dasar Pemrograman Web & Logika Komputasi': ['dasar', 'pemrograman', 'logika', 'algoritma', 'smk', 'pelajar', 'html', 'css', 'komputasi'],
};

/**
 * Membangun vektor keahlian pengguna (u) pada ruang kompetensi target & katalog.
 */
function buildUserVector(
  competencies: Competency[],
  selectedSkills: string[],
  targetRole: string,
  skillLevels?: Record<string, string>,
): number[] {
  const targetLower = targetRole.toLowerCase();
  const levels = skillLevels || {};

  return competencies.map((comp) => {
    const compName = comp.nama_skill;
    const keywords = SKILL_DOMAIN_MAP[compName] || [compName.toLowerCase()];
    const compRoles = comp.roles;

    let roleMatch = false;
    for (const r of compRoles) {
      const rLower = r.toLowerCase();
      if (targetLower.includes(rLower) || rLower.includes(targetLower)) {
        roleMatch = true;
        break;
      }
    }

    let bestScore = 0.0;
    for (const skill of selectedSkills) {
      const sLower = skill.toLowerCase();
      const isMatch = keywords.some((kw) => sLower.includes(kw) || kw.includes(sLower));
      if (isMatch) {
        const level = levels[skill] || levels[compName] || 'Intermediate';
        const score = LEVEL_SCORE[level] || 0.65;
        if (score > bestScore) bestScore = score;
      }
    }

    if (bestScore === 0 && roleMatch) {
      bestScore = 0.40;
    }

    return bestScore;
  });
}

/**
 * Membangun vektor standar kebutuhan industri (r) dari katalog kompetensi.
 */
function buildRequirementVector(competencies: Competency[]): number[] {
  return competencies.map((c) => (c.bobot_permintaan > 0 ? c.bobot_permintaan / 100 : 0.85));
}

/**
 * Menghitung Cosine Similarity antara dua vektor numerik.
 * Implementasi: Cosine(u, r) = dot(u, r) / (norm(u) * norm(r))
 */
function cosineSimilarity(vectorU: number[], vectorR: number[]): number {
  const dotProduct = vectorU.reduce((sum, val, i) => sum + val * (vectorR[i] ?? 0), 0);
  const normU = Math.sqrt(vectorU.reduce((sum, val) => sum + val * val, 0));
  const normR = Math.sqrt(vectorR.reduce((sum, val) => sum + val * val, 0));
  if (normU === 0 || normR === 0) return 0.50;
  return dotProduct / (normU * normR);
}

/**
 * Menghitung Match Score akhir terkalibrasi berbasis Cosine Similarity + Kuesioner.
 * Formula: matchScore = round(68.7962 * Cosine(u, r) + 28.4832)
 */
function computeMatchScore(
  cosine: number,
  questionnaire: Record<string, number>,
): number {
  const values = Object.values(questionnaire);
  const qAvg = values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 3.5;
  const qFactor = (qAvg - 3.0) * 2.5;
  const calibrated = 68.7962 * cosine + 28.4832 + qFactor;
  return Math.round(Math.max(45, Math.min(98, calibrated)));
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
  if (!hasSession(request)) {
    return NextResponse.json({ success: false, message: 'Session required.' }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const input = recommendationInputSchema.parse(rawBody);
    const isStudentPath = input.jenjang.toLowerCase().includes('pelajar') || input.role.toLowerCase() === 'pelajar';
    const competencies = listCompetencies();

    // 1. Bangun vektor profil user (u) dan vektor kebutuhan industri (r)
    const userVector = buildUserVector(competencies, input.selectedSkills, input.target, input.skillLevels);
    const requirementVector = buildRequirementVector(competencies);

    // 2. Hitung Cosine Similarity antara vektor user dan vektor industri
    const cosine = cosineSimilarity(userVector, requirementVector);

    // 3. Hitung Match Score akhir berbasis Cosine Similarity
    const matchScore = computeMatchScore(cosine, input.questionnaire);
    const skillGap = Math.max(4, Math.min(55, 100 - matchScore));

    // 4. Filter kompetensi yang relevan dengan target & skill user
    const firstWord = (value: string) => value.trim().split(/\s+/)[0] ?? value;
    const matchingCompetencies = competencies.filter((competency) => {
      const searchText = `${competency.name} ${competency.roles.join(' ')} ${competency.description}`.toLowerCase();
      return input.selectedSkills.some((skill) => searchText.includes(firstWord(skill.toLowerCase())))
        || searchText.includes(firstWord(input.target.toLowerCase()));
    });

    // 5. Analisis skill gap per kompetensi menggunakan skor vektor
    const activeCompetencies = matchingCompetencies.length ? matchingCompetencies : competencies;
    const skillAnalysis = activeCompetencies.slice(0, 6).map((competency) => {
      const level = input.skillLevels?.[competency.nama_skill] ?? 'Beginner';
      const levelScore = Math.round((LEVEL_SCORE[level] ?? 0.35) * 100);
      const required = Math.max(60, competency.bobot_permintaan);
      const gap = Math.max(0, required - levelScore);
      return {
        skill: competency.nama_skill,
        category: competency.kategori,
        current: levelScore,
        required,
        gap,
        status: gap >= 25 ? 'Gap' : gap > 0 ? 'Developing' : 'Strong'
      };
    });

    // 6. Rekomendasi sertifikasi berbobot berdasarkan gap terbesar
    const certifications = activeCompetencies
      .flatMap((competency) => competency.certifications.map((name) => {
        const detail = certificationCatalog[name];
        const relatedGap = skillAnalysis.find((item) => item.skill === competency.nama_skill)?.gap ?? skillGap;
        const match = Math.max(70, Math.min(98, 100 - relatedGap + Math.round(competency.bobot_permintaan / 20)));
        return {
          name,
          ...(detail ?? {
            provider: 'SkillGap competency catalog',
            description: 'Detail resmi belum tersedia.',
            targetLevel: competency.level,
            duration: 'Belum ditentukan',
            officialUrl: null,
            prerequisites: 'Belum ditentukan.'
          }),
          relatedSkills: [competency.nama_skill],
          match,
          priority: relatedGap >= 25 ? 'High' : 'Medium',
          relatedGap,
          reason: `Direkomendasikan karena membantu menutup skill gap ${competency.nama_skill} sebesar ${relatedGap}%.`
        };
      }))
      .slice(0, 3);

    // 7. Panggilan LLM API Sungguhan dengan Template Prompt per Jenjang (FR-08)
    const llmResult = await callRealLLM({
      role: input.role,
      jenjang: input.jenjang,
      target: input.target,
      selectedSkills: input.selectedSkills,
      questionnaire: input.questionnaire,
      skillLevels: input.skillLevels,
      studentProfile: input.studentProfile,
      reportGrades: input.reportGrades,
      extractedCvText: input.extractedCvText,
    });

    // Roadmap terintegrasi (mengutamakan hasil penalaran LLM jika ada)
    const roadmap = llmResult?.roadmap && llmResult.roadmap.length > 0
      ? llmResult.roadmap
      : [
          {
            phase: 'PHASE 1',
            title: isStudentPath ? `Fondasi Pemrograman & Logika (${input.target})` : `Fondasi Arsitektur ${input.target}`,
            goal: isStudentPath ? 'Memperkuat logika berpikir komputasional dan dasar web/algoritma' : `Tingkatkan kompetensi inti untuk ${input.target}`,
            duration: '4 minggu',
            skills: input.selectedSkills,
            resources: ['Kurikulum dasar dan latihan interaktif'],
            certification: certifications[0]?.name ?? 'Belum ditentukan',
            project: `${input.target} case study`,
            status: 'Not Started' as const,
            tasks: ['Konsep dasar & sintaks', 'Latihan terarah', 'Evaluasi mandiri']
          },
          {
            phase: 'PHASE 2',
            title: isStudentPath ? 'Latihan Terarah & Proyek Sekolah' : 'Implementasi Proyek Industri Praktis',
            goal: isStudentPath ? 'Membuat portofolio aplikasi mini untuk persiapan magang/studi' : 'Mengerjakan studi kasus industri dengan clean code & database',
            duration: '6 minggu',
            skills: skillAnalysis.filter((item) => item.gap > 0).map((item) => item.skill),
            resources: ['Dokumentasi resmi', 'Project-based learning'],
            certification: certifications[1]?.name ?? 'Belum ditentukan',
            project: 'Portfolio mini project',
            status: 'Not Started' as const,
            tasks: ['Desain sistem', 'Pengembangan fitur', 'Refining code']
          },
          {
            phase: 'PHASE 3',
            title: isStudentPath ? 'Validasi Kejuruan & Portofolio Akhir' : 'Validasi Sertifikasi & Kesiapan Rekrutmen',
            goal: isStudentPath ? 'Mempersiapkan portofolio kelulusan/SNBP atau UKK' : 'Mengambil sertifikasi industri kredibel dan mock interview',
            duration: '5 minggu',
            skills: skillAnalysis.map((item) => item.skill),
            resources: ['Practice test dan review'],
            certification: certifications[2]?.name ?? 'Belum ditentukan',
            project: 'Final case study',
            status: 'Not Started' as const,
            tasks: ['Review gap', 'Simulasi asesmen', 'Finalisasi portofolio']
          },
        ];

    const strengths = llmResult?.strengths ?? (
      isStudentPath
        ? ['Peta minat dan bakat berhasil dipetakan', 'Potensi belajar lintas bidang terbuka lebar', 'Minat teknologi sejalan dengan pilihan program studi']
        : ['Kompetensi prioritas telah teridentifikasi', 'Profil sesuai dengan target industri', 'Kesiapan belajar dapat ditingkatkan']
    );

    const gaps = llmResult?.gaps ?? (
      matchingCompetencies.length
        ? matchingCompetencies.slice(0, 3).map((competency) => `Perlu penguatan ${competency.name} level ${competency.level}`)
        : [`Perlu penguatan kompetensi inti untuk ${input.target}`, 'Perlu membangun portofolio yang relevan', 'Perlu validasi melalui proyek atau sertifikasi']
    );

    const studyPaths = isStudentPath
      ? (llmResult?.suggestedStudyPaths ?? [
          { title: 'Sistem Informasi', jenjang: 'Sarjana (S1)', match: Math.min(98, matchScore + 2), description: 'Mempelajari integrasi teknologi informasi, analisis proses bisnis, dan database.', careers: ['Business Analyst', 'Systems Analyst', 'IT Consultant'] },
          { title: 'Informatika', jenjang: 'Sarjana (S1)', match: matchScore, description: 'Fokus pada rekayasa perangkat lunak, struktur data, kecerdasan buatan, dan algoritma.', careers: ['Software Engineer', 'Data Scientist', 'AI Engineer'] },
          { title: 'Teknologi Informasi', jenjang: 'Diploma / Sarjana Terapan (D3/D4)', match: Math.max(70, matchScore - 3), description: 'Penerapan infrastruktur jaringan, sistem komputasi terapan, dan administrasi database.', careers: ['Cloud Administrator', 'Network Engineer', 'Full-stack Web Dev'] },
        ])
      : undefined;

    return NextResponse.json({
      success: true,
      data: {
        primarySkill: input.selectedSkills[0] ?? input.target,
        matchScore,
        skillGap,
        _cosineSimilarity: Math.round(cosine * 10000) / 10000,
        skillAnalysis,
        strengths,
        gaps,
        roadmap,
        certifications,
        studyPaths,
        aiNarrative: llmResult?.aiNarrative ?? `Analisis AI menunjukkan tingkat kesesuaian Anda sebesar ${matchScore}% terhadap target peran ${input.target}. Roadmap pembelajaran telah dipersonalisasi sesuai jenjang ${input.jenjang}.`,
        jobOpenings: isStudentPath
          ? [{ title: 'Jalur studi lanjut', fit: `Pilihan studi yang selaras dengan ${input.target}`, match: matchScore, salary: 'Target pendidikan' }]
          : [{ title: input.target, fit: `Role awal berdasarkan skill ${input.selectedSkills.join(', ')}`, match: matchScore, salary: 'Sesuaikan dengan pasar kerja' }],
      },
    });
  } catch (error: any) {
    if (error?.name !== 'ZodError') {
      console.error('[Recommendations API Error]:', error);
    }
    return NextResponse.json({ success: false, message: 'Input assessment tidak valid.' }, { status: 400 });
  }
}
